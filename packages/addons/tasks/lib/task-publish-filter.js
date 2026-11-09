/** 发布日范围独立于目标日期及活动日；只比较存储值的日期部分。 */
function publishDay(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(field + " 必须是合法的 YYYY-MM-DD 日期");
  }
  const [year, month, day] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  if (year < 1 || month < 1 || month > 12 || day < 1 ||
      day > [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]) {
    throw new Error(field + " 必须是合法的 YYYY-MM-DD 日期");
  }
  return value;
}

export function publishFilter(from, to) {
  let publishFrom = publishDay(from, "publishFrom"), publishTo = publishDay(to, "publishTo");
  const notices = [];
  if (publishFrom && publishTo && publishFrom > publishTo) {
    [publishFrom, publishTo] = [publishTo, publishFrom];
    notices.push({ code: "publish_range_swapped", field: "publishFrom/publishTo",
      message: "发布日期起始晚于终止，已交换", publishFrom, publishTo });
  }
  return { publishFrom, publishTo, notices };
}
