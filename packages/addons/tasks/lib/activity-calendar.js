/** 年度任务活动：日期字段保持本地 YYYY-MM-DD，与统计列表一致；只读 SQL 聚合。 */
const EVENTS = {
  publish: { date: 'publish_date', condition: '1=1' },
  done: { date: 'done_date', condition: "t.status='2'" },
  shutdown: { date: 'shutdown_date', condition: "t.status='1'" },
};
const TYPES = Object.keys(EVENTS);
const zero = () => ({ publish: 0, done: 0, shutdown: 0, total: 0 });

function validDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return year >= 1900 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 &&
    day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function activityFilter(activityDate, activityType) {
  if (activityDate === undefined && activityType === undefined) return null;
  if (!validDay(activityDate)) throw new Error('activityDate 必须是合法的 YYYY-MM-DD 日期（1900..9999 年）');
  const type = activityType === undefined ? 'done' : activityType;
  if (!TYPES.includes(type)) throw new Error('activityType 只支持 publish / done / shutdown');
  const event = EVENTS[type];
  return {
    date: activityDate, type,
    sql: '(' + event.condition + ' AND t.' + event.date + '=?)',
    params: [activityDate],
  };
}

export function activityCalendar(db, args = {}) {
  const year = args.year;
  if (!Number.isInteger(year) || year < 1900 || year > 9999) throw new Error('year 必填，必须是 1900..9999 的整数');
  const from = year + '-01-01', to = year + '-12-31';
  const sql = TYPES.map(key => {
    const event = EVENTS[key];
    return "SELECT t." + event.date + " AS date, '" + key + "' AS kind, COUNT(*) AS n FROM task t WHERE t.deleted_at IS NULL AND " +
      event.condition + ' AND t.' + event.date + ' BETWEEN ? AND ? GROUP BY t.' + event.date;
  }).join(' UNION ALL ') + ' ORDER BY date';
  const rows = db.prepare(sql).all(...TYPES.flatMap(() => [from, to]));
  const daily = new Map();
  for (const row of rows) {
    if (!validDay(row.date)) continue;
    if (!daily.has(row.date)) daily.set(row.date, { date: row.date, publish: 0, done: 0, shutdown: 0 });
    daily.get(row.date)[row.kind] = Number(row.n);
  }
  const days = [...daily.values()], totals = zero(), max = zero();
  for (const day of days) {
    let total = 0;
    for (const key of TYPES) {
      totals[key] += day[key]; max[key] = Math.max(max[key], day[key]); total += day[key];
    }
    totals.total += total; max.total = Math.max(max.total, total);
  }
  return { year, days, totals, max };
}

export function registerActivityCalendarAction(api) {
  api.action('tasks.activityCalendar', {
    description: '只读年度任务活动日历，独立于 statsReport 时间范围。排除已删除任务；publish=publish_date，done=当前 status=2 且 done_date，shutdown=当前 status=1 且 shutdown_date；日期均为本地日期，不按 UTC 转换。返回 year、按日期升序且仅含有活动日的 days:[{date,publish,done,shutdown}]、totals 与 max（均含三类及 total）；totals.total 是事件数之和，同一任务可贡献多类事件，max.total 是单日三类事件数之和的最大值，空年份各值为0。',
    input: { type: 'object', required: ['year'], properties: {
      year: { type: 'integer', minimum: 1900, maximum: 9999, description: '必填公历年份，1900..9999 整数；无默认值，不接受字符串。' },
    } },
    examples: [{ year: 2024 }],
    execute: args => activityCalendar(api.db, args || {}),
    render: result => JSON.stringify(result),
  });
}
