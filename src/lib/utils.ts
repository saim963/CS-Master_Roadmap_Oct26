import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TopicStatus, ProgressStats, DifficultyLevel } from '../types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------
// Status utilities
// ---------------------------------------------------------------

export const STATUS_CONFIG: Record<
  TopicStatus,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  not_started: {
    label: 'Not Started',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    icon: 'Circle',
  },
  learning: {
    label: 'Learning',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: 'BookOpen',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'CheckCircle',
  },
  mastered: {
    label: 'Mastered',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: 'Star',
  },
};

export const STATUS_CYCLE: TopicStatus[] = [
  'not_started',
  'learning',
  'completed',
  'mastered',
];

export function nextStatus(current: TopicStatus): TopicStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ---------------------------------------------------------------
// Progress calculation
// ---------------------------------------------------------------

export function calcProgressStats(statuses: TopicStatus[]): ProgressStats {
  const total = statuses.length;
  const counts = { not_started: 0, learning: 0, completed: 0, mastered: 0 };
  for (const s of statuses) counts[s]++;
  const done = counts.completed + counts.mastered;
  return {
    total,
    notStarted: counts.not_started,
    learning: counts.learning,
    completed: counts.completed,
    mastered: counts.mastered,
    percentage: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

// ---------------------------------------------------------------
// Difficulty utilities
// ---------------------------------------------------------------

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string }
> = {
  beginner: { label: 'Beginner', color: 'text-emerald-700' },
  intermediate: { label: 'Intermediate', color: 'text-amber-800' },
  advanced: { label: 'Advanced', color: 'text-orange-800' },
  expert: { label: 'Expert', color: 'text-rose-800' },
};

export function getDifficultyColor(diff: DifficultyLevel): string {
  switch (diff) {
    case 'beginner':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'intermediate':
      return 'text-amber-800 bg-amber-50 border-amber-200';
    case 'advanced':
      return 'text-orange-800 bg-orange-50 border-orange-200';
    case 'expert':
      return 'text-rose-800 bg-rose-50 border-rose-200';
  }
}

// ---------------------------------------------------------------
// Domain color utilities
// ---------------------------------------------------------------

export const DOMAIN_COLORS: Record<
  string,
  { bg: string; border: string; text: string; nodeBg: string; hex?: string }
> = {
  indigo: {
    bg: 'bg-indigo-50/80',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    nodeBg: '#ffffff',
    hex: '#4f46e5',
  },
  blue: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-200',
    text: 'text-blue-700',
    nodeBg: '#ffffff',
    hex: '#2563eb',
  },
  emerald: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    nodeBg: '#ffffff',
    hex: '#059669',
  },
  teal: {
    bg: 'bg-teal-50/80',
    border: 'border-teal-200',
    text: 'text-teal-700',
    nodeBg: '#ffffff',
    hex: '#0d9488',
  },
  orange: {
    bg: 'bg-orange-50/80',
    border: 'border-orange-200',
    text: 'text-orange-700',
    nodeBg: '#ffffff',
    hex: '#ea580c',
  },
  violet: {
    bg: 'bg-violet-50/80',
    border: 'border-violet-200',
    text: 'text-violet-700',
    nodeBg: '#ffffff',
    hex: '#7c3aed',
  },
  cyan: {
    bg: 'bg-cyan-50/80',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    nodeBg: '#ffffff',
    hex: '#0891b2',
  },
  sky: {
    bg: 'bg-sky-50/80',
    border: 'border-sky-200',
    text: 'text-sky-700',
    nodeBg: '#ffffff',
    hex: '#0284c7',
  },
  red: {
    bg: 'bg-red-50/80',
    border: 'border-red-200',
    text: 'text-red-700',
    nodeBg: '#ffffff',
    hex: '#dc2626',
  },
  yellow: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200',
    text: 'text-amber-800',
    nodeBg: '#ffffff',
    hex: '#d97706',
  },
  pink: {
    bg: 'bg-pink-50/80',
    border: 'border-pink-200',
    text: 'text-pink-700',
    nodeBg: '#ffffff',
    hex: '#db2777',
  },
  amber: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200',
    text: 'text-amber-800',
    nodeBg: '#ffffff',
    hex: '#d97706',
  },
};

export function getDomainColors(color: string) {
  return DOMAIN_COLORS[color] ?? DOMAIN_COLORS.indigo;
}

// ---------------------------------------------------------------
// Formatting utilities
// ---------------------------------------------------------------

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 8); // 8h work day
  return `~${days}d`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ---------------------------------------------------------------
// Graph color by relationship type
// ---------------------------------------------------------------

export const RELATIONSHIP_COLORS: Record<string, string> = {
  prerequisite_of: '#ef4444',  // red
  foundation_of: '#8b5cf6',    // violet
  uses: '#3b82f6',             // blue
  contains: '#6b7280',         // gray
  implements: '#22c55e',       // green
  related_to: '#f59e0b',       // amber
  application_of: '#06b6d4',   // cyan
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  prerequisite_of: 'Prerequisite of',
  foundation_of: 'Foundation of',
  uses: 'Uses',
  contains: 'Contains',
  implements: 'Implements',
  related_to: 'Related to',
  application_of: 'Application of',
};
