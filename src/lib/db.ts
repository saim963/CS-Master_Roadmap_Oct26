import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TopicProgress, UserSettings, Resource } from '../types';

const DB_NAME = 'cs-roadmap-db';
const DB_VERSION = 1;

interface CSRoadmapDB extends DBSchema {
  progress: {
    key: string;
    value: TopicProgress;
  };
  settings: {
    key: string;
    value: UserSettings;
  };
}

let db: IDBPDatabase<CSRoadmapDB> | null = null;

async function getDB(): Promise<IDBPDatabase<CSRoadmapDB>> {
  if (db) return db;
  db = await openDB<CSRoadmapDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('progress')) {
        database.createObjectStore('progress', { keyPath: 'topicId' });
      }
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' } as any);
      }
    },
  });
  return db;
}

// ---------------------------------------------------------------
// Progress CRUD
// ---------------------------------------------------------------

export async function getTopicProgress(topicId: string): Promise<TopicProgress | undefined> {
  const database = await getDB();
  return database.get('progress', topicId);
}

export async function getAllProgress(): Promise<TopicProgress[]> {
  const database = await getDB();
  return database.getAll('progress');
}

export async function saveTopicProgress(progress: TopicProgress): Promise<void> {
  const database = await getDB();
  await database.put('progress', {
    ...progress,
    lastUpdated: new Date().toISOString(),
  });
}

export async function deleteTopicProgress(topicId: string): Promise<void> {
  const database = await getDB();
  await database.delete('progress', topicId);
}

export async function clearAllProgress(): Promise<void> {
  const database = await getDB();
  await database.clear('progress');
}

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------

export async function getSettings(): Promise<UserSettings> {
  const database = await getDB();
  const stored = await database.get('settings', 'user' as any);
  return stored ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const database = await getDB();
  await database.put('settings', settings as any);
}

export const DEFAULT_SETTINGS: UserSettings = {
  schemaVersion: 1,
  theme: 'light',
  graphLayout: 'dagre',
  showCompletedInGraph: true,
  showMasteredInGraph: true,
  defaultExpansionDepth: 2,
};

// ---------------------------------------------------------------
// Export / Import
// ---------------------------------------------------------------

export interface ExportData {
  schemaVersion: number;
  exportedAt: string;
  progress: TopicProgress[];
  settings: UserSettings;
}

export async function exportData(): Promise<ExportData> {
  const [progress, settings] = await Promise.all([getAllProgress(), getSettings()]);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
  };
}

export async function importData(data: ExportData): Promise<void> {
  const database = await getDB();
  const tx = database.transaction('progress', 'readwrite');
  await tx.store.clear();
  for (const p of data.progress) {
    await tx.store.put(p);
  }
  await tx.done;
  if (data.settings) {
    await saveSettings(data.settings);
  }
}

export function generateResourceId(): string {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createResource(
  title: string,
  url: string,
  type: Resource['type'],
  description?: string
): Resource {
  return {
    id: generateResourceId(),
    title,
    url,
    type,
    description,
    addedAt: new Date().toISOString(),
  };
}
