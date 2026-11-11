import { useState } from 'react';

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        const { data, error: err } = await onSignUp(email.trim(), password);
        if (err) setError(err.message);
        else if (!data.session) setInfo('Account created. Check your email to confirm, then sign in.');
      } else {
        const { error: err } = await onSignIn(email.trim(), password);
        if (err) setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sky-100 dark:bg-slate-800 dark:ring-slate-700">
        <div className="mb-6 text-center">
          <div className="text-4xl" aria-hidden="true">💧</div>
          <h1 className="mt-2 text-2xl font-bold">Water Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Create an account to start tracking' : 'Sign in to see your water log'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-sky-500 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60 active:scale-[.98]"
          >
            {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? 'signin' : 'signup');
            setError('');
            setInfo('');
          }}
          className="mt-4 min-h-11 w-full text-sm font-medium text-sky-600 dark:text-sky-300"
        >
          {isSignUp ? 'Already have an account? Sign in' : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
