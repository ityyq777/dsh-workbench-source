"use strict";
var C = require("../ui/common.cjs");
var Attachments = require("../ui/attachments.cjs");
var ReplyTools = require("../ui/reply-tools.cjs");
var iconLabel = require("../../../lib/icon-label.cjs");
var Folder = require("lucide-react/icons/folder").default;
var InboxIcon = require("lucide-react/icons/inbox").default;
var Refresh = require("lucide-react/icons/refresh-cw").default;
var Download = require("lucide-react/icons/download").default;
var Search = require("lucide-react/icons/search").default;
var Close = require("lucide-react/icons/x").default;
var Mail = require("lucide-react/icons/mail").default;
var MailOpen = require("lucide-react/icons/mail-open").default;
var Move = require("lucide-react/icons/folder-input").default;
var Trash = require("lucide-react/icons/trash-2").default;

module.exports = function Messages(props) {
  var h = props.h,
    React = props.React;
  var accounts = C.useLoad(React, props.api, "mail.accountList", {}, []);
  var account = React.useState("");
  return h(Inbox, Object.assign({}, props, { key: account[0], accountId: account, accounts: accounts }));
};
function Inbox(props) {
  var h = props.h,
    React = props.React,
    api = props.api,
    accountId = props.accountId;
  var accs = (props.accounts.data && props.accounts.data.items) || [];
  var boxes = C.useLoad(React, api, "mail.mailboxList", { accountId: accountId[0] || undefined }, [accountId[0]]);
  var folders = (boxes.data && boxes.data.items) || [];
  var unified = React.useState(true), server = React.useState(null), searchRev = React.useRef(0);
  var folder = React.useState(accountId[0] ? "INBOX" : "");
  var search = React.useState(""),
    q = React.useState(""),
    unseen = React.useState(false);
  var page = React.useState([]),
    tokens = page[0];
  var list = C.useLoad(
    React,
    api,
    "mail.messageList",
    {
      accountId: accountId[0] || undefined,
      mailbox: folder[0] || undefined,
      unifiedInbox: !accountId[0] && unified[0],
      q: q[0],
      unread: unseen[0],
      limit: 50,
      cursor: tokens.at(-1),
    },
    [folder[0], q[0], unseen[0], tokens, unified[0]],
  );
  var sel = React.useState(null),
    msg = React.useState(null),
    target = React.useState("");
  var bodyState = React.useState({}),
    busy = React.useState(false),
    remote = React.useState(null);
  var generation = React.useRef(0),
    selected = React.useRef(0),
    busyRef = React.useRef(false);
  React.useEffect(function () {
    return function () {
      generation.current++;
      selected.current++;
      searchRev.current++;
    };
  }, []);
  function close() {
    selected.current++;
    sel[1](null);
    target[1]("");
    bodyState[1]({});
  }
  function clearServer() { searchRev.current++; server[1](null); }
  function searchServer() {
    close();
    var rev = ++searchRev.current;
    server[1]({ loading: true });
    C.call(api, "mail.serverSearch", { accountId: accountId[0], mailbox: folder[0], q: search[0].trim(), unread: unseen[0] })
      .then(function (r) {
        if (rev !== searchRev.current) return;
        server[1]({ data: r });
        list.refresh();
      }).catch(function (e) {
        if (rev === searchRev.current) server[1]({ error: "服务器搜索失败：" + C.errText(e) });
      });
  }
  function reset() {
    clearServer();
    close();
    page[1]([]);
    msg[1](null);
  }
  function changeFolder(v) {
    generation.current++;
    busyRef.current = false;
    busy[1](false);
    remote[1](null);
    folder[1](v);
    reset();
  }
  function report(e) {
    msg[1]({ kind: "error", text: C.errText(e) });
  }
  function button(text, click, disabled, kind, Icon) {
    return h(C.Btn, { h: h, onClick: click, disabled: disabled, kind: kind }, Icon ? iconLabel(h, Icon, text) : text);
  }
  function isUnread(m) {
    return !/\\Seen/.test(String(m.flags || ""));
  }
  function sender(m) {
    return m.fromName || m.from || "未知发件人";
  }
  function senderDetail(m) {
    return m.from && m.fromName && m.from !== m.fromName ? m.fromName + " <" + m.from + ">" : sender(m);
  }
  function loadBody(m, force, rev) {
    bodyState[1]({ loading: true });
    C.call(api, "mail.messageBody", { id: m.id, force: !!force })
      .then(function (r) {
        if (rev !== selected.current) return;
        if (!r || r.ok === false) throw new Error((r && r.message) || "正文下载失败");
        bodyState[1]({ data: r });
      })
      .catch(function (e) {
        if (rev === selected.current) bodyState[1]({ error: C.errText(e) });
      });
  }
  function open(m) {
    close();
    var rev = selected.current;
    sel[1](m);
    bodyState[1]({ loading: true });
    C.call(api, "mail.messageGet", { id: m.id })
      .then(function (d) {
        if (rev !== selected.current) return;
        sel[1](d);
        loadBody(d, false, rev);
        if (isUnread(d) && d.uid > 0) mutate("mail.messageMarkRead", { id: d.id, read: true }, false, rev);
      })
      .catch(function (e) {
        if (rev === selected.current) bodyState[1]({ error: C.errText(e) });
      });
  }
  function mutate(action, args, leave, rev) {
    if (busyRef.current) return;
    var epoch = generation.current;
    busyRef.current = true;
    busy[1](true);
    C.call(api, action, args)
      .then(function () {
        if (epoch !== generation.current) return;
        list.refresh();
        if (rev !== selected.current) return;
        if (leave) close();
        else
          sel[1](function (m) {
            if (!m) return m;
            return Object.assign({}, m, {
              flags: (String(m.flags || "").replace(/\\Seen\b/gi, "") + (args.read ? " \\Seen" : "")).trim(),
            });
          });
      })
      .catch(function (e) {
        if (epoch === generation.current) report(e);
      })
      .finally(function () {
        if (epoch === generation.current) {
          busyRef.current = false;
          busy[1](false);
        }
      });
  }
  function sync(older, onlyFolders) {
    if (!accountId[0] || busyRef.current || (!onlyFolders && !canRemote)) return;
    var epoch = generation.current,
      args = { id: accountId[0] };
    if (!onlyFolders) {
      args.mailbox = folder[0];
      args.limit = 50;
      if (older) {
        if (!remote[0] || !remote[0].nextBeforeUid) return;
        args.beforeUid = remote[0].nextBeforeUid;
        args.uidValidity = remote[0].uidValidity;
      }
    }
    busyRef.current = true;
    busy[1](true);
    msg[1](null);
    C.call(api, onlyFolders ? "mail.mailboxSync" : "mail.sync", args)
      .then(function (r) {
        if (epoch !== generation.current) return;
        if (onlyFolders) {
          boxes.refresh();
          return;
        }
        remote[1](r);
        list.refresh();
        msg[1]({ kind: "ok", text: "抓取 " + r.fetched + " 封，新增 " + r.inserted + " 封" });
      })
      .catch(function (e) {
        if (epoch === generation.current) report(e);
      })
      .finally(function () {
        if (epoch === generation.current) {
          busyRef.current = false;
          busy[1](false);
        }
      });
  }
  function changePage(stack) {
    close();
    page[1](stack);
  }
  var current = sel[0],
    state = bodyState[0],
    data = state.data || {};
  var result = server[0] || list;
  var items = (result.data && result.data.items) || [],
    canSync = !!accountId[0];
  var localOnly = folders.some(function (f) {
    return f.name === folder[0] && f.localOnly;
  });
  var canRemote = canSync && !localOnly;
  var names = Array.from(
    new Set(
      ["INBOX"].concat(
        folders.map(function (f) {
          return f.name;
        }),
      ),
    ),
  );
  function bodyNode() {
    if (state.loading) return h("div", { className: "wbml-state" }, "正文下载中…");
    if (state.error)
      return h(
        "div",
        { className: "wbml-body-fail" },
        "正文下载失败：" + state.error,
        button("重试", function () {
          open(current);
        }),
      );
    return h(
      "div",
      { className: "wbml-body-wrap" },
      h("pre", { className: "wbml-body" }, data.body || current.body || "此邮件无文字正文"),
      h(Attachments, { h: h, React: React, api: api, localOnly: current.uid <= 0 || !current.uidValidity, items: data.attachments || current.attachments || [] }),
      data.truncated || current.bodyTruncated
        ? h("p", { className: "wbml-body-note" }, "正文较长，已截断显示。")
        : null,
      current.uid > 0
        ? button("重新下载正文", function () {
            loadBody(current, true, ++selected.current);
          })
        : null,
    );
  }
  var body = result.loading
    ? h("div", { className: "wbml-state" }, "加载中…")
    : result.error
      ? h(C.Notice, { h: h, kind: "error", text: result.error })
      : h(
          React.Fragment,
          null,
          !items.length
            ? h(C.Empty, {
                h: h,
                text: server[0] ? "服务器没有匹配的邮件" : !accs.length ? "还没有账户" : q[0] || unseen[0] ? "未找到符合条件的本地邮件" : "没有本地邮件",
              })
            : null,
          h(
            "div",
            { className: "wbml-list" },
            items.map(function (m) {
              return h(
                "button",
                {
                  key: m.id,
                  type: "button",
                  title: senderDetail(m) + " · " + m.subject,
                  className:
                    "wbml-list-row" + (current && current.id === m.id ? " on" : "") + (isUnread(m) ? " unread" : ""),
                  onClick: function () {
                    open(m);
                  },
                },
                h("span", { className: "wbml-who" }, !accountId[0] && m.accountName ? sender(m) + " · " + m.accountName : sender(m)),
                h("span", { className: "wbml-time" }, C.fmtTime(m.dateAt, props.lang)),
                h(
                  "div",
                  { className: "wbml-line" },
                  h("span", { className: "wbml-subject" }, m.subject || "(无主题)"),
                  h("span", { className: "wbml-snippet" }, m.preview),
                ),
              );
            }),
          ),
          !server[0] && h(
            "div",
            { className: "wbml-paging" },
            button(
              "上一页",
              function () {
                changePage(tokens.slice(0, -1));
              },
              !tokens.length,
            ),
            h("span", null, "第 " + (tokens.length + 1) + " 页"),
            button(
              "下一页",
              function () {
                changePage(tokens.concat(list.data.nextCursor));
              },
              !list.data || !list.data.hasMore,
            ),
          ),
        );
  return h(
    "div",
    { className: "wbml-page is-split wb-fill" },
    h(
      "div",
      { className: "wbml-head" },
      h("h2", null, "邮件"),
      button("刷新本地列表", function () {
        reset();
        list.refresh();
      }, undefined, undefined, Refresh),
    ),
    h(C.Notice, { h: h, kind: "error", text: props.accounts.error || boxes.error }),
    h(C.Notice, { h: h, kind: msg[0] && msg[0].kind, text: msg[0] && msg[0].text }),
    h(
      "div",
      { className: "wbml-layout" + (current ? " has-detail" : "") },
      h(
        "aside",
        { className: "wbml-rail" },
        h(
          "div",
          { className: "wbml-rail-card" },
          h(
            C.Field,
            { h: h, label: "收件账户" },
            h(
              "select",
              {
                className: "wbml-input",
                value: accountId[0],
                onChange: function (e) {
                  accountId[1](e.target.value);
                },
              },
              h("option", { value: "" }, "全部账户"),
              accs.map(function (a) {
                return h("option", { key: a.id, value: a.id }, a.name);
              }),
            ),
          ),
          !canSync && h(C.Field, { h: h, label: "邮件范围" }, h("select", {
            className: "wbml-input", value: unified[0] ? "inbox" : "all",
            onChange: function (e) { unified[1](e.target.value === "inbox"); reset(); },
          }, h("option", { value: "inbox" }, "统一收件箱"), h("option", { value: "all" }, "全部邮件"))),
          canSync && h(
            C.Field,
            { h: h, label: iconLabel(h, Folder, "文件夹") },
            h(
              "select",
              {
                className: "wbml-input",
                value: folder[0],
                disabled: !canSync,
                onChange: function (e) {
                  changeFolder(e.target.value);
                },
              },
              !canSync ? h("option", { value: "" }, "全部文件夹") : null,
              names.map(function (n) {
                return h("option", { key: n, value: n }, n);
              }),
            ),
          ),
          h(
            "div",
            { className: "wbml-body-tools" },
            button(
              "更新文件夹",
              function () {
                sync(false, true);
              },
              !canSync || busy[0],
              undefined,
              Folder,
            ),
            button(
              "同步最新邮件",
              function () {
                sync(false, false);
              },
              !canRemote || busy[0],
              "primary",
              Download,
            ),
          ),
          canRemote && remote[0]
            ? button(
                remote[0].nextBeforeUid ? "从服务器加载更早邮件" : "已到服务器最早邮件",
                function () {
                  sync(true, false);
                },
                !remote[0].nextBeforeUid || busy[0],
              )
            : null,
          localOnly
            ? h("small", { className: "wbml-muted" }, "此文件夹仅保留本地副本")
            : !canSync
              ? h("small", { className: "wbml-muted" }, "选择具体账户后可同步")
              : null,
          h(
            "form",
            {
              className: "wbml-search",
              onSubmit: function (e) {
                e.preventDefault();
                q[1](search[0].trim());
                reset();
              },
            },
            h(
              C.Field,
              { h: h, label: "搜索本地副本", hint: "仅匹配已下载信头的主题和发件地址" },
              h("input", {
                className: "wbml-input",
                type: "search",
                value: search[0],
                onChange: function (e) {
                  clearServer();
                  close();
                  search[1](e.target.value);
                },
              }),
            ),
            h(C.Btn, { h: h, type: "submit" }, iconLabel(h, Search, "搜索")),
            button("在服务器搜索", searchServer, !canRemote || !folder[0] || !search[0].trim() || !!server[0]?.loading, undefined, Search),
            server[0] && button("返回本地列表", function () { clearServer(); close(); }),
          ),
          h(
            "label",
            null,
            h("input", {
              type: "checkbox",
              checked: unseen[0],
              onChange: function (e) {
                unseen[1](e.target.checked);
                reset();
              },
            }),
            " 只看未读",
          ),
        ),
      ),
      h(
        "section",
        { className: "wbml-pane wbml-listpane" },
        h(
          "div",
          { className: "wbml-pane-head" },
          h("strong", null, iconLabel(h,
            server[0] ? Search : folder[0] && folder[0] !== "INBOX" ? Folder : folder[0] || unified[0] ? InboxIcon : Mail,
            server[0] ? "服务器搜索 · " + folder[0] : folder[0] || (unified[0] ? "统一收件箱" : "全部邮件"))),
          h(
            "span",
            { className: "wbml-muted" },
            result.error || result.loading ? null : (server[0] ? "显示 " : "本页 ") + items.length + " 封 · " + items.filter(isUnread).length + " 未读" + (server[0]?.data?.truncated ? " · 仅显示最近 50 封" : ""),
          ),
        ),
        h("div", { className: "wbml-state-box" }, body),
      ),
      current
        ? h(
            "section",
            { className: "wbml-pane wbml-detailpane" },
            h(
              "div",
              { className: "wbml-detail-head" },
              h(
                "div",
                { className: "wbml-detail-title" },
                h("strong", null, current.subject || "(无主题)"),
                h(
                  "span",
                  { className: "wbml-muted" },
                  senderDetail(current) + " · " + C.fmtTime(current.dateAt, props.lang),
                ),
              ),
              button("关闭", close, undefined, undefined, Close),
            ),
            h(
              "div",
              { className: "wbml-detail-meta" },
              h("span", null, "收件人：" + (current.to || "—")),
              h("span", null, "文件夹：" + current.mailbox),
            ),
            current.uid > 0
              ? h(
                  "div",
                  { className: "wbml-tools" },
                  button(
                    isUnread(current) ? "标为已读" : "标为未读",
                    function () {
                      mutate(
                        "mail.messageMarkRead",
                        { id: current.id, read: isUnread(current) },
                        false,
                        selected.current,
                      );
                    },
                    busy[0],
                    undefined,
                    isUnread(current) ? MailOpen : Mail,
                  ),
                  h(
                    "select",
                    {
                      "aria-label": "目标文件夹",
                      className: "wbml-input",
                      value: target[0],
                      onChange: function (e) {
                        target[1](e.target.value);
                      },
                    },
                    h("option", { value: "" }, "选择目标文件夹"),
                    folders
                      .filter(function (f) {
                        return !f.localOnly && f.account_id === current.accountId && f.name !== current.mailbox;
                      })
                      .map(function (f) {
                        return h("option", { key: f.id, value: f.name }, f.name);
                      }),
                  ),
                  button(
                    "移动",
                    function () {
                      mutate("mail.messageMove", { id: current.id, mailbox: target[0] }, true, selected.current);
                    },
                    busy[0] || !target[0],
                    undefined,
                    Move,
                  ),
                  button(
                    "移入废纸篓",
                    function () {
                      mutate("mail.messageDelete", { id: current.id }, true, selected.current);
                    },
                    busy[0],
                    undefined,
                    Trash,
                  ),
                )
              : null,
            h(
              "div",
              { className: "wbml-detail-content" },
              bodyNode(),
              h(
                ReplyTools,
                Object.assign({}, props, {
                  key: current.id,
                  message: current,
                  body: data.body || current.body || "",
                  bodyReady: !!state.data,
                   originalAttachments: data.attachments || current.attachments || [],
                }),
              ),
            ),
          )
        : null,
    ),
  );
}
