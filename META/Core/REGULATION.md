# Development Regulations

Core principles for maintaining a clean, scalable, and navigable codebase.

---

## 1. META-File System

META-files provide documentation and context for the AI assistant and developers.

### 1.1 The `META.md` Index Pattern

Every folder can contain a `META.md` file that serves as an **index** for that folder:

- Describes the purpose of the folder
- Lists and briefly explains each file/subfolder within it
- Provides navigation context for understanding the folder's contents

This pattern is recursive — any subfolder with significant content should have its own `META.md`.

### 1.2 Core META-Files

| File | Purpose |
|------|---------|
| `META.md` | Index file for any folder — describes its contents |
| `REGULATION.md` | Development principles and coding standards (this file) |
| `PRODUCT.md` | Product vision and requirements |
| `MVP.md` | Minimum Viable Product scope and features |
| `TODO.md` | Task tracking and backlog |
| `PROGRESS.md` | Development progress and milestones |

> Additional META-files can be added as needed. The system is flexible.

---

## 2. Principle of Atomicity

The foundational principle of this project, applied to both structure and code.

### 2.1 Atomic File Structure

- Each file has a **single, well-defined purpose**
- A server file only defines the server; a utility file only contains utilities
- Avoid monolithic files with unrelated responsibilities

### 2.2 Atomic Code (Functions/Classes)

- Every function/class does **one thing well**
- Break large functions into smaller, focused units
- Promotes reusability and simplifies testing/debugging

---

## 3. Principle of Co-located Documentation

Keep documentation close to the code it describes.

- Significant features/modules must have an accompanying `.md` file **in the same directory**
- Documentation should explain: purpose, core logic, and system interactions
- **Example**: A `PropertyRecommender` service requires a `PropertyRecommender.md` alongside it