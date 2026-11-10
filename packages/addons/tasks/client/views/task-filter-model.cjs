// One state contract for checkbox OR selection and independent range AND filters.
// 优先级/难度区间共用同一份状态：「紧急任务」只是优先级 6–10 的快捷显示，不再单独传给接口。
var date = require("../ui/date-filter.cjs");
var groups = ["publish", "done", "shutdown"];
// 0 只表示「没有优先级 / 没有难度」，所以 UI 区间端点从 1 起：优先级整数 1–10，难度 0.5 起按半档递增。
var limits = {priority:{min:1, max:10, step:1}, difficulty:{min:0.5, max:5, step:0.5}};
var STORE = "wbt.taskFilters.v2";
function bounds() { return {min:"", max:""}; }
function empty() { return {statuses:[], priority:bounds(), difficulty:bounds(), publish:{from:"",to:""}, done:{from:"",to:""}, shutdown:{from:"",to:""}}; }
function statusFree(value) { return !value.statuses.length; }
function hasRange(value) {
  return groups.some(function (key) { return value[key].from || value[key].to; }) ||
    !!(value.priority.min || value.priority.max || value.difficulty.min || value.difficulty.max);
}
function all(value) { return statusFree(value) && !hasRange(value); }
function isUrgent(value) { return value.priority.min === "6" && value.priority.max === "10"; }
function fromTab(tab) {
  var value = empty(), status = {5:"1",6:"0",7:"2"}[tab];
  if (status) value.statuses = [status];
  if (Number(tab) === 0) value.priority = {min:"6", max:"10"};
  return value;
}
// 状态是否入选只看状态本身；区间是额外 AND 条件，不能让它把状态判断一起带走。
function includes(value, status) { return statusFree(value) || value.statuses.indexOf(status) >= 0; }
function toggle(value, key) {
  var next = Object.assign({}, value, {statuses:value.statuses.slice()});
  if (key === "all") return empty();
  else if (key === "urgent") next.priority = isUrgent(value) ? bounds() : {min:"6", max:"10"};
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
  if (key !== "publish" && (normalized.from || normalized.to)) next = enable(value,key);
  next = Object.assign({},next); next[key] = {from:normalized.from,to:normalized.to};
  return {value:next,swapped:normalized.swapped,autoSelected:key !== "publish" && value.statuses.indexOf(key === "done" ? "2" : "1") < 0 && !!(normalized.from || normalized.to)};
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
  groups.forEach(function(key){out[key+"From"] = value[key].from || undefined; out[key+"To"] = value[key].to || undefined;});
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
  } else if (params.priorityMin !== undefined || params.priorityMax !== undefined || params.difficultyMin !== undefined || params.difficultyMax !== undefined) {
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
    if (Array.isArray(parsed.statuses)) value.statuses = parsed.statuses.map(String).filter(function (s) { return /^[0-3]$/.test(s); });
    groups.forEach(function (key) {
      var box = parsed[key] || {};
      if (date.validDate(box.from)) value[key].from = box.from;
      if (date.validDate(box.to)) value[key].to = box.to;
    });
    ["priority", "difficulty"].forEach(function (key) {
      var box = parsed[key] || {}, min = limit(value, key, "min", box.min), max;
      if (min) { value = min.value; max = limit(value, key, "max", box.max); if (max) value = max.value; }
    });
    return {value:value, missing:parsed.missing === true && !value.difficulty.min && !value.difficulty.max};
  } catch (e) { return null; }
}
module.exports = {
  groups:groups, all:all, empty:empty, fromTab:fromTab, includes:includes, toggle:toggle, enable:enable,
  range:range, limit:limit, limits:limits, clearDifficulty:clearDifficulty, isUrgent:isUrgent, args:args,
  navigation:navigation, save:save, load:load,
};
