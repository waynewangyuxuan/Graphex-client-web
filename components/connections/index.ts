/**
 * Connection Components Index
 *
 * Central export point for all connection-related components.
 * These components implement Feature 4: Pre-Explanation Retrieval.
 */

// Main modal component
export { ConnectionModal } from './ConnectionModal';
export type { ConnectionModalProps } from './ConnectionModal';

// Sub-components (exported for testing and custom implementations)
export { ConnectionDetails } from './ConnectionDetails';
export type { ConnectionDetailsProps } from './ConnectionDetails';

export { HypothesisInput } from './HypothesisInput';
export type { HypothesisInputProps } from './HypothesisInput';

export { AIExplanation } from './AIExplanation';
export type { AIExplanationProps } from './AIExplanation';
