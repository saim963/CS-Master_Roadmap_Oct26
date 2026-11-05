// ============================================================
// Core Data Types for CS Master Roadmap
// ============================================================

export type TopicStatus = 'not_started' | 'learning' | 'completed' | 'mastered';

export type RelationshipType =
  | 'contains'
  | 'prerequisite_of'
  | 'uses'
  | 'foundation_of'
  | 'implements'
  | 'related_to'
  | 'application_of';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ---------------------------------------------------------------
// Static Catalogue Types (immutable academic data)
// ---------------------------------------------------------------

export interface Domain {
  id: string;
  title: string;
  description: string;
  color: string;       // Tailwind color token, e.g. "indigo"
  icon: string;        // lucide-react icon name
  subjectIds: string[];
}

export interface Subject {
  id: string;
  domainId: string;
  title: string;
  description: string;
  topicIds: string[];
  prerequisiteSubjectIds: string[];
  relatedSubjectIds: string[];
  tags: string[];
}

export interface Topic {
  id: string;
  subjectId: string;
  domainId: string;
  title: string;
  description: string;
  parentId: string | null;   // null = direct child of subject
  childIds: string[];
  difficulty: DifficultyLevel;
  estimatedHours: number;
  tags: string[];
  mathFoundationIds: string[]; // topic IDs from Math/Stats domains
  isMilestone: boolean;        // key topic — highlighted
}

export interface Relationship {
  id: string;
  sourceId: string;       // topic/subject ID
  targetId: string;
  type: RelationshipType;
  description?: string;
}

// ---------------------------------------------------------------
// Progress & User Data Types (mutable, stored in IndexedDB)
// ---------------------------------------------------------------

export interface TopicProgress {
  topicId: string;
  status: TopicStatus;
  notes: string;
  resources: Resource[];
  estimatedHoursOverride?: number;
  lastUpdated: string;  // ISO timestamp
  startedAt?: string;
  completedAt?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book' | 'course' | 'paper' | 'other';
  description?: string;
  addedAt: string;
}

export interface UserSettings {
  schemaVersion: number;
  theme: 'dark' | 'light';
  graphLayout: 'dagre' | 'force' | 'radial';
  showCompletedInGraph: boolean;
  showMasteredInGraph: boolean;
  defaultExpansionDepth: number;
  lastVisitedTopicId?: string;
}

// ---------------------------------------------------------------
// Computed / Derived Types
// ---------------------------------------------------------------

export interface ProgressStats {
  total: number;
  notStarted: number;
  learning: number;
  completed: number;
  mastered: number;
  percentage: number;  // (completed + mastered) / total * 100
}

export interface DomainProgress {
  domainId: string;
  stats: ProgressStats;
}

export interface SubjectProgress {
  subjectId: string;
  stats: ProgressStats;
}

// ---------------------------------------------------------------
// Search
// ---------------------------------------------------------------

export interface SearchResult {
  id: string;
  type: 'domain' | 'subject' | 'topic';
  title: string;
  parentTitle?: string;
  domainId: string;
  score: number;
}

// ---------------------------------------------------------------
// Catalogue (runtime registry)
// ---------------------------------------------------------------

export interface Catalogue {
  schemaVersion: number;
  domains: Domain[];
  subjects: Subject[];
  topics: Topic[];
  relationships: Relationship[];
}
