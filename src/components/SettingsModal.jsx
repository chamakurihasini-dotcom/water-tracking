import { useEffect, useState } from 'react';
import Modal from './Modal';
import { GOAL_MAX_ML, GOAL_MIN_ML, displayToMl, mlToDisplay } from '../utils/units';

const THEMES = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'System'],
];

export default function SettingsModal({ open, onClose, settings, onSave, email, pendingCount, onSignOut }) {
  const [unit, setUnit] = useState(settings.unit);
  const [goal, setGoal] = useState('');
  const [theme, setTheme] = useState(settings.theme);
  const [error, setError] = useState('');

  // Reset the draft each time the modal opens.
  useEffect(() => {
    if (open) {
      setUnit(settings.unit);
      setTheme(settings.theme);
      setGoal(String(Math.round(mlToDisplay(settings.goalMl, settings.unit))));
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const changeUnit = (next) => {
    const ml = displayToMl(Number(goal) || 0, unit);
    setGoal(String(Math.round(mlToDisplay(ml, next))));
    setUnit(next);
  };

  const handleSave = () => {
    const ml = Math.round(displayToMl(Number(goal), unit));
    if (!ml || ml < GOAL_MIN_ML || ml > GOAL_MAX_ML) {
      setError(`Goal must be between ${GOAL_MIN_ML} and ${GOAL_MAX_ML} ml.`);
      return;
    }
    onSave({ goalMl: ml, unit, theme });
    onClose();
  };

  const handleSignOut = () => {
    if (pendingCount > 0 && !window.confirm(`${pendingCount} change(s) are not uploaded yet and will be removed from this device. Sign out anyway?`)) {
      return;
    }
    onSignOut();
  };

  const segment = (active) =>
    `min-h-11 flex-1 rounded-xl text-sm font-semibold transition ${
      active ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    }`;

  return (
    <Modal open={open} title="Settings" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label htmlFor="goal" className="mb-2 block text-sm font-medium">
            Daily goal ({unit})
          </label>
          <input
            id="goal"
            type="number"
            inputMode="decimal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="h-14 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 text-xl font-semibold tabular-nums outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Units</p>
          <div className="flex gap-2">
            <button type="button" className={segment(unit === 'ml')} onClick={() => changeUnit('ml')}>
              Milliliters (ml)
            </button>
            <button type="button" className={segment(unit === 'oz')} onClick={() => changeUnit('oz')}>
              Ounces (oz)
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Theme</p>
          <div className="flex gap-2">
            {THEMES.map(([key, label]) => (
              <button key={key} type="button" className={segment(theme === key)} onClick={() => setTheme(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-sky-500 font-semibold text-white transition hover:bg-sky-600 active:scale-[.98]"
        >
          Save settings
        </button>

        <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
          <h3 className="mb-1 text-sm font-semibold">Account</h3>
          <p className="mb-3 break-all text-xs text-slate-500 dark:text-slate-400">Signed in as {email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-red-200 font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </Modal>
  );
}
