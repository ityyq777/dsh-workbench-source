// 任务事件口径的唯一来源：年度活动日历与难度分布的五维切换共用同一份日期定义，
// 避免「完成」在两张图上出现两种算法。日期字段保持本地 YYYY-MM-DD。
//
// claimed 用 COALESCE(claimed_at 本地日, publish_date) 兜底：终态会清空接取三列（spec 40），
// 已完成任务不写库、不回填，历史任务的接取日按发布日期近似，图例里注明。

const CLAIMED_DAY =
  "COALESCE(strftime('%Y-%m-%d', t.claimed_at/1000, 'unixepoch', 'localtime'), t.publish_date)";

export const EVENTS = {
  publish: { date: "t.publish_date", condition: "1=1" },
  done: { date: "t.done_date", condition: "t.status='2'" },
  shutdown: { date: "t.shutdown_date", condition: "t.status='1'" },
  claimed: { date: CLAIMED_DAY, condition: "t.status IN ('2','4')" },
};

export const EVENT_TYPES = Object.keys(EVENTS);

/** 事件在 [from, to] 区间内的 SQL 片段与参数（含已删除任务排除）。 */
export function eventRange(type, from, to) {
  const event = EVENTS[type];
  return {
    sql: "t.deleted_at IS NULL AND (" + event.condition + ") AND " + event.date + " BETWEEN ? AND ?",
    params: [from, to],
  };
}
