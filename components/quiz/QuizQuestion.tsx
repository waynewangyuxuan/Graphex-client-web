'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { QuestionFeedback } from './QuestionFeedback';

/**
 * Quiz Question Component
 *
 * Displays a single multiple-choice question with radio button options.
 * Shows immediate feedback after submission with explanation and node link.
 *
 * Features:
 * - Large clickable areas for accessibility
 * - Keyboard navigation (arrow keys + Enter)
 * - Immediate feedback with explanations
 * - Link back to relevant node
 *
 * @example
 * <QuizQuestion
 *   question={{
 *     id: 'q1',
 *     questionText: 'What is the primary function of mitochondria?',
 *     options: [
 *       { id: 'a', text: 'Energy production', isCorrect: true },
 *       { id: 'b', text: 'Protein synthesis', isCorrect: false },
 *     ],
 *     nodeId: 'node_123'
 *   }}
 *   questionNumber={1}
 *   totalQuestions={5}
 *   onAnswer={(optionId, isCorrect) => handleAnswer(optionId, isCorrect)}
 * />
 */

export interface QuizQuestionOption {
  id: number;
  text: string;
}

export interface QuizQuestionData {
  id: string;
  questionText: string;
  options: QuizQuestionOption[];
  correctAnswer: number;
  explanation: string;
  nodeRefs: string[];
}

export interface QuizQuestionProps {
  /**
   * Question data
   */
  question: QuizQuestionData;
  /**
   * Current question number (1-based)
   */
  questionNumber: number;
  /**
   * Total number of questions
   */
  totalQuestions: number;
  /**
   * Callback when user submits an answer
   */
  onAnswer: (optionId: number, isCorrect: boolean) => void;
  /**
   * Callback to navigate to relevant node
   */
  onViewNode?: (nodeId: string) => void;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onViewNode,
}: QuizQuestionProps) {
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(
    null
  );
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Reset state when question changes
  React.useEffect(() => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
  }, [question.id]);

  const handleOptionSelect = (optionId: number) => {
    if (!isSubmitted) {
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedOptionId === null) return;

    const isCorrect = selectedOptionId === question.correctAnswer;
    setIsSubmitted(true);
    onAnswer(selectedOptionId, isCorrect);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionSelect(optionId);
    }
  };

  return (
    <div className="w-full">
      {/* Question text */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {question.questionText}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const showAsCorrect = isSubmitted && option.id === question.correctAnswer;
          const showAsIncorrect =
            isSubmitted && isSelected && option.id !== question.correctAnswer;

          return (
            <div
              key={option.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${String.fromCharCode(65 + index)}: ${option.text}`}
              tabIndex={isSubmitted ? -1 : 0}
              onClick={() => handleOptionSelect(option.id)}
              onKeyDown={(e) => handleKeyDown(e, option.id)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                'hover:border-primary-300 hover:bg-primary-50',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected && !isSubmitted && 'border-primary bg-primary-50',
                !isSelected &&
                  !showAsCorrect &&
                  !showAsIncorrect &&
                  'border-gray-200 bg-white',
                showAsCorrect && 'border-success bg-success/10',
                showAsIncorrect && 'border-error bg-error/10',
                isSubmitted && 'cursor-default hover:border-current hover:bg-current'
              )}
            >
              {/* Radio button indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected && !isSubmitted && 'border-primary bg-primary',
                  !isSelected &&
                    !showAsCorrect &&
                    !showAsIncorrect &&
                    'border-gray-300 bg-white',
                  showAsCorrect && 'border-success bg-success',
                  showAsIncorrect && 'border-error bg-error'
                )}
                aria-hidden="true"
              >
                {isSelected && !isSubmitted && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
                {showAsCorrect && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {showAsIncorrect && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              {/* Option text */}
              <span className="flex-1 text-base text-text-primary">
                {option.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!isSubmitted && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedOptionId}
            className="w-full"
          >
            Submit Answer
          </Button>
        </div>
      )}

      {/* Feedback */}
      {isSubmitted && selectedOptionId !== null && (
        <div className="mt-6">
          <QuestionFeedback
            isCorrect={selectedOptionId === question.correctAnswer}
            explanation={question.explanation}
            nodeId={question.nodeRefs[0]}
            onViewNode={onViewNode}
          />
        </div>
      )}
    </div>
  );
}
