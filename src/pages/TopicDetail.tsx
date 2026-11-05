import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  Star,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Link as LinkIcon,
  Video,
  FileCode,
  GraduationCap,
  Calculator,
} from 'lucide-react';
import { CATALOGUE } from '../data';
import { useProgressStore } from '../store/progressStore';
import StatusBadge from '../components/StatusBadge';
import { getDomainColors, getDifficultyColor, cn } from '../lib/utils';
import type { Topic, Resource, TopicStatus } from '../types';

const RESOURCE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  video: Video,
  article: FileText,
  book: BookOpen,
  course: GraduationCap,
  paper: FileCode,
  other: LinkIcon,
};

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const {
    progressMap,
    setTopicStatus,
    updateNotes,
    addResource,
    removeResource,
  } = useProgressStore();

  const topic = useMemo(() => {
    return CATALOGUE.topics.find((t) => t.id === topicId);
  }, [topicId]);

  const subject = useMemo(() => {
    if (!topic) return null;
    return CATALOGUE.subjects.find((s) => s.id === topic.subjectId) ?? null;
  }, [topic]);

  const domain = useMemo(() => {
    if (!topic) return null;
    return CATALOGUE.domains.find((d) => d.id === topic.domainId) ?? null;
  }, [topic]);

  const parentTopic = useMemo(() => {
    if (!topic?.parentId) return null;
    return CATALOGUE.topics.find((t) => t.id === topic.parentId) ?? null;
  }, [topic]);

  const subtopics = useMemo(() => {
    if (!topic) return [];
    return topic.childIds
      .map((id) => CATALOGUE.topics.find((t) => t.id === id))
      .filter((t): t is Topic => !!t);
  }, [topic]);

  const mathFoundations = useMemo(() => {
    if (!topic?.mathFoundationIds) return [];
    return topic.mathFoundationIds
      .map((id) => {
        const top = CATALOGUE.topics.find((t) => t.id === id);
        const sub = CATALOGUE.subjects.find((s) => s.id === id);
        return { id, top, sub };
      })
      .filter((m) => m.top || m.sub);
  }, [topic]);

  // Local state for notes & new resource form
  const topicProgress = useMemo(() => {
    if (!topicId) return undefined;
    return progressMap[topicId];
  }, [topicId, progressMap]);

  const currentStatus = topicProgress?.status ?? 'not_started';
  const [notes, setNotes] = useState(topicProgress?.notes ?? '');
  const [notesSaved, setNotesSaved] = useState(false);

  // Sync notes when topic changes
  useEffect(() => {
    setNotes(topicProgress?.notes ?? '');
    setNotesSaved(false);
  }, [topicId, topicProgress?.notes]);

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<Resource['type']>('article');
  const [resourceDesc, setResourceDesc] = useState('');
  const [showAddResource, setShowAddResource] = useState(false);

  if (!topic || !subject || !domain) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Topic Not Found</h2>
        <p className="text-slate-600 text-sm">
          The topic with identifier "{topicId}" does not exist in the catalogue.
        </p>
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back to Roadmap
        </Link>
      </div>
    );
  }

  const domainColors = getDomainColors(domain.color);
  const diffColors = getDifficultyColor(topic.difficulty);

  const handleSaveNotes = async () => {
    await updateNotes(topic.id, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;

    const newRes: Resource = {
      id: `res-${Date.now()}`,
      title: resourceTitle.trim(),
      url: resourceUrl.trim(),
      type: resourceType,
      description: resourceDesc.trim() || undefined,
      addedAt: new Date().toISOString(),
    };

    await addResource(topic.id, newRes);
    setResourceTitle('');
    setResourceUrl('');
    setResourceDesc('');
    setShowAddResource(false);
  };

  const handleRemoveResource = async (resId: string) => {
    await removeResource(topic.id, resId);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] flex-wrap">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <Link to="/roadmap" className="hover:text-slate-900 transition-colors">
          Roadmap
        </Link>
        <ChevronRight size={12} />
        <Link
          to={`/subject/${subject.id}`}
          className={cn('font-medium hover:underline', domainColors.text)}
        >
          {subject.title}
        </Link>
        {parentTopic && (
          <>
            <ChevronRight size={12} />
            <Link
              to={`/topic/${parentTopic.id}`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              {parentTopic.title}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-slate-900 font-semibold">{topic.title}</span>
      </nav>

      {/* Main Topic Header */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs', domainColors.bg, domainColors.text, domainColors.border)}>
                {domain.title}
              </span>
              <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize shadow-2xs', diffColors)}>
                {topic.difficulty} Level
              </span>
              {topic.isMilestone && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  Key Milestone
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {topic.title}
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              {topic.description}
            </p>
          </div>

          {/* Status & Estimated Hours Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shrink-0 sm:w-60 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Status</span>
              <span className="capitalize font-mono text-slate-900 font-semibold">
                {currentStatus.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Status Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {(['not_started', 'learning', 'completed', 'mastered'] as TopicStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setTopicStatus(topic.id, st)}
                  className={cn(
                    'py-1 px-2 rounded-lg text-xs font-medium border text-center transition-all capitalize',
                    currentStatus === st
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-semibold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs'
                  )}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {topic.estimatedHours > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Estimated Study
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {topic.estimatedHours} hours
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-border)]">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtopics Section (if any) */}
      {subtopics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            Core Concepts & Subtopics ({subtopics.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subtopics.map((sub) => {
              const subStatus = progressMap[sub.id]?.status ?? 'not_started';
              return (
                <Link
                  key={sub.id}
                  to={`/topic/${sub.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {sub.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {sub.description}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={subStatus} size="sm" />
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mathematical Foundations Section (if any) */}
      {mathFoundations.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
            <Calculator size={16} />
            Mathematical & Statistical Foundations
          </h2>
          <p className="text-xs text-slate-600">
            This concept directly applies mathematics from these foundational disciplines:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {mathFoundations.map((m) => {
              const title = m.top?.title ?? m.sub?.title ?? m.id;
              const link = m.top ? `/topic/${m.top.id}` : `/subject/${m.sub?.id}`;
              return (
                <Link
                  key={m.id}
                  to={link}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-900 transition-colors group shadow-2xs"
                >
                  <span className="font-semibold group-hover:text-emerald-700 transition-colors">
                    {title}
                  </span>
                  <ExternalLink size={12} className="text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal Learning Notes (Persistent in IndexedDB) */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              My Study Notes & Insights
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal reflections, code snippets, and cheat sheets for this topic. Persisted locally.
            </p>
          </div>
          <button
            onClick={handleSaveNotes}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm',
              notesSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            )}
          >
            {notesSaved ? <CheckCircle size={13} /> : <Save size={13} />}
            {notesSaved ? 'Saved!' : 'Save Notes'}
          </button>
        </div>

        <textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your study notes, key takeaways, mathematical formulas, or revision reminders here..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono leading-relaxed resize-y shadow-2xs"
        />
      </div>

      {/* Useful Learning Resources */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LinkIcon size={18} className="text-indigo-600" />
              Curated & Personal Resources
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add reference papers, video lectures, books, or documentation links.
            </p>
          </div>
          <button
            onClick={() => setShowAddResource(!showAddResource)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors shadow-2xs"
          >
            <Plus size={13} />
            {showAddResource ? 'Cancel' : 'Add Resource'}
          </button>
        </div>

        {/* Add Resource Form Modal/Accordion */}
        {showAddResource && (
          <form
            onSubmit={handleAddResource}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Resource title (e.g. MIT 6.006 Lecture 1)"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                required
                className="sm:col-span-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 capitalize shadow-2xs"
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="book">Book</option>
                <option value="course">Course</option>
                <option value="paper">Academic Paper</option>
                <option value="other">Other</option>
              </select>
            </div>

            <input
              type="url"
              placeholder="https://..."
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />

            <input
              type="text"
              placeholder="Brief note or description (optional)"
              value={resourceDesc}
              onChange={(e) => setResourceDesc(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />

            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Add to Topic
            </button>
          </form>
        )}

        {/* Resource List */}
        {(!topicProgress?.resources || topicProgress.resources.length === 0) ? (
          <p className="text-xs text-slate-500 italic py-2">
            No resources added yet. Add your favorite tutorials, papers, or video links above.
          </p>
        ) : (
          <div className="space-y-2">
            {topicProgress.resources.map((res) => {
              const IconComp = RESOURCE_ICONS[res.type] ?? LinkIcon;
              return (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                      <IconComp size={15} />
                    </div>
                    <div className="min-w-0">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5 truncate"
                      >
                        <span>{res.title}</span>
                        <ExternalLink size={12} className="text-slate-400 shrink-0" />
                      </a>
                      {res.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {res.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveResource(res.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors ml-3 shrink-0"
                    title="Remove resource"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-[var(--color-border)] pt-6 flex items-center justify-between">
        <Link
          to={`/subject/${subject.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to {subject.title}
        </Link>
      </div>
    </div>
  );
}
