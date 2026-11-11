# Water Tracker

A mobile-first water intake tracker built with React, Vite and Tailwind CSS. Each user signs in with email and password, and their data is stored in Supabase so it follows them across devices.

## Features
- Email/password accounts. Each user sees only their own data.
- Circular progress ring showing `current / goal` and percent complete
- One-tap quick add: +250 ml (Glass), +350 ml (Mug), +500 ml (Bottle)
- Custom amount entry
- Today's log with timestamps, delete, and an Undo toast
- Automatic midnight reset (today is filtered by local date)
- Settings: daily goal, ml/oz units, light/dark/system theme, sign out
- History: 7-day bar chart with goal line, current and best streak, 7-day average
- Offline-tolerant: changes are saved locally and uploaded when back online

## 1. Install
Requires Node.js 18+.
```bash
npm install
```

## 2. Set up Supabase
1. Create a free project at https://supabase.com.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it. This creates the tables and Row Level Security policies.
3. Under **Authentication → Providers → Email**, either turn off **Confirm email** for local testing, or keep it on and set **Authentication → URL Configuration → Site URL** to your dev address (e.g. `http://localhost:3001`).
4. Go to **Project Settings → API** and copy the **Project URL** and the **publishable** (anon) key.
5. Copy `.env.example` to `.env` and fill in both values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```
   Never put a secret or service-role key in `.env`. Anything prefixed with `VITE_` is shipped to the browser.
6. Restart the dev server after editing `.env`.

## 3. Run on your PC
```bash
npm run dev
```
Open the address shown in the terminal. Port 3000 is often taken on Windows, so Vite may choose 3001.

## 4. Test on your phone (same Wi-Fi)
1. Find your PC's local IP with `ipconfig` (look for **IPv4 Address**, e.g. `192.168.1.25`).
2. Make sure the phone is on the same Wi-Fi network.
3. If prompted, allow Node.js through Windows Firewall on **Private** networks.
4. On the phone's browser, open `http://192.168.1.25:<port>` using your own IP and the port from the terminal.

Your PC must stay on and running `npm run dev`.

## Production build
```bash
npm run build      # outputs dist/
npm run preview    # serves dist/ on the LAN
```

## How data is kept
- Every row in `entries` and `settings` has a `user_id` that defaults to the signed-in user.
- Row Level Security allows each user to read and write only rows where `user_id = auth.uid()`.
- The browser caches each user's data under keys prefixed with their user ID. Signing out removes that cache from the browser.

## Project structure
```
src/
  App.jsx                    auth gate, tracker layout, tabs, toasts, theme
  hooks/useAuth.js           session, sign in / up / out
  hooks/useWaterStore.js     per-user local-first state + Supabase sync queue
  hooks/useLocalStorage.js   useState mirrored to localStorage
  lib/supabase.js            shared Supabase client (publishable key)
  utils/dates.js             day keys, 7-day summary, streaks
  utils/units.js             ml/oz conversion, presets, limits
  utils/uuid.js              UUID generator that works on plain HTTP
  components/                AuthScreen, ProgressRing, QuickAdd, TodayLog, modals, HistoryView, SyncBadge, Toast
supabase/schema.sql          tables + RLS policies
```

## Customizing
- Presets and their icons: `PRESETS` in `src/utils/units.js`
- Goal limits and max entry size: `GOAL_MIN_ML`, `GOAL_MAX_ML`, `MAX_ENTRY_ML` in `src/utils/units.js`
- Sync window (days pulled from the cloud): `SYNC_WINDOW_DAYS` in `src/hooks/useWaterStore.js`
- Colors: Tailwind `sky-*` classes in the components
