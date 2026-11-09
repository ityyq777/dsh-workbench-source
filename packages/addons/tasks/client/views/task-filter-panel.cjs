// Render-only filter panel; state and request ownership stay in TasksView.
var Icon = require("../ui/icons.cjs").Icon;
var model = require("./task-filter-model.cjs"), DateFilter = require("../ui/date-filter.cjs").DateFilter;
module.exports = function renderFilterPanel(React, p) {
  var h = React.createElement, en = p.lang === "en", value = p.value;
  var title = en ? "Filters" : "筛选";
  var labels = en ? {publish:"Publication range",done:"Completion range",shutdown:"Closure range"} : {publish:"发布时间范围",done:"完成时间范围",shutdown:"关闭时间范围"};
  var options = [["all",en?"All":"全部"],["urgent",en?"Urgent tasks":"紧急任务"],["0",en?"Opened":"已开启"],["2",en?"Completed":"已完成"],["1",en?"Closed":"已关闭"],["3",en?"Restarted":"已重启"]];
  function change(next) { p.onChange(next); }
  function setRange(key, input) {
    var result = model.range(value,key,input);
    if (!result) { p.onHint(en ? "Enter a valid date" : "请输入有效日期"); return; }
    var hints = [];
    if (result.swapped || input.swapped) hints.push(en ? "Start was after end; dates swapped" : "起始晚于终止，已交换");
    if (result.autoSelected) hints.push(en ? "Corresponding status selected automatically" : "已自动勾选对应状态");
    p.onHint(hints.join(" · ")); change(result.value);
  }
  return h("aside", {className:"wbt-filter-panel" + (p.open ? " expanded" : ""),"aria-label":title},
    h("button",{type:"button",className:"wbt-btn wbt-filter-toggle","aria-label":title,title:title,"aria-expanded":p.open,"aria-controls":p.id,onClick:p.onToggle}, h(Icon,{name:"filter"})),
    h("div",{className:"wbt-filter-content",id:p.id},
      h("fieldset",{className:"wbt-filter-group wbt-status-grid"},h("legend",null,en?"Status (match any)":"状态"),options.map(function(option){
        var key = option[0], checked = key === "all" ? model.all(value) : key === "urgent" ? value.urgent : value.statuses.indexOf(key) >= 0;
        return h("label",{key:key,className:"wbt-check"},h("input",{type:"checkbox",checked:checked,"data-status":key,onChange:function(){change(model.toggle(value,key));p.onHint("");}}),option[1]);
      })),
      p.search,
      h("div",{className:"wbt-filter-group"},p.tags,p.missing),
      model.groups.map(function(key){
        return h("section",{key:key,className:"wbt-filter-group","aria-label":labels[key]},
          h("strong",null,labels[key]),
          h(DateFilter,{lang:p.lang,kind:key,value:value[key],onChange:function(next){setRange(key,next);}}));
      }),
      (value.done.from || value.done.to) && (value.shutdown.from || value.shutdown.to) ? h("div",{className:"wbt-mhint",role:"status"},en?"Completion and closure ranges require different statuses; their intersection is empty.":"完成与关闭范围要求不同状态，同时填写时交集为空。") : null,
      p.hint ? h("div",{className:"wbt-mhint",role:"status"},p.hint) : null));
};
