// One state contract for checkbox OR selection and independent range AND filters.
// 快捷预设只是「一组筛选值」的常量表：激活态由当前值精确比对推导，不另存 flag。
var date = require("../ui/date-filter.cjs");
var groups = ["publish", "done", "shutdown"];
// 0 只表示「没有优先级 / 没有难度」，所以 UI 区间端点从 1 起：优先级整数 1–10，难度 0.5 起按半档递增。
var limits = {priority:{min:1, max:10, step:1}, difficulty:{min:0.5, max:5, step:0.5}};
var STORE = "wbt.taskFilters.v3";
function bounds() { return {min:"", max:""}; }
function empty() { return {statuses:[], priority:bounds(), difficulty:bounds(), publish:{from:"",to:""}, done:{from:"",to:""}, shutdown:{from:"",to:""}, target:{from:"",to:""}}; }
function statusFree(value) { return !value.statuses.length; }
function hasRange(value) {
  return groups.concat(["target"]).some(function (key) { return value[key].from || value[key].to; }) ||
    !!(value.priority.min || value.priority.max || value.difficulty.min || value.difficulty.max);
}
function all(value) { return statusFree(value) && !hasRange(value); }
// 预设是唯一常量表：日期按浏览器本地时区临时算，避免把「昨天/今天」固化进状态。
var PRESETS = [
  {id:"urgent", statuses:["0"], priority:{min:"8", max:"10"}},
  {id:"hard", statuses:["0", "4"], difficulty:{min:"4", max:"5"}},
  {id:"overdue", statuses:["0", "4"], target:"before"},
  {id:"dueToday", statuses:["0", "4"], target:"today"},
  {id:"recentDone", statuses:["2"], done:"week"},
  {id:"claimed", statuses:["4"]},
];
function presetValue(id) {
  var spec = null;
  PRESETS.forEach(function (item) { if (item.id === id) spec = item; });
  if (!spec) return null;
  var value = empty(), now = date.today();
  value.statuses = spec.statuses.slice();
  if (spec.priority) value.priority = {min:spec.priority.min, max:spec.priority.max};
  if (spec.difficulty) value.difficulty = {min:spec.difficulty.min, max:spec.difficulty.max};
  if (spec.target === "before") value.target = {from:"", to:date.shift(now, -1)};
  if (spec.target === "today") value.target = {from:now, to:now};
  if (spec.done === "week") value.done = {from:date.shift(now, -6), to:now};
  return value;
}
function signature(value) {
  return JSON.stringify({
    statuses: value.statuses.slice().sort(), priority: value.priority, difficulty: value.difficulty,
    publish: value.publish, done: value.done, shutdown: value.shutdown, target: value.target,
  });
}
function activePreset(value) {
  var found = "", want = signature(value);
  PRESETS.forEach(function (spec) { if (!found && signature(presetValue(spec.id)) === want) found = spec.id; });
  return found;
}
// 状态是否入选只看状态本身；区间是额外 AND 条件，不能让它把状态判断一起带走。
function includes(value, status) { return statusFree(value) || value.statuses.indexOf(status) >= 0; }
function toggle(value, key) {
  var next = Object.assign({}, value, {statuses:value.statuses.slice()});
  if (key === "all") return empty();
  else { var index = next.statuses.indexOf(key); if (index >= 0) next.statuses.splice(index, 1); else next.statuses.push(key); }
  // Explicitly deselecting a status clears its range, including the last selected status.
  if ((key === "2" && value.statuses.indexOf("2") >= 0) || !includes(next,"2")) next.done = {from:"",to:""};
  if ((key === "1" && value.statuses.indexOf("1") >= 0) || !includes(next,"1")) next.shutdown = {from:"",to:""};
  return next;
}
function enable(value, key) {
  var status = key === "done" ? "2" : "1";
  return Object.assign({},value,{statuses:statusFree(value) ? [status] : Array.from(new Set(value.statuses.concat(status)))});
}
function range(value, key, input) {
  var normalized = date.normalize(input);
  if (!normalized) return null;
  var next = value;
  if (key !== "publish" && key !== "target" && (normalized.from || normalized.to)) next = enable(value,key);
  next = Object.assign({},next); next[key] = {from:normalized.from,to:normalized.to};
  return {value:next,swapped:normalized.swapped,autoSelected:key !== "publish" && key !== "target" && value.statuses.indexOf(key === "done" ? "2" : "1") < 0 && !!(normalized.from || normalized.to)};
}
/** 单端输入：按 limits[key] 的 min/max/step 校验（优先级整数、难度半档）；非法值返回 null 交给调用方提示。 */
function parseLimit(key, input) {
  var text = String(input == null ? "" : input).trim(), spec = limits[key];
  if (!text) return "";
  if (!/^\d+(?:\.\d)?$/.test(text)) return null;
  var number = Number(text);
  if (!isFinite(number) || Math.abs(Math.round(number / spec.step) * spec.step - number) > 1e-9) return null;
  if (number < spec.min || number > spec.max) return null;
  return String(Number(number.toFixed(1)));
}
function limit(value, key, end, input) {
  var parsed = parseLimit(key, input), box = Object.assign({}, value[key]);
  if (parsed === null) return null;
  box[end] = parsed;
  var swapped = false;
  if (box.min && box.max && Number(box.min) > Number(box.max)) {
    var swap = box.min; box.min = box.max; box.max = swap; swapped = true;
  }
  var next = Object.assign({}, value); next[key] = box;
  return {value:next, swapped:swapped, clearsMissing:key === "difficulty" && !!(box.min || box.max)};
}
function clearDifficulty(value) { var next = Object.assign({}, value); next.difficulty = bounds(); return next; }
function args(value) {
  var out = {statuses:value.statuses.map(Number)};
  groups.concat(["target"]).forEach(function(key){out[key+"From"] = value[key].from || undefined; out[key+"To"] = value[key].to || undefined;});
  if (value.priority.min) out.priorityMin = Number(value.priority.min);
  if (value.priority.max) out.priorityMax = Number(value.priority.max);
  if (value.difficulty.min) out.difficultyMin = Number(value.difficulty.min);
  if (value.difficulty.max) out.difficultyMax = Number(value.difficulty.max);
  return out;
}
function readBounds(params, key, target) {
  var min = String(params[key+"Min"] == null ? "" : params[key+"Min"]), max = String(params[key+"Max"] == null ? "" : params[key+"Max"]);
  var result = limit(target, key, "min", min);
  if (!result && min) return null;
  var next = result ? result.value : target;
  result = limit(next, key, "max", max);
  if (!result && max) return null;
  return result ? result.value : next;
}
function navigation(params) {
  if (!params) return null;
  var value;
  if (params.activityDate && date.validDate(params.activityDate)) {
    var type = groups.indexOf(params.activityType) >= 0 ? params.activityType : "done";
    value = range(empty(),type,{from:params.activityDate,to:params.activityDate}).value;
  } else if (params.filterRoot === true) {
    value = empty();
    groups.forEach(function(key){var result = range(value,key,{from:params[key+"From"] || "",to:params[key+"To"] || ""});if(result)value=result.value;});
  } else if (params.priorityMin !== undefined || params.priorityMax !== undefined || params.difficultyMin !== undefined || params.difficultyMax !== undefined || params.targetFrom !== undefined || params.targetTo !== undefined) {
    value = empty();
  } else return null;
  var withPriority = readBounds(params, "priority", value);
  var withDifficulty = withPriority ? readBounds(params, "difficulty", withPriority) : null;
  return withDifficulty || value;
}
/** 任务视图切走会卸载，因此把筛选条件落到会话存储，切回来和刷新后仍能还原。 */
function save(value, missing, params) {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(STORE, JSON.stringify(Object.assign({missing:missing === true, navigation:JSON.stringify(params || {})}, value)));
  } catch (e) { /* 隐私模式或超配额时不影响筛选本身 */ }
}
function load(params) {
  try {
    if (typeof sessionStorage === "undefined") return null;
    var raw = sessionStorage.getItem(STORE);
    if (!raw) return null;
    var parsed = JSON.parse(raw), value = empty();
    if (parsed.navigation !== JSON.stringify(params || {})) return null;
    if (Array.isArray(parsed.statuses)) value.statuses = parsed.statuses.map(String).filter(function (s) { return /^[0-4]$/.test(s); });
    groups.concat(["target"]).forEach(function (key) {
      var box = parsed[key] || {};
      if (typeof box.from === "string" && date.validDate(box.from)) value[key].from = box.from;
      if (typeof box.to === "string" && date.validDate(box.to)) value[key].to = box.to;
    });
    ["priority", "difficulty"].forEach(function (key) {
      var box = parsed[key] || {}, min = limit(value, key, "min", box.min), max;
      if (min) { value = min.value; max = limit(value, key, "max", box.max); if (max) value = max.value; }
    });
    return {value:value, missing:parsed.missing === true && !value.difficulty.min && !value.difficulty.max};
  } catch (e) { return null; }
}
module.exports = {
  groups:groups, all:all, empty:empty, includes:includes, toggle:toggle, enable:enable,
  range:range, limit:limit, limits:limits, clearDifficulty:clearDifficulty, args:args,
  presets:PRESETS.map(function (spec) { return spec.id; }), presetValue:presetValue, activePreset:activePreset,
  navigation:navigation, save:save, load:load,
};
