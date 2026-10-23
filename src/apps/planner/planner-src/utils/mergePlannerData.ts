import {
  ActivityIcon,
  AgendaEvent,
  FamilyMember,
  GroceryItem,
  IconCategoryMeta,
  PlannerPreferences,
  Reward,
  RoutineTemplate,
} from '../types/family';

export interface PlannerData {
  members: FamilyMember[];
  events: AgendaEvent[];
  groceries: GroceryItem[];
  rewards: Reward[];
  customIcons: ActivityIcon[];
  customCategories: IconCategoryMeta[];
  customRoutines: RoutineTemplate[];
  preferences: PlannerPreferences;
}

const DEFAULT_PREFERENCES: PlannerPreferences = {
  iconRows: 3,
  defaultIconOnlyView: true,
  showKidsTab: true,
  showGroceriesTab: true,
};

/**
 * JSON met een vaste sleutelvolgorde, zodat twee objecten die inhoudelijk
 * hetzelfde zijn ook echt als gelijk worden herkend.
 */
export function canonicalJson(value: unknown): string {
  const canonicalize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(canonicalize);
    if (input && typeof input === 'object') {
      const record = input as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(record).sort()) {
        result[key] = canonicalize(record[key]);
      }
      return result;
    }
    return input;
  };
  return JSON.stringify(canonicalize(value));
}

export function emptyPlannerData(reference?: PlannerData): PlannerData {
  return {
    members: [],
    events: [],
    groceries: [],
    rewards: [],
    customIcons: [],
    customCategories: [],
    customRoutines: [],
    preferences: reference?.preferences ?? DEFAULT_PREFERENCES,
  };
}

interface MergeResult<T> {
  items: T[];
  conflicts: number;
}

/**
 * Drieweg-samenvoeging per item:
 * - alleen lokaal gewijzigd → lokale versie;
 * - alleen op het andere toestel gewijzigd → die versie;
 * - beide gewijzigd → lokale versie wint en we tellen een conflict;
 * - aan één kant toegevoegd → blijft behouden;
 * - aan één kant verwijderd en aan de andere kant ongewijzigd → verwijderd;
 * - aan één kant verwijderd maar aan de andere kant gewijzigd → de gewijzigde
 *   versie blijft behouden (niets gaat stil verloren).
 */
export function mergeById<T extends { id: string }>(
  base: T[],
  local: T[],
  remote: T[],
): MergeResult<T> {
  const baseMap = new Map(base.map((item) => [item.id, item]));
  const localMap = new Map(local.map((item) => [item.id, item]));
  const remoteMap = new Map(remote.map((item) => [item.id, item]));
  const ids = new Set([...baseMap.keys(), ...localMap.keys(), ...remoteMap.keys()]);

  const items: T[] = [];
  let conflicts = 0;

  for (const id of ids) {
    const baseItem = baseMap.get(id);
    const localItem = localMap.get(id);
    const remoteItem = remoteMap.get(id);
    const localChanged = localItem !== undefined
      && (baseItem === undefined || canonicalJson(localItem) !== canonicalJson(baseItem));
    const remoteChanged = remoteItem !== undefined
      && (baseItem === undefined || canonicalJson(remoteItem) !== canonicalJson(baseItem));

    if (localItem && remoteItem) {
      if (localChanged && remoteChanged && canonicalJson(localItem) !== canonicalJson(remoteItem)) {
        conflicts += 1;
      }
      items.push(localChanged ? localItem : remoteItem);
      continue;
    }

    if (localItem) {
      if (baseItem === undefined) {
        // Nieuw op dit toestel.
        items.push(localItem);
      } else if (localChanged) {
        // Op het andere toestel verwijderd, hier gewijzigd: niet stil verliezen.
        conflicts += 1;
        items.push(localItem);
      }
      // Anders: op het andere toestel verwijderd en hier ongewijzigd → weg.
      continue;
    }

    if (remoteItem) {
      if (baseItem === undefined) {
        // Nieuw op het andere toestel.
        items.push(remoteItem);
      } else if (remoteChanged) {
        // Hier verwijderd, daar gewijzigd: de wijziging blijft behouden.
        conflicts += 1;
        items.push(remoteItem);
      }
    }
    // Anders: hier en daar verwijderd → weg.
  }

  return { items, conflicts };
}

export interface PlannerMergeResult {
  data: PlannerData;
  conflicts: number;
}

export function mergePlannerData(
  base: PlannerData,
  local: PlannerData,
  remote: PlannerData,
): PlannerMergeResult {
  let conflicts = 0;
  const merge = <T extends { id: string }>(key: keyof PlannerData): T[] => {
    const result = mergeById(
      base[key] as unknown as T[],
      local[key] as unknown as T[],
      remote[key] as unknown as T[],
    );
    conflicts += result.conflicts;
    return result.items;
  };

  const localPreferencesChanged = canonicalJson(local.preferences) !== canonicalJson(base.preferences);
  const remotePreferencesChanged = canonicalJson(remote.preferences) !== canonicalJson(base.preferences);
  let preferences: PlannerPreferences;
  if (!localPreferencesChanged) {
    preferences = remote.preferences;
  } else if (!remotePreferencesChanged) {
    preferences = local.preferences;
  } else if (canonicalJson(local.preferences) === canonicalJson(remote.preferences)) {
    preferences = local.preferences;
  } else {
    conflicts += 1;
    preferences = local.preferences;
  }

  return {
    data: {
      members: merge<FamilyMember>('members'),
      events: merge<AgendaEvent>('events'),
      groceries: merge<GroceryItem>('groceries'),
      rewards: merge<Reward>('rewards'),
      customIcons: merge<ActivityIcon>('customIcons'),
      customCategories: merge<IconCategoryMeta>('customCategories'),
      customRoutines: merge<RoutineTemplate>('customRoutines'),
      preferences,
    },
    conflicts,
  };
}
