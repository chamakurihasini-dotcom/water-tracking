import { formatAmount } from '../utils/units';
import { formatTime } from '../utils/dates';

export default function TodayLog({ entries, unit, onDelete }) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Nothing logged yet today. Tap a button above to start 💧
      </p>
    );
  }

  return (
    <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {entries.map((e) => (
        <li
          key={e.id}
          className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 dark:bg-slate-700/60"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">
              💧
            </span>
            <div>
              <p className="font-semibold tabular-nums">{formatAmount(e.ml, unit)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(e.ts)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(e)}
            aria-label={`Delete ${formatAmount(e.ml, unit)} entry`}
            className="min-h-11 rounded-xl px-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-slate-600"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
