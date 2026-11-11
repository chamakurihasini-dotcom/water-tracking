export const ML_PER_OZ = 29.5735;
export const MAX_ENTRY_ML = 2000;
export const GOAL_MIN_ML = 500;
export const GOAL_MAX_ML = 6000;

/** Quick-add buttons. Amounts are always stored in ml. */
export const PRESETS = [
  { label: 'Glass', ml: 250, icon: '🥛' },
  { label: 'Mug', ml: 350, icon: '☕' },
  { label: 'Bottle', ml: 500, icon: '🧴' },
];

/** Convert a stored ml value to the display unit (number, not formatted). */
export function mlToDisplay(ml, unit) {
  return unit === 'oz' ? ml / ML_PER_OZ : ml;
}

/** Convert a number typed in the display unit back to ml. */
export function displayToMl(value, unit) {
  return unit === 'oz' ? value * ML_PER_OZ : value;
}

/** Formatted number in the display unit, e.g. "1,500" or "50.7". */
export function formatNumber(ml, unit) {
  const v = mlToDisplay(ml, unit);
  if (unit === 'oz') {
    return (Math.round(v * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  return Math.round(v).toLocaleString();
}

/** e.g. "1,500 ml" or "50.7 oz". */
export function formatAmount(ml, unit) {
  return `${formatNumber(ml, unit)} ${unit}`;
}
