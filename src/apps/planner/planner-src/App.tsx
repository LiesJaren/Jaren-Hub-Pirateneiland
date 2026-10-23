import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Smile,
  Shield,
  ShoppingBag,
  Printer,
  Plus,
  Star,
  Users,
  Sparkles,
  Share2,
  Volume2,
  CheckCircle,
  Trash2,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  FamilyMember,
  AgendaEvent,
  Reward,
  GroceryItem,
  ActivityIcon,
  IconCategoryMeta,
  TimeOfDay,
  RoutineTemplate,
  PlannerPreferences,
} from './types/family';

import { AgendaView } from './components/AgendaView';
import { KidsModeView } from './components/KidsModeView';
import { ParentPortalView } from './components/ParentPortalView';
import { PrintWeekModal } from './components/PrintWeekModal';
import { EventModal } from './components/EventModal';
import { CopyEventsModal } from './components/CopyEventsModal';
import { InsertRoutineModal } from './components/InsertRoutineModal';
import { CreateIconModal } from './components/CreateIconModal';
import { IconPickerModal } from './components/IconPickerModal';
import { MemberEditModal } from './components/MemberEditModal';
import { GroceryIconPicker, GroceryIconSelection } from './components/GroceryIconPicker';
import { IconVisual } from './components/IconVisual';

import { soundEffects, spreekBericht } from './utils/audio';
import { getTodayDateStr, addDays, getWeekMonday } from './utils/dateUtils';
import {
  PlannerData,
  canonicalJson,
  emptyPlannerData,
  mergePlannerData,
} from './utils/mergePlannerData';
import { ACTIVITY_ICONS } from './data/iconLibrary';
import { FAMILY_SEED_ICONS } from './data/familySeedIcons';
import { JAREN_SUPERHELD_AVATAR } from './data/jarenAvatar';
import familyBannerImg from './assets/images/family_banner.jpg';

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: 'm1', name: 'Papa Birger', role: 'ouder', color: '#3b82f6', avatar: '👨' },
  { id: 'm2', name: 'Mama Lieselot', role: 'ouder', color: '#10b981', avatar: '👩' },
  { id: 'm3', name: 'Jaren (6 jr)', role: 'kind', color: '#f59e0b', avatar: '👦', stars: 5, rewardsEarned: 2 },
];

const INITIAL_GROCERIES: GroceryItem[] = [
  { id: 'g1', name: 'Halfvolle Melk', quantity: '2', unit: 'pakken', category: 'Zuivel', checked: false, icon: '🥛' },
  { id: 'g2', name: 'Volkoren Brood', quantity: '1', unit: 'brood', category: 'Bakkerij', checked: false, icon: '🍞' },
  { id: 'g3', name: 'Bananen', quantity: '1', unit: 'tros', category: 'Fruit & Groente', checked: false, icon: '🍌' },
  { id: 'g4', name: 'Eieren (vrije uitloop)', quantity: '10', unit: 'stuks', category: 'Zuivel', checked: true, icon: '🥚' },
  { id: 'g5', name: 'Chocolade Hagelslag', quantity: '1', unit: 'pak', category: 'Beleg', checked: false, icon: '🍫' },
  { id: 'g6', name: 'Appels (Elstar)', quantity: '6', unit: 'stuks', category: 'Fruit & Groente', checked: false, icon: '🍎' },
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: 'Zelf pannenkoeken bakken met stroop', icon: '🥞', emoji: '🥞', starsCost: 5, starCost: 5, description: 'Samen beslag maken en versieren', status: 'available' },
  { id: 'r2', title: '30 minuten extra schermtijd / gamen', icon: '🎮', emoji: '🎮', starsCost: 3, starCost: 3, description: 'Lekker bouwen in Lego of favoriete spel', status: 'available' },
  { id: 'r3', title: 'Zelf 2 bollen ijs kiezen bij ijssalon', icon: '🍦', emoji: '🍦', starsCost: 5, starCost: 5, description: 'Met spikkels en slagroom', status: 'available' },
  { id: 'r4', title: 'Middagje binnenspeeltuin of zwemparadijs', icon: '🎪', emoji: '🎪', starsCost: 10, starCost: 10, description: 'Klimmen, klauteren en glijden', status: 'available' },
];

function loadStoredArray<T>(key: string, legacyKey?: string): T[] | null {
  const keys = legacyKey ? [key, legacyKey] : [key];
  for (const storageKey of keys) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === null) continue;
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as T[];
      console.warn(`Ignoring invalid saved data for ${storageKey}: expected an array`);
    } catch (error) {
      console.warn(`Could not load saved data for ${storageKey}:`, error);
    }
  }
  return null;
}

const SYNC_BASE_KEY = 'fp_sync_base';
const SYNC_META_INTERVAL_MS = 15_000;

const DEFAULT_PREFERENCES: PlannerPreferences = {
  iconRows: 3,
  defaultIconOnlyView: true,
  showKidsTab: true,
  showGroceriesTab: true,
};

// Eenmalige migratie: bestaande planners stonden standaard op kaarten.
// De gebruiker wil enkel de iconen zien; daarna blijft de keuze wel respecteren.
const ICON_ONLY_DEFAULT_MIGRATION_KEY = 'fp_default_icon_only_v1';

function migrateIconOnlyPreference(preferences: PlannerPreferences): PlannerPreferences {
  try {
    if (!localStorage.getItem(ICON_ONLY_DEFAULT_MIGRATION_KEY)) {
      localStorage.setItem(ICON_ONLY_DEFAULT_MIGRATION_KEY, '1');
      const migrated = { ...preferences, defaultIconOnlyView: true };
      localStorage.setItem('fp_preferences', JSON.stringify(migrated));
      return migrated;
    }
  } catch (error) {
    console.warn('Kon de voorkeur voor de iconenweergave niet migreren:', error);
  }
  return preferences;
}

interface StoredPlannerData extends PlannerData {
  revision: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const REQUIRED_PLANNER_ARRAYS = [
  'members',
  'events',
  'groceries',
  'rewards',
  'customIcons',
  'customCategories',
] as const;

function isPlannerData(value: unknown): value is StoredPlannerData {
  if (!isRecord(value)) return false;
  if (!REQUIRED_PLANNER_ARRAYS.every((key) => Array.isArray(value[key]))) return false;
  if (value.customRoutines !== undefined && !Array.isArray(value.customRoutines)) return false;
  return Number.isInteger(value.revision);
}

function normalizePlannerPreferences(value: unknown): PlannerPreferences {
  if (!isRecord(value)) return DEFAULT_PREFERENCES;
  const preferences = value as Partial<PlannerPreferences>;
  return {
    iconRows: preferences.iconRows === 2 ? 2 : 3,
    defaultIconOnlyView: preferences.defaultIconOnlyView !== false,
    showKidsTab: preferences.showKidsTab !== false,
    showGroceriesTab: preferences.showGroceriesTab !== false,
  };
}

function normalizeStoredPlannerData(value: unknown): StoredPlannerData | null {
  if (!isPlannerData(value)) return null;
  return {
    ...value,
    customRoutines: value.customRoutines ?? [],
    preferences: normalizePlannerPreferences(value.preferences),
  };
}

function stripRevision(data: StoredPlannerData): PlannerData {
  const { revision: _revision, ...plannerData } = data;
  return plannerData;
}

function serializePlannerData(data: PlannerData): string {
  return canonicalJson({
    members: data.members,
    events: data.events,
    groceries: data.groceries,
    rewards: data.rewards,
    customIcons: data.customIcons,
    customCategories: data.customCategories,
    customRoutines: data.customRoutines,
    preferences: data.preferences,
  });
}

function loadSyncBase(): PlannerData | null {
  try {
    const raw = localStorage.getItem(SYNC_BASE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (!REQUIRED_PLANNER_ARRAYS.every((key) => Array.isArray(parsed[key]))) return null;
    return {
      members: parsed.members as FamilyMember[],
      events: parsed.events as AgendaEvent[],
      groceries: parsed.groceries as GroceryItem[],
      rewards: parsed.rewards as Reward[],
      customIcons: parsed.customIcons as ActivityIcon[],
      customCategories: parsed.customCategories as IconCategoryMeta[],
      customRoutines: Array.isArray(parsed.customRoutines)
        ? parsed.customRoutines as RoutineTemplate[]
        : [],
      preferences: normalizePlannerPreferences(parsed.preferences),
    };
  } catch (error) {
    console.warn('Kon de laatst gesynchroniseerde versie niet lezen:', error);
    return null;
  }
}

function saveSyncBase(data: PlannerData): void {
  try {
    localStorage.setItem(SYNC_BASE_KEY, serializePlannerData(data));
  } catch (error) {
    console.warn('Kon de laatst gesynchroniseerde versie niet bewaren:', error);
  }
}

const DEFAULT_PLANNER_ID = '403b870e-29af-4350-b313-ec37bfaaddcc';

function getPlannerId(): string {
  const url = new URL(window.location.href);
  let plannerId = url.searchParams.get('planner');
  if (!plannerId || !/^[0-9a-f-]{36}$/i.test(plannerId)) {
    plannerId = localStorage.getItem('fp_planner_id');
    if (!plannerId || !/^[0-9a-f-]{36}$/i.test(plannerId)) {
      plannerId = DEFAULT_PLANNER_ID;
    }
  }
  if (localStorage.getItem('fp_planner_id') !== plannerId) {
    localStorage.setItem('fp_planner_id', plannerId);
  }
  if (url.searchParams.get('planner') !== plannerId) {
    url.searchParams.set('planner', plannerId);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  return plannerId;
}

const applyJarenAvatar = (list: FamilyMember[]): FamilyMember[] =>
  list.map((member) =>
    member.role === 'kind' && (member.avatar === '👦' || !member.avatar)
      ? { ...member, avatar: JAREN_SUPERHELD_AVATAR }
      : member,
  );

export default function App() {
  const plannerId = getPlannerId();
  const plannerApiUrl = `https://familie-planner-22okt2026.vercel.app/api/planner?planner=${encodeURIComponent(plannerId)}`;
  const today = getTodayDateStr();
  const monday = getWeekMonday(today);

  // Core Persistent State
  const [activeTab, setActiveTab] = useState<'agenda' | 'kids' | 'ouders' | 'boodschappen'>('agenda');

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    return applyJarenAvatar(loadStoredArray<FamilyMember>('fp_members', 'familieplanner_members_v2') ?? DEFAULT_MEMBERS);
  });

  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    const savedEvents = loadStoredArray<AgendaEvent>('fp_events', 'familieplanner_events_v2');
    if (savedEvents) return savedEvents;

    // Seed realistic initial events around current week
    return [
      {
        id: 'ev_1',
        title: 'Opstaan & Tanden poetsen',
        date: today,
        startTime: '07:30',
        endTime: '08:00',
        memberIds: ['m3'],
        timeOfDay: 'ochtend',
        icon: '🪥',
        iconEmoji: '🪥',
        iconLabel: 'Tanden poetsen',
        isRoutine: true,
        completed: true,
      },
      {
        id: 'ev_2',
        title: 'Naar school (Groep 3)',
        date: today,
        startTime: '08:30',
        endTime: '15:15',
        memberIds: ['m3', 'm2'],
        timeOfDay: 'ochtend',
        icon: '🎒',
        iconEmoji: '🎒',
        iconLabel: 'School',
        location: 'Basisschool De Regenboog',
      },
      {
        id: 'ev_3',
        title: 'Zwemles - Diploma A',
        date: addDays(monday, 2), // Wednesday
        startTime: '15:30',
        endTime: '16:30',
        memberIds: ['m3', 'm1'],
        timeOfDay: 'middag',
        icon: '🏊',
        iconEmoji: '🏊',
        iconLabel: 'Zwemles',
        location: 'Zwembad De Vrolijke Dolfijn',
      },
      {
        id: 'ev_4',
        title: 'Voetbaltraining F-pupillen',
        date: addDays(monday, 4), // Friday
        startTime: '17:00',
        endTime: '18:00',
        memberIds: ['m3', 'm1'],
        timeOfDay: 'avond',
        icon: '⚽',
        iconEmoji: '⚽',
        iconLabel: 'Voetbal',
        location: 'Sportpark Middenmeer',
      },
      {
        id: 'ev_5',
        title: 'Pannenkoeken bakken gezinsdag',
        date: addDays(monday, 5), // Saturday
        startTime: '10:00',
        endTime: '12:00',
        memberIds: ['m1', 'm2', 'm3'],
        timeOfDay: 'ochtend',
        icon: '🥞',
        iconEmoji: '🥞',
        iconLabel: 'Pannenkoeken',
      },
    ];
  });

  const [groceries, setGroceries] = useState<GroceryItem[]>(() => {
    return loadStoredArray<GroceryItem>('fp_groceries', 'familieplanner_groceries_v2') ?? INITIAL_GROCERIES;
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    return loadStoredArray<Reward>('fp_rewards', 'familieplanner_rewards_v2') ?? INITIAL_REWARDS;
  });

  const [customIcons, setCustomIcons] = useState<ActivityIcon[]>(() => {
    const storedIcons = loadStoredArray<ActivityIcon>('fp_custom_icons', 'familieplanner_custom_icons_v2') ?? [];
    // Seed de gezinsbibliotheek eenmalig wanneer deze browser nog geen eigen iconen heeft.
    if (storedIcons.length === 0 && FAMILY_SEED_ICONS.length > 0) {
      return [...FAMILY_SEED_ICONS];
    }
    return storedIcons;
  });

  const [customCategories, setCustomCategories] = useState<IconCategoryMeta[]>(() => {
    return loadStoredArray<IconCategoryMeta>('fp_custom_categories', 'familieplanner_custom_cats_v2') ?? [];
  });

  const [customRoutines, setCustomRoutines] = useState<RoutineTemplate[]>(() => {
    return loadStoredArray<RoutineTemplate>('fp_custom_routines', 'familieplanner_custom_routines_v2') ?? [];
  });

  const handleSaveCustomRoutine = (template: RoutineTemplate): boolean => {
    const next = [...customRoutines.filter((item) => item.id !== template.id), template];
    try {
      localStorage.setItem('fp_custom_routines', JSON.stringify(next));
      setCustomRoutines(next);
      return true;
    } catch (error) {
      console.error('Routine kon niet worden opgeslagen:', error);
      return false;
    }
  };

  const handleDeleteCustomRoutine = (templateId: string): void => {
    const next = customRoutines.filter((item) => item.id !== templateId);
    try {
      localStorage.setItem('fp_custom_routines', JSON.stringify(next));
      setCustomRoutines(next);
    } catch (error) {
      console.error('Routine kon niet worden verwijderd:', error);
    }
  };

  const [preferences, setPreferences] = useState<PlannerPreferences>(() => {
    try {
      const saved = localStorage.getItem('fp_preferences');
      return migrateIconOnlyPreference(
        saved ? normalizePlannerPreferences(JSON.parse(saved)) : DEFAULT_PREFERENCES
      );
    } catch (error) {
      console.warn('Could not load planner preferences:', error);
      return migrateIconOnlyPreference(DEFAULT_PREFERENCES);
    }
  });

  const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'saving' | 'error' | 'conflict' | 'offline'>('loading');
  const [isCloudReady, setIsCloudReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [conflictRemote, setConflictRemote] = useState<StoredPlannerData | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [hydrateAttempt, setHydrateAttempt] = useState(0);
  const syncStatusRef = useRef(syncStatus);
  syncStatusRef.current = syncStatus;
  const revisionRef = useRef(0);
  const persistedSnapshotRef = useRef('');

  const plannerData: PlannerData = {
    members,
    events,
    groceries,
    rewards,
    customIcons,
    customCategories,
    customRoutines,
    preferences,
  };
  const plannerDataRef = useRef(plannerData);
  plannerDataRef.current = plannerData;

  // Onthoud de allereerste lokale inhoud. Zo kunnen we voorkomen dat een
  // gloednieuw toestel met alleen voorbeeldgegevens de gedeelde planner vult
  // voordat het toestel met de echte planning de link heeft geopend.
  const initialPlannerSnapshotRef = useRef<string | null>(null);
  if (initialPlannerSnapshotRef.current === null) {
    initialPlannerSnapshotRef.current = serializePlannerData(plannerData);
  }

  const applyPlannerData = (data: PlannerData): PlannerData => {
    const appliedMembers = applyJarenAvatar(data.members);
    const appliedRoutines = data.customRoutines ?? [];
    const appliedPreferences = migrateIconOnlyPreference(normalizePlannerPreferences(data.preferences));
    setMembers(appliedMembers);
    setEvents(data.events);
    setGroceries(data.groceries);
    setRewards(data.rewards);
    setCustomIcons(data.customIcons);
    setCustomCategories(data.customCategories);
    setCustomRoutines(appliedRoutines);
    setPreferences(appliedPreferences);
    return {
      ...data,
      members: appliedMembers,
      customRoutines: appliedRoutines,
      preferences: appliedPreferences,
    };
  };

  const commitSyncedData = (data: PlannerData, revision: number): void => {
    const applied = applyPlannerData(data);
    revisionRef.current = Math.max(revisionRef.current, revision);
    persistedSnapshotRef.current = serializePlannerData(applied);
    saveSyncBase(applied);
    setSyncStatus('synced');
    setConflictRemote(null);
  };

  type SaveResult =
    | { kind: 'saved'; revision: number }
    | { kind: 'conflict'; remote: StoredPlannerData | null; revision: number };

  const postPlannerData = async (data: PlannerData, expectedRevision: number): Promise<SaveResult> => {
    const response = await fetch(plannerApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, expectedRevision }),
    });
    let result: unknown = null;
    try {
      result = await response.json();
    } catch {
      // Laat de statuscontrole hieronder de fout afhandelen.
    }
    if (response.status === 409) {
      return {
        kind: 'conflict',
        remote: isRecord(result) && 'data' in result
          ? normalizeStoredPlannerData(result.data)
          : null,
        revision: isRecord(result) && Number.isInteger(result.revision)
          ? Number(result.revision)
          : 0,
      };
    }
    if (!response.ok || !isRecord(result) || !Number.isInteger(result.revision)) {
      throw new Error(`Planner opslaan mislukt (${response.status})`);
    }
    return { kind: 'saved', revision: Number(result.revision) };
  };

  const syncMerged = async (initialRemote: StoredPlannerData): Promise<boolean> => {
    let remote = initialRemote;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const base = loadSyncBase();
      const local = plannerDataRef.current;
      const remoteData = stripRevision(remote);
      const merged = base
        ? mergePlannerData(base, local, remoteData)
        : mergePlannerData(emptyPlannerData(), local, remoteData);
      const result = await postPlannerData(merged.data, remote.revision);
      if (result.kind === 'saved') {
        commitSyncedData(merged.data, result.revision);
        setSyncNotice(merged.conflicts > 0
          ? 'De planner is samengevoegd met een ander toestel. Jouw versie van hetzelfde onderdeel is behouden.'
          : 'De planner is samengevoegd met een wijziging op een ander toestel.');
        return true;
      }
      if (result.remote) {
        remote = result.remote;
        continue;
      }
      setConflictRemote(null);
      setSyncStatus('conflict');
      return false;
    }
    setSyncStatus('conflict');
    return false;
  };

  const handleUseRemoteVersion = (): void => {
    if (!conflictRemote) return;
    commitSyncedData(stripRevision(conflictRemote), conflictRemote.revision);
    setSyncNotice('De nieuwste versie van het andere toestel is geladen.');
  };

  const handleKeepLocalVersion = async (): Promise<void> => {
    if (!conflictRemote) return;
    setSyncStatus('saving');
    try {
      const result = await postPlannerData(plannerDataRef.current, conflictRemote.revision);
      if (result.kind === 'saved') {
        commitSyncedData(plannerDataRef.current, result.revision);
        setSyncNotice('Jouw versie is opgeslagen.');
        return;
      }
      if (result.remote) {
        setConflictRemote(result.remote);
      }
      setSyncStatus('conflict');
    } catch (error) {
      console.error('Gekozen versie kon niet worden opgeslagen:', error);
      setSyncStatus('error');
    }
  };

  const retryCloudSync = (): void => {
    setIsOffline(false);
    setIsCloudReady(false);
    setSyncStatus('loading');
    setHydrateAttempt((attempt) => attempt + 1);
  };

  useEffect(() => {
    if (!syncNotice) return;
    const timer = window.setTimeout(() => setSyncNotice(null), 8000);
    return () => window.clearTimeout(timer);
  }, [syncNotice]);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const response = await fetch(plannerApiUrl, { cache: 'no-store' });
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error(`Planner opslag niet beschikbaar (${response.status})`);
        }
        const result: unknown = await response.json();
        if (!isRecord(result) || !('data' in result)) {
          throw new Error('Ongeldig antwoord van de planneropslag');
        }
        if (!active) return;

        const local = plannerDataRef.current;
        const base = loadSyncBase();

        // Nog geen gedeelde planning: dit toestel vult de cloud met zijn
        // lokale gegevens. Zo blijft de bestaande planning behouden.
        if (result.data === null) {
          if (initialPlannerSnapshotRef.current === serializePlannerData(local)) {
            // Dit toestel heeft alleen de voorbeeldplanning. Wacht met vullen
            // tot de gebruiker iets wijzigt of het echte toestel de link opent.
            persistedSnapshotRef.current = serializePlannerData(local);
            setIsCloudReady(true);
            setSyncStatus('synced');
            setSyncNotice('De gedeelde planner is nog leeg. Open deze link eerst op het toestel met je bestaande planning, of voeg eerst een afspraak toe.');
            return;
          }
          const save = await postPlannerData(local, 0);
          if (!active) return;
          if (save.kind === 'saved') {
            commitSyncedData(local, save.revision);
            setIsCloudReady(true);
            return;
          }
          if (save.kind === 'conflict' && save.remote) {
            setIsCloudReady(true);
            await syncMerged(save.remote);
            return;
          }
          throw new Error('Eerste plannergegevens opslaan mislukt');
        }

        const remote = normalizeStoredPlannerData(result.data);
        if (!remote) throw new Error('Ongeldige gegevens in de planneropslag');

        if (!base) {
          // Eerste keer op dit toestel: de gedeelde versie is leidend.
          commitSyncedData(stripRevision(remote), remote.revision);
        } else {
          const localSnapshot = serializePlannerData(local);
          const baseSnapshot = serializePlannerData(base);
          const remoteData = stripRevision(remote);
          const remoteSnapshot = serializePlannerData(remoteData);

          if (localSnapshot === baseSnapshot || localSnapshot === remoteSnapshot) {
            // Geen lokale wijzigingen (of beide zijn al gelijk): cloud wint.
            commitSyncedData(remoteData, remote.revision);
          } else if (remoteSnapshot === baseSnapshot) {
            // Alleen dit toestel is gewijzigd: lokale versie opslaan.
            const save = await postPlannerData(local, remote.revision);
            if (save.kind === 'saved') {
              commitSyncedData(local, save.revision);
            } else if (save.kind === 'conflict' && save.remote) {
              const merged = await syncMerged(save.remote);
              if (!merged) {
                setIsCloudReady(true);
                return;
              }
            } else {
              throw new Error('Lokale wijzigingen opslaan mislukt');
            }
          } else {
            // Beide kanten gewijzigd: samenvoegen.
            const merged = await syncMerged(remote);
            if (!merged) {
              setIsCloudReady(true);
              return;
            }
          }
        }

        if (!active) return;
        setIsCloudReady(true);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Gedeelde planner kon niet worden geladen:', error);
        if (active) {
          // Geen gedeelde opslag bereikbaar: werk lokaal verder en toon een
          // duidelijke knop om opnieuw te proberen.
          setIsOffline(true);
          setIsCloudReady(true);
          setSyncStatus('offline');
        }
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [hydrateAttempt]);

  // Keep the browser copy as a fallback and synchronize changes to shared storage.
  useEffect(() => {
    try {
      localStorage.setItem('fp_members', JSON.stringify(members));
      localStorage.setItem('fp_events', JSON.stringify(events));
      localStorage.setItem('fp_groceries', JSON.stringify(groceries));
      localStorage.setItem('fp_rewards', JSON.stringify(rewards));
      localStorage.setItem('fp_custom_icons', JSON.stringify(customIcons));
      localStorage.setItem('fp_custom_categories', JSON.stringify(customCategories));
      localStorage.setItem('fp_custom_routines', JSON.stringify(customRoutines));
      localStorage.setItem('fp_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Could not save planner data to local storage:', error);
    }

    if (!isCloudReady || isOffline) return;
    const snapshot = serializePlannerData(plannerData);
    if (snapshot === persistedSnapshotRef.current) return;

    setSyncStatus('saving');
    const timeout = window.setTimeout(async () => {
      const dataToSave = plannerDataRef.current;
      const snapshotToSave = serializePlannerData(dataToSave);
      try {
        const result = await postPlannerData(dataToSave, revisionRef.current);
        if (result.kind === 'saved') {
          if (result.revision > revisionRef.current) {
            revisionRef.current = result.revision;
          }
          const currentSnapshot = serializePlannerData(plannerDataRef.current);
          if (currentSnapshot === snapshotToSave) {
            const applied = applyPlannerData(dataToSave);
            persistedSnapshotRef.current = serializePlannerData(applied);
            saveSyncBase(applied);
          }
          setSyncStatus('synced');
          setConflictRemote(null);
          return;
        }
        if (result.remote) {
          await syncMerged(result.remote);
          return;
        }
        setSyncStatus('conflict');
      } catch (error) {
        console.error('Gedeelde planner kon niet worden opgeslagen:', error);
        setSyncStatus('error');
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [members, events, groceries, rewards, customIcons, customCategories, customRoutines, preferences, isCloudReady, isOffline]);

  useEffect(() => {
    if (!isCloudReady || isOffline) return;
    let stopped = false;
    let inFlight = false;

    const refresh = async () => {
      if (stopped || inFlight || document.visibilityState === 'hidden') return;
      inFlight = true;
      try {
        // Eerst alleen het kleine versienummer ophalen.
        const metaResponse = await fetch(`${plannerApiUrl}&meta=1`, { cache: 'no-store' });
        const metaContentType = metaResponse.headers.get('content-type') || '';
        if (!metaResponse.ok || !metaContentType.includes('application/json')) return;
        const meta: unknown = await metaResponse.json();
        if (!isRecord(meta) || !Number.isInteger(meta.revision)) {
          throw new Error('Ongeldig antwoord van de planneropslag');
        }
        const remoteRevision = Number(meta.revision);

        const localSnapshot = serializePlannerData(plannerDataRef.current);
        const hasLocalChanges = localSnapshot !== persistedSnapshotRef.current;

        if (remoteRevision <= revisionRef.current) {
          if (hasLocalChanges && syncStatusRef.current === 'error') {
            // Een eerdere opslagpoging mislukte; probeer opnieuw.
            const retry = await postPlannerData(plannerDataRef.current, revisionRef.current);
            if (retry.kind === 'saved') {
              const applied = applyPlannerData(plannerDataRef.current);
              revisionRef.current = Math.max(revisionRef.current, retry.revision);
              persistedSnapshotRef.current = serializePlannerData(applied);
              saveSyncBase(applied);
              setSyncStatus('synced');
            } else if (retry.remote) {
              await syncMerged(retry.remote);
            } else {
              setSyncStatus('conflict');
            }
          } else if (!hasLocalChanges && syncStatusRef.current !== 'saving') {
            setSyncStatus('synced');
          }
          return;
        }

        // Er is iets veranderd: nu pas de volledige planning downloaden.
        const response = await fetch(plannerApiUrl, { cache: 'no-store' });
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) return;
        const result: unknown = await response.json();
        if (!isRecord(result) || !('data' in result)) {
          throw new Error('Ongeldig antwoord van de planneropslag');
        }
        const remote = normalizeStoredPlannerData(result.data);
        if (!remote) throw new Error('Ongeldige gegevens in de planneropslag');

        if (!hasLocalChanges) {
          commitSyncedData(stripRevision(remote), remote.revision);
        } else {
          await syncMerged(remote);
        }
      } catch (error) {
        console.error('Gedeelde planner kon niet worden ververst:', error);
        setSyncStatus('error');
      } finally {
        inFlight = false;
      }
    };

    const poll = window.setInterval(() => {
      void refresh();
    }, SYNC_META_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    void refresh();

    return () => {
      stopped = true;
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isCloudReady, isOffline]);

  // Modal Control States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<string>(today);
  const [eventModalTimeOfDay, setEventModalTimeOfDay] = useState<TimeOfDay | undefined>();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDate, setPrintDate] = useState<string>(today);
  const [printScope, setPrintScope] = useState<'week' | 'day'>('week');

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState<string>(today);
  const [copyEventId, setCopyEventId] = useState<string | undefined>();

  const [isInsertRoutineModalOpen, setIsInsertRoutineModalOpen] = useState(false);
  const [routineTargetDate, setRoutineTargetDate] = useState<string>(today);

  const [isCreateIconModalOpen, setIsCreateIconModalOpen] = useState(false);
  const [createIconTarget, setCreateIconTarget] = useState<'activiteit' | 'categorie'>('activiteit');
  const [isIconPickerModalOpen, setIsIconPickerModalOpen] = useState(false);

  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isMemberEditOpen, setIsMemberEditOpen] = useState(false);

  const [isGroceryIconPickerOpen, setIsGroceryIconPickerOpen] = useState(false);
  const [groceryIconTarget, setGroceryIconTarget] = useState<GroceryItem | null>(null);
  const [newGroceryIcon, setNewGroceryIcon] = useState<GroceryIconSelection>({ iconEmoji: '🛒' });

  const [appNotice, setAppNotice] = useState<string | null>(null);
  const [undoClearDay, setUndoClearDay] = useState<{ date: string; events: AgendaEvent[] } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const showNotice = (message: string) => {
    setAppNotice(message);
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setAppNotice(null);
      setUndoClearDay(null);
    }, 8000);
  };

  const openCreateIconModal = (target: 'activiteit' | 'categorie' = 'activiteit') => {
    setCreateIconTarget(target);
    setIsCreateIconModalOpen(true);
  };

  const handleSaveCustomCategory = (category: IconCategoryMeta) => {
    setCustomCategories((prev) => [
      ...prev.filter((item) => item.id !== category.id),
      category,
    ]);
    showNotice(`Categorie “${category.name}” is toegevoegd.`);
  };

  // New grocery form state
  const [newGroceryName, setNewGroceryName] = useState('');
  const [newGroceryQty, setNewGroceryQty] = useState('1');

  // Child member quick access
  const childMember = members.find((m) => m.role === 'kind') || members[2];
  const childStars = childMember?.stars ?? 0;

  // Handlers for Event Management
  const handleOpenAddEvent = (date?: string, timeOfDay?: TimeOfDay) => {
    soundEffects.playTap();
    setEditingEvent(null);
    setEventModalDate(date || today);
    setEventModalTimeOfDay(timeOfDay);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: AgendaEvent) => {
    soundEffects.playTap();
    setEditingEvent(event);
    setEventModalDate(event.date);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<AgendaEvent, 'id'>, eventId?: string) => {
    soundEffects.playSuccessChime();
    if (eventId) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...eventData, id: eventId } : e))
      );
    } else {
      const newEv: AgendaEvent = {
        ...eventData,
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      setEvents((prev) => [...prev, newEv]);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    soundEffects.playTap();
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleToggleCompleteEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const completed = !e.completed;
          if (completed && childMember && e.memberIds.includes(childMember.id)) {
            // Reward child with 1 star
            setMembers((mList) =>
              mList.map((m) =>
                m.id === childMember.id ? { ...m, stars: (m.stars || 0) + 1 } : m
              )
            );
          }
          return { ...e, completed };
        }
        return e;
      })
    );
  };

  const handleBatchInsertEvents = (newEvents: AgendaEvent[]) => {
    soundEffects.playVictoryFanfare();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setEvents((prev) => [...prev, ...newEvents]);
  };

  const handleClearDayEvents = (dateStr: string) => {
    soundEffects.playTap();
    const removed = events.filter((e) => e.date === dateStr);
    setEvents((prev) => prev.filter((e) => e.date !== dateStr));
    setUndoClearDay({ date: dateStr, events: removed });
    showNotice(`Dag gewist: ${removed.length} afspra${removed.length === 1 ? 'ak' : 'ken'}.`);
  };

  const handleUndoClearDay = () => {
    if (!undoClearDay) return;
    setEvents((prev) => [...prev, ...undoClearDay.events]);
    setUndoClearDay(null);
    setAppNotice(null);
    soundEffects.playSuccessChime();
  };

  const handleDuplicateEvent = (event: AgendaEvent, targetDate?: string) => {
    soundEffects.playTap();
    setEvents((prev) => [
      ...prev,
      {
        ...event,
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: targetDate || event.date,
        completed: false,
      },
    ]);
  };

  // Handlers for Stars & Rewards
  const handleUpdateMemberStars = (memberId: string, newStars: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, stars: Math.max(0, newStars) } : m))
    );
  };

  const handleAddReward = () => {
    soundEffects.playTap();
    const title = prompt('Titel van de nieuwe beloning:');
    if (!title?.trim()) return;
    const cost = parseInt(prompt('Aantal sterren benodigd (bijv. 5):') || '5', 10);
    const newRew: Reward = {
      id: `rw_${Date.now()}`,
      title: title.trim(),
      icon: '🎁',
      emoji: '🎁',
      starsCost: cost,
      starCost: cost,
      status: 'available',
    };
    setRewards((prev) => [...prev, newRew]);
  };

  const handleEditReward = (reward: Reward) => {
    setRewards((prev) => {
      const exists = prev.some((r) => r.id === reward.id);
      if (exists) {
        return prev.map((r) => (r.id === reward.id ? reward : r));
      }
      return [...prev, reward];
    });
  };

  const handleDeleteReward = (rewardId: string) => {
    soundEffects.playTap();
    setRewards((prev) => prev.filter((r) => r.id !== rewardId));
  };

  const handleClaimReward = (rewardId: string, _memberId: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, status: 'claimed' } : r))
    );
  };

  const handleRedeemReward = (
    rewardId: string,
    memberId: string,
    deductStars: boolean,
    approvedBy?: string
  ) => {
    const rew = rewards.find((r) => r.id === rewardId);
    const cost = rew?.starCost ?? rew?.starsCost ?? 5;

    if (deductStars) {
      handleUpdateMemberStars(memberId, Math.max(0, childStars - cost));
    }

    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId
          ? {
              ...r,
              status: 'redeemed',
              redeemedAt: Date.now(),
              redeemedBy: approvedBy || 'Ouder',
            }
          : r
      )
    );
  };

  // Grocery Handlers
  const handleToggleGroceryCheck = (id: string) => {
    soundEffects.playTap();
    setGroceries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g))
    );
  };

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryName.trim()) return;
    soundEffects.playSuccessChime();
    const newItem: GroceryItem = {
      id: `g_${Date.now()}`,
      name: newGroceryName.trim(),
      quantity: newGroceryQty.trim() || '1',
      unit: 'stuks',
      category: 'Algemeen',
      checked: false,
      icon: newGroceryIcon.iconEmoji || '🛒',
      iconEmoji: newGroceryIcon.iconEmoji,
      iconImageDataUrl: newGroceryIcon.iconImageDataUrl,
      iconImageUrl: newGroceryIcon.iconImageUrl,
      iconLabel: newGroceryIcon.iconLabel,
      iconId: newGroceryIcon.iconId,
    };
    setGroceries((prev) => [newItem, ...prev]);
    setNewGroceryName('');
    setNewGroceryQty('1');
    setNewGroceryIcon({ iconEmoji: '🛒' });
  };

  const handleApplyGroceryIcon = (selection: GroceryIconSelection) => {
    if (groceryIconTarget) {
      setGroceries((prev) =>
        prev.map((item) =>
          item.id === groceryIconTarget.id
            ? {
                ...item,
                icon: selection.iconEmoji || item.icon || '🛒',
                iconEmoji: selection.iconEmoji,
                iconImageDataUrl: selection.iconImageDataUrl,
                iconImageUrl: selection.iconImageUrl,
                iconLabel: selection.iconLabel,
                iconId: selection.iconId,
              }
            : item
        )
      );
      setGroceryIconTarget(null);
    } else {
      setNewGroceryIcon(selection);
    }
  };

  const handleDeleteGrocery = (id: string) => {
    soundEffects.playTap();
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDownloadBackup = async () => {
    const backup = {
      format: 'familieplanner-backup',
      version: 2,
      createdAt: new Date().toISOString(),
      data: { ...plannerData },
    };
    const json = JSON.stringify(backup, null, 2);
    const fileName = `familieplanner-backup-${getTodayDateStr()}.json`;

    const saveWithAnchor = () => {
      const file = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Ruim de blob pas veel later op: bij grote back-ups kan de browser
      // anders te vroeg klaar zijn met downloaden.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    try {
      const picker = (window as unknown as {
        showSaveFilePicker?: (options: unknown) => Promise<{
          createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>;
        }>;
      }).showSaveFilePicker;

      if (typeof picker === 'function') {
        try {
          const handle = await picker({
            suggestedName: fileName,
            types: [
              {
                description: 'FamiliePlanner back-up',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(json);
          await writable.close();
          showNotice(`Back-up opgeslagen: ${fileName}`);
          return;
        } catch (pickerError) {
          if ((pickerError as { name?: string })?.name === 'AbortError') return;
          console.warn('Opslaan via bestandskiezer lukte niet, alternatief gebruiken:', pickerError);
        }
      }

      saveWithAnchor();
      showNotice(`Back-up gedownload: ${fileName}`);
    } catch (error) {
      console.error('Plannerback-up kon niet worden gedownload:', error);
      try {
        saveWithAnchor();
        showNotice(`Back-up gedownload: ${fileName}`);
      } catch (fallbackError) {
        console.error(fallbackError);
        window.alert('De back-up kon niet worden gedownload. Probeer het opnieuw of gebruik een andere browser.');
      }
    }
  };

  const handleRestoreBackup = async (file: File): Promise<{ ok: boolean; message: string }> => {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        return { ok: false, message: 'Dit bestand is geen geldige JSON.' };
      }

      const root = parsed as Record<string, unknown>;
      const bundleMap: Record<string, string> = {
        members: 'fp_members',
        events: 'fp_events',
        groceries: 'fp_groceries',
        rewards: 'fp_rewards',
        customIcons: 'fp_custom_icons',
        customCategories: 'fp_custom_categories',
        customRoutines: 'fp_custom_routines',
        preferences: 'fp_preferences',
      };

      let source: Record<string, unknown>;
      if (typeof root.fp_members === 'string' || typeof root.fp_events === 'string') {
        // Oude herstelbundel: losse localStorage-sleutels als strings.
        source = {};
        for (const [target, key] of Object.entries(bundleMap)) {
          const raw = root[key];
          if (typeof raw === 'string') {
            try {
              source[target] = JSON.parse(raw);
            } catch {
              // Sla een kapotte sleutel over.
            }
          }
        }
      } else if (typeof root.data === 'object' && root.data !== null) {
        source = root.data as Record<string, unknown>;
      } else {
        source = root;
      }

      if (!Array.isArray(source.members) || !Array.isArray(source.events)) {
        return {
          ok: false,
          message: 'Dit bestand hoort niet bij FamiliePlanner: leden of afspraken ontbreken.',
        };
      }

      const confirmed = window.confirm(
        'Weet je zeker dat je de huidige planner vervangt door deze back-up?'
      );
      if (!confirmed) return { ok: false, message: '' };

      setMembers(applyJarenAvatar(source.members as FamilyMember[]));
      setEvents(source.events as AgendaEvent[]);
      if (Array.isArray(source.groceries)) setGroceries(source.groceries as GroceryItem[]);
      if (Array.isArray(source.rewards)) setRewards(source.rewards as Reward[]);
      if (Array.isArray(source.customIcons)) setCustomIcons(source.customIcons as ActivityIcon[]);
      if (Array.isArray(source.customCategories)) {
        setCustomCategories(source.customCategories as IconCategoryMeta[]);
      }
      if (Array.isArray(source.customRoutines)) {
        setCustomRoutines(source.customRoutines as RoutineTemplate[]);
      }
      if (source.preferences) {
        setPreferences(normalizePlannerPreferences(source.preferences));
      }

      const summary = `Back-up hersteld: ${source.events.length} afspraken en ${source.members.length} gezinsleden.`;
      showNotice(summary);
      return { ok: true, message: summary };
    } catch (error) {
      console.error('Back-up herstellen mislukt:', error);
      return {
        ok: false,
        message: 'Het bestand kon niet worden gelezen. Kies een FamiliePlanner-back-up (.json).',
      };
    }
  };

  const isShared = syncStatus === 'synced' || syncStatus === 'saving';

  if (syncStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-6 text-center text-lg font-bold text-slate-800" role="status">
        Gedeelde planner wordt geladen...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Family identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-2xl shadow-sm border-2 border-white">
              🌟
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>FamiliePlanner</span>
                <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Gezinsagenda
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Birger, Lieselot & Jaren 🎒⚽⭐
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav aria-label="Hoofdnavigatie" className="order-3 lg:order-none w-full lg:w-auto flex items-center justify-start sm:justify-center overflow-x-auto bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                setActiveTab('agenda');
              }}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda</span>
            </button>

            {preferences.showKidsTab && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTap();
                  setActiveTab('kids');
                }}
                className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'kids'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Smile className="w-4 h-4" />
                <span>Kindermodus</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                setActiveTab('ouders');
              }}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ouders'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Ouderportaal</span>
            </button>

            {preferences.showGroceriesTab && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTap();
                  setActiveTab('boodschappen');
                }}
                className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'boodschappen'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Boodschappen</span>
              </button>
            )}
          </nav>

          {/* Right quick tools: stars, sharing and printing */}
          <div className="ml-auto flex items-center gap-2">
            {/* Quick Star Counter for Jaren */}
            {preferences.showKidsTab && (
              <div
                onClick={() => {
                  soundEffects.playStarChime();
                  setActiveTab('kids');
                }}
                className="shrink-0 px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-2xs"
                title="Sterren van Jaren - Klik om naar Kindermodus te gaan"
              >
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                <span className="text-xs font-black text-amber-950">
                  ⭐ {childStars}
                </span>
              </div>
            )}

            <div
              className={`shrink-0 px-3 py-2 rounded-2xl text-xs font-black border flex items-center gap-1.5 ${
                isShared
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
              title={
                isShared
                  ? 'De planner is gedeeld met je gezin'
                  : 'De planner staat (tijdelijk) alleen op dit toestel'
              }
            >
              {isShared
                ? <Cloud className="w-4 h-4" />
                : <CloudOff className="w-4 h-4" />}
              <span className="hidden lg:inline">
                {isShared ? 'Gedeeld' : 'Lokaal'}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                const shareUrl = window.location.href;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: 'FamiliePlanner',
                      text: 'Open onze gedeelde FamiliePlanner.',
                      url: shareUrl,
                    });
                    return;
                  } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') return;
                    console.error('De plannerlink kon niet worden gedeeld:', error);
                  }
                }
                if (navigator.clipboard?.writeText) {
                  void navigator.clipboard.writeText(shareUrl)
                    .then(() => window.alert('Deellink gekopieerd. Stuur deze link naar je gezinslid.'))
                    .catch((error: unknown) => {
                      console.error('De plannerlink kon niet naar het klembord worden gekopieerd:', error);
                      window.prompt('Kopieer deze deellink:', shareUrl);
                    });
                } else {
                  window.prompt('Kopieer deze deellink:', shareUrl);
                }
              }}
              className="shrink-0 px-3.5 py-2 rounded-2xl text-xs font-black bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Kopieer een link naar deze gedeelde planner"
              aria-label="Deel plannerlink"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Deellink</span>
            </button>

            {/* Print 1 A4 Quick Action */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                setPrintDate(today);
                setPrintScope('week');
                setIsPrintModalOpen(true);
              }}
              className="shrink-0 px-3.5 py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              title="Druk de weekplanning af op 1 vel A4 voor op de koelkast"
              aria-label="Print weekplanning op 1 A4"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print 1 A4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {(syncStatus !== 'synced' || syncNotice) && (
          <div
            role="status"
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
              syncNotice && syncStatus === 'synced'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : syncStatus === 'error' || syncStatus === 'conflict'
                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                  : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
          >
            {syncStatus === 'saving' && 'Wijzigingen worden gedeeld opgeslagen...'}
            {syncStatus === 'offline' && (
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Lokale modus: de gedeelde online opslag is niet bereikbaar. Je wijzigingen staan veilig op dit
                  toestel, maar zijn nog niet zichtbaar voor de anderen. Maak zo nodig een JSON-back-up via het
                  Ouderportaal.
                </span>
                <button
                  type="button"
                  onClick={retryCloudSync}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-black text-white hover:bg-amber-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Opnieuw proberen
                </button>
              </div>
            )}
            {syncStatus === 'error' && 'De gedeelde opslag is tijdelijk niet bereikbaar. Je wijzigingen blijven op dit toestel staan en de app probeert automatisch opnieuw. Maak zo nodig een JSON-back-up via het Ouderportaal.'}
            {syncStatus === 'conflict' && (
              <div>
                <p>
                  De planner is op een ander toestel gewijzigd. Je kunt de nieuwste versie laden of je eigen
                  wijzigingen toch opslaan.
                </p>
                {conflictRemote ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleUseRemoteVersion}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-black text-white hover:bg-slate-900"
                    >
                      Nieuwste versie laden
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleKeepLocalVersion()}
                      className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-black text-rose-800 hover:bg-rose-50"
                    >
                      Mijn versie behouden
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs">Ververs de pagina om de nieuwste versie op te halen.</p>
                )}
              </div>
            )}
            {syncNotice && syncStatus === 'synced' && syncNotice}
          </div>
        )}
        <section className="relative mb-6 overflow-hidden rounded-3xl border-2 border-amber-300 bg-slate-900 shadow-lg">
          <div className="relative h-48 w-full overflow-hidden sm:h-60 md:h-72">
            <img
              src={familyBannerImg}
              alt="Familie Birger, Lieselot en Jaren"
              className="h-full w-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent p-5 sm:p-7">
              <span className="mb-2 inline-flex w-fit items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
                FamiliePlanner • Birger, Lieselot & Jaren
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                Welkom bij onze Gezinsagenda
              </h2>
              <p className="mt-1.5 max-w-xl text-xs font-medium text-slate-200 drop-shadow-sm sm:text-sm">
                Samen maken we er elke dag een succes van! 🎒⚽⭐
              </p>
            </div>
          </div>
        </section>

        {activeTab === 'agenda' && (
          <AgendaView
            events={events}
            members={members}
            iconRows={preferences.iconRows}
            defaultIconOnlyView={preferences.defaultIconOnlyView}
            initialDate={today}
            onAddEvent={handleOpenAddEvent}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onClearDayEvents={handleClearDayEvents}
            onDuplicateEvent={handleDuplicateEvent}
            onToggleComplete={handleToggleCompleteEvent}
            onOpenPrintModal={(d, scope) => {
              setPrintDate(d || today);
              setPrintScope(scope || 'week');
              setIsPrintModalOpen(true);
            }}
            onOpenInsertRoutineModal={(d) => {
              setRoutineTargetDate(d || today);
              setIsInsertRoutineModalOpen(true);
            }}
            onOpenCopyModal={(d, evId) => {
              setCopySourceDate(d || today);
              setCopyEventId(evId);
              setIsCopyModalOpen(true);
            }}
            onBatchInsertEvents={handleBatchInsertEvents}
          />
        )}

        {activeTab === 'kids' && (
          <KidsModeView
            events={events}
            groceries={groceries}
            members={members}
            rewards={rewards}
            onToggleEventComplete={handleToggleCompleteEvent}
            onToggleGroceryCheck={handleToggleGroceryCheck}
            onAddReward={handleAddReward}
            onEditReward={handleEditReward}
            onDeleteReward={handleDeleteReward}
            onClaimReward={handleClaimReward}
            onRedeemReward={handleRedeemReward}
            onUpdateMemberStars={handleUpdateMemberStars}
          />
        )}

        {activeTab === 'ouders' && (
          <ParentPortalView
            members={members}
            events={events}
            rewards={rewards}
            groceries={groceries}
            customIcons={customIcons}
            customCategories={customCategories}
            preferences={preferences}
            onUpdatePreferences={setPreferences}
            onAddEvent={handleOpenAddEvent}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onToggleCompleteEvent={handleToggleCompleteEvent}
            onAddReward={handleAddReward}
            onEditReward={handleEditReward}
            onDeleteReward={handleDeleteReward}
            onClaimReward={handleClaimReward}
            onRedeemReward={(rewId, memId, deduct, approvedBy) =>
              handleRedeemReward(rewId, memId, deduct, approvedBy)
            }
            onUpdateMemberStars={handleUpdateMemberStars}
            onSaveCustomIcon={(newIcon) => {
              setCustomIcons((prev) => [...prev, newIcon]);
            }}
            onDeleteCustomIcon={(iconId) => {
              setCustomIcons((prev) => prev.filter((i) => i.id !== iconId));
            }}
            onOpenPrintModal={(d) => {
              setPrintDate(d || today);
              setPrintScope('week');
              setIsPrintModalOpen(true);
            }}
            onOpenInsertRoutineModal={(d) => {
              setRoutineTargetDate(d || today);
              setIsInsertRoutineModalOpen(true);
            }}
            onOpenCopyModal={(d, evId) => {
              setCopySourceDate(d || today);
              setCopyEventId(evId);
              setIsCopyModalOpen(true);
            }}
            onOpenFamilySettings={() => {
              soundEffects.playTap();
              alert('Gezinsbeheer: Namen en voorkeuren worden gedeeld opgeslagen.');
            }}
            onDownloadBackup={handleDownloadBackup}
            onRestoreBackup={handleRestoreBackup}
            onOpenCreateIconModal={() => openCreateIconModal('activiteit')}
            onOpenCreateCategoryModal={() => openCreateIconModal('categorie')}
            onEditMember={(m) => {
              setEditingMember(m);
              setIsMemberEditOpen(true);
            }}
          />
        )}

        {/* Tab 4: Boodschappenlijstje */}
        {activeTab === 'boodschappen' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md border-3 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-inner border border-white/30">
                  🛒
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    Gedeeld Boodschappenlijstje
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    Voor Birger en Lieselot in de supermarkt en voor Jaren in de speurtochtmodus!
                  </p>
                </div>
              </div>

              <div className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30 text-center">
                <span className="text-[10px] uppercase font-black text-emerald-100 block">Nog te halen</span>
                <span className="text-xl font-black text-white">
                  {groceries.filter((g) => !g.checked).length} artikelen
                </span>
              </div>
            </div>

            {/* Quick Add Form */}
            <form
              onSubmit={handleAddGrocery}
              className="bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center gap-3"
            >
              <button
                type="button"
                onClick={() => {
                  setGroceryIconTarget(null);
                  setIsGroceryIconPickerOpen(true);
                }}
                className="w-12 h-12 shrink-0 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 flex flex-col items-center justify-center"
                title="Kies een icoon voor deze boodschap"
              >
                <IconVisual
                  emoji={newGroceryIcon.iconEmoji || '🛒'}
                  imageDataUrl={newGroceryIcon.iconImageDataUrl}
                  imageUrl={newGroceryIcon.iconImageUrl}
                  className="text-2xl flex items-center justify-center"
                  imageClassName="w-8 h-8 object-contain"
                />
              </button>
              <input
                type="text"
                value={newGroceryName}
                onChange={(e) => setNewGroceryName(e.target.value)}
                placeholder="Bijv. Roombeboter, aardbeien, pannenkoekenmeel..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 w-full"
              />
              <input
                type="text"
                value={newGroceryQty}
                onChange={(e) => setNewGroceryQty(e.target.value)}
                placeholder="Aantal"
                className="w-full sm:w-24 px-3 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 text-center"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Toevoegen</span>
              </button>
            </form>

            {/* Grocery items list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {groceries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleGroceryCheck(item.id)}
                  className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    item.checked
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-400'
                      : 'bg-white border-slate-200 hover:border-emerald-400 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setGroceryIconTarget(item);
                        setIsGroceryIconPickerOpen(true);
                      }}
                      className="w-11 h-11 shrink-0 rounded-xl hover:bg-emerald-100 flex items-center justify-center transition-colors"
                      title="Icoon wijzigen"
                    >
                      <IconVisual
                        emoji={item.iconEmoji || item.icon || '🛒'}
                        imageDataUrl={item.iconImageDataUrl}
                        imageUrl={item.iconImageUrl}
                        className="text-3xl flex items-center justify-center"
                        imageClassName="w-9 h-9 object-contain"
                      />
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-black truncate ${
                          item.checked ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        {item.quantity} {item.unit || ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'border-2 border-slate-300 bg-slate-50'
                      }`}
                    >
                      {item.checked && <CheckCircle className="w-4 h-4" />}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGrocery(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Verwijder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        initialEvent={editingEvent}
        defaultDate={eventModalDate}
        defaultTimeOfDay={eventModalTimeOfDay}
        members={members}
        customIcons={customIcons}
        customCategories={customCategories}
        onOpenCreateIconModal={() => openCreateIconModal('activiteit')}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
      />

      <PrintWeekModal
        isOpen={isPrintModalOpen}
        events={events}
        members={members}
        groceries={groceries}
        customIcons={customIcons}
        defaultDate={printDate}
        initialScope={printScope}
        onNavigateToDay={(d) => {
          setIsPrintModalOpen(false);
          setActiveTab('agenda');
        }}
        onClose={() => setIsPrintModalOpen(false)}
      />

      <CopyEventsModal
        isOpen={isCopyModalOpen}
        events={events}
        members={members}
        initialSourceDate={copySourceDate}
        initialSelectedEventId={copyEventId}
        onBatchCopyEvents={handleBatchInsertEvents}
        onSaveCustomRoutine={handleSaveCustomRoutine}
        onClose={() => setIsCopyModalOpen(false)}
      />

      <InsertRoutineModal
        isOpen={isInsertRoutineModalOpen}
        defaultDate={routineTargetDate}
        members={members}
        customIcons={customIcons}
        customCategories={customCategories}
        onOpenCreateIconModal={() => openCreateIconModal('activiteit')}
        customTemplates={customRoutines}
        onSaveCustomTemplate={handleSaveCustomRoutine}
        onDeleteCustomTemplate={handleDeleteCustomRoutine}
        onBatchInsertEvents={handleBatchInsertEvents}
        onClose={() => setIsInsertRoutineModalOpen(false)}
      />

      <CreateIconModal
        isOpen={isCreateIconModalOpen}
        initialTarget={createIconTarget}
        customCategories={customCategories}
        onSaveCategory={handleSaveCustomCategory}
        onSaveIcon={(newIcon) => {
          setCustomIcons((prev) => [...prev, newIcon]);
          setIsCreateIconModalOpen(false);
        }}
        onClose={() => setIsCreateIconModalOpen(false)}
      />

      <IconPickerModal
        isOpen={isIconPickerModalOpen}
        customIcons={customIcons}
        customCategories={customCategories}
        onOpenCreateIconModal={() => openCreateIconModal('activiteit')}
        onOpenCreateCategoryModal={() => openCreateIconModal('categorie')}
        onSelectIcon={() => setIsIconPickerModalOpen(false)}
        onClose={() => setIsIconPickerModalOpen(false)}
      />

      <MemberEditModal
        isOpen={isMemberEditOpen}
        member={editingMember}
        onSave={(updated) => {
          setMembers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          showNotice(`${updated.name} is bijgewerkt.`);
        }}
        onClose={() => {
          setIsMemberEditOpen(false);
          setEditingMember(null);
        }}
      />

      <GroceryIconPicker
        isOpen={isGroceryIconPickerOpen}
        itemName={groceryIconTarget?.name || newGroceryName}
        customIcons={customIcons}
        current={
          groceryIconTarget
            ? {
                iconEmoji: groceryIconTarget.iconEmoji || groceryIconTarget.icon,
                iconImageDataUrl: groceryIconTarget.iconImageDataUrl,
                iconImageUrl: groceryIconTarget.iconImageUrl,
                iconLabel: groceryIconTarget.iconLabel,
                iconId: groceryIconTarget.iconId,
              }
            : newGroceryIcon
        }
        onSelect={handleApplyGroceryIcon}
        onClose={() => {
          setIsGroceryIconPickerOpen(false);
          setGroceryIconTarget(null);
        }}
      />

      {appNotice && (
        <div className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700">
            <span className="text-xs font-bold">{appNotice}</span>
            {undoClearDay && (
              <button
                type="button"
                onClick={handleUndoClearDay}
                className="shrink-0 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300"
              >
                Ongedaan maken
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
