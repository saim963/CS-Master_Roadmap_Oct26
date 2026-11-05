import { Link } from 'react-router-dom';
import { Compass, Home, TreePine } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
        <Compass size={32} />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold text-slate-900 font-mono">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          The subject, topic, or path you are looking for does not exist in the computer science roadmap knowledge graph.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Home size={14} /> Go to Dashboard
        </Link>
        <Link
          to="/roadmap"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs transition-colors"
        >
          <TreePine size={14} /> Explore Roadmap
        </Link>
      </div>
    </div>
  );
}
