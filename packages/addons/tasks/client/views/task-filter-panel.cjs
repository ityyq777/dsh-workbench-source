// Render-only filter panel; state and request ownership stay in TasksView.
var Icon = require("../ui/icons.cjs").Icon;
var model = require("./task-filter-model.cjs"), DateFilter = require("../ui/date-filter.cjs").DateFilter;
// Keep an editing draft so typing “10” does not swap the range after its first digit.
function NumberInput(p) {
  var React = p.React, draftState = React.useState(String(p.value)), draft = draftState[0], setDraft = draftState[1];
  React.useEffect(function () { setDraft(String(p.value)); }, [p.value]);
  function commit(node) {
    var result = p.commit(node.validity && node.validity.badInput ? "invalid" : draft);
    setDraft(result === undefined ? String(p.value) : result);
  }
  return React.createElement("input", {type:"number",className:"wbt-input wbt-limit-input",min:p.min,max:p.max,step:p.step,inputMode:p.step === 1 ? "numeric" : "decimal",value:draft,
    "aria-label":p.label,placeholder:p.placeholder,onChange:function(e){setDraft(e.target.value);},
    onBlur:function(e){commit(e.currentTarget);},onKeyDown:function(e){
      if(e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
      if(e.key === "Escape") { e.preventDefault(); setDraft(String(p.value)); }
    }});
}
module.exports = function renderFilterPanel(React, p) {
  var h = React.createElement, en = p.lang === "en", value = p.value;
  var title = en ? "Filters" : "筛选";
  var labels = en ? {publish:"Publication range",done:"Completion range",shutdown:"Closure range"} : {publish:"发布时间范围",done:"完成时间范围",shutdown:"关闭时间范围"};
  var options = [["all",en?"All":"全部"],["urgent",en?"Urgent tasks":"紧急任务"],["0",en?"Opened":"已开启"],["2",en?"Completed":"已完成"],["1",en?"Closed":"已关闭"],["3",en?"Restarted":"已重启"]];
  var unitId = p.id + "-unit";
  var units = en ? {priority:"1–10, higher is more urgent", difficulty:"0.5–5 in half steps, higher is harder"} : {priority:"1–10，越大越紧急", difficulty:"0.5–5，半档递增，越大越难"};
  function change(next) { p.onChange(next); }
  function setRange(key, input) {
    var result = model.range(value,key,input);
    if (!result) { p.onHint(en ? "Enter a valid date" : "请输入有效日期"); return; }
    var hints = [];
    if (result.swapped || input.swapped) hints.push(en ? "Start was after end; dates swapped" : "起始晚于终止，已交换");
    if (result.autoSelected) hints.push(en ? "Corresponding status selected automatically" : "已自动勾选对应状态");
    p.onHint(hints.join(" · ")); change(result.value);
  }
  function setLimit(key, end, text) {
    var result = model.limit(value,key,end,text);
    if (!result) { p.onHint(en ? (key === "difficulty" ? "Difficulty takes 0.5 steps from 0.5 to 5" : "Priority takes whole numbers 1–10") : (key === "difficulty" ? "难度仅接受 0.5–5 之间的半档数值" : "优先级仅接受 1–10 的整数")); return; }
    var hints = [];
    if (result.swapped) hints.push(en ? "Start was above end; values swapped" : "起始大于终止，已交换");
    if (result.clearsMissing && p.difficultyMissing) hints.push(en ? "Cleared “difficulty unset only”" : "已取消「仅未填难度」");
    p.onHint(hints.join(" · "));
    if (result.clearsMissing && p.onMissingChange) p.onMissingChange(false);
    change(result.value);
    return result.value[key][end];
  }
  function limitRow(key, label) {
    var box = value[key], spec = model.limits[key];
    function field(end) {
      var labelText = en ? (end === "min" ? "Minimum " : "Maximum ") + label : (end === "min" ? "最低" : "最高") + label;
      return h(NumberInput,{React:React,value:box[end],min:spec.min,max:spec.max,step:spec.step,label:labelText,placeholder:en?"Any":"不限",commit:function(text){return setLimit(key,end,text);}});
    }
    function clear() {
      p.onHint(""); change(Object.assign({},value,(function(){var next={};next[key]={min:"",max:""};return next;})()));
    }
    return h("div",{className:"wbt-limit-row",key:key},
      h("strong",null,label),
      h("div",{className:"wbt-limit-fields",role:"group","aria-label":label,"aria-describedby":unitId+"-"+key},field("min"),h("span",{className:"wbt-limit-join","aria-hidden":true},en?"to":"至"),field("max"),
        h("button",{type:"button",className:"wbt-btn ghost wbt-limit-clear","aria-label":(en?"Clear ":"清空")+label,title:(en?"Clear ":"清空")+label,onClick:clear},"×")),
      h("span",{className:"wbt-limit-unit",id:unitId+"-"+key},units[key]));
  }
  return h("aside", {className:"wbt-filter-panel" + (p.open ? " expanded" : ""),"aria-label":title},
    h("button",{type:"button",className:"wbt-btn wbt-filter-toggle","aria-label":title,title:title,"aria-expanded":p.open,"aria-controls":p.id,onClick:p.onToggle}, h(Icon,{name:"filter"})),
    h("div",{className:"wbt-filter-content",id:p.id},
      h("fieldset",{className:"wbt-filter-group wbt-status-grid"},h("legend",null,en?"Status (match any)":"状态"),options.map(function(option){
        var key = option[0], checked = key === "all" ? model.all(value) : key === "urgent" ? model.isUrgent(value) : value.statuses.indexOf(key) >= 0;
        return h("label",{key:key,className:"wbt-check"},h("input",{type:"checkbox",checked:checked,"data-status":key,onChange:function(){change(model.toggle(value,key));p.onHint("");}}),option[1]);
      })),
      p.search,
      h("div",{className:"wbt-filter-group"},p.tags,p.missing),
      h("fieldset",{className:"wbt-filter-group wbt-limit-group"},h("legend",null,en?"Priority and difficulty":"优先级与难度"),
        h("p",{className:"wbt-limit-hint"},en?"Priority takes whole numbers 1–10; difficulty takes 0.5 steps. Blank means no limit.":"优先级取 1–10 的整数，难度按 0.5 递增；留空表示不限。"),
        limitRow("priority", en ? "Priority" : "优先级"),
        limitRow("difficulty", en ? "Difficulty" : "难度")),
      model.groups.map(function(key){
        return h("section",{key:key,className:"wbt-filter-group","aria-label":labels[key]},
          h("strong",null,labels[key]),
          h(DateFilter,{lang:p.lang,kind:key,value:value[key],onChange:function(next){setRange(key,next);}}));
      }),
      (value.done.from || value.done.to) && (value.shutdown.from || value.shutdown.to) ? h("div",{className:"wbt-mhint",role:"status"},en?"Completion and closure ranges require different statuses; their intersection is empty.":"完成与关闭范围要求不同状态，同时填写时交集为空。") : null,
      p.hint ? h("div",{className:"wbt-mhint",role:"status"},p.hint) : null));
};
