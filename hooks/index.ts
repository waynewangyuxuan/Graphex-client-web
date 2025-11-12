/**
 * React Query Hooks Index
 *
 * Central export point for all React Query hooks.
 * Import from this file for convenient access to all hooks.
 */

// Document hooks
export {
  useDocument,
  useDocumentStatus,
  useUploadDocument,
  useUploadDocumentFromUrl,
  documentKeys,
} from './useDocument';

// Graph hooks
export {
  useGraph,
  useGenerateGraph,
  useJobStatus,
  useGraphGeneration,
  graphKeys,
  jobKeys,
} from './useGraph';

// Connection hooks
export {
  useExplainConnection,
} from './useConnection';

// Quiz hooks
export {
  useGenerateQuiz,
  useSubmitQuiz,
  useQuizFlow,
  quizKeys,
} from './useQuiz';

// Note hooks
export {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useNodeNotes,
  useEdgeNotes,
  noteKeys,
} from './useNotes';

// Toast hook
export { useToast, ToastProvider } from './useToast';
