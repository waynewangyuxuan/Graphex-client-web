'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults, type QuizResultsData } from './QuizResults';
import { useQuizFlow } from '@/hooks/useQuiz';
import type { QuizAnswer, QuizQuestion as APIQuizQuestion } from '@/types/api.types';

/**
 * Quiz Modal Component
 *
 * Main container for the quiz experience. Handles:
 * - Quiz generation from graph
 * - Question flow management
 * - Answer tracking
 * - Quiz submission
 * - Results display
 *
 * Features:
 * - Full-screen modal for focused experience
 * - Loading states during generation/submission
 * - Error handling with retry options
 * - Smooth transitions between questions
 * - Next button appears after answer submission
 *
 * @example
 * <QuizModal
 *   isOpen={isQuizOpen}
 *   onClose={() => setIsQuizOpen(false)}
 *   graphId="graph_abc123"
 *   onComplete={(results) => {
 *     console.log(`Score: ${results.score}%`);
 *   }}
 * />
 */

export interface QuizModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal is closed
   */
  onClose: () => void;
  /**
   * Graph ID to generate quiz from
   */
  graphId: string;
  /**
   * Callback when quiz is completed
   */
  onComplete?: (results: QuizResultsData) => void;
  /**
   * Number of questions to generate
   * @default 5
   */
  questionCount?: number;
  /**
   * Quiz difficulty level
   * @default "medium"
   */
  difficulty?: 'easy' | 'medium' | 'hard';
  /**
   * Callback to navigate to a specific node
   */
  onViewNode?: (nodeId: string) => void;
}

interface AnswerState {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export function QuizModal({
  isOpen,
  onClose,
  graphId,
  onComplete,
  questionCount = 5,
  difficulty = 'medium',
  onViewNode,
}: QuizModalProps) {
  const {
    generateQuiz,
    quiz,
    submitQuiz,
    results,
    isGenerating,
    isSubmitting,
    error,
  } = useQuizFlow(graphId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerState[]>([]);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = React.useState(false);

  // Generate quiz when modal opens
  React.useEffect(() => {
    if (isOpen && !quiz && !isGenerating) {
      generateQuiz({
        graphId,
        difficulty,
        count: questionCount,
      });
    }
  }, [isOpen, quiz, isGenerating, generateQuiz, graphId, difficulty, questionCount]);

  // Reset state when quiz changes
  React.useEffect(() => {
    if (quiz) {
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setHasAnsweredCurrent(false);
    }
  }, [quiz?.quizId]);

  // Call onComplete when results are available
  React.useEffect(() => {
    if (results && onComplete) {
      onComplete(results as QuizResultsData);
    }
  }, [results, onComplete]);

  const handleAnswer = (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    setAnswers((prev) => [
      ...prev,
      {
        questionId,
        selectedAnswer,
        isCorrect,
      },
    ]);
    setHasAnsweredCurrent(true);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    if (isLastQuestion) {
      // Submit quiz
      const submissionAnswers: QuizAnswer[] = answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
      }));

      submitQuiz({ answers: submissionAnswers });
    } else {
      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setHasAnsweredCurrent(false);
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setHasAnsweredCurrent(false);
    generateQuiz({
      graphId,
      difficulty,
      count: questionCount,
    });
  };

  const handleClose = () => {
    // Reset state
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setHasAnsweredCurrent(false);
    onClose();
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isLastQuestion = quiz && currentQuestionIndex === quiz.questions.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <Dialog.Content
        className="max-w-4xl"
        hideCloseButton={isGenerating || isSubmitting}
      >
        {/* Loading state - Generating quiz */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" variant="primary" />
            <p className="mt-4 text-lg font-medium text-text-primary">
              Generating quiz questions...
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Creating {questionCount} questions from your graph
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-error/10 p-4">
              <svg
                className="h-12 w-12 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Failed to generate quiz
            </h3>
            <p className="mb-6 text-sm text-text-secondary">
              {error.message || 'Something went wrong. Please try again.'}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  generateQuiz({
                    graphId,
                    difficulty,
                    count: questionCount,
                  })
                }
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Quiz questions */}
        {quiz && !results && !isSubmitting && currentQuestion && (
          <>
            <Dialog.Header>
              <Dialog.Title>Comprehension Check</Dialog.Title>
              <Dialog.Description>
                Test your understanding of the concepts you've learned
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body className="space-y-6">
              {/* Progress */}
              <QuizProgress
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={quiz.questions.length}
                answeredCount={answers.length}
              />

              {/* Current question */}
              <QuizQuestion
                question={currentQuestion as APIQuizQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={quiz.questions.length}
                onAnswer={(optionId, isCorrect) =>
                  handleAnswer(currentQuestion.id, optionId, isCorrect)
                }
                onViewNode={onViewNode}
              />
            </Dialog.Body>

            {/* Next button (appears after answer) */}
            {hasAnsweredCurrent && (
              <Dialog.Footer>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto"
                >
                  {isLastQuestion ? 'See Results' : 'Next Question'}
                </Button>
              </Dialog.Footer>
            )}
          </>
        )}

        {/* Loading state - Submitting quiz */}
        {isSubmitting && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" variant="primary" />
            <p className="mt-4 text-lg font-medium text-text-primary">
              Calculating your score...
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <>
            <Dialog.Header>
              <Dialog.Title>Quiz Complete!</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <QuizResults
                results={results as QuizResultsData}
                onRetake={handleRetake}
                onReviewGraph={handleClose}
                onViewNode={onViewNode}
              />
            </Dialog.Body>
          </>
        )}
      </Dialog.Content>
    </Dialog>
  );
}
