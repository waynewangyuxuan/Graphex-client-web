import { http, HttpResponse } from 'msw';
import { folders, entities, fullEntity } from './data';

export const handlers = [
  http.get('/api/folders', () => {
    return HttpResponse.json(folders);
  }),

  http.get('/api/entities', () => {
    return HttpResponse.json(entities);
  }),

  http.get('/api/entities/:id', ({ params }) => {
    const { id } = params;
    if (id === fullEntity.id) {
      return HttpResponse.json(fullEntity);
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
