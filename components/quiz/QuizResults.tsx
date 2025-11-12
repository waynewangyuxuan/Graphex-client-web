'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Quiz Results Component
 *
 * Displays final quiz results with:
 * - Score percentage with color coding
 * - List of questions with correct/incorrect indicators
 * - Concepts to review (nodes with incorrect answers)
 * - Actions: Review Graph, Retake Quiz
 *
 * Color coding:
 * - 80-100%: Green (mastered)
 * - 60-79%: Amber (good progress)
 * - <60%: Red-orange (needs review)
 *
 * @example
 * <QuizResults
 *   results={{
 *     quizId: 'quiz_123',
 *     score: 80,
 *     totalQuestions: 5,
 *     correctAnswers: 4,
 *     answers: [...]
 *   }}
 *   onRetake={() => generateNewQuiz()}
 *   onReviewGraph={() => router.push('/graph')}
 *   onViewNode={(nodeId) => navigateToNode(nodeId)}
 * />
 */

import type {
  QuizSubmissionResponse,
  QuizQuestionResult
} from '@/types/api.types';

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: number;
  selectedOptionText: string;
  correctAnswer: number;
  correctOptionText: string;
  isCorrect: boolean;
  nodeId?: string;
  explanation: string;
}

export interface QuizResultsData {
  score: number;
  correct: number;
  total: number;
  results: QuizQuestionResult[];
  // Extended data for UI display
  answers?: QuizAnswer[];
}

export interface QuizResultsProps {
  /**
   * Quiz results data
   */
  results: QuizResultsData;
  /**
   * Callback to retake the quiz
   */
  onRetake: () => void;
  /**
   * Callback to return to graph view
   */
  onReviewGraph: () => void;
  /**
   * Callback to navigate to a specific node
   */
  onViewNode?: (nodeId: string) => void;
}

export function QuizResults({
  results,
  onRetake,
  onReviewGraph,
  onViewNode,
}: QuizResultsProps) {
  const { score, total, correct, results: questionResults } = results;

  // Determine score color and message
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getScoreMessage = (score: number) => {
    if (score === 100) return "Perfect! You've mastered this material.";
    if (score >= 80) return 'Excellent work! You have a strong understanding.';
    if (score >= 60) return 'Good progress! Review the concepts below to improve.';
    return 'Keep learning! Review these concepts and try again.';
  };

  // Get concepts to review (incorrect answers)
  const conceptsToReview = questionResults.filter((result) => !result.correct);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Score card */}
      <Card className={cn('text-center', getScoreBgColor(score))}>
        <Card.Body className="p-8">
          {/* Score display */}
          <div className="mb-4">
            <div className={cn('text-5xl font-bold', getScoreColor(score))}>
              {score}%
            </div>
            <p className="mt-2 text-lg text-text-secondary">
              You got {correct} out of {total} correct
            </p>
          </div>

          {/* Score message */}
          <p className="text-base font-medium text-text-primary">
            {getScoreMessage(score)}
          </p>

          {/* Progress circle visualization */}
          <div className="mt-6 flex justify-center">
            <svg className="h-32 w-32" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={cn('transition-all duration-1000', getScoreColor(score))}
                strokeDasharray={`${(score / 100) * 314} 314`}
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
              />
            </svg>
          </div>
        </Card.Body>
      </Card>

      {/* Question results */}
      <Card>
        <Card.Header>
          <Card.Title>Question Results</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            {questionResults.map((result, index) => (
              <div
                key={result.questionId}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4',
                  result.correct
                    ? 'border-success/30 bg-success/5'
                    : 'border-error/30 bg-error/5'
                )}
              >
                {/* Icon */}
                {result.correct ? (
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                    aria-label="Correct"
                  />
                ) : (
                  <XCircle
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-error"
                    aria-label="Incorrect"
                  />
                )}

                {/* Question and answer */}
                <div className="flex-1">
                  <h4 className="mb-1 font-medium text-text-primary">
                    Question {index + 1}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Your answer: Option {result.selectedAnswer}
                  </p>
                  {!result.correct && (
                    <>
                      <p className="mt-1 text-sm text-success">
                        Correct answer: Option {result.correctAnswer}
                      </p>
                      <p className="mt-2 text-sm italic text-text-secondary">
                        {result.explanation}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Concepts to review */}
      {conceptsToReview.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Concepts to Review</Card.Title>
          </Card.Header>
          <Card.Body>
            <p className="mb-4 text-sm text-text-secondary">
              Review these concepts to strengthen your understanding:
            </p>
            <div className="space-y-2">
              {conceptsToReview.map((result, index) => (
                <div
                  key={result.questionId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">
                      Question {questionResults.findIndex(r => r.questionId === result.questionId) + 1}
                    </span>
                    <p className="mt-1 text-xs text-text-secondary">
                      {result.explanation}
                    </p>
                  </div>
                  {onViewNode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewNode(result.questionId)}
                      rightIcon={<ExternalLink className="h-4 w-4" />}
                    >
                      Review
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={onReviewGraph}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="sm:w-auto"
        >
          Return to Graph
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onRetake}
          leftIcon={<RotateCcw className="h-5 w-5" />}
          className="sm:w-auto"
        >
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}
