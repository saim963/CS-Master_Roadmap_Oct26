import { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TreePine,
  Network,
  BarChart3,
  Menu,
  X,
  BookOpen,
  Search,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProgressStore } from '../store/progressStore';
import SearchModal from './SearchModal';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/roadmap', label: 'Roadmap', icon: TreePine },
  { to: '/graph', label: 'Knowledge Graph', icon: Network },
  { to: '/progress', label: 'Progress & Settings', icon: BarChart3 },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { getOverallStats, progressMap } = useProgressStore();
  const overallStats = useMemo(() => getOverallStats(), [getOverallStats, progressMap]);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)]',
          'transform transition-transform duration-200 ease-in-out',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 truncate">CS Master Roadmap</div>
            <div className="text-xs text-[var(--color-text-muted)]">{overallStats.percentage}% complete</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-[var(--color-text-muted)] hover:text-slate-900 p-1 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2 border-b border-[var(--color-border)]">
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${overallStats.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
            <span>{overallStats.completed + overallStats.mastered} done</span>
            <span>{overallStats.total} total</span>
          </div>
        </div>

        {/* Search button */}
        <div className="px-3 py-3 border-b border-[var(--color-border)]">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-slate-900 hover:border-indigo-400 transition-colors text-sm shadow-2xs"
          >
            <Search size={14} />
            <span>Search topics…</span>
            <kbd className="ml-auto text-xs bg-[var(--color-surface)] text-slate-500 px-1.5 py-0.5 rounded border border-[var(--color-border)]">⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Quick stats */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-600">{overallStats.learning}</div>
              <div className="text-xs text-[var(--color-text-muted)]">In Progress</div>
            </div>
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-violet-600">{overallStats.mastered}</div>
              <div className="text-xs text-[var(--color-text-muted)]">Mastered</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-[var(--color-border)] flex items-center px-4 gap-3 shrink-0 bg-[var(--color-surface)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[var(--color-text-muted)] hover:text-slate-900 p-1"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
            <span>CS Master Roadmap</span>
            <ChevronRight size={14} />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-slate-900 hover:border-indigo-400 transition-colors text-sm shadow-2xs"
            >
              <Search size={14} />
              <span className="hidden sm:block">Search</span>
              <kbd className="hidden sm:block text-xs bg-[var(--color-surface)] text-slate-500 px-1.5 py-0.5 rounded border border-[var(--color-border)]">⌘K</kbd>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onNavigate={(path) => {
            navigate(path);
            setSearchOpen(false);
          }}
        />
      )}
    </div>
  );
}
