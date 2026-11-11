import { useEffect, useRef, useState } from 'react';
import { PRESETS, formatNumber } from '../utils/units';

export default function QuickAdd({ unit, onAdd, onCustom }) {
  const [pop, setPop] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleAdd = (ml) => {
    onAdd(ml);
    navigator.vibrate?.(15);
    setPop({ key: Date.now(), text: `${formatNumber(ml, unit)} ${unit}` });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPop(null), 1100);
  };

  return (
    <div className="relative pt-6">
      {pop && (
        <span
          key={pop.key}
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 animate-float-up whitespace-nowrap text-lg font-bold text-sky-600 dark:text-sky-300"
        >
          +{pop.text}
        </span>
      )}

      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.ml}
            type="button"
            onClick={() => handleAdd(p.ml)}
            className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl bg-sky-50 px-2 py-4 text-center ring-1 ring-sky-100 transition hover:bg-sky-100 active:scale-95 dark:bg-slate-700 dark:ring-slate-600 dark:hover:bg-slate-600"
          >
            <span className="text-2xl" aria-hidden="true">
              {p.icon}
            </span>
            <span className="text-sm font-semibold">{p.label}</span>
            <span className="text-xs text-slate-500 dark:text-slate-300">
              +{formatNumber(p.ml, unit)} {unit}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onCustom}
        className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl bg-sky-500 font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-[.98]"
      >
        + Custom amount
      </button>
    </div>
  );
}
