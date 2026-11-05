import { create } from 'zustand';
import type {
  TopicProgress,
  TopicStatus,
  UserSettings,
  Resource,
  ProgressStats,
} from '../types';
import {
  getAllProgress,
  saveTopicProgress,
  clearAllProgress,
  importData,
  exportData,
  getSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  type ExportData,
} from '../lib/db';
import { calcProgressStats } from '../lib/utils';
import { CATALOGUE } from '../data';

// ---------------------------------------------------------------
// State shape
// ---------------------------------------------------------------

interface ProgressStore {
  // Data
  progressMap: Record<string, TopicProgress>;
  settings: UserSettings;
  isLoaded: boolean;

  // Actions — Progress
  loadProgress: () => Promise<void>;
  getTopicStatus: (topicId: string) => TopicStatus;
  setTopicStatus: (topicId: string, status: TopicStatus) => Promise<void>;
  updateNotes: (topicId: string, notes: string) => Promise<void>;
  addResource: (topicId: string, resource: Resource) => Promise<void>;
  removeResource: (topicId: string, resourceId: string) => Promise<void>;
  resetProgress: () => Promise<void>;

  // Actions — Settings
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;

  // Actions — Export / Import
  exportAll: () => Promise<ExportData>;
  importAll: (data: ExportData) => Promise<void>;

  // Computed helpers
  getSubjectStats: (subjectId: string) => ProgressStats;
  getDomainStats: (domainId: string) => ProgressStats;
  getOverallStats: () => ProgressStats;
  getRecentlyStudied: (limit?: number) => TopicProgress[];
}

// ---------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progressMap: {},
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  // ── Load ──────────────────────────────────────────────────────
  loadProgress: async () => {
    const [allProgress, settings] = await Promise.all([
      getAllProgress(),
      getSettings(),
    ]);
    const progressMap: Record<string, TopicProgress> = {};
    for (const p of allProgress) {
      progressMap[p.topicId] = p;
    }
    set({ progressMap, settings, isLoaded: true });
  },

  // ── Topic status ──────────────────────────────────────────────
  getTopicStatus: (topicId) => {
    return get().progressMap[topicId]?.status ?? 'not_started';
  },

  setTopicStatus: async (topicId, status) => {
    const existing = get().progressMap[topicId];
    const now = new Date().toISOString();
    const updated: TopicProgress = {
      topicId,
      status,
      notes: existing?.notes ?? '',
      resources: existing?.resources ?? [],
      lastUpdated: now,
      startedAt: existing?.startedAt ?? (status !== 'not_started' ? now : undefined),
      completedAt:
        status === 'completed' || status === 'mastered'
          ? now
          : existing?.completedAt,
    };
    await saveTopicProgress(updated);
    set((s) => ({
      progressMap: { ...s.progressMap, [topicId]: updated },
    }));
  },

  // ── Notes ─────────────────────────────────────────────────────
  updateNotes: async (topicId, notes) => {
    const existing = get().progressMap[topicId];
    const updated: TopicProgress = {
      topicId,
      status: existing?.status ?? 'not_started',
      notes,
      resources: existing?.resources ?? [],
      lastUpdated: new Date().toISOString(),
      startedAt: existing?.startedAt,
      completedAt: existing?.completedAt,
    };
    await saveTopicProgress(updated);
    set((s) => ({
      progressMap: { ...s.progressMap, [topicId]: updated },
    }));
  },

  // ── Resources ─────────────────────────────────────────────────
  addResource: async (topicId, resource) => {
    const existing = get().progressMap[topicId];
    const resources = [...(existing?.resources ?? []), resource];
    const updated: TopicProgress = {
      topicId,
      status: existing?.status ?? 'not_started',
      notes: existing?.notes ?? '',
      resources,
      lastUpdated: new Date().toISOString(),
      startedAt: existing?.startedAt,
      completedAt: existing?.completedAt,
    };
    await saveTopicProgress(updated);
    set((s) => ({
      progressMap: { ...s.progressMap, [topicId]: updated },
    }));
  },

  removeResource: async (topicId, resourceId) => {
    const existing = get().progressMap[topicId];
    if (!existing) return;
    const resources = existing.resources.filter((r) => r.id !== resourceId);
    const updated = { ...existing, resources, lastUpdated: new Date().toISOString() };
    await saveTopicProgress(updated);
    set((s) => ({
      progressMap: { ...s.progressMap, [topicId]: updated },
    }));
  },

  // ── Reset ─────────────────────────────────────────────────────
  resetProgress: async () => {
    await clearAllProgress();
    set({ progressMap: {} });
  },

  // ── Settings ──────────────────────────────────────────────────
  updateSettings: async (patch) => {
    const settings = { ...get().settings, ...patch };
    await saveSettings(settings);
    set({ settings });
  },

  // ── Export / Import ───────────────────────────────────────────
  exportAll: async () => {
    return exportData();
  },

  importAll: async (data) => {
    await importData(data);
    await get().loadProgress();
  },

  // ── Computed helpers ──────────────────────────────────────────
  getSubjectStats: (subjectId) => {
    const subject = CATALOGUE.subjects.find((s) => s.id === subjectId);
    if (!subject) return calcProgressStats([]);
    const statuses = collectLeafStatuses(subject.topicIds, get().progressMap);
    return calcProgressStats(statuses);
  },

  getDomainStats: (domainId) => {
    const domain = CATALOGUE.domains.find((d) => d.id === domainId);
    if (!domain) return calcProgressStats([]);
    const topicIds = new Set<string>();
    for (const sId of domain.subjectIds) {
      const subject = CATALOGUE.subjects.find((s) => s.id === sId);
      if (subject) {
        for (const tId of subject.topicIds) topicIds.add(tId);
      }
    }
    const statuses = [...topicIds].map(
      (id) => (get().progressMap[id]?.status ?? 'not_started') as TopicStatus
    );
    return calcProgressStats(statuses);
  },

  getOverallStats: () => {
    const allTopicIds = new Set<string>();
    for (const subject of CATALOGUE.subjects) {
      for (const tId of subject.topicIds) allTopicIds.add(tId);
    }
    const statuses = [...allTopicIds].map(
      (id) => (get().progressMap[id]?.status ?? 'not_started') as TopicStatus
    );
    return calcProgressStats(statuses);
  },

  getRecentlyStudied: (limit = 5) => {
    return Object.values(get().progressMap)
      .filter((p) => p.status !== 'not_started')
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
      .slice(0, limit);
  },
}));

// ---------------------------------------------------------------
// Helper: collect leaf topic statuses within a topic subtree
// ---------------------------------------------------------------

function collectLeafStatuses(
  topicIds: string[],
  progressMap: Record<string, TopicProgress>
): TopicStatus[] {
  const statuses: TopicStatus[] = [];
  for (const tId of topicIds) {
    const topic = CATALOGUE.topics.find((t) => t.id === tId);
    if (!topic) continue;
    if (topic.childIds.length === 0) {
      statuses.push(progressMap[tId]?.status ?? 'not_started');
    } else {
      statuses.push(...collectLeafStatuses(topic.childIds, progressMap));
    }
  }
  return statuses;
}
