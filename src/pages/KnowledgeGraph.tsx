import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link } from 'react-router-dom';
import {
  Network,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { CATALOGUE } from '../data';
import { useProgressStore } from '../store/progressStore';
import { getDomainColors, cn } from '../lib/utils';
import type { Subject, RelationshipType } from '../types';

const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  foundation_of: '#059669',    // Emerald
  prerequisite_of: '#dc2626',  // Red
  uses: '#2563eb',             // Blue
  application_of: '#7c3aed',   // Violet
  related_to: '#64748b',       // Slate
  implements: '#d97706',       // Amber
  contains: '#0891b2',         // Cyan
};

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  foundation_of: 'Foundation Of',
  prerequisite_of: 'Prerequisite Of',
  uses: 'Uses / Relies On',
  application_of: 'Application Of',
  related_to: 'Related To',
  implements: 'Implements Concept',
  contains: 'Contains',
};

export default function KnowledgeGraph() {
  const { getSubjectStats } = useProgressStore();

  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedRelTypes, setSelectedRelTypes] = useState<Record<RelationshipType, boolean>>({
    foundation_of: true,
    prerequisite_of: true,
    uses: true,
    application_of: true,
    related_to: true,
    implements: true,
    contains: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>('algorithms-ds');

  // Compute active subjects based on domain selection
  const filteredSubjects = useMemo(() => {
    let list = CATALOGUE.subjects;
    if (selectedDomain !== 'all') {
      list = list.filter((s) => s.domainId === selectedDomain);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedDomain, searchQuery]);

  const activeSubjectIds = useMemo(() => {
    return new Set(filteredSubjects.map((s) => s.id));
  }, [filteredSubjects]);

  // Spacious, clean layout positions for nodes
  const initialNodes: Node[] = useMemo(() => {
    const isSingleDomain = selectedDomain !== 'all';

    const domainIndices: Record<string, number> = {};
    CATALOGUE.domains.forEach((d, idx) => {
      domainIndices[d.id] = idx;
    });

    const domainSubjectCount: Record<string, number> = {};

    return filteredSubjects.map((subject, idx) => {
      let x = 0;
      let y = 0;

      if (isSingleDomain) {
        // Spacious 3-column layout when focusing on a single domain
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        x = col * 360;
        y = row * 190;
      } else {
        // Clean 3-column domain cluster layout with generous gaps
        const dIdx = domainIndices[subject.domainId] ?? 0;
        const count = domainSubjectCount[subject.domainId] || 0;
        domainSubjectCount[subject.domainId] = count + 1;

        const domainCol = dIdx % 3;
        const domainRow = Math.floor(dIdx / 3);

        const subCol = count % 2;
        const subRow = Math.floor(count / 2);

        // Generous spacing: 920px between domain clusters horizontally, 820px vertically
        // 320px between subject columns (leaving 70px gap for 250px cards), 160px vertical pitch
        x = domainCol * 920 + subCol * 320;
        y = domainRow * 820 + subRow * 160;
      }

      const domain = CATALOGUE.domains.find((d) => d.id === subject.domainId);
      const colors = getDomainColors(domain?.color ?? 'indigo');
      const stats = getSubjectStats(subject.id);
      const isSelected = selectedSubjectId === subject.id;

      return {
        id: subject.id,
        position: { x, y },
        data: {
          label: (
            <div className="flex flex-col text-left space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md truncate max-w-[160px]"
                  style={{
                    backgroundColor: `${colors.hex ?? '#4f46e5'}18`,
                    color: colors.hex ?? '#4f46e5',
                  }}
                >
                  {domain?.title ?? 'Subject'}
                </span>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {stats.percentage}%
                </span>
              </div>
              <span className="font-semibold text-xs leading-snug line-clamp-2 text-slate-900">
                {subject.title}
              </span>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-500">
                <span>{subject.topicIds.length} topics</span>
                <span className="text-indigo-600 font-medium">Details →</span>
              </div>
            </div>
          ),
          subject,
        },
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: isSelected
            ? `2px solid ${colors.hex ?? '#4f46e5'}`
            : `1.5px solid ${colors.hex ?? '#6366f1'}88`,
          borderRadius: '12px',
          padding: '10px 14px',
          width: 250,
          boxShadow: isSelected
            ? '0 6px 20px rgba(79, 70, 229, 0.22)'
            : '0 4px 14px rgba(15, 23, 42, 0.07)',
          cursor: 'pointer',
          transition: 'all 0.15s ease-in-out',
        },
      };
    });
  }, [filteredSubjects, selectedDomain, selectedSubjectId, getSubjectStats]);

  // Filter edges based on visible nodes and active relationship types
  const initialEdges: Edge[] = useMemo(() => {
    return CATALOGUE.relationships
      .filter((rel) => {
        if (!selectedRelTypes[rel.type]) return false;
        return activeSubjectIds.has(rel.sourceId) && activeSubjectIds.has(rel.targetId);
      })
      .map((rel) => {
        const color = RELATIONSHIP_COLORS[rel.type] ?? '#4f46e5';
        return {
          id: rel.id,
          source: rel.sourceId,
          target: rel.targetId,
          type: 'smoothstep',
          animated: rel.type === 'prerequisite_of',
          label: RELATIONSHIP_LABELS[rel.type],
          labelStyle: { fill: '#475569', fontSize: 10, fontWeight: 600 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 6,
          style: { stroke: color, strokeWidth: 1.8 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
            width: 14,
            height: 14,
          },
        };
      });
  }, [activeSubjectIds, selectedRelTypes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when filtered nodes/edges change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedSubjectId(node.id);
  }, []);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return CATALOGUE.subjects.find((s) => s.id === selectedSubjectId) ?? null;
  }, [selectedSubjectId]);

  const selectedSubjectDomain = useMemo(() => {
    if (!selectedSubject) return null;
    return CATALOGUE.domains.find((d) => d.id === selectedSubject.domainId) ?? null;
  }, [selectedSubject]);

  const selectedPrerequisites = useMemo(() => {
    if (!selectedSubject) return [];
    return selectedSubject.prerequisiteSubjectIds
      .map((id) => CATALOGUE.subjects.find((s) => s.id === id))
      .filter((s): s is Subject => !!s);
  }, [selectedSubject]);

  const selectedRelated = useMemo(() => {
    if (!selectedSubject) return [];
    return selectedSubject.relatedSubjectIds
      .map((id) => CATALOGUE.subjects.find((s) => s.id === id))
      .filter((s): s is Subject => !!s);
  }, [selectedSubject]);

  const toggleRelType = (type: RelationshipType) => {
    setSelectedRelTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[var(--color-bg)]">
      {/* Top Controls Toolbar */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Network className="text-indigo-600" size={18} />
            <span className="font-semibold text-slate-900 text-sm">Knowledge Graph</span>
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-[var(--color-surface)] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="all">All Domains (12)</option>
              {CATALOGUE.domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Find subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--color-surface)] border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-40 sm:w-48 shadow-2xs"
            />
          </div>
        </div>

        {/* Legend / Relationship Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {(Object.keys(RELATIONSHIP_COLORS) as RelationshipType[]).map((type) => {
            const isActive = selectedRelTypes[type];
            const color = RELATIONSHIP_COLORS[type];
            return (
              <button
                key={type}
                onClick={() => toggleRelType(type)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors',
                  isActive
                    ? 'bg-white border-slate-300 text-slate-700 shadow-2xs'
                    : 'bg-transparent border-slate-200 text-slate-400 line-through opacity-70'
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {RELATIONSHIP_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Flow Canvas and Node Details Panel */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* React Flow Graph */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.12}
            maxZoom={2}
          >
            <Background color="#cbd5e1" gap={24} size={1.2} />
            <Controls className="fill-slate-700" />
            <MiniMap
              nodeColor={() => '#4f46e5'}
              maskColor="rgba(241, 245, 249, 0.7)"
              className="!bottom-4 !right-4 !w-36 !h-28"
            />
          </ReactFlow>
        </div>

        {/* Subject Inspector Drawer */}
        {selectedSubject && (
          <div className="w-80 sm:w-96 bg-[var(--color-surface)] border-l border-[var(--color-border)] p-5 flex flex-col gap-4 overflow-y-auto shrink-0 shadow-xl z-10">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                  {selectedSubjectDomain?.title}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedSubject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubjectId(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedSubject.description}
            </p>

            {/* Subject Tags */}
            <div className="flex flex-wrap gap-1">
              {selectedSubject.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Prerequisites */}
            <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Required Prerequisites
              </h4>
              {selectedPrerequisites.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No formal prerequisites required.</p>
              ) : (
                <div className="space-y-1">
                  {selectedPrerequisites.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedSubjectId(req.id)}
                      className="w-full text-left flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 border border-slate-200 transition-colors"
                    >
                      <span className="truncate">{req.title}</span>
                      <ArrowRight size={13} className="text-slate-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Related Disciplines */}
            <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Related Subjects
              </h4>
              {selectedRelated.length === 0 ? (
                <p className="text-xs text-slate-400 italic">None listed.</p>
              ) : (
                <div className="space-y-1">
                  {selectedRelated.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => setSelectedSubjectId(rel.id)}
                      className="w-full text-left flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 border border-slate-200 transition-colors"
                    >
                      <span className="truncate">{rel.title}</span>
                      <ArrowRight size={13} className="text-slate-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: View Subject Explorer */}
            <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex gap-2">
              <Link
                to={`/subject/${selectedSubject.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                <BookOpen size={14} />
                Open Subject View
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
