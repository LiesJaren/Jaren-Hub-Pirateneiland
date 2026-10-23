import type {
  NewEvent,
  ParentSummary,
  PlatformEvent,
  PublicSettings,
  Summary,
} from './types';

// Sleutels voor lokale fallback opslag
const LOCAL_EVENTS_KEY = 'je_events';
const LOCAL_SETTINGS_KEY = 'je_settings';
const LOCAL_STARS_KEY = 'je_stars';
const LOCAL_PIN_KEY = 'je_parent_pin';
const LOCAL_SESSION_KEY = 'je_parent_auth';

function getLocalSettings(): PublicSettings {
  if (typeof window === 'undefined') {
    return { childName: 'Jaren', theme: 'pirate', platformName: "Jaren's Eiland" };
  }
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { childName: 'Jaren', theme: 'pirate', platformName: "Jaren's Eiland" };
}

function getLocalStars(): number {
  if (typeof window === 'undefined') return 24;
  try {
    // Kijk eerst of de planner een kind heeft met sterren
    const plannerMembers = localStorage.getItem('fp_members');
    if (plannerMembers) {
      const list = JSON.parse(plannerMembers);
      if (Array.isArray(list)) {
        const child = list.find((m) => m && m.role === 'kind');
        if (child && Number.isFinite(child.stars)) {
          return Math.max(0, Math.trunc(child.stars));
        }
      }
    }
    const raw = localStorage.getItem(LOCAL_STARS_KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isFinite(n)) return Math.max(0, Math.trunc(n));
    }
  } catch {}
  return 24; // Startgoudstukken voor Kapitein Jaren
}

function setLocalStars(stars: number): void {
  const safe = Math.max(0, Math.trunc(stars));
  try {
    localStorage.setItem(LOCAL_STARS_KEY, String(safe));
    // Werk ook de planner kind-sterren bij als die er zijn
    const plannerMembers = localStorage.getItem('fp_members');
    if (plannerMembers) {
      const list = JSON.parse(plannerMembers);
      if (Array.isArray(list)) {
        const updated = list.map((m) =>
          m && m.role === 'kind' ? { ...m, stars: safe } : m,
        );
        localStorage.setItem('fp_members', JSON.stringify(updated));
      }
    }
  } catch {}
}

function getLocalEvents(): PlatformEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [
    {
      id: 1,
      app: 'platform',
      type: 'welkom',
      payload: { message: 'Welkom op Jarens Piraten-Eiland! 🏴‍☠️' },
      stars: 5,
      created_at: new Date().toISOString(),
    },
  ];
}

function saveLocalEvents(events: PlatformEvent[]): void {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events.slice(0, 150)));
  } catch {}
}

export function buildLocalSummary(): Summary {
  const events = getLocalEvents();
  const stars = getLocalStars();
  const settings = getLocalSettings();

  const checkins = events.filter((e) => e.app === 'checkin').length;
  const games = events.filter((e) => e.app === 'learning').length;
  const earnedStars = events.reduce((sum, e) => sum + (e.stars > 0 ? e.stars : 0), 0);

  return {
    stars,
    earnedStars: Math.max(stars, earnedStars),
    plannerStars: stars,
    events: events.length,
    checkins,
    games,
    recent: events.slice(0, 15),
    settings,
  };
}

// Netwerk aanroep met automatische fallback
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }
  } catch {
    // Server is lokaal niet actief; val geruisloos terug op lokale client storage
  }

  // Fallback handlers voor /api/* routes
  if (path.startsWith('/api/summary')) {
    return buildLocalSummary() as T;
  }

  if (path.startsWith('/api/events')) {
    if (options?.method === 'POST' && options.body) {
      const newEvent = JSON.parse(options.body as string) as NewEvent;
      const events = getLocalEvents();
      const currentStars = getLocalStars();
      const addedStars = Number(newEvent.stars ?? 0);
      const newStars = Math.max(0, currentStars + addedStars);
      setLocalStars(newStars);

      const created: PlatformEvent = {
        id: Date.now(),
        app: newEvent.app,
        type: newEvent.type,
        payload: newEvent.payload ?? {},
        stars: addedStars,
        created_at: new Date().toISOString(),
      };
      events.unshift(created);
      saveLocalEvents(events);

      return {
        event: created,
        summary: buildLocalSummary(),
      } as T;
    }
    return { events: getLocalEvents() } as T;
  }

  if (path.startsWith('/api/parent/session')) {
    const authed = sessionStorage.getItem(LOCAL_SESSION_KEY) === 'true';
    return { authenticated: authed } as T;
  }

  if (path.startsWith('/api/parent/login')) {
    if (options?.body) {
      const { pin } = JSON.parse(options.body as string);
      const storedPin = localStorage.getItem(LOCAL_PIN_KEY) ?? '2706';
      if (pin === storedPin) {
        sessionStorage.setItem(LOCAL_SESSION_KEY, 'true');
        return { ok: true } as T;
      }
      throw new Error('Onjuiste PIN-code. Probeer het opnieuw.');
    }
  }

  if (path.startsWith('/api/parent/logout')) {
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    return { ok: true } as T;
  }

  if (path.startsWith('/api/parent/summary')) {
    const summary = buildLocalSummary();
    const storedPin = localStorage.getItem(LOCAL_PIN_KEY);
    return {
      ...summary,
      parent: {
        pinIsDefault: !storedPin || storedPin === '2706',
      },
    } as T;
  }

  if (path.startsWith('/api/parent/pin')) {
    if (options?.body) {
      const { pin } = JSON.parse(options.body as string);
      if (typeof pin === 'string' && /^\d{4,8}$/.test(pin)) {
        localStorage.setItem(LOCAL_PIN_KEY, pin);
        return { ok: true } as T;
      }
      throw new Error('PIN moet 4 tot 8 cijfers zijn.');
    }
  }

  if (path.startsWith('/api/parent/settings')) {
    if (options?.body) {
      const { childName, theme } = JSON.parse(options.body as string);
      const current = getLocalSettings();
      const updated = {
        ...current,
        childName: childName ?? current.childName,
        theme: theme ?? current.theme,
      };
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
      return { settings: updated } as T;
    }
  }

  return buildLocalSummary() as T;
}

const VERCEL_PLANNER_API =
  'https://familie-planner-22okt2026.vercel.app/api/planner?planner=403b870e-29af-4350-b313-ec37bfaaddcc';

let lastVercelSync = 0;

export async function syncWithVercelPlanner(): Promise<void> {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (now - lastVercelSync < 5000) return;
  lastVercelSync = now;

  try {
    const res = await fetch(VERCEL_PLANNER_API, { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) return;
    const json = await res.json();
    if (json && json.data && Array.isArray(json.data.members)) {
      const child = json.data.members.find(
        (m: any) => m && (m.role === 'kind' || m.id === 'm3'),
      );
      if (child && Number.isFinite(child.stars)) {
        const liveStars = Math.max(0, Math.trunc(child.stars));
        localStorage.setItem(LOCAL_STARS_KEY, String(liveStars));
      }
    }
  } catch {
    // Offline / netwerkfout negeren
  }
}

export async function getSummary(): Promise<Summary> {
  void syncWithVercelPlanner();
  return request<Summary>('/api/summary');
}

export function getEvents(app?: string, limit = 50): Promise<{ events: PlatformEvent[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (app) params.set('app', app);
  return request<{ events: PlatformEvent[] }>(`/api/events?${params.toString()}`);
}

export function addEvent(
  event: NewEvent,
): Promise<{ event: PlatformEvent; summary: Summary }> {
  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export function getParentSession(): Promise<{ authenticated: boolean }> {
  return request('/api/parent/session');
}

export function parentLogin(pin: string): Promise<{ ok: true }> {
  return request('/api/parent/login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

export function parentLogout(): Promise<{ ok: true }> {
  return request('/api/parent/logout', { method: 'POST' });
}

export function getParentSummary(): Promise<ParentSummary> {
  return request('/api/parent/summary');
}

export function changeParentPin(pin: string): Promise<{ ok: true }> {
  return request('/api/parent/pin', {
    method: 'PUT',
    body: JSON.stringify({ pin }),
  });
}

export function saveParentSettings(settings: {
  childName?: string;
  theme?: string;
}): Promise<{ settings: PublicSettings }> {
  return request('/api/parent/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function adjustStarsDirectly(delta: number): number {
  const current = getLocalStars();
  const next = Math.max(0, current + delta);
  setLocalStars(next);
  return next;
}
