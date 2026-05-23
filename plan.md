# plan.md — AFM Workshop Clone

## 1) Objectives
- Clone the **AI Film Maker’s Workflow** step-based workshop UI/UX (dark theme, sidebar + step content).
- Deliver the **core workshop flow**: view steps, complete steps, track progress, unlock badges, finale confetti.
- Persist workshop content in **MongoDB** (seeded) and persist user progress via **localStorage** (and optionally mirror to backend).
- Ensure smooth usability: sidebar navigation, copy prompt, reset, resources open in new tab.

## 2) Implementation Steps

### Phase 1 — Core Flow POC (Skip; no risky integrations)
User stories:
1. As a user, I can open the app and see the curriculum steps list.
2. As a user, I can click a step and see its content.
3. As a user, I can mark a step complete and move forward.
4. As a user, I can see progress update immediately.
5. As a user, I can refresh and not lose progress.

(We’ll implement directly; the “core” is internal state + UI, no external integration.)

### Phase 2 — V1 App Development (MVP clone)
**Backend (FastAPI + MongoDB)**
- Create data models/collections:
  - `steps` (8 docs): id, order, title, emoji, description, badgeName, badgeIcon, interactiveSpec, actionItems[], prompts[{title, body}], resources[{label,url}], finaleExtras.
- Seed steps on startup (idempotent upsert by `order` or `slug`).
- APIs:
  - `GET /api/steps` → minimal list for sidebar (order, title, emoji).
  - `GET /api/steps/{order}` → full step payload.
  - (Optional) `GET /api/seed/status` for debugging.

**Frontend (React + Tailwind + shadcn/ui)**
- Routing:
  - `/step/:order` main route; redirect `/` → `/step/1`.
- State:
  - `useWorkshopProgress()` hook backed by `localStorage`:
    - completedSteps: number[]
    - step1Choice: string | null
    - derived: progressPct, currentLevel, nextBadge
- Layout replication:
  - Fixed left sidebar with: logo/title, director level card (progress bar, X/8, %), curriculum list, footer + Reset.
  - Main content area (scrollable) with:
    - step pills (STEP X + X/8)
    - title + description
    - badge card (locked/unlocked visual)
    - interactive block (Step 1 choice cards)
    - action items list
    - AI prompts with code block + **Copy Prompt**
    - resources buttons opening new tab
    - footer nav: Previous + Complete & Continue
- Step-specific UI:
  - Step 1: selectable choice cards (persist in localStorage).
  - Steps 2–7: render prompts/action items/resources from backend.
  - Step 8 Finale: confetti overlay + congratulations panel + embedded video section.
- UX details:
  - Copy prompt → clipboard + toast.
  - Complete & Continue:
    - marks current step complete
    - navigates to next step (or Finale)
    - updates badge unlock state
  - Sidebar step click allowed anytime.
  - Reset clears localStorage and returns to step 1.

User stories:
1. As a user, I can navigate all 8 steps from the sidebar and see the active highlight.
2. As a user, I can complete a step and automatically advance to the next step.
3. As a user, I can copy any AI prompt with one click and get confirmation.
4. As a user, I can reset my progress and start over.
5. As a user, I can finish all steps and see the Finale confetti + congratulations screen.

**Conclude Phase 2 with E2E test run**
- Validate: load app, sidebar renders 8 steps, complete steps 1→8, refresh persistence, reset works.

### Phase 3 — Hardening + Polish
- Visual parity improvements:
  - amber glow borders, lock icon states, hover states, typography scale.
  - progress bar animation, badge unlock micro-animation.
- Data/edge cases:
  - Handle missing backend data (fallback UI, skeleton loading).
  - Prevent double-complete; allow uncomplete only via Reset.
- Optional backend progress mirror (still no auth):
  - `POST /api/progress` (sessionId in localStorage) + `GET /api/progress/{sessionId}`.

User stories:
1. As a user, I see loading states instead of blank content on slow connections.
2. As a user, I never lose my selected Step 1 choice across refresh.
3. As a user, completion buttons are disabled appropriately to prevent glitches.
4. As a user, the badge state clearly reflects locked vs unlocked.
5. As a user, I can resume where I left off after reopening the browser.

**Conclude Phase 3 with E2E regression testing**
- Test all navigation paths, copy buttons, reset, finale rendering, responsiveness.

## 3) Next Actions
1. Define and write the 8-step content as a single backend seed payload (JSON in code).
2. Implement backend `steps` APIs + seed-on-startup.
3. Replace current frontend placeholder with layout + routing + API fetch.
4. Implement localStorage progress hook + completion/navigation logic.
5. Implement Step 8 confetti + embedded video block.
6. Run E2E tests and iterate on UI parity.

## 4) Success Criteria
- App visually matches the reference layout: sidebar + main content + dark/amber theme.
- All 8 steps load from backend; Step 1 choice works; prompts copy reliably.
- Progress is accurate (X/8 + %), persists after refresh, and reset clears state.
- Completing step 8 shows Finale confetti and congratulations content.
- No console errors; all core flows pass E2E test.