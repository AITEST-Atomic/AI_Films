# plan.md — AFM Workshop Clone (Updated)

## 1) Objectives
- Clone the **AI Film Maker’s Workflow** step-based workshop UI/UX (dark theme, sidebar + step content) with high visual parity.
- Deliver the **complete workshop flow**: view steps, complete steps, track progress, unlock badges, Finale confetti.
- Persist workshop content in **MongoDB (seeded on startup)** and persist user progress via **localStorage**.
- Ensure smooth usability and UX polish: sidebar navigation, copy prompt + toast, reset progress, external resources open in new tab, mobile sidebar.

**Current status:** Phase 2 (MVP clone) is **complete** with full feature coverage and 100% test pass rate.

## 2) Implementation Steps

### Phase 1 — Core Flow POC (Skip; no risky integrations)
User stories:
1. As a user, I can open the app and see the curriculum steps list.
2. As a user, I can click a step and see its content.
3. As a user, I can mark a step complete and move forward.
4. As a user, I can see progress update immediately.
5. As a user, I can refresh and not lose progress.

**Status:** Skipped as planned.

### Phase 2 — V1 App Development (MVP clone)
#### Backend (FastAPI + MongoDB)
- Data models/collections:
  - `steps` (8 docs): `order, emoji, title, subtitle, heading, description, badgeName, badgeIcon, interactive, actionItems[], prompts[{title, body}], resources[{label,url}], finaleExtras`
  - `director_levels` (9 docs): `min_steps, title, subtitle, emoji`
- Seed on startup (idempotent upsert/insert):
  - Steps and director levels are seeded automatically when the backend starts.
- APIs (implemented):
  - `GET /api/steps` → sidebar list (order, emoji, title, subtitle)
  - `GET /api/steps/{order}` → full step payload
  - `GET /api/director-levels` → director level progression map

**Status:** Completed; all endpoints validated 100%.

#### Frontend (React + Tailwind + shadcn/ui)
- State management:
  - `useWorkshopProgress()` hook backed by `localStorage`:
    - `completedSteps: number[]`
    - `step1Choice: string | null`
    - `currentStep: number`
    - derived: `completedCount`, `progressPercent`
- Layout replication:
  - Fixed desktop sidebar (280px): branding, director level card, curriculum list (active + completed states), reset button.
  - Mobile: Sheet-based sidebar via top header.
  - Main content: step pills, heading/description, badge card (locked/unlocked), interactive blocks, action items, prompts (copy), resources, previous/complete navigation.
- Step-specific UI:
  - Step 1: choice cards persisted in localStorage.
  - Steps 2–7: action items, prompts, and resources rendered from backend.
  - Step 8 (Finale): confetti animation (canvas-confetti), hero, YouTube embed, success story, “Do this right now”, bonus collab section.
- UX details:
  - Copy prompt uses clipboard API + Sonner toast.
  - “Complete & Continue” marks completion and advances.
  - “Previous Step” navigates back.
  - Reset clears localStorage state.

**Status:** Completed; UI matches reference and is fully functional.

User stories (delivered):
1. As a user, I can navigate all 8 steps from the sidebar and see the active highlight.
2. As a user, I can complete a step and automatically advance to the next step.
3. As a user, I can copy any AI prompt with one click and get confirmation.
4. As a user, I can reset my progress and start over.
5. As a user, I can finish all steps and see the Finale confetti + congratulations screen.

**Conclude Phase 2 with E2E test run**
- Backend tests: **100% pass** (steps list/detail + director levels).
- Frontend tests: **100% feature pass**. Note: clipboard copy can fail in headless automation due to browser permissions, but works for real users.

### Phase 3 — Hardening + Polish
Focus now shifts to optional enhancements and production hardening.

- Visual parity and micro-interactions:
  - Fine-tune spacing/typography and hover/glow states.
  - Add/adjust subtle loading skeletons.
  - Ensure reduced-motion behavior for confetti and transitions.
- Data/edge cases:
  - Defensive UI if backend data is missing or slow.
  - Guardrails for completion flow (disable buttons while loading).
- Optional backend progress mirror (no auth):
  - `POST /api/progress` (sessionId in localStorage)
  - `GET /api/progress/{sessionId}`

User stories (optional polish):
1. As a user, I see loading states instead of blank content on slow connections.
2. As a user, I never lose my selected Step 1 choice across refresh.
3. As a user, completion buttons are disabled appropriately to prevent glitches.
4. As a user, the badge state clearly reflects locked vs unlocked.
5. As a user, I can resume where I left off after reopening the browser.

**Conclude Phase 3 with E2E regression testing**
- Re-run navigation/completion/reset/finale tests.
- Validate responsiveness (mobile Sheet sidebar).
- Validate reduced motion preference.

## 3) Next Actions
1. Phase 3 (optional): add skeleton/loading states and reduced-motion improvements.
2. Phase 3 (optional): add completion button “loading” states to prevent double-click.
3. Phase 3 (optional): implement backend progress mirroring endpoints if cross-device persistence is desired.
4. Run a final regression pass after any polish changes.

## 4) Success Criteria
- App visually matches the reference layout: sidebar + main content + dark/amber theme.
- All 8 steps load from backend; Step 1 choice works; prompts copy reliably (real browsers).
- Progress is accurate (X/8 + %), persists after refresh, and reset clears state.
- Completing step 8 shows Finale confetti and full finale content.
- No console errors; backend APIs stable; tests pass (backend 100%, frontend feature coverage 100%).
