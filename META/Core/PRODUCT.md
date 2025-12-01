# Graphex: AI-Powered Knowledge Graph Reader

## The Problem
Traditional reading is linear, but human memory is a *network*. Readers spend enormous mental energy translating paragraphs into mental models—then forget most of it. Current tools either require manual graph-building (Heptabase) or produce passive visualizations (Instagraph). Neither actually *teaches*.

## The Vision
Graphex transforms documents into **interactive knowledge graphs** that adapt to how you learn—not just how the author wrote. It's a cognitive prosthetic that sits between passive reading and active understanding.

## Core Workflow
1. **Upload** → AI extracts a navigable graph from any document
2. **Explore** → Click nodes to reveal source text; edges explain *why* concepts connect
3. **Annotate** → Add notes, rearrange structure, create new connections
4. **Verify** → System challenges your understanding of subgraphs
5. **Iterate** → Graph evolves as your knowledge deepens

## Key Features
| Feature | Description |
|---------|-------------|
| **Doc-to-Graph** | Schema-driven extraction (Arguments, Timeline, Characters) |
| **Source Anchoring** | Every node links back to exact PDF location |
| **Multi-Doc Merge** | Synthesize multiple papers into unified knowledge map |
| **Epistemic Diffing** | Visualize what you learned vs. what you already knew |
| **Kit-Build Mode** | AI provides nodes; *you* build the connections (active learning) |

## Technical Edge
- **Ingestion**: Marker (deep learning PDF parser) preserves tables, headers, coordinates
- **Efficiency**: Hierarchical clustering (HDBSCAN) reduces LLM calls from O(N) to O(log N)
- **Rendering**: WebGL-based engine (Sigma.js) handles 50,000+ nodes smoothly
- **Security**: Defense-in-depth against prompt injection via `llm-guard`

## Market Position
**Not** a note-taking app. **Not** a passive visualizer.
→ An *Active Graph Reader* for students, researchers, and professionals drowning in dense material.

## One-Liner
> **Graphex turns any document into a map you can walk through—and quizzes you at every crossroad.**