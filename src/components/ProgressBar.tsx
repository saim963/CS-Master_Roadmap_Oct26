import type { ProgressStats } from '../types';
import { cn } from '../lib/utils';

interface Props {
  stats: ProgressStats;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showCounts?: boolean;
}

export default function ProgressBar({ stats, size = 'md', showLabels = false, showCounts = false }: Props) {
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  const masteredPct = stats.total === 0 ? 0 : (stats.mastered / stats.total) * 100;
  const completedPct = stats.total === 0 ? 0 : (stats.completed / stats.total) * 100;
  const learningPct = stats.total === 0 ? 0 : (stats.learning / stats.total) * 100;

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
          <span>{stats.percentage}% complete</span>
          {showCounts && (
            <span>{stats.completed + stats.mastered} / {stats.total} topics</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden flex', heights[size])}>
        <div
          className="bg-violet-500 transition-all duration-500"
          style={{ width: `${masteredPct}%` }}
          title={`Mastered: ${stats.mastered}`}
        />
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${completedPct}%` }}
          title={`Completed: ${stats.completed}`}
        />
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{ width: `${learningPct}%` }}
          title={`Learning: ${stats.learning}`}
        />
      </div>
      {showCounts && (
        <div className="flex gap-3 mt-1.5 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Mastered: {stats.mastered}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Done: {stats.completed}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Learning: {stats.learning}</span>
        </div>
      )}
    </div>
  );
}
