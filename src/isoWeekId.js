// Compute the ISO 8601 week identifier (e.g. "2026-W29")
// for a given Date. Uses UTC internally so the result is
// stable across timezones.
export default function isoWeekId (date) {
  const t = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  // ISO weeks start on Monday. Shift so Mon=0.
  const day = (t.getUTCDay() + 6) % 7
  // Thursday of this ISO week determines the year.
  t.setUTCDate(t.getUTCDate() - day + 3)
  const year = t.getUTCFullYear()
  // First Thursday of that year.
  const firstThu = new Date(Date.UTC(year, 0, 4))
  const firstThuDay = (firstThu.getUTCDay() + 6) % 7
  const week = 1 + Math.round(
    ((t - firstThu) / 86400000 - 3 + firstThuDay) / 7
  )
  return `${year}-W${String(week).padStart(2, '0')}`
}
