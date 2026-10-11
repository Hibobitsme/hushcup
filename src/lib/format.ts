/** "11:00 PM" */
export function clock(t: number | Date) {
  const d = new Date(t);
  const H = d.getHours();
  const h12 = H % 12 === 0 ? 12 : H % 12;
  return `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${H >= 12 ? 'PM' : 'AM'}`;
}

/** "11 PM", or "11:30 PM" when the minutes matter. */
export function clockShort(t: number | Date) {
  const d = new Date(t);
  const H = d.getHours();
  const m = d.getMinutes();
  const h12 = H % 12 === 0 ? 12 : H % 12;
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${H >= 12 ? 'PM' : 'AM'}`;
}

/** Minutes after midnight to "11:00 PM". */
export function minuteLabel(min: number) {
  const x = ((min % 1440) + 1440) % 1440;
  const d = new Date(2000, 0, 1, Math.floor(x / 60), x % 60);
  return clock(d);
}

/** "Thursday, Oct 8" */
export function longDate(t: number) {
  return new Date(t).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function mg(n: number) {
  return Math.round(n);
}
