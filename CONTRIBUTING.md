# Contributing to MergeSVG

Thanks for your interest in improving MergeSVG! This guide explains how to set up your environment, propose changes, and submit high‑quality pull requests. The project is a Next.js + TypeScript app focused on safely merging and manipulating SVG assets entirely client‑side.

## Table of Contents
1. Vision & Scope
2. Getting Started
3. Development Workflow
4. Code Style & Quality
5. SVG Safety & Validation
6. Adding Features / Architecture Notes
7. Commit Messages & Branch Naming
8. Pull Request Guidelines
9. Issue Reporting
10. Performance & UX Considerations
11. Security / Responsible Disclosure
12. Questions & Discussion

---
## 1. Vision & Scope
MergeSVG helps users visually compose multiple SVGs into a single, portable, self‑contained file—ideal for README banners and layouts that should not break due to external asset failures. Contributions should preserve:
- Client‑side only processing (privacy & speed).
- Predictable visual output (no broken external links).
- Simplicity of drag‑and‑drop interaction.
- Safety around untrusted SVG input.

## 2. Getting Started
Prerequisites:
- Node.js ≥ 20 (recommend latest LTS) and npm ≥ 10.

Setup:
```cmd
git clone https://github.com/whiteSHADOW1234/MergeSVG.git
cd MergeSVG
npm install
```

Run dev server (Turbopack):
```cmd
npm run dev
```
Build production bundle:
```cmd
npm run build
```
Start production server:
```cmd
npm start
```
Lint:
```cmd
npm run lint
```

## 3. Development Workflow
1. Fork the repository.
2. Create a feature branch from `main` (see naming below).
3. Make focused, incremental commits.
4. Ensure `npm run lint` passes before opening a PR.
5. Add/adjust documentation (README or inline) when behavior changes.
6. Open a Pull Request early if you want design feedback.

## 4. Code Style & Quality
- Language: TypeScript + React (Next.js App Router).
- Styling: TailwindCSS (keep utility classes purposeful; avoid redundant wrappers).
- Linting: ESLint config extends `next/core-web-vitals` + `next/typescript`. Fix all reported issues; do not introduce new warnings.
- Formatting: Prettier is not configured; follow existing patterns (2 spaces, descriptive names, avoid large anonymous functions).
- Avoid one‑letter variable names (except trivial indices). Prefer clarity (`uploadedSVGs`, `canvasSize`).
- Keep components presentational where possible; move logic to hooks under `src/app/hooks/`.
- Avoid unnecessary re-renders (memoize expensive computations, avoid recreating large objects inside render).

## 5. SVG Safety & Validation
User-supplied SVGs are potentially hostile. Current sanitation focuses on animation override removal in `src/app/utils/sanitize.ts` (`sanitizeAnimationOverrides`). If you enhance sanitation:
- Never execute inline scripts (`<script>` elements must be stripped).
- Remove or neutralize external references (`<image xlink:href>`, remote fonts) unless a secure embedding path is added.
- Preserve legitimate styling while blocking forced animation disabling or suspicious CSS.
- Validate that imported content begins with `<svg` before treating it as such (see `useSVGUpload.ts`).
- Document any new sanitation steps in this file and within the util.

## 6. Adding Features / Architecture Notes
- New UI components: place in `src/app/components/`. Keep them stateless if possible; move drag/manipulation logic to hooks or context.
- New hooks: place in `src/app/hooks/` with clear names (`useCanvasGrid`, `useExportOptions`). Keep side-effects isolated.
- Types: extend `src/app/types/svg.ts` for shared structures (`UploadedSVG`, `CanvasSVG`, `CanvasSize`). Update all dependent hooks/components.
- Utilities: put pure logic in `src/app/utils/`. Avoid coupling utilities to React.
- API routes: If adding server functionality (currently client-side only), create routes under `src/app/api/`. Keep them minimal and stateless; consider whether server involvement violates project privacy goals.
- Export logic: Adjust `src/app/utils/svgExport.tsx` (if extended) carefully—ensure exported SVG remains self-contained.

## 7. Commit Messages & Branch Naming
Use Conventional Commits for clarity and automated tooling compatibility:
```
<type>(optional scope): <short summary>

[optional body]
[optional footer]
```
Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `build`.
Examples:
- `feat(canvas): add snap-to-grid option`
- `fix(upload): validate svg mimetype fallback`

Branch naming examples:
- `feat/snap-grid`
- `fix/url-upload-error`
- `refactor/drag-handlers`

## 8. Pull Request Guidelines
Checklist before opening:
- PR title follows Conventional Commits style.
- Scope is focused (prefer multiple small PRs over a large one).
- All lint issues resolved (`npm run lint`).
- No dead / commented-out code left behind.
- Added or updated any necessary docs / inline comments (only where non-obvious).
- Tested manually in dev for core flows: upload (file + URL), drag, resize, export.

In the PR description include:
- What & Why: rationale for change.
- Screenshots / GIF for UI updates.
- Risk / rollback plan if touching core logic (upload, manipulation, export).
- Follow-ups (if any) to keep PR lean.

## 9. Issue Reporting
When filing an issue, include:
- Description of problem / enhancement.
- Steps to reproduce (if bug).
- Expected vs actual behavior.
- Environment (browser + OS + viewport size if canvas sizing relevant).
- Sample SVG(s) (inline or attached) if input-specific.

Label suggestions (if you can add labels): `bug`, `enhancement`, `question`, `security`, `performance`.

## 10. Performance & UX Considerations
- Avoid heavy recalculation on every mouse move; throttle or batch if adding complex interactions.
- Keep drag/resize handlers minimal (see `useSVGManipulation.ts`).
- Avoid large DOM trees—merge wrappers or fragments when possible.
- Defer expensive operations until export, not during every frame of interaction.
- Test resizing logic at various screen widths (canvas sizing uses window heuristics in `useCanvasResize.ts`).

## 11. Security / Responsible Disclosure
If you find a security vulnerability (e.g., XSS via crafted SVG), DO NOT open a public issue immediately. Instead:
1. Email the maintainer (check GitHub profile or repository owner contact).
2. Provide reproduction steps + malicious sample.
3. Allow reasonable time for a fix before public disclosure.

## 12. Questions & Discussion
Use GitHub Discussions or Issues for clarifications, architectural proposals, or design suggestions. For substantial re-architecture, propose a brief plan first to ensure alignment.

---
## Quick Reference
| Task              | Command          |
|-------------------|------------------|
| Install deps      | `npm install`    |
| Dev server        | `npm run dev`    |
| Build             | `npm run build`  |
| Start (prod)      | `npm start`      |
| Lint              | `npm run lint`   |

Thanks again for contributing—your improvements help everyone build reliable, beautiful SVG compositions.
