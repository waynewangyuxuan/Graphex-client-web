import type { Folder, EntitySummary, KnowledgeEntity } from '@/types';

export const folders: Folder[] = [
  { id: 'folder-1', name: 'Research', parentId: null },
  { id: 'folder-2', name: 'ML Papers', parentId: 'folder-1' },
  { id: 'folder-3', name: 'Work', parentId: null },
];

export const entities: EntitySummary[] = [
  {
    id: 'entity-0',
    title: 'Getting Started',
    folderId: null,
    tags: ['intro'],
    createdAt: '2024-01-01T10:00:00Z',
    modifiedAt: '2024-01-01T10:00:00Z',
    stats: { nodeCount: 3, edgeCount: 2, pageCount: 5 },
  },
  {
    id: 'entity-1',
    title: 'ML Fundamentals',
    folderId: 'folder-2',
    tags: ['ml', 'basics'],
    createdAt: '2024-01-10T10:00:00Z',
    modifiedAt: '2024-01-15T14:30:00Z',
    stats: { nodeCount: 6, edgeCount: 7, pageCount: 12 },
  },
  {
    id: 'entity-2',
    title: 'Neural Networks',
    folderId: 'folder-2',
    tags: ['nn'],
    createdAt: '2024-01-08T09:00:00Z',
    modifiedAt: '2024-01-12T11:00:00Z',
    stats: { nodeCount: 8, edgeCount: 10, pageCount: 8 },
  },
];

export const fullEntity: KnowledgeEntity = {
  id: 'entity-1',
  title: 'ML Fundamentals',
  folderId: 'folder-2',
  tags: ['ml', 'basics'],
  createdAt: '2024-01-10T10:00:00Z',
  modifiedAt: '2024-01-15T14:30:00Z',
  stats: { nodeCount: 6, edgeCount: 7, pageCount: 12 },
  graph: {
    nodes: [
      {
        id: 'n1',
        label: 'Machine Learning',
        type: 'key',
        source: {
          sectionId: 's1',
          pageNumber: 1,
          boundingBox: { x: 0.1, y: 0.15, width: 0.8, height: 0.1 },
          text: 'Machine Learning is a subset of AI...',
        },
      },
      {
        id: 'n2',
        label: 'Neural Networks',
        type: 'concept',
        source: {
          sectionId: 's2',
          pageNumber: 1,
          boundingBox: { x: 0.1, y: 0.28, width: 0.8, height: 0.12 },
          text: 'Neural Networks are computing systems...',
        },
      },
      {
        id: 'n3',
        label: 'Deep Learning',
        type: 'concept',
        source: {
          sectionId: 's3',
          pageNumber: 1,
          boundingBox: { x: 0.1, y: 0.42, width: 0.8, height: 0.1 },
          text: 'Deep Learning uses multiple layers...',
        },
      },
      {
        id: 'n4',
        label: 'Backpropagation',
        type: 'concept',
        source: {
          sectionId: 's4',
          pageNumber: 2,
          boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.12 },
          text: 'Backpropagation calculates gradients...',
        },
      },
      {
        id: 'n5',
        label: 'Training Process',
        type: 'concept',
        source: {
          sectionId: 's5',
          pageNumber: 2,
          boundingBox: { x: 0.1, y: 0.25, width: 0.8, height: 0.1 },
          text: 'The training process involves...',
        },
      },
      {
        id: 'n6',
        label: 'Gradient Descent',
        type: 'concept',
        source: {
          sectionId: 's6',
          pageNumber: 2,
          boundingBox: { x: 0.1, y: 0.4, width: 0.8, height: 0.12 },
          text: 'Gradient Descent is an optimization...',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', relation: 'INCLUDES' },
      { id: 'e2', source: 'n1', target: 'n3', relation: 'ENABLES' },
      { id: 'e3', source: 'n2', target: 'n4', relation: 'USES' },
      { id: 'e4', source: 'n3', target: 'n5', relation: 'REQUIRES' },
      { id: 'e5', source: 'n4', target: 'n6', relation: 'OPTIMIZES' },
      { id: 'e6', source: 'n5', target: 'n6', relation: 'USES' },
    ],
  },
  source: {
    pdfUrl: '/samples/ml-fundamentals.pdf',
    content: {
      sections: [
        {
          id: 's0',
          type: 'heading',
          level: 1,
          content: 'Chapter 1: Introduction to ML',
          pageNumber: 1,
          nodeId: null,
        },
        {
          id: 's1',
          type: 'paragraph',
          content:
            'Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data, learn from it, and make predictions or decisions.',
          pageNumber: 1,
          nodeId: 'n1',
        },
        {
          id: 's2',
          type: 'paragraph',
          content:
            'Neural Networks are computing systems inspired by biological neural networks that constitute animal brains. These systems learn to perform tasks by considering examples, generally without being programmed with task-specific rules.',
          pageNumber: 1,
          nodeId: 'n2',
        },
        {
          id: 's3',
          type: 'paragraph',
          content:
            'Deep Learning is a subset of machine learning based on artificial neural networks with multiple layers between the input and output layers. These intermediate layers enable the model to learn increasingly abstract representations.',
          pageNumber: 1,
          nodeId: 'n3',
        },
        {
          id: 's4',
          type: 'paragraph',
          content:
            'Backpropagation calculates the gradient of the loss function with respect to each weight by propagating the error backward through the network. This algorithm is fundamental to training deep neural networks.',
          pageNumber: 2,
          nodeId: 'n4',
        },
        {
          id: 's5',
          type: 'paragraph',
          content:
            'The Training Process in machine learning involves feeding data through the model, comparing outputs to expected results, and adjusting parameters to minimize error. This iterative process continues until acceptable performance.',
          pageNumber: 2,
          nodeId: 'n5',
        },
        {
          id: 's6',
          type: 'paragraph',
          content:
            'Gradient Descent is an optimization algorithm used to minimize the loss function by iteratively moving toward the steepest descent. Variants include SGD, Mini-batch, and adaptive methods like Adam.',
          pageNumber: 2,
          nodeId: 'n6',
        },
      ],
    },
  },
};
