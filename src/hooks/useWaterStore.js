import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '../lib/supabase';
import { addDays, dayKey, summarizeDays } from '../utils/dates';
import { uuid } from '../utils/uuid';

export const DEFAULT_SETTINGS = { goalMl: 2500, unit: 'ml', theme: 'system', updatedAt: null };
const SYNC_WINDOW_DAYS = 60;

/**
 * Applies one queued operation to Supabase. Throws on failure so the queue
 * keeps the operation and retries it later. Row Level Security limits every
 * query to the signed-in user's rows.
 */
async function runOp(userId, op) {
  if (op.type === 'insert') {
    const { error } = await supabase.from('entries').upsert({
      id: op.entry.id,
      user_id: userId,
      ml: op.entry.ml,
      ts: op.entry.ts,
    });
    if (error) throw error;
  } else if (op.type === 'delete') {
    const { error } = await supabase.from('entries').delete().eq('id', op.id);
    if (error) throw error;
  } else if (op.type === 'settings') {
    const s = op.settings;
    const { error } = await supabase.from('settings').upsert({
      user_id: userId,
      goal_ml: s.goalMl,
      unit: s.unit,
      theme: s.theme,
      updated_at: s.updatedAt ?? new Date().toISOString(),
    });
    if (error) throw error;
  }
}

/**
 * Local-first water store for one user.
 * - Changes are applied to localStorage immediately, so the UI never waits.
 * - Changes also go into a persisted queue that is pushed to Supabase when online.
 * - On load, reconnect, and tab focus: push the queue, then pull recent data and merge.
 * Local cache keys include the user id, so accounts on the same browser never mix.
 */
export function useWaterStore(userId) {
  const key = (name) => `water:${userId}:${name}`;
  const [entries, setEntries] = useLocalStorage(key('entries'), []);
  const [settings, setSettings] = useLocalStorage(key('settings'), DEFAULT_SETTINGS);
  const [queue, setQueue] = useLocalStorage(key('queue'), []);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [now, setNow] = useState(() => new Date());

  const queueRef = useRef(queue);
  const settingsRef = useRef(settings);
  const flushingRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const commitQueue = useCallback(
    (next) => {
      queueRef.current = next;
      setQueue(next);
    },
    [setQueue],
  );

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    setSyncStatus('syncing');
    try {
      while (queueRef.current.length > 0) {
        await runOp(userId, queueRef.current[0]);
        commitQueue(queueRef.current.slice(1));
      }
      setSyncStatus('synced');
    } catch (err) {
      console.warn('[sync] push failed', err);
      setSyncStatus(navigator.onLine ? 'error' : 'offline');
    } finally {
      flushingRef.current = false;
    }
  }, [userId, commitQueue]);

  const enqueue = useCallback(
    (op) => {
      commitQueue([...queueRef.current, op]);
      flush();
    },
    [commitQueue, flush],
  );

  // Pull the last SYNC_WINDOW_DAYS of entries and this user's settings, then merge.
  const pull = useCallback(async () => {
    const since = addDays(new Date(), -SYNC_WINDOW_DAYS);
    const [entriesRes, settingsRes] = await Promise.all([
      supabase
        .from('entries')
        .select('id, ml, ts')
        .gte('ts', since.toISOString())
        .order('ts', { ascending: true }),
      supabase.from('settings').select('goal_ml, unit, theme, updated_at').maybeSingle(),
    ]);
    if (entriesRes.error) throw entriesRes.error;
    if (settingsRes.error) throw settingsRes.error;

    const pendingOps = queueRef.current;
    const pendingInsertIds = new Set(pendingOps.filter((o) => o.type === 'insert').map((o) => o.entry.id));
    const pendingDeleteIds = new Set(pendingOps.filter((o) => o.type === 'delete').map((o) => o.id));
    const remote = entriesRes.data ?? [];
    const remoteIds = new Set(remote.map((r) => r.id));
    const sinceMs = since.getTime();

    setEntries((prev) => {
      const map = new Map();
      for (const e of prev) {
        const inWindow = new Date(e.ts).getTime() >= sinceMs;
        // In the window, missing remotely, and not waiting to upload: deleted elsewhere.
        if (inWindow && !remoteIds.has(e.id) && !pendingInsertIds.has(e.id)) continue;
        map.set(e.id, e);
      }
      for (const r of remote) map.set(r.id, { id: r.id, ml: r.ml, ts: r.ts });
      for (const id of pendingDeleteIds) map.delete(id);
      return [...map.values()].sort((a, b) => new Date(a.ts) - new Date(b.ts));
    });

    const remoteSettings = settingsRes.data;
    const hasPendingSettings = pendingOps.some((o) => o.type === 'settings');
    if (remoteSettings) {
      setSettings((prev) => {
        const remoteIsNewer =
          !prev.updatedAt || new Date(remoteSettings.updated_at) > new Date(prev.updatedAt);
        if (!hasPendingSettings && remoteIsNewer) {
          return {
            goalMl: remoteSettings.goal_ml,
            unit: remoteSettings.unit,
            theme: remoteSettings.theme,
            updatedAt: remoteSettings.updated_at,
          };
        }
        return prev;
      });
    } else {
      // First sign-in: create this user's settings row.
      enqueue({ type: 'settings', settings: settingsRef.current });
    }
  }, [setEntries, setSettings, enqueue]);

  const sync = useCallback(async () => {
    await flush();
    try {
      await pull();
    } catch (err) {
      console.warn('[sync] pull failed', err);
      setSyncStatus(navigator.onLine ? 'error' : 'offline');
    }
  }, [flush, pull]);

  useEffect(() => {
    sync();
    const onOnline = () => sync();
    const onOffline = () => setSyncStatus('offline');
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sync]);

  // Tick every minute and on focus so "today" rolls over at midnight.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  // ---- Actions ----

  const addEntry = useCallback(
    (ml) => {
      const entry = { id: uuid(), ml, ts: new Date().toISOString() };
      setEntries((prev) => [...prev, entry]);
      enqueue({ type: 'insert', entry });
      return entry;
    },
    [setEntries, enqueue],
  );

  const removeEntry = useCallback(
    (id) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      enqueue({ type: 'delete', id });
    },
    [setEntries, enqueue],
  );

  // Used by Undo: puts back a removed entry (same id, so the upsert is idempotent).
  const restoreEntry = useCallback(
    (entry) => {
      setEntries((prev) => [...prev, entry].sort((a, b) => new Date(a.ts) - new Date(b.ts)));
      enqueue({ type: 'insert', entry });
    },
    [setEntries, enqueue],
  );

  const updateSettings = useCallback(
    (patch) => {
      const next = { ...settingsRef.current, ...patch, updatedAt: new Date().toISOString() };
      settingsRef.current = next;
      setSettings(next);
      enqueue({ type: 'settings', settings: next });
    },
    [setSettings, enqueue],
  );

  // ---- Derived data ----

  const todayKey = dayKey(now);
  const todayEntries = useMemo(
    () =>
      entries
        .filter((e) => dayKey(e.ts) === todayKey)
        .sort((a, b) => new Date(b.ts) - new Date(a.ts)),
    [entries, todayKey],
  );
  const todayTotal = useMemo(() => todayEntries.reduce((sum, e) => sum + e.ml, 0), [todayEntries]);
  const summary = useMemo(
    () => summarizeDays(entries, settings.goalMl, now),
    [entries, settings.goalMl, now],
  );

  return {
    settings,
    now,
    syncStatus,
    pendingCount: queue.length,
    todayEntries,
    todayTotal,
    summary,
    addEntry,
    removeEntry,
    restoreEntry,
    updateSettings,
  };
}
