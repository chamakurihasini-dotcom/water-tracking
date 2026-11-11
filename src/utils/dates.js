/** Local calendar day key, e.g. "2026-11-11". Uses the device's timezone. */
export function dayKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function nextDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + 1));
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Builds everything the History view needs from raw entries.
 * - last7: the 7 days ending today, oldest first, with total ml per day
 * - streak: consecutive days meeting the goal, ending today (or yesterday
 *   if today's goal isn't met yet, so the streak isn't shown as broken early)
 * - best: longest run of goal-meeting days in the data
 * - average: mean daily total over the last 7 days
 */
export function summarizeDays(entries, goalMl, now = new Date()) {
  const totals = {};
  for (const e of entries) {
    const k = dayKey(e.ts);
    totals[k] = (totals[k] || 0) + e.ml;
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(now, i - 6);
    const key = dayKey(date);
    return {
      key,
      label: date.toLocaleDateString([], { weekday: 'short' }),
      ml: totals[key] || 0,
    };
  });

  let streak = 0;
  let cursor = now;
  if ((totals[dayKey(now)] || 0) < goalMl) cursor = addDays(now, -1);
  while ((totals[dayKey(cursor)] || 0) >= goalMl) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of Object.keys(totals).sort()) {
    if (totals[k] >= goalMl) {
      run = prev && nextDayKey(prev) === k ? run + 1 : 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    prev = k;
  }

  const average = Math.round(last7.reduce((sum, d) => sum + d.ml, 0) / 7);
  return { last7, streak, best, average };
}
