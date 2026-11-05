// ============================================================
// CS Master Roadmap — Complete Catalogue Export
// ============================================================

import type { Catalogue } from '../types';
import { DOMAINS, SUBJECTS, DOMAIN_MAP, SUBJECT_MAP } from './domains';
import { TOPICS, TOPIC_MAP } from './topics';
import { TOPICS2, TOPIC_MAP2 } from './topics2';
import { RELATIONSHIPS, RELATIONSHIP_MAP } from './relationships';

export const ALL_TOPICS = [...TOPICS, ...TOPICS2];
export const ALL_TOPIC_MAP = { ...TOPIC_MAP, ...TOPIC_MAP2 };

export const CATALOGUE: Catalogue = {
  schemaVersion: 1,
  domains: DOMAINS,
  subjects: SUBJECTS,
  topics: ALL_TOPICS,
  relationships: RELATIONSHIPS,
};

export {
  DOMAINS,
  DOMAIN_MAP,
  SUBJECTS,
  SUBJECT_MAP,
  TOPICS,
  TOPIC_MAP,
  TOPICS2,
  TOPIC_MAP2,
  RELATIONSHIPS,
  RELATIONSHIP_MAP,
};
