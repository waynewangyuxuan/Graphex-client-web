# Graphex Frontend: Mock Data

## Purpose

Mock data for development. MSW intercepts API calls and returns this data.

## Folders

```json
[
  { "id": "folder-1", "name": "Research", "parentId": null },
  { "id": "folder-2", "name": "ML Papers", "parentId": "folder-1" },
  { "id": "folder-3", "name": "Work", "parentId": null }
]
```

## Entities (List View)

```json
[
  {
    "id": "entity-1",
    "title": "ML Fundamentals",
    "folderId": "folder-2",
    "tags": ["ml", "basics"],
    "createdAt": "2024-01-10T10:00:00Z",
    "modifiedAt": "2024-01-15T14:30:00Z",
    "stats": { "nodeCount": 6, "edgeCount": 7, "pageCount": 12 }
  },
  {
    "id": "entity-2",
    "title": "Neural Networks",
    "folderId": "folder-2",
    "tags": ["nn"],
    "createdAt": "2024-01-08T09:00:00Z",
    "modifiedAt": "2024-01-12T11:00:00Z",
    "stats": { "nodeCount": 8, "edgeCount": 10, "pageCount": 8 }
  }
]
```

## Full Entity (Detail View)

```json
{
  "id": "entity-1",
  "title": "ML Fundamentals",
  "folderId": "folder-2",
  "tags": ["ml", "basics"],
  "createdAt": "2024-01-10T10:00:00Z",
  "modifiedAt": "2024-01-15T14:30:00Z",
  "stats": { "nodeCount": 6, "edgeCount": 7, "pageCount": 12 },
  "graph": {
    "nodes": [
      {
        "id": "n1",
        "label": "Machine Learning",
        "type": "key",
        "source": {
          "sectionId": "s1",
          "pageNumber": 1,
          "boundingBox": { "x": 0.1, "y": 0.15, "width": 0.8, "height": 0.1 },
          "text": "Machine Learning is a subset of AI..."
        }
      },
      {
        "id": "n2",
        "label": "Neural Networks",
        "type": "concept",
        "source": {
          "sectionId": "s2",
          "pageNumber": 1,
          "boundingBox": { "x": 0.1, "y": 0.28, "width": 0.8, "height": 0.12 },
          "text": "Neural Networks are computing systems..."
        }
      },
      {
        "id": "n3",
        "label": "Deep Learning",
        "type": "concept",
        "source": {
          "sectionId": "s3",
          "pageNumber": 1,
          "boundingBox": { "x": 0.1, "y": 0.42, "width": 0.8, "height": 0.1 },
          "text": "Deep Learning uses multiple layers..."
        }
      },
      {
        "id": "n4",
        "label": "Backpropagation",
        "type": "concept",
        "source": {
          "sectionId": "s4",
          "pageNumber": 2,
          "boundingBox": { "x": 0.1, "y": 0.1, "width": 0.8, "height": 0.12 },
          "text": "Backpropagation calculates gradients..."
        }
      }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2", "relation": "INCLUDES" },
      { "id": "e2", "source": "n1", "target": "n3", "relation": "ENABLES" },
      { "id": "e3", "source": "n2", "target": "n4", "relation": "USES" },
      { "id": "e4", "source": "n3", "target": "n4", "relation": "REQUIRES" }
    ]
  },
  "source": {
    "pdfUrl": "/samples/ml-fundamentals.pdf",
    "content": {
      "sections": [
        { "id": "s0", "type": "heading", "level": 1, "content": "Chapter 1: Introduction to ML", "pageNumber": 1, "nodeId": null },
        { "id": "s1", "type": "paragraph", "content": "Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.", "pageNumber": 1, "nodeId": "n1" },
        { "id": "s2", "type": "paragraph", "content": "Neural Networks are computing systems inspired by biological neural networks. These systems learn to perform tasks by considering examples.", "pageNumber": 1, "nodeId": "n2" },
        { "id": "s3", "type": "paragraph", "content": "Deep Learning uses multiple layers between input and output to learn increasingly abstract representations of data.", "pageNumber": 1, "nodeId": "n3" },
        { "id": "s4", "type": "paragraph", "content": "Backpropagation calculates the gradient of the loss function with respect to each weight by propagating errors backward through the network.", "pageNumber": 2, "nodeId": "n4" }
      ]
    }
  }
}
```

## MSW Handlers

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/folders', () => {
    return HttpResponse.json(foldersData);
  }),
  http.get('/api/entities', () => {
    return HttpResponse.json(entitiesListData);
  }),
  http.get('/api/entities/:id', () => {
    return HttpResponse.json(fullEntityData);
  }),
];
```