# Contributing to repo-vite-react-base

Welcome to the `repo-vite-react-base` contributor guide. This document defines the architectural structure, Role catalog, coding conventions, React / JSX / a11y rules, testing practices, quality gates, and workflow for this template repository and projects derived from it.

---

## 1. Purpose

`repo-vite-react-base` is a foundational **Vite.js + React 19 + React Compiler + TypeScript** development environment structured according to the **Fractal Architecture Framework (FAF)** and verified by `@morriconeluca/eslint-plugin-faf`.

- Architectural conformity is enforced by the `faf/conformity` ESLint rule (`faf.configs.recommended`).
- The authoritative specification of FAF is available at [https://github.com/morriconeluca/fractal-architecture-framework](https://github.com/morriconeluca/fractal-architecture-framework).

---

## 2. Repository Architecture

The repository is structured strictly according to FAF principles.

### 2.1 First Level

`src/` is a Root Fragment whose Root Nodes are `main.css` and `main.tsx` (`rootNodes: [['main.css'], ['main.tsx']]`) and whose Public Surface is `src/main.tsx` (`publicRootNodes: ['src/main.tsx']`).

```text
src/                                  Root Fragment
  main.css                            Root Node: global application stylesheet
  main.tsx                            Root Node: public entry point and re-exports
  _components/app/                    Private Category Fragment (component)
    app.type.ts                       Fragment Node (type)
    app.component.tsx                 Master Node
    index.ts                          Access Node
    app.spec.tsx                      Unit test (Sub-Graph Node)
```

- **Origin `src/` is a Root Fragment**: Its Root Nodes are ordered by `rootNodes: [['main.css'], ['main.tsx']]`, and the application entry point (`src/main.tsx`) imports `./main.css` and exposes both runtime Symbols and public TypeScript types.
- **Single Public Root Node (`src/main.tsx`)**: The sole element in `publicRootNodes: ['src/main.tsx']`. All external consumers and integration tests under `test/` import exclusively from `src/main.tsx`.

### 2.2 Placement Criterion

Place each unit according to its production consumers only (actual imports, excluding `*.spec.{ts,tsx}`):

1. A unit with a single production consumer lives in that consumer's Private Category, inside the Category of its own Role.
2. A unit with multiple production consumers lives in the Fractal Branch of their nearest common domain (`<domain>/_<domain>@shared/<Category>/`).
3. Promote a unit only when a second production consumer appears. Never place a unit in a higher domain preemptively or to bypass sibling import rules.
4. Every production module under `src/` (excluding `*.spec.{ts,tsx}`, `*.mock.{ts,tsx}`, and `.css` stylesheets) must be reachable from `src/main.tsx`.

Sibling Fragments in the same Category do not import each other. When units in the same Category must depend on one another, order them using one of the two general Horizontal Hierarchies configured in `fafconfig.ts`:

- **Atomic Design Sub-Categories** (4 levels):
  ```text
  _atoms (Rank 0) < _molecules (Rank 1) < _organisms (Rank 2) < _templates (Rank 3)
  ```
- **Systemic Design Sub-Categories** (5 levels):
  ```text
  _primitives (Rank 0) < _compounds (Rank 1) < _aggregates (Rank 2) < _systems (Rank 3) < _ecosystems (Rank 4)
  ```

`horizontalHierarchies` in `fafconfig.ts` declares `[[['_atoms'], ['_molecules'], ['_organisms'], ['_templates']], [['_primitives'], ['_compounds'], ['_aggregates'], ['_systems'], ['_ecosystems']]]`. A Sub-Category propagates its Parent Category's Role.

From outside a Fragment, import exclusively its `index.ts`. Within the same Fragment, the Sub-Graph Node `<name>.spec.{ts,tsx}` imports its Fragment's Master Node `./<name>.<role>.js` directly (and any lower-Rank Fragment Nodes), while importing `index.ts` for Sub-Fragments or external Fragments.

### 2.3 Role Catalog

`fafconfig.ts` defines the catalog of Roles for React 19 applications:

| Rank | Role                | Category      | Form                                               | Responsibility                                                                               |
| ---- | ------------------- | ------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 0    | `style`             | `_styles`     | Implicit `.css` extension, multiple Symbols        | Stylesheets and visual presentation rules.                                                   |
| 1    | `constant`          | `_constants`  | Category Nodes, multiple Symbols                   | Primitive literal values and static constants with no runtime logic.                         |
| 2    | `schema`            | `_schemas`    | Fragments                                          | Declarative runtime validation schemas.                                                      |
| 3    | `type`              | `_types`      | Category Nodes or Fragment Nodes, multiple Symbols | Static TypeScript type definitions with mandatory JSDoc comments.                            |
| 4    | `mock`              | `_mocks`      | Category Nodes, multiple Symbols                   | In-memory synthetic test fixtures and sample data.                                           |
| 5    | `config`            | `_configs`    | Category Nodes, multiple Symbols                   | Typed immutable domain configuration objects.                                                |
| 6    | `util`              | `_utils`      | Fragments                                          | Pure functional processing, including validation and parsing functions that consume schemas. |
| 7    | `store`             | `_stores`     | Fragments                                          | Application or session state management.                                                     |
| 8    | `context`           | `_contexts`   | Fragments                                          | React Context definitions and providers.                                                     |
| 9    | `hook`              | `_hooks`      | Fragments                                          | Reusable React custom hooks.                                                                 |
| 10   | `component`         | `_components` | Fragments                                          | UI React components.                                                                         |
| 11   | `layout`            | `_layouts`    | Fragments                                          | Structural page layouts composing components.                                                |
| 12   | `page`              | `_pages`      | Fragments                                          | Route-level React views composing layouts, components, hooks, and stores.                    |
| 13   | `route`             | `_routes`     | Fragments                                          | Route definitions and navigation wiring.                                                     |
| 14   | Access Node, `spec` | —             | —                                                  | Top Rank (`index.ts` and `*.spec.{ts,tsx}`).                                                 |

### 2.4 Purity by Role

Purity is mechanically enforced by ESLint across `src/**/*.{ts,tsx}` (excluding `*.spec.{ts,tsx}`):

- Production files under `src/**/*.{ts,tsx}` are forbidden from importing low-level Node or effectful modules (`node:fs`, `fs`, `node:worker_threads`, `worker_threads`, `node:child_process`, `child_process`, `oxc-resolver`) or accessing the `process` global.

### 2.5 Fragment Anatomy

Every Fragment consists of:

- **Master Node (`<name>.<role>.{ts,tsx}`)**: Defines and exports the single Symbol embodying the Fragment's responsibility.
- **Fragment Nodes (`<name>.<lower-role>.{ts,tsx,css}`)**: Optional co-located nodes of lower-Rank Roles (e.g., `app.type.ts`) used by the Master Node and optionally re-exported by `index.ts`.
- **Access Node (`index.ts`)**: Re-exports the Fragment's public Symbols and defines no Symbols of its own.
- **Sub-Graph Node (`<name>.spec.{ts,tsx}`)**: Sibling unit test file exercising the Fragment's Master Node.

### 2.6 Code Outside the Tree

Code outside `src/`:

- `test/`: Entry-point integration tests (`test/main.test.tsx`), dependency-graph fitness tests (`test/fitness/`), test support (`test/support/`), and tooling tests (`test/tooling/`).
- `scripts/`: Quality gate runners (`check.ts`, `mutate-diff.ts`, `mutation-*.ts`) and repository ESLint rules (`scripts/eslint/`).
- Configuration files (`fafconfig.ts`, `eslint.config.ts`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `stryker.config.json`, `commitlint.config.ts`, `index.html`).

---

## 3. Coding Conventions

### 3.1 Language

- All identifiers, filenames, JSDoc comments, test descriptions, documentation, and commit messages must be written in **English**.

### 3.2 Types

- **Type aliases only**: Use `type` declarations exclusively. `interface` is forbidden (`@typescript-eslint/consistent-type-definitions`).
- **`T` prefix**: Every declared type alias must use `PascalCase` prefixed with `T` (e.g., `TAppProps`), enforced by `@typescript-eslint/naming-convention`.

### 3.3 Comments Policy

- Comments are forbidden across the codebase (`repository/comment-policy`), with one exception: JSDoc block comments (`/** ... */`) inside `*.type.ts` files.
- Inside `*.type.ts` files, informative JSDoc comments are **mandatory** on every `type` alias and every property signature (`jsdoc/require-jsdoc`, `jsdoc/informative-docs`, `jsdoc/no-types`).
- Inline comments (`//`), non-JSDoc block comments, ESLint disable comments, `@ts-ignore` / `@ts-expect-error` directives, and shebangs are forbidden everywhere.

### 3.4 Functional Paradigm, React 19, and Accessibility

- **No classes or `this`**: `ClassDeclaration`, `ClassExpression`, and `ThisExpression` are forbidden (`no-restricted-syntax`).
- **No `throw` statements**: `ThrowStatement` is forbidden across the codebase, except inside `src/**/_utils/assert-invariant/assert-invariant.util.ts`. Expected failures must be represented as typed values.
- **Immutability**: Use `readonly` on all type properties and array/tuple parameters.
- **React 19 + React Compiler**: Compiled with `babel-plugin-react-compiler` via `@rolldown/plugin-babel` and `@vitejs/plugin-react`, and linted with `eslint-plugin-react`, `eslint-plugin-react-hooks` (including React Compiler rules), `eslint-plugin-react-refresh` (`vite`), `eslint-plugin-jsx-a11y` (`strict`), `sonarjs/jsx-no-leaked-render`, and `sonarjs/no-useless-react-setstate`.
- **Complexity**: Cyclomatic complexity threshold is `10` for `.ts` files and `20` for `.tsx` files (`sonarjs/cyclomatic-complexity`).

### 3.5 Automated Rule Enforcement

- `faf/conformity`: Validates full FAF architectural conformity via `@morriconeluca/eslint-plugin-faf`.
- `repository/comment-policy`: Enforces the zero-comment policy outside `*.type.ts` JSDoc blocks.
- `repository/no-unknown-parameters`: Forbids `unknown` in function parameters under `src/` (excluding `*.spec.{ts,tsx}`), except for type predicates (`value is T`, `asserts value is T`) on that parameter, functions in `*.schema.{ts,tsx}`, or functions in `*.util.{ts,tsx}` files that import a runtime schema from `/_schemas/` (`*.schema.js`).
- `repository/no-decided-assertion`: Forbids `assertInvariant(typeof x === ...)` checks when the operand's static type already decides the condition.
- `repository/no-tautological-assertion`: Forbids `expect(...)` subjects in tests that do not execute code and only inspect values derived from `*.constant.js` or `*.config.js`.

---

## 4. Testing

### 4.1 Test Placement

- **Unit tests (`src/**/\*.spec.{ts,tsx}`)**: Co-located with each Fragment, importing `./<name>.<role>.js` directly.
- **Integration, fitness, and tooling tests (`test/**/\*.test.{ts,tsx}`)**: Located outside `src/`. Production code imports from `test/`must go through`src/main.tsx`.

### 4.2 In-Memory vs. Disk Fixtures

- Unit tests for pure Roles (`util`, `schema`, `config`, `constant`, `type`, `mock`) and pure UI components use in-memory rendering/data.
- Tests requiring filesystem state use `fs-fixture`. `vitest.config.ts` and `test/support/test-temp-dir.ts` isolate temporary directories per process outside the repository root and automatically clean up stale directories.

---

## 5. Quality Gates

All five quality gates must pass before committing or merging:

1. **`gate:1`** (`npm run gate:1`):
   - Runs `prettier --check` and `tsc --noEmit`.
2. **`gate:2`** (`npm run gate:2`):
   - Runs `eslint .` with `@morriconeluca/eslint-plugin-faf` (`faf.configs.recommended`), React / JSX / a11y rules, and all repository rules.
3. **`gate:3`** (`npm run gate:3`):
   - Runs `vitest run --coverage`.
   - Enforces per-file coverage thresholds of **≥ 95% lines** and **≥ 90% branches**.
   - Includes `test/fitness/dependency-graph.test.ts` (verifying zero circular dependencies, full reachability from `src/main.tsx`, and zero `dist/` imports).
4. **`gate:4:diff` / `gate:4:incremental` / `gate:4:force`**:
   - Runs Stryker mutation testing via `scripts/mutate-diff.ts` with independent plan verification (`scripts/stryker-plan-recorder.ts`) and per-file score threshold **≥ 80%**.
   - `gate:4:diff` mutates touched `src/` directories against `main` (or `FAF_DIFF_BASE` / CLI argument).
   - `gate:4:incremental` mutates all mutable `src/` files using `.cache/stryker/incremental.json`.
   - `gate:4:force` forces re-execution of all mutants across `src/`.
5. **`gate:5`** (`npm run gate:5`):
   - Builds `dist/` via `vite build` with React Compiler.

---

## 6. Workflow

### 6.1 Commands

- **Incremental check during development**:
  ```bash
  npm run check
  ```
- **Full continuous integration check**:
  ```bash
  npm run ci
  ```
- **Centralized incremental mutation**:
  ```bash
  npm run gate:4:incremental
  ```
- **Format and lint autofix**:
  ```bash
  npm run sanitize
  ```

### 6.2 Commit Conventions

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`) and are validated by `@commitlint/cli` via Husky hooks.
