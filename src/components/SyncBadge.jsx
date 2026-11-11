const STATES = {
  local: ['Local only', 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'],
  idle: ['Connecting', 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'],
  syncing: ['Syncing…', 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'],
  synced: ['Synced', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'],
  offline: ['Offline', 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'],
  error: ['Sync error', 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'],
};

export default function SyncBadge({ status, pendingCount, configured }) {
  const [label, styles] = STATES[configured ? status : 'local'] ?? STATES.idle;
  const suffix = pendingCount > 0 ? ` · ${pendingCount} pending` : '';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
      role="status"
    >
      {label}
      {configured ? suffix : ''}
    </span>
  );
}
