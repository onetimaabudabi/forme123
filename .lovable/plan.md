# Read-Pipeline Audit & Bug Fix Plan

Focus: fix READ + UI-sync bugs. Do not touch working write logic. Keep the Apple-inspired UI intact.

## What I found in the current code

- **Friends leaderboard** — `listFriendUids` + `getFriendsLeaderboard` do work, but the Leaderboard route only refetches when `profile` changes. After navigating away and back, TanStack keeps the component mounted long enough that new friends don't appear. Same pattern on Feed and Friends screens.
- **Workout sharing** — Share writes to `activity_feed` via `postActivity`, but the Feed tab never refetches when refocused, so the post looks like it "wasn't published".
- **Daily Challenge** — `getOrCreateTodayMission` picks from a static array. No AI, no display on Home Screen, no link to Activity Calendar entries.
- **Workout History** — `logCompletedWorkout` already stores exercises. History route reads correctly, but a new completion doesn't invalidate the list on return.
- **Measurements / Sleep / Nutrition / Water** — writes and reads are correct; problem is stale-state after add/delete (route already mounted) and missing on-focus refetch.
- **Meal Plans** — persistence works via `getLatestMealPlan`. Route needs to always restore the latest instead of showing an empty state on first mount race.
- **Workout Persistence** — `getActivePlan` restores non-archived plan; verified correct. No change needed beyond focus-refetch.
- **Activity Calendar** — `activity.ts` collects from many collections. Need to make sure daily-challenge completions are also written to the source of truth it reads.
- **Home Screen** — no daily-challenge card component today.
- **AI Chat** — currently single conversation in state. Needs Firestore-backed conversation list.
- **Username system** — `ensureUserIdentity` allocates one automatically. Sign-up form doesn't collect a chosen username, and edit-profile doesn't allow changing it with uniqueness validation.

## Plan (grouped by delivery slice)

### Slice A — Read/refresh reliability (fixes 1, 2, 4, 5, 6, 7, 8, 9, 10 in one shot)
Add a small `useFocusRefetch(fn, deps)` hook and wire it into every list screen so returning to the tab re-runs the Firestore query. This is the single highest-impact fix and resolves most "data doesn't show" reports without touching writes or UI.

Screens updated: `_tabs.feed`, `_tabs.workout`, `_tabs.index`, `leaderboard`, `friends`, `history`, `measurements`, `sleep`, `nutrition`, `meal-plan`, `activity`, `notifications`.

Also: after `share()` in workout, invalidate feed cache flag in `sessionStorage` so Feed refetches on next mount.

### Slice B — Daily Challenge (fix 3 + 11)
- Replace static picker in `missions.ts` with `generateAIChallenge(profile)` calling `groqJSON`, deterministic per-day (`YYYY-MM-DD` doc id under `missions/{uid}/daily/{date}`) so it can never regenerate the same day.
- Fallback to static list if AI fails.
- Add a "Today's challenge" card to `_tabs.index.tsx` linking to `/challenges`.
- On completion, also write to activity feed / activity calendar source (already done via `postActivity` and streak; verify calendar picks it up).

### Slice C — Friends leaderboard correctness (fix 1)
- Ensure users without `stats` still appear (already the case for friends scope).
- Show self and confirm friend uids are pulled from `friends/{uid}/list`.
- Add auto-refetch on route focus (from Slice A).

### Slice D — Username in registration (fix 13)
- Add a `username` field to `profile-setup.tsx`, validated with `resolveUsername` before submit. Pass preferred name to `ensureUserIdentity`.
- Add "Change username" row in `edit-profile.tsx` with uniqueness check via Firestore transaction (reuse `ensureUserIdentity`-style claim).
- Verify Feed / Leaderboard / Friends already show `@username` (they do).

### Slice E — AI Chat multi-conversation (fix 12)
- New collections: `ai_chats/{uid}/threads/{threadId}` (title, updatedAt) and `ai_chats/{uid}/threads/{threadId}/messages`.
- Refactor `_tabs.coach.tsx` to include a compact thread list drawer with create / rename / delete / switch. Preserve existing chat UI.
- All chats persist and restore.

### Slice F — Firestore audit checklist (fix 14 + 15)
After the above, run through each collection and confirm:
- write → read → render survives refresh, navigation, logout/login.
- Fix anything discovered (mostly indexes; document required composite indexes in `.lovable/plan.md`).

## What I will NOT change
- The Apple-inspired visual style.
- Working write logic in `workouts.ts`, `mealPlans.ts`, `nutrition.ts`, `sleep.ts`, `measurements.ts`, `weights.ts`, `friends.ts`.
- Existing routes / navigation structure.
- Feed / Leaderboard / Friends UI layout.

## Delivery order

Recommend shipping in this order for a single-turn implementation:
1. Slice A (biggest UX win, smallest risk)
2. Slice B (unblocks Home + Challenges + Calendar)
3. Slice C (already 90% working after A)
4. Slice D (registration + edit-profile username)
5. Slice E (AI chat multi-conversation)
6. Slice F (final QA + index docs)

Reply **all** to ship all six slices in one pass, or list the slice letters you want first (e.g. `A B C`).
