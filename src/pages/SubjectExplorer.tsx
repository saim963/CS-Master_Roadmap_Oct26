import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Calculator,
  Clock,
  Star,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CATALOGUE } from '../data';
import { useProgressStore } from '../store/progressStore';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import { getDomainColors, getDifficultyColor, cn } from '../lib/utils';
import type { Topic, Subject } from '../types';

function DomainIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as any)[name] as React.FC<{ size?: number; className?: string }>;
  if (!Icon) return <BookOpen size={size} />;
  return <Icon size={size} />;
}

export default function SubjectExplorer() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { progressMap, setTopicStatus, getSubjectStats } = useProgressStore();

  const subject = useMemo(() => {
    return CATALOGUE.subjects.find((s) => s.id === subjectId);
  }, [subjectId]);

  const domain = useMemo(() => {
    if (!subject) return null;
    return CATALOGUE.domains.find((d) => d.id === subject.domainId) ?? null;
  }, [subject]);

  const stats = useMemo(() => {
    if (!subject) return null;
    return getSubjectStats(subject.id);
  }, [subject, getSubjectStats]);

  // Prerequisites
  const prerequisites = useMemo(() => {
    if (!subject) return [];
    return subject.prerequisiteSubjectIds
      .map((id) => CATALOGUE.subjects.find((s) => s.id === id))
      .filter((s): s is Subject => !!s);
  }, [subject]);

  // Related subjects
  const relatedSubjects = useMemo(() => {
    if (!subject) return [];
    return subject.relatedSubjectIds
      .map((id) => CATALOGUE.subjects.find((s) => s.id === id))
      .filter((s): s is Subject => !!s);
  }, [subject]);

  // Sibling subjects in the same domain
  const siblingSubjects = useMemo(() => {
    if (!domain) return [];
    return domain.subjectIds
      .map((id) => CATALOGUE.subjects.find((s) => s.id === id))
      .filter((s): s is Subject => !!s && s.id !== subjectId);
  }, [domain, subjectId]);

  // Topics belonging to this subject
  const topics = useMemo(() => {
    if (!subject) return [];
    return subject.topicIds
      .map((id) => CATALOGUE.topics.find((t) => t.id === id))
      .filter((t): t is Topic => !!t);
  }, [subject]);

  const rootTopics = useMemo(() => {
    return topics.filter((t) => t.parentId === null);
  }, [topics]);

  // Find all mathematical foundation topics referenced by topics in this subject
  const mathFoundations = useMemo(() => {
    const mathIds = new Set<string>();
    topics.forEach((t) => {
      t.mathFoundationIds?.forEach((mId) => mathIds.add(mId));
    });
    return [...mathIds]
      .map((id) => {
        // Can be a topic or subject ID
        const topic = CATALOGUE.topics.find((t) => t.id === id);
        const subject = CATALOGUE.subjects.find((s) => s.id === id);
        return { id, topic, subject };
      })
      .filter((m) => m.topic || m.subject);
  }, [topics]);

  if (!subject || !domain || !stats) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Subject Not Found</h2>
        <p className="text-slate-600 text-sm">
          The subject with identifier "{subjectId}" does not exist in the catalogue.
        </p>
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Roadmap
        </Link>
      </div>
    );
  }

  const colors = getDomainColors(domain.color);

  const renderTopicItem = (topic: Topic, depth = 0) => {
    const status = progressMap[topic.id]?.status ?? 'not_started';
    const children = topic.childIds
      .map((cId) => CATALOGUE.topics.find((t) => t.id === cId))
      .filter((c): c is Topic => !!c);
    const diffColor = getDifficultyColor(topic.difficulty);

    return (
      <div key={topic.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-lg border transition-all text-sm',
            'bg-white border-slate-200 hover:border-slate-300 shadow-2xs',
            topic.isMilestone && 'border-amber-300 bg-amber-50/50'
          )}
          style={{ marginLeft: `${depth * 1.5}rem` }}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Link
              to={`/topic/${topic.id}`}
              className="font-medium text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-2 truncate"
            >
              <span>{topic.title}</span>
              {topic.isMilestone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  Key Milestone
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded border capitalize', diffColor)}>
              {topic.difficulty}
            </span>
            {topic.estimatedHours > 0 && (
              <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                <Clock size={12} />
                {topic.estimatedHours}h
              </span>
            )}
            <StatusBadge
              status={status}
              onChange={(next) => setTopicStatus(topic.id, next)}
              size="sm"
              showLabel
            />
            <Link
              to={`/topic/${topic.id}`}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors"
              title="View full topic details"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {children.length > 0 && (
          <div className="space-y-1 mt-1">
            {children.map((c) => renderTopicItem(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <Link to="/roadmap" className="hover:text-slate-900 transition-colors">
          Roadmap
        </Link>
        <ChevronRight size={12} />
        <span className={cn('font-semibold', colors.text)}>{domain.title}</span>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-semibold">{subject.title}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border flex items-center gap-1.5 shadow-2xs',
                  colors.bg,
                  colors.text,
                  colors.border
                )}
              >
                <DomainIcon name={domain.icon} size={14} />
                {domain.title}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {subject.title}
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed">
              {subject.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {subject.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shrink-0 w-full md:w-64 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Subject Progress</span>
              <span className="text-slate-900 font-mono font-bold text-sm">
                {stats.percentage}%
              </span>
            </div>
            <ProgressBar stats={stats} size="md" showCounts />
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              {stats.completed + stats.mastered} of {stats.total} topics completed
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisites & Mathematical Foundations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prerequisites */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3 shadow-xs">
          <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Formal Prerequisites
          </h2>
          {prerequisites.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No formal prerequisites required. This subject can be studied as an introductory entry point.
            </p>
          ) : (
            <div className="space-y-2">
              {prerequisites.map((p) => {
                const pStats = getSubjectStats(p.id);
                return (
                  <Link
                    key={p.id}
                    to={`/subject/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors group shadow-2xs"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {p.title}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs font-mono text-slate-500">{pStats.percentage}%</span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Mathematical Foundations */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3 shadow-xs">
          <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Calculator size={15} className="text-emerald-600" />
            Mathematical & Statistical Foundations
          </h2>
          {mathFoundations.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No specific mathematical foundations linked for this subject.
            </p>
          ) : (
            <div className="space-y-2">
              {mathFoundations.map((m) => {
                const title = m.topic?.title ?? m.subject?.title ?? m.id;
                const link = m.topic ? `/topic/${m.topic.id}` : `/subject/${m.subject?.id}`;
                return (
                  <Link
                    key={m.id}
                    to={link}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors group shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {title}
                      </span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" />
            Curriculum Topics ({topics.length})
          </h2>
        </div>

        {rootTopics.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center text-slate-500 text-sm shadow-xs">
            Topics catalogue for this subject will expand in future revisions.
          </div>
        ) : (
          <div className="space-y-2">
            {rootTopics.map((topic) => renderTopicItem(topic, 0))}
          </div>
        )}
      </div>

      {/* Related Subjects & Siblings */}
      {(relatedSubjects.length > 0 || siblingSubjects.length > 0) && (
        <div className="border-t border-[var(--color-border)] pt-8 space-y-6">
          {relatedSubjects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Interdisciplinary & Related Subjects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedSubjects.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/subject/${rel.id}`}
                    className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all group"
                  >
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {rel.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {rel.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {siblingSubjects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                More in {domain.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {siblingSubjects.map((sibling) => (
                  <Link
                    key={sibling.id}
                    to={`/subject/${sibling.id}`}
                    className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all group"
                  >
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {sibling.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {sibling.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
