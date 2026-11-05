import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../store/progressStore';
import { CATALOGUE } from '../data';
import { getDomainColors } from '../lib/utils';
import ProgressBar from '../components/ProgressBar';
import {
  TrendingUp,
  Clock,
  BookOpen,
  ChevronRight,
  Zap,
  Target,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';

function DomainIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as any)[name] as React.FC<{ size?: number; className?: string }>;
  if (!Icon) return <BookOpen size={size} />;
  return <Icon size={size} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { getOverallStats, getDomainStats, getRecentlyStudied, progressMap } = useProgressStore();
  const overallStats = getOverallStats();
  const recentlyStudied = getRecentlyStudied(6);

  // Suggest next topics: pick topics from subjects with most in-progress
  const suggestions = CATALOGUE.topics
    .filter((t) => {
      const status = progressMap[t.id]?.status ?? 'not_started';
      return status === 'not_started' && t.isMilestone;
    })
    .slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-[var(--color-text-muted)]">
          Your Computer Science learning journey at a glance.
        </p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Overall Progress</h2>
            <p className="text-[var(--color-text-muted)] text-sm">
              Across all {CATALOGUE.domains.length} domains and {CATALOGUE.topics.length} topics
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">{overallStats.percentage}%</div>
            <div className="text-sm text-[var(--color-text-muted)]">complete</div>
          </div>
        </div>
        <ProgressBar stats={overallStats} size="lg" showLabels showCounts />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Not Started', val: overallStats.notStarted, color: 'text-slate-600' },
            { label: 'Learning', val: overallStats.learning, color: 'text-blue-600' },
            { label: 'Completed', val: overallStats.completed, color: 'text-emerald-600' },
            { label: 'Mastered', val: overallStats.mastered, color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-3 text-center">
              <div className={cn('text-xl font-bold', s.color)}>{s.val}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/roadmap')}
          className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 text-left hover:bg-indigo-100/80 transition-colors group shadow-2xs"
        >
          <BookOpen size={24} className="text-indigo-600 mb-2" />
          <div className="font-semibold text-slate-900">Browse Roadmap</div>
          <div className="text-sm text-slate-600">Explore the full topic tree</div>
          <ChevronRight size={16} className="text-indigo-600 mt-2 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => navigate('/graph')}
          className="bg-violet-50/80 border border-violet-200 rounded-xl p-4 text-left hover:bg-violet-100/80 transition-colors group shadow-2xs"
        >
          <Zap size={24} className="text-violet-600 mb-2" />
          <div className="font-semibold text-slate-900">Knowledge Graph</div>
          <div className="text-sm text-slate-600">Visualize relationships</div>
          <ChevronRight size={16} className="text-violet-600 mt-2 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => navigate('/progress')}
          className="bg-teal-50/80 border border-teal-200 rounded-xl p-4 text-left hover:bg-teal-100/80 transition-colors group shadow-2xs"
        >
          <TrendingUp size={24} className="text-teal-600 mb-2" />
          <div className="font-semibold text-slate-900">Progress Details</div>
          <div className="text-sm text-slate-600">Stats & settings</div>
          <ChevronRight size={16} className="text-teal-600 mt-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Domain Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Domains</h2>
          <button
            onClick={() => navigate('/roadmap')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOGUE.domains.map((domain) => {
            const stats = getDomainStats(domain.id);
            const colors = getDomainColors(domain.color);
            return (
              <button
                key={domain.id}
                onClick={() => navigate(`/roadmap?domain=${domain.id}`)}
                className={cn(
                  'rounded-xl p-4 text-left border transition-all hover:scale-[1.01] hover:shadow-md shadow-2xs bg-white',
                  colors.border
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('flex items-center gap-2 font-semibold', colors.text)}>
                    <DomainIcon name={domain.icon} size={18} />
                    <span className="text-sm">{domain.title}</span>
                  </div>
                  <span className={cn('text-lg font-bold', colors.text)}>
                    {stats.percentage}%
                  </span>
                </div>
                <ProgressBar stats={stats} size="sm" />
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-2">
                  <span>{domain.subjectIds.length} subjects</span>
                  <span>{stats.completed + stats.mastered}/{stats.total} topics</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Studied */}
      {recentlyStudied.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold text-slate-900">Recently Studied</h2>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)] shadow-xs">
            {recentlyStudied.map((p) => {
              const topic = CATALOGUE.topics.find((t) => t.id === p.topicId);
              const subject = topic
                ? CATALOGUE.subjects.find((s) => s.id === topic.subjectId)
                : null;
              if (!topic) return null;
              return (
                <button
                  key={p.topicId}
                  onClick={() => navigate(`/topic/${p.topicId}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{topic.title}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">
                      {subject?.title}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] shrink-0">
                    {new Date(p.lastUpdated).toLocaleDateString()}
                  </div>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)] shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Next Topics */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold text-slate-900">Suggested Next</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map((topic) => {
              const subject = CATALOGUE.subjects.find((s) => s.id === topic.subjectId);
              const domain = CATALOGUE.domains.find((d) => d.id === topic.domainId);
              const colors = domain ? getDomainColors(domain.color) : getDomainColors('indigo');
              return (
                <button
                  key={topic.id}
                  onClick={() => navigate(`/topic/${topic.id}`)}
                  className={cn(
                    'rounded-xl p-4 text-left border transition-all hover:scale-[1.01] hover:shadow-sm bg-white',
                    colors.border
                  )}
                >
                  <div className={cn('text-xs font-semibold mb-1', colors.text)}>
                    {subject?.title}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{topic.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {topic.estimatedHours}h · {topic.difficulty}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state if no progress */}
      {overallStats.total > 0 && overallStats.learning === 0 && overallStats.completed === 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center shadow-xs">
          <BookOpen size={48} className="mx-auto text-indigo-500 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Start Your Journey</h3>
          <p className="text-[var(--color-text-muted)] mb-4">
            Browse the roadmap and mark topics as you learn them.
          </p>
          <button
            onClick={() => navigate('/roadmap')}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Browse Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
