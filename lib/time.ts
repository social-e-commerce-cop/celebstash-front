/**
 * Server timestamps → correct local time.
 *
 * The backend runs in UTC. Some responses carry an explicit zone ("2026-10-01T14:30:00Z");
 * older fields are zoneless LocalDateTime strings ("2026-10-01T14:30:00.123456"). JavaScript
 * parses a zoneless date-time as the DEVICE's local time, which shifted every such timestamp by
 * the phone's UTC offset (two hours in Kigali). Zoneless values are therefore read as UTC here,
 * and the conversion to the viewer's time zone is left to Date/Intl — never manual hour math.
 */

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Parses a server timestamp. Returns null for missing or unparseable values. */
export function parseServerDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') return new Date(value);

  let iso = value.trim();
  if (DATE_TIME.test(iso) && !HAS_ZONE.test(iso)) {
    // Hermes only accepts up to millisecond precision; Java sends microseconds/nanoseconds.
    iso = iso.replace(/(\.\d{3})\d+$/, '$1') + 'Z';
  }
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** Normalises a server timestamp to an ISO-8601 UTC string (for state that stores strings). */
export function toUtcIso(value: string | null | undefined): string {
  const d = parseServerDate(value);
  return d ? d.toISOString() : value ?? '';
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function isYesterday(d: Date, now: Date): boolean {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
}

/**
 * Social-style relative time in the viewer's time zone:
 * "Just now", "2m", "3h", "Yesterday", "4d", then "Sep 28" (or "Sep 28, 2025" for older years).
 */
export function formatRelativeTime(value: string | number | Date | null | undefined, now: Date = new Date()): string {
  const d = parseServerDate(value);
  if (!d) return '';
  const diff = now.getTime() - d.getTime();

  if (diff < MINUTE) return 'Just now'; // also absorbs small clock skew (negative diffs)
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (isYesterday(d, now)) return 'Yesterday';
  if (diff < 7 * DAY) return `${Math.max(2, Math.floor(diff / DAY))}d`;

  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
