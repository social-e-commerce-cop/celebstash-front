/**
 * Safely parses any date/time string from backend (ISO 8601, UTC Instant with microseconds,
 * LocalDateTime without timezone, or raw SQL datetime string) into Unix epoch milliseconds.
 *
 * Prevents React Native / Hermes engine parsing bugs:
 * 1) Hermes stops parsing ISO fractional seconds after 3 digits, dropping the trailing 'Z'.
 *    Without 'Z', it incorrectly parses UTC timestamps as local device time, causing a 2-hour offset
 *    in UTC+2 timezones.
 * 2) Strings without timezone are compared (UTC vs local) against currentNow to reliably pick the correct time.
 */
export function parseTimestamp(dateStr?: string | number, currentNow: number = Date.now()): number {
  if (!dateStr) return NaN;
  if (typeof dateStr === 'number') return dateStr;

  let str = String(dateStr).trim().replace(' ', 'T');
  if (!str) return NaN;

  // Normalize fractional seconds to at most 3 digits (milliseconds)
  // E.g. "2026-09-18T05:16:39.628607Z" -> "2026-09-18T05:16:39.628Z"
  str = str.replace(/\.(\d+)/, (_, frac) => '.' + frac.slice(0, 3));

  // Match ISO 8601 components explicitly: YYYY-MM-DDTHH:mm:ss(.sss)?(Z|[+-]HH:mm)?
  const isoMatch = str.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}(?::?\d{2})?)?$/i
  );

  if (isoMatch) {
    const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr, msStr, tzStr] = isoMatch;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const sec = parseInt(secStr, 10);
    const ms = msStr ? parseInt(msStr.padEnd(3, '0'), 10) : 0;

    if (tzStr) {
      if (tzStr.toUpperCase() === 'Z') {
        return Date.UTC(year, month, day, hour, min, sec, ms);
      } else {
        const sign = tzStr[0] === '-' ? -1 : 1;
        const cleanTz = tzStr.slice(1).replace(':', '');
        const tzHour = parseInt(cleanTz.slice(0, 2), 10);
        const tzMin = cleanTz.length >= 4 ? parseInt(cleanTz.slice(2, 4), 10) : 0;
        const offsetMs = sign * (tzHour * 60 + tzMin) * 60 * 1000;
        return Date.UTC(year, month, day, hour, min, sec, ms) - offsetMs;
      }
    } else {
      // String without timezone offset (e.g. from backend LocalDateTime).
      // Check both UTC interpretation and local device interpretation, picking the closest to currentNow.
      const utcTime = Date.UTC(year, month, day, hour, min, sec, ms);
      const localTime = new Date(year, month, day, hour, min, sec, ms).getTime();
      return Math.abs(currentNow - utcTime) < Math.abs(currentNow - localTime) ? utcTime : localTime;
    }
  }

  const parsed = new Date(str).getTime();
  return isNaN(parsed) ? NaN : parsed;
}

/**
 * Format relative time elapsed (e.g. 'now', '1min', '5mins', '2h', '3d', '1w', '1y')
 */
export function formatRealTimeAgo(dateStr?: string | number, currentNow: number = Date.now()): string {
  if (!dateStr) return '';
  try {
    const time = parseTimestamp(dateStr, currentNow);
    if (isNaN(time)) return '';

    const diffSec = Math.floor((currentNow - time) / 1000);
    // If posted within the last 60 seconds (or slight device/server clock difference), display 'now'
    if (diffSec < 60) return 'now';

    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return mins === 1 ? '1min' : `${mins}mins`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    const weeks = Math.floor(days / 7);
    if (weeks < 52) return `${weeks}w`;

    const years = Math.floor(days / 365);
    return `${years}y`;
  } catch {
    return '';
  }
}
