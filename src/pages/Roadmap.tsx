import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Filter,
  Star,
  Layers,
  Sparkles,
  Search,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CATALOGUE } from '../data';
import { useProgressStore } from '../store/progressStore';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { getDomainColors, getDifficultyColor, cn } from '../lib/utils';
import type { Topic, TopicStatus, DifficultyLevel } from '../types';

function DomainIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as any)[name] as React.FC<{ size?: number; className?: string }>;
  if (!Icon) return <BookOpen size={size} />;
  return <Icon size={size} />;
}

export default function Roadmap() {
  const { progressMap, setTopicStatus, getDomainStats, getSubjectStats } = useProgressStore();

  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    'core-cs': true,
  });
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    'algorithms-ds': true,
  });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const [filterStatus, setFilterStatus] = useState<TopicStatus | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [milestonesOnly, setMilestonesOnly] = useState(false);

  // Fast maps
  const topicsById = useMemo(() => {
    return new Map(CATALOGUE.topics.map((t) => [t.id, t]));
  }, []);

  const subjectsById = useMemo(() => {
    return new Map(CATALOGUE.subjects.map((s) => [s.id, s]));
  }, []);

  // Filter topics
  const matchesTopicFilter = (topic: Topic): boolean => {
    const status = progressMap[topic.id]?.status ?? 'not_started';
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (filterDifficulty !== 'all' && topic.difficulty !== filterDifficulty) return false;
    if (milestonesOnly && !topic.isMilestone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = topic.title.toLowerCase().includes(q);
      const matchDesc = topic.description.toLowerCase().includes(q);
      const matchTags = topic.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  };

  const toggleDomain = (id: string) => {
    setExpandedDomains((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const dMap: Record<string, boolean> = {};
    const sMap: Record<string, boolean> = {};
    const tMap: Record<string, boolean> = {};
    CATALOGUE.domains.forEach((d) => (dMap[d.id] = true));
    CATALOGUE.subjects.forEach((s) => (sMap[s.id] = true));
    CATALOGUE.topics.forEach((t) => {
      if (t.childIds.length > 0) tMap[t.id] = true;
    });
    setExpandedDomains(dMap);
    setExpandedSubjects(sMap);
    setExpandedTopics(tMap);
  };

  const collapseAll = () => {
    setExpandedDomains({});
    setExpandedSubjects({});
    setExpandedTopics({});
  };

  // Render a topic row and its children recursively
  const renderTopic = (topic: Topic, depth = 0) => {
    const hasChildren = topic.childIds.length > 0;
    const isExpanded = !!expandedTopics[topic.id];
    const status = progressMap[topic.id]?.status ?? 'not_started';
    const childTopics = topic.childIds
      .map((cId) => topicsById.get(cId))
      .filter((c): c is Topic => !!c);

    // If filtering, only display if topic or its descendants match
    const selfMatches = matchesTopicFilter(topic);
    const childrenMatch = childTopics.some((c) => matchesTopicFilter(c));
    if (!selfMatches && !childrenMatch && (filterStatus !== 'all' || filterDifficulty !== 'all' || searchQuery || milestonesOnly)) {
      return null;
    }

    const diffColors = getDifficultyColor(topic.difficulty);

    return (
      <div key={topic.id} className="space-y-1">
        <div
          className={cn(
            'group flex items-center justify-between py-2 px-3 rounded-lg border transition-all text-sm',
            'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300',
            topic.isMilestone && 'border-amber-300 bg-amber-50/50'
          )}
          style={{ marginLeft: `${depth * 1.25}rem` }}
        >
          {/* Left title & controls */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleTopic(topic.id)}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800 transition-colors"
                title={isExpanded ? 'Collapse subtopics' : 'Expand subtopics'}
              >
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
            ) : (
              <div className="w-5" />
            )}

            <Link
              to={`/topic/${topic.id}`}
              className="font-medium text-slate-900 hover:text-indigo-600 transition-colors truncate flex items-center gap-2"
            >
              <span>{topic.title}</span>
              {topic.isMilestone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  Milestone
                </span>
              )}
            </Link>
          </div>

          {/* Right badges & controls */}
          <div className="flex items-center gap-2.5 shrink-0 ml-3">
            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded border capitalize', diffColors)}>
              {topic.difficulty}
            </span>

            {topic.estimatedHours > 0 && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {topic.estimatedHours}h
              </span>
            )}

            <StatusBadge
              status={status}
              onChange={(next) => setTopicStatus(topic.id, next)}
              size="sm"
              showLabel
            />
          </div>
        </div>

        {/* Nested Child Topics */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 mt-1">
            {childTopics.map((c) => renderTopic(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-indigo-600" />
            Curriculum Roadmap
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Explore the complete computer science hierarchy from broad domains down to specialized concepts.
          </p>
        </div>

        {/* Global Expand/Collapse */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs transition-colors"
          >
            <Maximize2 size={13} />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs transition-colors"
          >
            <Minimize2 size={13} />
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter topics, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-[var(--color-surface)] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="completed">Completed</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value as any)}
          className="bg-[var(--color-surface)] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>

        {/* Milestones toggle */}
        <button
          onClick={() => setMilestonesOnly((prev) => !prev)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-2xs',
            milestonesOnly
              ? 'bg-amber-100 border-amber-400 text-amber-900'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          )}
        >
          <Sparkles size={13} className={milestonesOnly ? 'text-amber-600' : 'text-slate-400'} />
          Key Milestones
        </button>
      </div>

      {/* Domain Trees */}
      <div className="space-y-4">
        {CATALOGUE.domains.map((domain) => {
          const isDomainExpanded = !!expandedDomains[domain.id];
          const colors = getDomainColors(domain.color);
          const domainStats = getDomainStats(domain.id);
          const subjects = domain.subjectIds
            .map((sId) => subjectsById.get(sId))
            .filter((s): s is typeof CATALOGUE.subjects[0] => !!s);

          return (
            <div
              key={domain.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xs"
            >
              {/* Domain Header Row */}
              <div
                onClick={() => toggleDomain(domain.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs',
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    <DomainIcon name={domain.icon} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-900 text-base truncate">{domain.title}</h2>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        ({domain.subjectIds.length} subjects)
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                      {domain.description}
                    </p>
                  </div>
                </div>

                {/* Domain Progress and Chevron */}
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="hidden sm:block w-32">
                    <ProgressBar stats={domainStats} size="sm" />
                    <div className="text-[11px] text-[var(--color-text-muted)] text-right mt-1 font-mono">
                      {domainStats.percentage}% ({domainStats.completed + domainStats.mastered}/{domainStats.total})
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isDomainExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>

              {/* Domain Body: Subjects List */}
              {isDomainExpanded && (
                <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)] bg-slate-50/50">
                  {subjects.map((subject) => {
                    const isSubjectExpanded = !!expandedSubjects[subject.id];
                    const subjectStats = getSubjectStats(subject.id);
                    const rootTopics = subject.topicIds
                      .map((tId) => topicsById.get(tId))
                      .filter((t): t is Topic => !!t && t.parentId === null);

                    return (
                      <div key={subject.id} className="p-4 space-y-3 bg-white">
                        {/* Subject Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <button
                              onClick={() => toggleSubject(subject.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors"
                            >
                              {isSubjectExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>

                            <Link
                              to={`/subject/${subject.id}`}
                              className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-2"
                            >
                              <span>{subject.title}</span>
                              <span className="text-xs text-slate-500 font-normal">
                                · {subject.topicIds.length} topics
                              </span>
                            </Link>
                          </div>

                          {/* Subject Progress */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                              {subjectStats.percentage}% done
                            </span>
                            <div className="w-20 hidden md:block">
                              <ProgressBar stats={subjectStats} size="sm" />
                            </div>
                            <Link
                              to={`/subject/${subject.id}`}
                              className="text-xs text-indigo-700 hover:text-indigo-800 font-medium px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-2xs"
                            >
                              Explore Subject →
                            </Link>
                          </div>
                        </div>

                        {/* Subject Topics Tree */}
                        {isSubjectExpanded && (
                          <div className="pl-6 space-y-1.5 border-l-2 border-indigo-200 ml-2 pt-1">
                            {rootTopics.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-2">
                                Subtopics catalogue for this subject can be explored in Subject view.
                              </p>
                            ) : (
                              rootTopics.map((topic) => renderTopic(topic, 0))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
