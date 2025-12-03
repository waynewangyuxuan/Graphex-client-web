import { http, HttpResponse } from 'msw';
import type { Folder, EntitySummary, KnowledgeEntity } from '@/types';
import { folders, entities, fullEntity } from './data';

// Type for entity ID route params
interface EntityParams {
  id: string;
}

export const handlers = [
  http.get<never, never, Folder[]>('/api/folders', () => {
    return HttpResponse.json(folders);
  }),

  http.get<never, never, EntitySummary[]>('/api/entities', () => {
    return HttpResponse.json(entities);
  }),

  http.get<EntityParams, never, KnowledgeEntity | null>(
    '/api/entities/:id',
    ({ params }) => {
      const { id } = params;
      if (id === fullEntity.id) {
        return HttpResponse.json(fullEntity);
      }
      return new HttpResponse(null, { status: 404 });
    }
  ),
];
