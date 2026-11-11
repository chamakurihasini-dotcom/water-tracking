export default function Toast({ message, actionLabel, onAction }) {
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-white shadow-lg"
    >
      <span className="text-sm">{message}</span>
      {onAction && (
        <button type="button" onClick={onAction} className="min-h-11 px-2 font-semibold text-sky-300">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
