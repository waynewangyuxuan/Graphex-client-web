/**
 * Mock data for MSW handlers
 *
 * Provides realistic test data for all API endpoints to enable frontend
 * development without a running backend.
 */

/**
 * Generate a mock ID for testing
 */
export const mockId = (prefix: string = '') => {
  const randomStr = Math.random().toString(36).substring(2, 10);
  return prefix ? `${prefix}_${randomStr}` : randomStr;
};

/**
 * Generate timestamp in ISO format
 */
export const mockTimestamp = () => new Date().toISOString();

/**
 * Mock document with realistic content
 * Matches backend GET /api/v1/documents/:id schema
 */
export const mockDocument = {
  id: 'doc_abc123',
  title: 'Active Learning Strategies in Education',
  content: `Active Learning: A Comprehensive Overview

Active learning is an educational approach that involves students in the learning process more directly than passive methods such as lectures. It emphasizes student engagement, critical thinking, and the application of knowledge.

Key Principles of Active Learning:

1. Engagement
Students participate actively rather than passively receiving information. This can include discussions, problem-solving, case studies, and hands-on activities.

2. Retention
Research shows that active learning improves long-term retention of information. When students engage with material through multiple modalities, they create stronger neural connections.

3. Understanding
Active learning promotes deeper understanding rather than surface-level memorization. Students construct knowledge by connecting new information to existing mental models.

4. Critical Thinking
By grappling with problems and questions, students develop critical thinking skills that transfer beyond the specific content being learned.

5. Mastery
Through repeated practice and feedback, students achieve mastery of concepts and skills. This iterative process builds confidence and competence.

Implementation Strategies:

Think-Pair-Share: Students think individually, discuss with a partner, then share with the larger group.

Case Studies: Real-world scenarios that require application of concepts.

Problem-Based Learning: Complex problems that drive the learning of new content.

Collaborative Projects: Team-based work that requires coordination and collective problem-solving.

Evidence Base:

Multiple meta-analyses have demonstrated the effectiveness of active learning across STEM disciplines, showing improved exam performance and reduced failure rates compared to traditional lectures.

Conclusion:

Active learning represents a paradigm shift from teacher-centered to student-centered education, with substantial research support for its effectiveness in promoting deep learning and retention.`,
  sourceType: 'pdf' as const,
  status: 'ready' as const,
  metadata: {
    fileSize: 1048576,
    quality: {
      score: 85,
    },
    images: [],
  },
};

/**
 * Mock graph with realistic Mermaid syntax
 */
export const mockGraph = {
  id: 'graph_abc123',
  documentId: 'doc_abc123',
  mermaidCode: `graph TD
  A[Active Learning] --> B[Engagement]
  A --> C[Retention]
  A --> D[Understanding]
  B --> E[Critical Thinking]
  C --> E
  D --> E
  E --> F[Mastery]
  B --> G[Student Participation]
  D --> H[Deep Learning]`,
  status: 'ready' as const,
  generationModel: 'claude-sonnet-4',
  nodes: [
    {
      id: 'node_1',
      nodeKey: 'A',
      title: 'Active Learning',
      nodeType: 'concept',
      summary: 'An educational approach that involves students in the learning process more directly than passive methods.',
      sourceReferences: [
        {
          start: 0,
          end: 186,
          text: 'Active learning is an educational approach that involves students in the learning process more directly than passive methods such as lectures. It emphasizes student engagement, critical thinking, and the application of knowledge.',
        },
      ],
    },
    {
      id: 'node_2',
      nodeKey: 'B',
      title: 'Engagement',
      nodeType: 'concept',
      summary: 'Students participate actively rather than passively receiving information.',
      sourceReferences: [
        {
          start: 250,
          end: 450,
          text: 'Students participate actively rather than passively receiving information. This can include discussions, problem-solving, case studies, and hands-on activities.',
        },
      ],
    },
    {
      id: 'node_3',
      nodeKey: 'C',
      title: 'Retention',
      nodeType: 'concept',
      summary: 'Active learning improves long-term retention of information.',
      sourceReferences: [
        {
          start: 455,
          end: 650,
          text: 'Research shows that active learning improves long-term retention of information. When students engage with material through multiple modalities, they create stronger neural connections.',
        },
      ],
    },
    {
      id: 'node_4',
      nodeKey: 'D',
      title: 'Understanding',
      nodeType: 'concept',
      summary: 'Promotes deeper understanding rather than surface-level memorization.',
      sourceReferences: [
        {
          start: 655,
          end: 850,
          text: 'Active learning promotes deeper understanding rather than surface-level memorization. Students construct knowledge by connecting new information to existing mental models.',
        },
      ],
    },
    {
      id: 'node_5',
      nodeKey: 'E',
      title: 'Critical Thinking',
      nodeType: 'concept',
      summary: 'Students develop critical thinking skills that transfer beyond specific content.',
      sourceReferences: [
        {
          start: 855,
          end: 1050,
          text: 'By grappling with problems and questions, students develop critical thinking skills that transfer beyond the specific content being learned.',
        },
      ],
    },
    {
      id: 'node_6',
      nodeKey: 'F',
      title: 'Mastery',
      nodeType: 'concept',
      summary: 'Through repeated practice and feedback, students achieve mastery of concepts.',
      sourceReferences: [
        {
          start: 1055,
          end: 1250,
          text: 'Through repeated practice and feedback, students achieve mastery of concepts and skills. This iterative process builds confidence and competence.',
        },
      ],
    },
    {
      id: 'node_7',
      nodeKey: 'G',
      title: 'Student Participation',
      nodeType: 'concept',
      summary: 'Direct involvement in the learning process through various activities.',
      sourceReferences: [
        {
          start: 250,
          end: 450,
          text: 'Students participate actively rather than passively receiving information. This can include discussions, problem-solving, case studies, and hands-on activities.',
        },
      ],
    },
    {
      id: 'node_8',
      nodeKey: 'H',
      title: 'Deep Learning',
      nodeType: 'concept',
      summary: 'Student-centered education promoting deep learning and retention.',
      sourceReferences: [
        {
          start: 1800,
          end: 2000,
          text: 'Active learning represents a paradigm shift from teacher-centered to student-centered education, with substantial research support for its effectiveness in promoting deep learning and retention.',
        },
      ],
    },
  ],
  edges: [
    {
      id: 'edge_1',
      fromNodeId: 'node_1',
      toNodeId: 'node_2',
      relationship: 'leads to',
      aiExplanation: null,
    },
    {
      id: 'edge_2',
      fromNodeId: 'node_1',
      toNodeId: 'node_3',
      relationship: 'results in',
      aiExplanation: null,
    },
    {
      id: 'edge_3',
      fromNodeId: 'node_1',
      toNodeId: 'node_4',
      relationship: 'promotes',
      aiExplanation: null,
    },
    {
      id: 'edge_4',
      fromNodeId: 'node_2',
      toNodeId: 'node_5',
      relationship: 'develops',
      aiExplanation: null,
    },
    {
      id: 'edge_5',
      fromNodeId: 'node_3',
      toNodeId: 'node_5',
      relationship: 'supports',
      aiExplanation: null,
    },
    {
      id: 'edge_6',
      fromNodeId: 'node_4',
      toNodeId: 'node_5',
      relationship: 'enables',
      aiExplanation: null,
    },
    {
      id: 'edge_7',
      fromNodeId: 'node_5',
      toNodeId: 'node_6',
      relationship: 'leads to',
      aiExplanation: null,
    },
    {
      id: 'edge_8',
      fromNodeId: 'node_2',
      toNodeId: 'node_7',
      relationship: 'includes',
      aiExplanation: null,
    },
    {
      id: 'edge_9',
      fromNodeId: 'node_4',
      toNodeId: 'node_8',
      relationship: 'achieves',
      aiExplanation: null,
    },
  ],
  createdAt: '2025-11-11T10:00:00Z',
};

/**
 * Mock quiz questions
 */
export const mockQuiz = {
  quizId: 'quiz_abc123',
  questions: [
    {
      id: 'q1',
      questionText: 'Which concept is a direct result of Active Learning?',
      options: [
        { id: 0, text: 'Engagement' },
        { id: 1, text: 'Passive Reception' },
        { id: 2, text: 'Memorization' },
        { id: 3, text: 'Teacher-Centered Learning' },
      ],
      correctAnswer: 0,
      explanation: 'Active Learning leads directly to Engagement, as students participate actively rather than passively receiving information.',
      difficulty: 'easy' as const,
      nodeRefs: ['node_1', 'node_2'],
    },
    {
      id: 'q2',
      questionText: 'What do Engagement, Retention, and Understanding all contribute to?',
      options: [
        { id: 0, text: 'Mastery' },
        { id: 1, text: 'Critical Thinking' },
        { id: 2, text: 'Student Participation' },
        { id: 3, text: 'Deep Learning' },
      ],
      correctAnswer: 1,
      explanation: 'Engagement, Retention, and Understanding all converge to develop Critical Thinking skills, which are essential for applying knowledge beyond specific content.',
      difficulty: 'medium' as const,
      nodeRefs: ['node_2', 'node_3', 'node_4', 'node_5'],
    },
    {
      id: 'q3',
      questionText: 'According to the material, what does Critical Thinking ultimately lead to?',
      options: [
        { id: 0, text: 'Engagement' },
        { id: 1, text: 'Retention' },
        { id: 2, text: 'Mastery' },
        { id: 3, text: 'Understanding' },
      ],
      correctAnswer: 2,
      explanation: 'Critical Thinking leads to Mastery, where students achieve competence and confidence through iterative practice and feedback.',
      difficulty: 'medium' as const,
      nodeRefs: ['node_5', 'node_6'],
    },
    {
      id: 'q4',
      questionText: 'Which implementation strategy involves individual thinking, partner discussion, and group sharing?',
      options: [
        { id: 0, text: 'Case Studies' },
        { id: 1, text: 'Think-Pair-Share' },
        { id: 2, text: 'Problem-Based Learning' },
        { id: 3, text: 'Collaborative Projects' },
      ],
      correctAnswer: 1,
      explanation: 'Think-Pair-Share is the strategy that follows this three-step process: individual thinking, partner discussion, then sharing with the larger group.',
      difficulty: 'easy' as const,
      nodeRefs: ['node_2', 'node_7'],
    },
    {
      id: 'q5',
      questionText: 'What type of learning does Understanding promote according to the graph?',
      options: [
        { id: 0, text: 'Surface-level memorization' },
        { id: 1, text: 'Deep Learning' },
        { id: 2, text: 'Passive reception' },
        { id: 3, text: 'Teacher-centered education' },
      ],
      correctAnswer: 1,
      explanation: 'Understanding promotes Deep Learning by helping students construct knowledge by connecting new information to existing mental models, representing a shift to student-centered education.',
      difficulty: 'hard' as const,
      nodeRefs: ['node_4', 'node_8'],
    },
  ],
};

/**
 * Mock notes
 */
export const mockNotes = [
  {
    id: 'note_1',
    graphId: 'graph_abc123',
    nodeId: 'node_1',
    edgeId: null,
    content: 'This concept reminds me of the Socratic method in philosophy.',
    createdAt: '2025-11-11T10:10:00Z',
    updatedAt: '2025-11-11T10:10:00Z',
  },
  {
    id: 'note_2',
    graphId: 'graph_abc123',
    nodeId: 'node_5',
    edgeId: null,
    content: 'Key insight: Critical thinking is transferable across domains, not just content-specific.',
    createdAt: '2025-11-11T10:15:00Z',
    updatedAt: '2025-11-11T10:15:00Z',
  },
];

/**
 * Mock connection explanation
 */
export const mockConnectionExplanation = {
  fromNode: 'node_2',
  toNode: 'node_5',
  relationship: 'develops',
  explanation: 'Engagement develops Critical Thinking because when students actively participate in the learning process through discussions, problem-solving, and hands-on activities, they are forced to grapple with complex questions. This active wrestling with ideas strengthens their analytical and evaluative skills, which are the core components of critical thinking. The connection is supported by research showing that engaged learners perform better on assessments requiring higher-order thinking.',
  sourceReferences: [
    {
      start: 250,
      end: 450,
      text: 'Students participate actively rather than passively receiving information. This can include discussions, problem-solving, case studies, and hands-on activities.',
    },
    {
      start: 855,
      end: 1050,
      text: 'By grappling with problems and questions, students develop critical thinking skills that transfer beyond the specific content being learned.',
    },
  ],
  userHypothesisEvaluation: null,
};

/**
 * Mock job statuses for simulating async operations
 */
export const mockJobStates = {
  queued: {
    id: 'job_graph_123',
    type: 'graph-generation' as const,
    status: 'queued' as const,
    progress: 0,
    result: null,
    error: null,
    createdAt: '2025-11-11T10:00:00Z',
    completedAt: null,
  },
  processing: {
    id: 'job_graph_123',
    type: 'graph-generation' as const,
    status: 'processing' as const,
    progress: 50,
    result: null,
    error: null,
    createdAt: '2025-11-11T10:00:00Z',
    completedAt: null,
  },
  completed: {
    id: 'job_graph_123',
    type: 'graph-generation' as const,
    status: 'completed' as const,
    progress: 100,
    result: {
      graphId: 'graph_abc123',
    },
    error: null,
    createdAt: '2025-11-11T10:00:00Z',
    completedAt: '2025-11-11T10:02:30Z',
  },
  failed: {
    id: 'job_graph_123',
    type: 'graph-generation' as const,
    status: 'failed' as const,
    progress: 75,
    result: null,
    error: 'AI service timeout',
    createdAt: '2025-11-11T10:00:00Z',
    completedAt: '2025-11-11T10:03:00Z',
  },
};

/**
 * Mock document processing statuses
 */
export const mockDocumentStatuses = {
  processing: {
    id: 'doc_abc123',
    status: 'processing' as const,
    progress: 50,
    errorMessage: null,
  },
  ready: {
    id: 'doc_abc123',
    status: 'ready' as const,
    progress: 100,
    errorMessage: null,
  },
  failed: {
    id: 'doc_abc123',
    status: 'failed' as const,
    progress: 0,
    errorMessage: 'Failed to extract text from PDF',
  },
};
