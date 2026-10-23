import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { addEvent as postEvent, adjustStarsDirectly, getSummary } from './api';
import {
  DEFAULT_AVATAR_CONFIG,
  loadAvatarConfig,
  saveAvatarConfig,
} from './avatarCatalog';
import {
  DEFAULT_LEARNING_CONFIG,
  loadLearningConfig,
  saveLearningConfig,
} from './learningCatalog';
import { playCoin, playPop, playSuccess } from './sound';
import type {
  AvatarCategory,
  AvatarConfig,
  AvatarMode,
  CustomLearningConfig,
  FamilyReward,
  NewEvent,
  Summary,
} from './types';

export const DEFAULT_FAMILY_REWARDS: FamilyReward[] = [
  {
    id: 'rew-gametime',
    title: '30 min Vrij Gamen',
    cost: 15,
    emoji: '🎮',
    description: 'Lekker een halfuurtje extra gamen op de computer of tablet.',
  },
  {
    id: 'rew-dinner',
    title: 'Zelf Avondeten Kiezen',
    cost: 20,
    emoji: '🥞',
    description: 'Pannenkoeken, frietjes of jouw lievelingspasta!',
  },
  {
    id: 'rew-movie',
    title: 'Piraten Filmavond',
    cost: 30,
    emoji: '🍿',
    description: 'Gezellig een film kijken met popcorn en limonade.',
  },
  {
    id: 'rew-playground',
    title: 'Grote Speeltuin Uitstapje',
    cost: 40,
    emoji: '🎠',
    description: 'Samen naar de grote speeltuin of binnenspeeltuin!',
  },
];

const REWARDS_STORAGE_KEY = 'je_family_rewards';

type PlatformContextValue = {
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addEvent: (event: NewEvent) => Promise<Summary>;
  childName: string;
  stars: number;
  theme: string;
  avatarConfig: AvatarConfig;
  setAvatarMode: (mode: AvatarMode) => void;
  equipAvatarItem: (category: AvatarCategory, itemId: string) => void;
  unlockAvatarItem: (itemId: string, cost: number) => boolean;
  spendStars: (amount: number, reason: string) => boolean;
  earnStars: (amount: number, reason: string) => void;
  familyRewards: FamilyReward[];
  claimFamilyReward: (rewardId: string) => boolean;
  addCustomReward: (reward: FamilyReward) => void;
  removeCustomReward: (rewardId: string) => void;
  learningConfig: CustomLearningConfig;
  updateLearningConfig: (config: CustomLearningConfig) => void;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Avatar state
  const [avatarConfig, setAvatarState] = useState<AvatarConfig>(() => loadAvatarConfig());

  // Family rewards state
  const [familyRewards, setFamilyRewards] = useState<FamilyReward[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_FAMILY_REWARDS;
    try {
      const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_FAMILY_REWARDS;
  });

  // Custom learning state
  const [learningConfig, setLearningConfig] = useState<CustomLearningConfig>(() =>
    loadLearningConfig(),
  );

  const refresh = useCallback(async () => {
    try {
      const next = await getSummary();
      setSummary(next);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'De server is niet bereikbaar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  const addEvent = useCallback(async (event: NewEvent) => {
    const result = await postEvent(event);
    setSummary(result.summary);
    setError(null);
    return result.summary;
  }, []);

  const earnStars = useCallback(
    (amount: number, reason: string) => {
      if (amount <= 0) return;
      playCoin();
      adjustStarsDirectly(amount);
      void addEvent({
        app: 'reward',
        type: 'earn_stars',
        stars: amount,
        payload: { reason },
      });
    },
    [addEvent],
  );

  const spendStars = useCallback(
    (amount: number, reason: string): boolean => {
      const current = summary?.stars ?? 0;
      if (current < amount) return false;
      playCoin();
      adjustStarsDirectly(-amount);
      void addEvent({
        app: 'reward',
        type: 'spend_stars',
        stars: -amount,
        payload: { reason },
      });
      return true;
    },
    [summary?.stars, addEvent],
  );

  const setAvatarMode = useCallback((mode: AvatarMode) => {
    playPop();
    setAvatarState((prev) => {
      const next: AvatarConfig = {
        ...prev,
        mode,
      };
      saveAvatarConfig(next);
      return next;
    });
  }, []);

  const equipAvatarItem = useCallback((category: AvatarCategory, itemId: string) => {
    playPop();
    setAvatarState((prev) => {
      const next: AvatarConfig = {
        ...prev,
        [category]: itemId,
      };
      saveAvatarConfig(next);
      return next;
    });
  }, []);

  const unlockAvatarItem = useCallback(
    (itemId: string, cost: number): boolean => {
      const currentStars = summary?.stars ?? 0;
      if (currentStars < cost) return false;

      const spent = spendStars(cost, `Item ontgrendeld: ${itemId}`);
      if (!spent) return false;

      playSuccess();
      setAvatarState((prev) => {
        const next: AvatarConfig = {
          ...prev,
          unlockedIds: Array.from(new Set([...prev.unlockedIds, itemId])),
        };
        saveAvatarConfig(next);
        return next;
      });
      return true;
    },
    [summary?.stars, spendStars],
  );

  const claimFamilyReward = useCallback(
    (rewardId: string): boolean => {
      const reward = familyRewards.find((r) => r.id === rewardId);
      if (!reward) return false;
      const spent = spendStars(reward.cost, `Beloning ingewisseld: ${reward.title}`);
      if (!spent) return false;

      playSuccess();
      setFamilyRewards((prev) => {
        const next = prev.map((r) =>
          r.id === rewardId ? { ...r, claimedCount: (r.claimedCount ?? 0) + 1 } : r,
        );
        localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return true;
    },
    [familyRewards, spendStars],
  );

  const addCustomReward = useCallback((newReward: FamilyReward) => {
    setFamilyRewards((prev) => {
      const next = [newReward, ...prev];
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCustomReward = useCallback((rewardId: string) => {
    setFamilyRewards((prev) => {
      const next = prev.filter((r) => r.id !== rewardId);
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLearningConfig = useCallback((config: CustomLearningConfig) => {
    setLearningConfig(config);
    saveLearningConfig(config);
  }, []);

  const value = useMemo<PlatformContextValue>(() => {
    const baseStars = summary?.stars ?? 24;
    return {
      summary,
      loading,
      error,
      refresh,
      addEvent,
      childName: summary?.settings.childName ?? 'Jaren',
      stars: baseStars,
      theme: summary?.settings.theme ?? 'pirate',
      avatarConfig,
      setAvatarMode,
      equipAvatarItem,
      unlockAvatarItem,
      spendStars,
      earnStars,
      familyRewards,
      claimFamilyReward,
      addCustomReward,
      removeCustomReward,
      learningConfig,
      updateLearningConfig,
    };
  }, [
    summary,
    loading,
    error,
    refresh,
    addEvent,
    avatarConfig,
    setAvatarMode,
    equipAvatarItem,
    unlockAvatarItem,
    spendStars,
    earnStars,
    familyRewards,
    claimFamilyReward,
    addCustomReward,
    removeCustomReward,
    learningConfig,
    updateLearningConfig,
  ]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return ctx;
}
