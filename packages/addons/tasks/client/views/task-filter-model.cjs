// One state contract for checkbox OR selection and independent date-range AND filters.
var date = require("../ui/date-filter.cjs");
var groups = ["publish", "done", "shutdown"];
function all(value) { return !value.statuses.length && !value.urgent; }
function empty() { return {statuses:[], urgent:false, publish:{from:"",to:""}, done:{from:"",to:""}, shutdown:{from:"",to:""}}; }
function fromTab(tab) {
  var value = empty(), status = {5:"1",6:"0",7:"2"}[tab];
  if (status) value.statuses = [status];
  value.urgent = Number(tab) === 0;
  return value;
}
function includes(value, status) { return all(value) || value.statuses.indexOf(status) >= 0; }
function toggle(value, key) {
  var next = Object.assign({}, value, {statuses:value.statuses.slice()});
  if (key === "all") { next.statuses = []; next.urgent = false; }
  else if (key === "urgent") next.urgent = !value.urgent;
  else { var index = next.statuses.indexOf(key); if (index >= 0) next.statuses.splice(index, 1); else next.statuses.push(key); }
  // A disabled range is cleared, never silently retained as an invisible predicate.
  if (!includes(next,"2")) next.done = {from:"",to:""};
  if (!includes(next,"1")) next.shutdown = {from:"",to:""};
  return next;
}
function enable(value, key) {
  var status = key === "done" ? "2" : "1";
  return Object.assign({},value,{statuses:all(value) ? [status] : Array.from(new Set(value.statuses.concat(status)))});
}
function range(value, key, input) {
  var normalized = date.normalize(input);
  if (!normalized) return null;
  var next = value;
  if (key !== "publish" && (normalized.from || normalized.to)) next = enable(value,key);
  next = Object.assign({},next); next[key] = {from:normalized.from,to:normalized.to};
  return {value:next,swapped:normalized.swapped,autoSelected:all(value) && key !== "publish" && !!(normalized.from || normalized.to)};
}
function args(value) {
  var out = {statuses:value.statuses.map(Number),urgent:value.urgent};
  groups.forEach(function(key){out[key+"From"] = value[key].from || undefined; out[key+"To"] = value[key].to || undefined;});
  return out;
}
function navigation(params) {
  if (!params) return null;
  if (params.activityDate && date.validDate(params.activityDate)) {
    var type = groups.indexOf(params.activityType) >= 0 ? params.activityType : "done";
    return range(empty(),type,{from:params.activityDate,to:params.activityDate}).value;
  }
  if (params.filterRoot !== true) return null;
  var value = empty();
  groups.forEach(function(key){var result = range(value,key,{from:params[key+"From"] || "",to:params[key+"To"] || ""});if(result)value=result.value;});
  return value;
}
module.exports = {groups:groups,all:all,empty:empty,fromTab:fromTab,includes:includes,toggle:toggle,enable:enable,range:range,args:args,navigation:navigation};
