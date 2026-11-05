import { useState, useRef } from 'react';
import {
  BarChart3,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Clock,
  Layers,
  Database,
} from 'lucide-react';
import { CATALOGUE } from '../data';
import { useProgressStore } from '../store/progressStore';
import ProgressBar from '../components/ProgressBar';
import { getDomainColors, cn } from '../lib/utils';
import type { ExportData } from '../lib/db';

export default function ProgressSettings() {
  const {
    progressMap,
    exportAll,
    importAll,
    resetProgress,
    getOverallStats,
    getDomainStats,
  } = useProgressStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const overallStats = getOverallStats();

  // Compute total estimated hours completed
  const totalCompletedHours = Object.values(progressMap).reduce((acc, p) => {
    if (p.status === 'completed' || p.status === 'mastered') {
      const topic = CATALOGUE.topics.find((t) => t.id === p.topicId);
      return acc + (p.estimatedHoursOverride ?? topic?.estimatedHours ?? 0);
    }
    return acc;
  }, 0);

  const handleExport = async () => {
    const data = await exportAll();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cs-roadmap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed: ExportData = JSON.parse(text);
        if (!parsed.progress || !Array.isArray(parsed.progress)) {
          throw new Error('Invalid backup file structure: missing progress array.');
        }
        await importAll(parsed);
        setImportStatus('Progress imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err: any) {
        setImportStatus(`Import failed: ${err.message}`);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = async () => {
    await resetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-indigo-600" />
          Progress & Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Review your overall learning milestones, manage IndexedDB persistence, and export/import study records.
        </p>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Overall Completion</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {overallStats.percentage}%
          </div>
          <div className="text-[11px] text-slate-500">
            {overallStats.completed + overallStats.mastered} of {overallStats.total} topics
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">In Progress</div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono">
            {overallStats.learning}
          </div>
          <div className="text-[11px] text-slate-500">Topics currently learning</div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Mastered</div>
          <div className="text-2xl font-extrabold text-violet-600 font-mono">
            {overallStats.mastered}
          </div>
          <div className="text-[11px] text-slate-500">Highest proficiency level</div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Est. Hours Studied</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono flex items-center gap-1.5">
            <Clock size={20} />
            {totalCompletedHours}h
          </div>
          <div className="text-[11px] text-slate-500">Based on topic estimates</div>
        </div>
      </div>

      {/* Domain Breakdown Table / Progress Cards */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          Progress by Computer Science Domain
        </h2>

        <div className="space-y-4">
          {CATALOGUE.domains.map((domain) => {
            const domainStats = getDomainStats(domain.id);
            const colors = getDomainColors(domain.color);

            return (
              <div
                key={domain.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={cn('font-semibold text-sm', colors.text)}>
                    {domain.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      {domainStats.completed + domainStats.mastered} / {domainStats.total} topics
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {domainStats.percentage}%
                    </span>
                  </div>
                </div>
                <ProgressBar stats={domainStats} size="md" showCounts />
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management & Persistence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export / Import */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database size={18} className="text-indigo-600" />
            Backup & Sync Data
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your progress, notes, and added resources are stored in your browser's persistent IndexedDB storage.
            Export a JSON backup to transfer your progress between computers or safeguard your learning journey.
          </p>

          {importStatus && (
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
              {importStatus}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download size={14} />
              Export Backup (JSON)
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
              <Upload size={14} />
              Import Backup
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset / Danger Zone */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Reset Learning Data
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reset all your topic progress, study notes, and personal learning resources back to fresh defaults.
            This action cannot be undone unless you have an exported backup.
          </p>

          {showResetConfirm ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
              <p className="text-xs text-red-900 font-semibold">
                Are you sure you want to delete all local progress?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                <RotateCcw size={14} />
                Reset All Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
