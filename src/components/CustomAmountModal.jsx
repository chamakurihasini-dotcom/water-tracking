import { useEffect, useState } from 'react';
import Modal from './Modal';
import { MAX_ENTRY_ML, displayToMl, formatNumber } from '../utils/units';

export default function CustomAmountModal({ open, onClose, unit, onSubmit }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = Number(value);
    if (!n || n <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    const ml = Math.round(displayToMl(n, unit));
    if (ml > MAX_ENTRY_ML) {
      setError(`Maximum ${formatNumber(MAX_ENTRY_ML, unit)} ${unit} per entry.`);
      return;
    }
    onSubmit(ml);
    onClose();
  };

  return (
    <Modal open={open} title="Custom amount" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            aria-label={`Amount in ${unit}`}
            className="h-14 flex-1 rounded-2xl border border-sky-200 bg-sky-50 px-4 text-2xl font-semibold tabular-nums outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700"
          />
          <span className="text-lg font-medium text-slate-500 dark:text-slate-300">{unit}</span>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-sky-500 font-semibold text-white transition hover:bg-sky-600 active:scale-[.98]"
        >
          Add water
        </button>
      </form>
    </Modal>
  );
}
