# Engineer Zero Build Checkpoint — 2026-07-17

## Purpose

This document records the project state immediately before the Coding Developer curriculum detour. It predates repository initialization; the later Coding Developer checkpoint records the current shared-program work.

## Current Product State

- Next.js / TypeScript web application with two career tracks: Applied AI Operations Engineer and IT Support Technician.
- Learner progress, drafts, activity attempts, readiness, projects, and theme preferences persist locally in the browser for the personal-pilot experience.
- The Applied AI Operations Engineer track has an interactive Course Runner with deterministic grading, saved evidence, revision flow, missions, labs, sources, and local draft recovery.
- The AIO 48-Hour Interview Sprint has eight authored academic lesson sequences. The Foundation Bridge and larger catalog remain compatible with the same reader through a migration adapter.
- Supabase, payment, live-coach, reviewer approval, and managed code execution foundations exist only in planned/partial form; browser-local pilot behavior remains the active path.

## Academic Course Remodel Completed

- Replaced the AIO Course Runner's card/alert-stack presentation with a reader-first layout.
- Added semantic course blocks: prose, case study, worked example, key takeaway, misconception, and evidence asset.
- Moved objectives, boundaries, escalation guidance, evidence requirements, and sources into one expandable Course Guide.
- Added a short saved application prompt within the first fictional case of a lesson.
- Applied quiet academic typography and contrast-safe reading tokens to the shared learning shell, activity lists, Projects, Interview Studio, and Readiness surfaces.
- Retained all existing scoring, drafts, capability levels, and evidence behavior.

## Verification at Checkpoint

- `npm run lint -- --quiet` passed.
- `npm test` passed: 16 tests.
- `npm run build` passed.
- Browser review confirmed the AIO reader has no horizontal overflow and its Course Guide expands correctly.
- The Impeccable detector reported no current findings for the primary AIO course and learning-shell components.

## Relevant Architecture

- `lib/course-types.ts`: course/lab/mission schemas and semantic `CourseBlock` type.
- `lib/aio-content.ts`: AIO Sprint, Fast Track, Master Track, labs, missions, and interview content.
- `lib/aio-foundation.ts`: six-week AIO Foundation Bridge and role-concept library.
- `components/AioCourseSurface.tsx`: catalog display, compatibility adapter, Course Guide, academic lesson renderer, and evidence flow.
- `lib/types.ts` and `lib/tracks.ts`: career-track definitions and learner-state model.

## Coding Developer Architecture Decision

Coding Developer should be implemented next as a **shared standalone program module**, not as a third career track.

- It needs its own catalogue, progression, practice artifacts, assessments, and completion evidence.
- AIO should consume it through mapped prerequisites and a role-specific “Applied Coding for AIO” bridge, rather than duplicating foundational coding lessons.
- Future tracks can reuse it selectively: IT Support for scripting/automation; Backend Engineering for the full program; AI Product/AI Solutions tracks for targeted modules.
- A future standalone Developer career track can be created later by combining this shared module with specialized backend, systems, and interview-capstone modules.

## Safe Starting Point for the Next Build

Do not replace or delete the existing AIO Foundation Bridge during the Coding Developer build. First create a shared-program registry and expose the Coding Developer module alongside Tracks. Then migrate AIO Foundation lessons to reference the shared module while preserving current AIO activity IDs, attempt records, and readiness evidence.
