// 计划口径：目标计划日期（target_date）落在区间内的未删除任务数。
// 计划不是活动事件——不能并入 ./events.js 的 EVENTS：那会让难度分布凭空多一维，
// 也会把「活动总数」这个用户看惯的数字静默改写。年度活动日历与范围趋势图都从这里取。
const PLAN = { key: "target", date: "t.target_date" };

/** 计划在 [from, to] 区间内的 SQL 片段与参数（含已删除任务与空目标日排除）。 */
export function planRange(from, to) {
  return {
    sql: "t.deleted_at IS NULL AND " + PLAN.date + " IS NOT NULL AND " + PLAN.date + " BETWEEN ? AND ?",
    params: [from, to],
  };
}

export { PLAN };
