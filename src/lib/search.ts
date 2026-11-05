import Fuse from 'fuse.js';
import type { SearchResult } from '../types';
import { CATALOGUE } from '../data';

// Build flat searchable items once
interface SearchItem {
  id: string;
  type: 'domain' | 'subject' | 'topic';
  title: string;
  description: string;
  parentTitle: string;
  domainId: string;
  tags: string;
}

function buildSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const domain of CATALOGUE.domains) {
    items.push({
      id: domain.id,
      type: 'domain',
      title: domain.title,
      description: domain.description,
      parentTitle: '',
      domainId: domain.id,
      tags: '',
    });
  }

  for (const subject of CATALOGUE.subjects) {
    const domain = CATALOGUE.domains.find((d) => d.id === subject.domainId);
    items.push({
      id: subject.id,
      type: 'subject',
      title: subject.title,
      description: subject.description,
      parentTitle: domain?.title ?? '',
      domainId: subject.domainId,
      tags: subject.tags.join(' '),
    });
  }

  for (const topic of CATALOGUE.topics) {
    const subject = CATALOGUE.subjects.find((s) => s.id === topic.subjectId);
    items.push({
      id: topic.id,
      type: 'topic',
      title: topic.title,
      description: topic.description,
      parentTitle: subject?.title ?? '',
      domainId: topic.domainId,
      tags: topic.tags.join(' '),
    });
  }

  return items;
}

let fuse: Fuse<SearchItem> | null = null;
let searchItems: SearchItem[] = [];

function getFuse(): Fuse<SearchItem> {
  if (!fuse) {
    searchItems = buildSearchItems();
    fuse = new Fuse(searchItems, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'tags', weight: 0.25 },
        { name: 'description', weight: 0.15 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }
  return fuse;
}

export function search(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];
  const fuseInstance = getFuse();
  const results = fuseInstance.search(query, { limit });
  return results.map((r) => ({
    id: r.item.id,
    type: r.item.type,
    title: r.item.title,
    parentTitle: r.item.parentTitle,
    domainId: r.item.domainId,
    score: r.score ?? 0,
  }));
}

export function getById(id: string): SearchItem | undefined {
  return searchItems.find((i) => i.id === id);
}
