// Small date/format helpers shared by the search bar, hotel page and booking page.
const pad = (n: number) => String(n).padStart(2, '0');
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseIso = (s: string): Date | null => {
  const p = (s || '').split('-');
  return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
};
export const addDaysIso = (iso: string, n: number) => {
  const d = parseIso(iso) || new Date();
  d.setDate(d.getDate() + n);
  return toIso(d);
};
export const nightsBetween = (checkIn: string, checkOut: string) => {
  const a = parseIso(checkIn);
  const b = parseIso(checkOut);
  if (!a || !b) return 1;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Tue 13 Oct 2026" */
export const niceDate = (iso: string) => {
  const d = parseIso(iso);
  return d ? `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}` : iso;
};
/** "13 Oct" */
export const shortDate = (iso: string) => {
  const d = parseIso(iso);
  return d ? `${d.getDate()} ${MON[d.getMonth()]}` : iso;
};
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const guestsLine = (adults: number, children: number) =>
  `${plural(adults, 'adult')}${children ? `, ${plural(children, 'child', 'children')}` : ''}`;
