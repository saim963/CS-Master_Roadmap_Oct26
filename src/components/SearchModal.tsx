import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, BookOpen, FlaskConical, Layers } from 'lucide-react';
import { search } from '../lib/search';
import type { SearchResult } from '../types';
import { cn } from '../lib/utils';
import { CATALOGUE } from '../data';

interface Props {
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const TYPE_ICONS = {
  domain: Layers,
  subject: FlaskConical,
  topic: BookOpen,
};

const TYPE_LABELS = {
  domain: 'Domain',
  subject: 'Subject',
  topic: 'Topic',
};

function getPath(result: SearchResult): string {
  if (result.type === 'domain') return `/roadmap`;
  if (result.type === 'subject') return `/subject/${result.id}`;
  return `/topic/${result.id}`;
}

function getDomainColor(domainId: string): string {
  const domain = CATALOGUE.domains.find((d) => d.id === domainId);
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    teal: 'text-teal-600',
    orange: 'text-orange-600',
    violet: 'text-violet-600',
    cyan: 'text-cyan-600',
    sky: 'text-sky-600',
    red: 'text-red-600',
    yellow: 'text-amber-600',
    pink: 'text-pink-600',
    amber: 'text-amber-600',
  };
  return colorMap[domain?.color ?? 'indigo'] ?? 'text-indigo-600';
}

export default function SearchModal({ onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const r = search(query, 15);
    setResults(r);
    setActiveIdx(0);
  }, [query]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[activeIdx]) {
        onNavigate(getPath(results[activeIdx]));
      }
    },
    [results, activeIdx, onClose, onNavigate]
  );

  // Close on ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-200">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search domains, subjects, topics…"
            className="flex-1 py-4 bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm font-medium"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {results.length === 0 && query.length > 0 && (
            <div className="p-8 text-center text-slate-500">
              <Search size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p>No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
          {results.length === 0 && query.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">
              Start typing to search across {CATALOGUE.topics.length} topics
            </div>
          )}
          {results.map((r, idx) => {
            const Icon = TYPE_ICONS[r.type];
            const domainColorClass = getDomainColor(r.domainId);
            return (
              <button
                key={r.id}
                onClick={() => onNavigate(getPath(r))}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  idx === activeIdx
                    ? 'bg-indigo-50 border-l-3 border-indigo-600'
                    : 'hover:bg-slate-50 border-l-3 border-transparent'
                )}
              >
                <Icon size={16} className={cn(domainColorClass, 'shrink-0')} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">{r.title}</div>
                  {r.parentTitle && (
                    <div className="text-xs text-slate-500 truncate">
                      {r.parentTitle}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-600 shrink-0 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                  {TYPE_LABELS[r.type]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex gap-4 text-xs text-slate-500">
          <span><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs text-slate-700">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs text-slate-700">Enter</kbd> Open</span>
          <span><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs text-slate-700">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
