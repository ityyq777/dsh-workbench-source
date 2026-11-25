"use strict";

/**
 * 兼容层：把各插件现有的 dataTables/dataQuery（limit/offset 契约）适配成
 * packages/addons/lib/data-view.cjs 需要的分页契约。
 *
 * 数据页是低频管理视图，单表最多抓 2000 行后在客户端排序/筛选；
 * 新插件若要服务端分页，直接实现共享视图的 tasks 契约即可替换。
 */

function unwrap(r) {
  return r && r.result !== undefined ? r.result : r;
}

function rowsOf(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.rows)) return body.rows;
  if (Array.isArray(body.items)) return body.items;
  return [];
}

function textOf(value) {
  if (value === null || value === undefined) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

/** 列元信息归一：字符串列名补成 TEXT；对象列把可选契约字段原样带过去。 */
function columnOf(col) {
  if (typeof col === "string") return { name: col, type: "TEXT", system: false };
  if (!col || typeof col !== "object" || !col.name) return null;
  return {
    name: String(col.name),
    type: String(col.type || "TEXT"),
    kind: col.kind,
    label: col.label,
    system: col.system === true,
    pk: col.pk === true,
    notnull: col.notnull,
    defaultValue: col.defaultValue,
  };
}

/**
 * 声明列优先、行派生兜底：表清单里声明了列就用它（空表也能出完整表头与字段页签），
 * 声明里没有、行里却有的列补在最后（只声明一部分列的旧插件也能看全数据）。
 */
function columnsOf(rows, declared) {
  var seen = Object.create(null);
  var cols = [];
  (declared || []).forEach(function (col) {
    var c = columnOf(col);
    if (c && !seen[c.name]) { seen[c.name] = true; cols.push(c); }
  });
  if (rows.length) {
    Object.keys(rows[0]).forEach(function (name) {
      if (seen[name]) return;
      seen[name] = true;
      cols.push({ name: name, type: "TEXT", system: false });
    });
  }
  return cols;
}

function tableNames(body) {
  var list = body && Array.isArray(body.tables) ? body.tables : [];
  return list.map(function (t) {
    if (typeof t === "string") return { name: t };
    return { name: t.name, count: t.count, columns: t.columns };
  }).filter(function (t) { return t.name; });
}

function compare(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  var sa = textOf(a), sb = textOf(b);
  var na = Number(sa), nb = Number(sb);
  if (sa !== "" && sb !== "" && Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return sa.localeCompare(sb, "zh-CN");
}

module.exports = function createLegacyData(domain, options) {
  options = options || {};
  var paged = options.paged !== false;
  var maxRows = Math.max(1, Number(options.maxRows) || 2000);
  var pageLimit = Math.min(200, maxRows);

  function tablesLoader(api) {
    return api.call(domain + ".dataTables").then(function (r) {
      if (r && r.ok === false) throw new Error(r.error || "dataTables failed");
      var body = unwrap(r);
      return { tables: tableNames(body) };
    });
  }

  function fetchAll(api, table) {
    var rows = [];
    var offset = 0;
    function next() {
      var args = { table: table, limit: pageLimit };
      if (paged) args.offset = offset;
      return api.call(domain + ".dataQuery", args).then(function (r) {
        if (r && r.ok === false) throw new Error(r.error || "dataQuery failed");
        var batch = rowsOf(unwrap(r));
        rows = rows.concat(batch);
        if (!paged || batch.length < pageLimit || rows.length >= maxRows) return rows.slice(0, maxRows);
        offset += batch.length;
        return next();
      });
    }
    return next();
  }

  // 表清单缓存按 api 对象隔离：同一个数据页反复翻页/筛选时不必每页都重拉一次表结构。
  var tablesCache = new WeakMap();
  function tablesOf(api) {
    var cached = tablesCache.get(api);
    if (cached) return cached;
    var pending = Promise.resolve(tablesLoader(api)).then(function (body) { return body.tables; });
    pending.catch(function () { tablesCache.delete(api); });
    tablesCache.set(api, pending);
    return pending;
  }

  function query(api, args) {
    return tablesOf(api).then(function (tables) {
      var declared = null;
      for (var i = 0; i < tables.length; i++) if (tables[i].name === args.table) declared = tables[i].columns;
      return fetchAll(api, args.table).then(function (all) {
      return runQuery(api, args, all, declared);
    });
    });
  }

  function runQuery(api, args, all, declared) {
      var search = String(args.search || "").trim().toLowerCase();
      var filters = args.filters && typeof args.filters === "object" ? args.filters : {};
      var filterKeys = Object.keys(filters).slice(0, 20);
      var columns = columnsOf(all, declared);
      var colNames = columns.map(function (c) { return c.name; });
      var includeDeleted = args.includeDeleted === true;
      var rows = all.filter(function (row) {
        if (!includeDeleted && row.deleted_at) return false;
        if (search) {
          var hit = colNames.some(function (c) { return textOf(row[c]).toLowerCase().indexOf(search) >= 0; });
          if (!hit) return false;
        }
        return filterKeys.every(function (c) {
          return textOf(row[c]).toLowerCase().indexOf(textOf(filters[c]).toLowerCase()) >= 0;
        });
      });

      var sort = String(args.sort || "");
      var order = args.order === "asc" ? "asc" : "desc";
      if (sort && colNames.indexOf(sort) >= 0) {
        rows = rows.slice().sort(function (a, b) {
          var d = compare(a[sort], b[sort]);
          return order === "asc" ? d : -d;
        });
      }

      var pageSize = Math.max(1, Math.min(200, Number(args.pageSize) || 50));
      var total = rows.length;
      var pages = Math.max(1, Math.ceil(total / pageSize));
      var page = Math.max(1, Math.min(pages, Number(args.page) || 1));
      var start = (page - 1) * pageSize;
      var started = Date.now();
      return {
        table: args.table,
        columns: columns,
        rows: rows.slice(start, start + pageSize),
        page: page,
        pageSize: pageSize,
        pages: pages,
        total: total,
        sort: sort,
        order: order,
        search: search,
        filters: filters,
        includeDeleted: includeDeleted,
        queryMs: Math.max(0, Date.now() - started),
      };
  }

  return { tablesLoader: tablesLoader, query: query };
};
