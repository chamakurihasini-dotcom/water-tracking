import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWaterStore } from './hooks/useWaterStore';
import { supabaseConfigured } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import ProgressRing from './components/ProgressRing';
import QuickAdd from './components/QuickAdd';
import CustomAmountModal from './components/CustomAmountModal';
import TodayLog from './components/TodayLog';
import SettingsModal from './components/SettingsModal';
import HistoryView from './components/HistoryView';
import SyncBadge from './components/SyncBadge';
import Toast from './components/Toast';
import { formatAmount } from './utils/units';

export default function App() {
  const auth = useAuth();

  if (!supabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">Setup needed</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.
        </p>
      </div>
    );
  }
  if (auth.loading) {
    return <div className="flex min-h-dvh items-center justify-center text-sky-600">Loading…</div>;
  }
  if (!auth.user) {
    return <AuthScreen onSignIn={auth.signIn} onSignUp={auth.signUp} />;
  }
  // key={user.id}: switching accounts remounts the tracker with that user's data.
  return <Tracker key={auth.user.id} user={auth.user} onSignOut={auth.signOut} />;
}

function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100 dark:bg-slate-800 dark:ring-slate-700 ${className}`}
    >
      {children}
    </section>
  );
}

function Tracker({ user, onSignOut }) {
  const store = useWaterStore(user.id);
  const { settings, todayEntries, todayTotal, summary, now } = store;

  const [tab, setTab] = useState('today');
  const [customOpen, setCustomOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Apply light / dark / system theme
  useEffect(() => {
    const apply = () => {
      const dark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (settings.theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);

  // Auto-hide the undo toast
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const percent = Math.round((todayTotal / settings.goalMl) * 100);

  const handleDelete = (entry) => {
    store.removeEntry(entry.id);
    setToast({ message: `Removed ${formatAmount(entry.ml, settings.unit)}`, entry });
  };

  const handleUndo = () => {
    if (toast?.entry) store.restoreEntry(toast.entry);
    setToast(null);
  };

  // Remove this user's local cache so the next person on this browser sees nothing.
  const handleSignOut = async () => {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(`water:${user.id}:`)) localStorage.removeItem(k);
    }
    await onSignOut();
  };

  const dateLabel = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-28 pt-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-300">{dateLabel}</p>
          <h1 className="text-2xl font-bold">Water</h1>
        </div>
        <div className="flex items-center gap-2">
          <SyncBadge status={store.syncStatus} pendingCount={store.pendingCount} configured />
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-sky-100 active:scale-95 dark:bg-slate-800 dark:ring-slate-700"
          >
            ⚙️
          </button>
        </div>
      </header>

      <nav className="mt-5 grid grid-cols-2 rounded-2xl bg-sky-100 p-1 dark:bg-slate-800" aria-label="Views">
        {[
          ['today', 'Today'],
          ['history', 'History'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`min-h-11 rounded-xl text-sm font-semibold transition ${
              tab === key
                ? 'bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-300'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mt-5 space-y-5">
        {tab === 'today' ? (
          <>
            <Card>
              <ProgressRing current={todayTotal} goal={settings.goalMl} unit={settings.unit} percent={percent} />
            </Card>

            <Card>
              <h2 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Quick add</h2>
              <QuickAdd unit={settings.unit} onAdd={(ml) => store.addEntry(ml)} onCustom={() => setCustomOpen(true)} />
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Today's log</h2>
                <span className="text-xs text-slate-400">{todayEntries.length} drinks</span>
              </div>
              <TodayLog entries={todayEntries} unit={settings.unit} onDelete={handleDelete} />
            </Card>
          </>
        ) : (
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Last 7 days</h2>
            <HistoryView summary={summary} goalMl={settings.goalMl} unit={settings.unit} />
          </Card>
        )}
      </main>

      <CustomAmountModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        unit={settings.unit}
        onSubmit={(ml) => store.addEntry(ml)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={store.updateSettings}
        email={user.email}
        pendingCount={store.pendingCount}
        onSignOut={handleSignOut}
      />

      {toast && <Toast message={toast.message} actionLabel="Undo" onAction={handleUndo} />}
    </div>
  );
}
