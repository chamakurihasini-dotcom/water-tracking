import { formatNumber } from '../utils/units';

const SIZE = 240;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({ current, goal, unit, percent }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(percent, 100) / 100);

  return (
    <div className="relative mx-auto h-60 w-60" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 h-full w-full">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-sky-100 dark:stroke-slate-700"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-sky-500 dark:stroke-sky-400"
          style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tabular-nums">{percent}%</span>
        <span className="mt-1 text-sm tabular-nums text-slate-500 dark:text-slate-400">
          {formatNumber(current, unit)} / {formatNumber(goal, unit)} {unit}
        </span>
        {percent >= 100 && (
          <span className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">Goal reached 🎉</span>
        )}
      </div>
    </div>
  );
}
