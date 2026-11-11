import { formatNumber } from '../utils/units';

function Stat({ label, value, suffix }) {
  return (
    <div className="rounded-2xl bg-sky-50 px-2 py-3 dark:bg-slate-700/60">
      <p className="text-2xl font-bold tabular-nums">
        {value}
        <span className="ml-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{suffix}</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function HistoryView({ summary, goalMl, unit }) {
  const { last7, streak, best, average } = summary;
  const max = Math.max(goalMl, ...last7.map((d) => d.ml), 1);
  const goalPct = (goalMl / max) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Current streak" value={streak} suffix="days" />
        <Stat label="Best streak" value={best} suffix="days" />
        <Stat label="7-day average" value={formatNumber(average, unit)} suffix={unit} />
      </div>

      <div>
        <div className="relative h-44">
          {/* goal line */}
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-sky-600/60 dark:border-sky-300/60"
            style={{ bottom: `${goalPct}%` }}
            aria-hidden="true"
          />
          <div className="flex h-full items-end gap-2">
            {last7.map((d) => {
              const height = d.ml > 0 ? Math.max((d.ml / max) * 100, 3) : 0;
              const met = d.ml >= goalMl;
              return (
                <div key={d.key} className="flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${formatNumber(d.ml, unit)} ${unit}`}>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      met ? 'bg-emerald-400' : 'bg-sky-400 dark:bg-sky-500'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          {last7.map((d) => (
            <div key={d.key} className="flex-1 text-center">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{d.label}</p>
              <p className="text-[10px] tabular-nums text-slate-400">{d.ml ? formatNumber(d.ml, unit) : '—'}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Dashed line = daily goal ({formatNumber(goalMl, unit)} {unit}). Green bars met the goal.
        </p>
      </div>
    </div>
  );
}
