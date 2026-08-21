/** Format a number as Kenyan Shillings (KES), e.g. 2,500. */
export function formatKes(amount: number | string | null | undefined): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'KES 0';
  return `KES ${n.toLocaleString('en-KE', { maximumFractionDigits: n % 1 === 0 ? 0 : 2 })}`;
}

/** Format an ISO/DB date string into a short, readable form. */
export function formatDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Relative time, e.g. "3h", "2d". */
export function timeAgo(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return formatDate(value);
}

export function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function fullNameOf(u?: { fullName?: string; full_name?: string }): string {
  return u?.fullName || u?.full_name || 'Unknown';
}
