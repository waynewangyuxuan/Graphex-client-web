# Quiz Components

Comprehensive quiz system for Feature 5: Basic Comprehension Check. Implements retrieval practice for enhanced learning through the testing effect.

## Overview

The quiz system provides:
- **Non-blocking trigger** after 5+ node interactions
- **Multiple choice questions** with immediate feedback
- **Score reporting** with concepts to review
- **Accessibility-first** design (WCAG AA compliant)
- **Smooth animations** and transitions

## Components

### QuizTriggerBanner

Notification banner that slides from top when user has interacted with 5+ nodes.

**Features:**
- Non-blocking (user can continue working)
- Slides in with smooth animation (400ms)
- Two actions: "Start Quiz" (primary), "Later" (secondary)
- Dismissible with X button
- Teal info styling

**Usage:**
```tsx
import { QuizTriggerBanner } from '@/components/quiz';

<QuizTriggerBanner
  isVisible={interactedNodeIds.size >= 5}
  onStart={() => setIsQuizOpen(true)}
  onDismiss={() => setShowBanner(false)}
  interactionCount={interactedNodeIds.size}
/>
```

**Props:**
- `isVisible` - Whether banner is visible
- `onStart` - Callback when "Start Quiz" clicked
- `onDismiss` - Callback when banner dismissed
- `interactionCount` - Number of nodes interacted with

---

### QuizModal

Main quiz container managing the complete quiz flow.

**Features:**
- Quiz generation from graph
- Question flow management
- Answer tracking and submission
- Loading states for generation/submission
- Error handling with retry
- Results display

**Usage:**
```tsx
import { QuizModal } from '@/components/quiz';

<QuizModal
  isOpen={isQuizOpen}
  onClose={() => setIsQuizOpen(false)}
  graphId="graph_abc123"
  onComplete={(results) => console.log(results)}
  onViewNode={(nodeId) => navigateToNode(nodeId)}
  questionCount={5}
  difficulty="medium"
/>
```

**Props:**
- `isOpen` - Whether modal is open
- `onClose` - Callback when modal closed
- `graphId` - Graph ID to generate quiz from
- `onComplete?` - Callback when quiz completed
- `questionCount?` - Number of questions (default: 5)
- `difficulty?` - Quiz difficulty (default: "medium")
- `onViewNode?` - Callback to navigate to a node

---

### QuizProgress

Progress indicator showing current question and completion status.

**Features:**
- Text indicator: "Question X of Y"
- Visual progress bar
- Dot indicators for small quiz counts (≤10)
- Smooth progress animations

**Usage:**
```tsx
import { QuizProgress } from '@/components/quiz';

<QuizProgress
  currentQuestion={2}
  totalQuestions={5}
  answeredCount={1}
/>
```

**Props:**
- `currentQuestion` - Current question number (1-based)
- `totalQuestions` - Total number of questions
- `answeredCount?` - Number of questions answered
- `className?` - Additional CSS classes

---

### QuizQuestion

Single multiple-choice question with radio button options.

**Features:**
- Large clickable areas (entire row)
- Keyboard navigation (arrow keys + Enter)
- Immediate visual feedback after submission
- Shows correct/incorrect with explanations
- Link to relevant node for review

**Usage:**
```tsx
import { QuizQuestion } from '@/components/quiz';

<QuizQuestion
  question={{
    id: 'q1',
    questionText: 'What is the primary function?',
    options: [
      { id: 0, text: 'Option A' },
      { id: 1, text: 'Option B' },
    ],
    correctAnswer: 0,
    explanation: 'Option A is correct because...',
    nodeRefs: ['node_123']
  }}
  questionNumber={1}
  totalQuestions={5}
  onAnswer={(optionId, isCorrect) => handleAnswer(optionId, isCorrect)}
  onViewNode={(nodeId) => navigateToNode(nodeId)}
/>
```

**Props:**
- `question` - Question data (see `QuizQuestionData` type)
- `questionNumber` - Current question number (1-based)
- `totalQuestions` - Total questions in quiz
- `onAnswer` - Callback when answer submitted
- `onViewNode?` - Callback to navigate to node

---

### QuestionFeedback

Feedback display after answer submission.

**Features:**
- Correct: Green checkmark + explanation
- Incorrect: Red X + explanation + correct answer
- Link to review relevant node
- Smooth fade-in animation (300ms)
- Serif font for readability

**Usage:**
```tsx
import { QuestionFeedback } from '@/components/quiz';

<QuestionFeedback
  isCorrect={false}
  explanation="The correct answer is A because..."
  nodeId="node_123"
  onViewNode={(nodeId) => navigateToNode(nodeId)}
/>
```

**Props:**
- `isCorrect` - Whether answer was correct
- `explanation` - Explanation text
- `nodeId?` - Optional node ID to link to
- `onViewNode?` - Callback to navigate to node

---

### QuizResults

Final results page with score and review concepts.

**Features:**
- Score percentage with color coding:
  - 80-100%: Green (mastered)
  - 60-79%: Amber (good progress)
  - <60%: Red-orange (needs review)
- Progress circle visualization
- List of questions with results
- Concepts to review (incorrect answers)
- Actions: "Return to Graph", "Retake Quiz"

**Usage:**
```tsx
import { QuizResults } from '@/components/quiz';

<QuizResults
  results={{
    score: 80,
    correct: 4,
    total: 5,
    results: [...]
  }}
  onRetake={() => generateNewQuiz()}
  onReviewGraph={() => router.push('/graph')}
  onViewNode={(nodeId) => navigateToNode(nodeId)}
/>
```

**Props:**
- `results` - Quiz results data (see `QuizResultsData` type)
- `onRetake` - Callback to retake quiz
- `onReviewGraph` - Callback to return to graph
- `onViewNode?` - Callback to navigate to node

---

## Integration Example

Complete integration with graph view page:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { QuizTriggerBanner, QuizModal } from '@/components/quiz';

export default function GraphView({ graphId }: { graphId: string }) {
  const [interactedNodeIds, setInteractedNodeIds] = useState<Set<string>>(new Set());
  const [showQuizBanner, setShowQuizBanner] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Show banner when 5 unique nodes interacted
  useEffect(() => {
    if (interactedNodeIds.size >= 5 && !showQuizBanner) {
      setShowQuizBanner(true);
    }
  }, [interactedNodeIds.size]);

  const handleNodeClick = (nodeId: string) => {
    setInteractedNodeIds(prev => new Set([...prev, nodeId]));
    // ... other click logic
  };

  const handleQuizComplete = (results: any) => {
    console.log('Quiz completed:', results);
    // Optional: Update node states based on results
  };

  return (
    <>
      <QuizTriggerBanner
        isVisible={showQuizBanner}
        onStart={() => {
          setShowQuizBanner(false);
          setIsQuizOpen(true);
        }}
        onDismiss={() => setShowQuizBanner(false)}
        interactionCount={interactedNodeIds.size}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        graphId={graphId}
        onComplete={handleQuizComplete}
      />

      {/* Graph and reading panel */}
    </>
  );
}
```

See `QuizModal.example.tsx` for a complete working example.

---

## Design System

### Colors

**Banner:**
- Background: `bg-info/10` (teal-blue with transparency)
- Border: `border-l-4 border-info`

**Question Options:**
- Selected: `bg-primary-50 border-primary`
- Hover: `hover:bg-primary-50`
- Correct: `bg-success/10 border-success`
- Incorrect: `bg-error/10 border-error`

**Feedback:**
- Correct: `bg-success/10 border-l-4 border-success text-success`
- Incorrect: `bg-error/10 border-l-4 border-error text-error`

**Results Score:**
- 80-100%: `text-success bg-success/10`
- 60-79%: `text-warning bg-warning/10`
- <60%: `text-error bg-error/10`

### Typography

- Question text: `text-xl font-semibold`
- Options: `text-base`
- Feedback: `text-base font-serif` (for readability)
- Score: `text-5xl font-bold`

### Spacing

- Banner padding: `p-4`
- Question spacing: `space-y-6`
- Option spacing: `space-y-3`
- Modal padding: `p-8`

### Animations

- Banner slide: `translate-y-full → translate-y-0` (400ms)
- Feedback fade: `fade-in slide-in-from-top-2` (300ms)
- Results: `scale-95 opacity-0 → scale-100 opacity-100` (300ms)

---

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between options and buttons
- **Arrow keys**: Move between radio options
- **Enter/Space**: Select option
- **Escape**: Close modal (via Radix Dialog)

### Screen Reader Support

- Progress bar: `role="progressbar"` with `aria-valuenow`
- Radio options: `role="radiogroup"` with `aria-checked`
- Feedback: `role="alert"` with `aria-live="polite"`
- Icons: Proper `aria-label` or `aria-hidden`

### Focus Management

- Visible focus indicators on all interactive elements
- Focus trapped in modal during quiz
- Focus returns to trigger element on close

### Color Contrast

- All text meets WCAG AA contrast ratios (4.5:1 minimum)
- Success green: #4CAF50
- Error red: #F44336
- Primary blue: #2196F3

---

## API Integration

Uses hooks from `@/hooks/useQuiz`:

```tsx
const {
  generateQuiz,
  quiz,
  submitQuiz,
  results,
  isGenerating,
  isSubmitting,
  error,
} = useQuizFlow(graphId);
```

### Quiz Generation

```tsx
generateQuiz({
  graphId: 'graph_abc123',
  difficulty: 'medium',
  count: 5,
});
```

### Quiz Submission

```tsx
submitQuiz({
  answers: [
    { questionId: 'q1', selectedAnswer: 0 },
    { questionId: 'q2', selectedAnswer: 2 },
  ],
});
```

### API Response Types

See `@/types/api.types` for complete type definitions:
- `QuizGenerationRequest`
- `QuizGenerationResponse`
- `QuizSubmissionRequest`
- `QuizSubmissionResponse`
- `QuizQuestion`
- `QuizQuestionResult`

---

## Testing Considerations

### Unit Tests

Test each component in isolation:
- `QuizProgress`: Progress calculation and display
- `QuizQuestion`: Option selection and submission
- `QuestionFeedback`: Correct/incorrect display
- `QuizResults`: Score calculation and display

### Integration Tests

Test component interactions:
- `QuizModal`: Full quiz flow
- Answer tracking across questions
- Submission and results display

### E2E Tests

Test complete user flows:
- Node interaction tracking
- Banner trigger after 5 interactions
- Complete quiz taking
- Score display and retake

---

## Performance

### Optimization Techniques

- Lazy loading of quiz components (use dynamic imports if needed)
- Memoization of expensive calculations
- Debounced API calls for quiz generation
- Optimistic UI updates during submission

### Bundle Size

Each component is tree-shakeable via named exports.

---

## Future Enhancements (Post-MVP)

From MVP.md, these are explicitly cut for the 2-week sprint:

**NOT in MVP:**
- Adaptive difficulty based on performance
- Mastery tracking over time
- Question analytics
- Spaced repetition scheduling
- Multiple question types (beyond MCQ)

These can be added in future iterations.

---

## Related Documentation

- [MVP.md](/META/Core/MVP.md) - Feature requirements
- [UIUX.md](/META/Core/UIUX.md) - Design specifications
- [TECHNICAL.md](/META/Core/TECHNICAL.md) - Architecture patterns
- [Server_API_Reference.md](/META/Server_API_Reference.md) - API endpoints

---

**Version**: 1.0
**Last Updated**: 2025-11-12
**Status**: Production-ready
