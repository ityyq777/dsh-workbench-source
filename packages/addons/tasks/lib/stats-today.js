// 今日活动独立于报表 range；历史日期允许附带时间，只比较前十位。
export const TODAY_STATS_DESCRIPTION = "服务端本地日期 date（YYYY-MM-DD）；published=publish_date 前十位为今日的全部状态任务，done=当前 status=2 且 done_date 前十位为今日，shutdown=当前 status=1 且 shutdown_date 前十位为今日；均排除软删除。avgDifficultyDone 仅统计上述今日完成且 difficulty>0 的任务，四舍五入一位小数，无样本为 null；avgSample 为有效样本数。今日指标独立于 range/from/to";

export function todayActivity(db, date) {
  const row = db.prepare(
    "SELECT " +
      "COUNT(CASE WHEN substr(publish_date,1,10)=? THEN 1 END) AS published, " +
      "COUNT(CASE WHEN status='2' AND substr(done_date,1,10)=? THEN 1 END) AS done, " +
      "COUNT(CASE WHEN status='1' AND substr(shutdown_date,1,10)=? THEN 1 END) AS shutdown, " +
      "ROUND(AVG(CASE WHEN status='2' AND substr(done_date,1,10)=? AND difficulty>0 THEN difficulty END),1) AS avgDifficultyDone, " +
      "COUNT(CASE WHEN status='2' AND substr(done_date,1,10)=? AND difficulty>0 THEN 1 END) AS avgSample " +
      "FROM task WHERE deleted_at IS NULL",
  ).get(date, date, date, date, date);
  return {
    date,
    published: Number(row.published),
    done: Number(row.done),
    shutdown: Number(row.shutdown),
    avgDifficultyDone: row.avgDifficultyDone === null ? null : Number(row.avgDifficultyDone),
    avgSample: Number(row.avgSample),
  };
}
