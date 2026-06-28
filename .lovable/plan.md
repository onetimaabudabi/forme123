This is a very large request. I'll split it into two phases so you get a working, audited build at the end of each phase rather than one giant unverified pass.

## Phase 1 — Persistence & core bug fixes (sections 1–9, 14, 18)

Goal: every screen reliably reads/writes Firestore; nothing disappears on refresh, tab change, or re-login.

1. **Workout plan persistence** — `getActivePlan` already exists but the screen state is in-memory. Add an `archived`/`completedAt` field; only show the latest non-archived plan. "Generate" only runs on explicit tap. On finish: archive the plan, log to `workouts`, then allow regeneration.
2. **Workout history** — extend `workouts` doc to store `exercises`, `sets`, `reps`, `durationMin`, `kcal`, `completedAt`. Update `history.tsx` to render from this collection with totals (this week, all-time).
3. **Meal plan persistence** — mirror the workout pattern in `mealPlans.ts`: load latest, only regenerate on explicit tap, archive on "Generate New".
4. **Daily mission** — audit `getOrCreateTodayMission`; ensure home and challenges screen both call it and share the same doc (no duplicates). Fix any race where the home screen creates a second mission.
5. **Streak** — verify `applyDailyCompletion` runs only via `toggleMission`, persists `streak`/`lastCompletedAt` on the user doc, and restores on load. Add missed-day reset on app open.
6. **Sleep / measurements** — both libs already write to Firestore; verify the UIs call them, refetch after save, support edit + delete. Add weekly/monthly averages for sleep and a simple progress chart for measurements.
7. **Activity calendar** — `activity.ts` already aggregates collections; ensure every new collection (completed workouts, meal logs, coach messages) is included and the calendar refetches on focus.
8. **Persistence audit** — sweep every route, replace any leftover `useState`-only data with Firestore reads, confirm data survives sign-out/in.

## Phase 2 — Social foundation (sections 10–13, 15–17)

Goal: scalable Firestore schema and minimal working friend/leaderboard/feed UI. No mock data.

1. **User discovery** — on profile creation, assign `username` (lowercased, unique) and `friendCode` (e.g. `FRM-482731`). Add a `usernames` lookup collection for uniqueness. Search screen queries by username prefix or exact friend code.
2. **Friend requests** — `friend_requests` collection with `fromUid`, `toUid`, `status` (`pending`/`accepted`/`declined`/`cancelled`). On accept, write two docs in `friends/{uid}/list/{friendUid}` for fast lookups.
3. **Friends list & public profile** — `/friends` shows accepted friends with avatar, username, streak, current goal. `/u/$username` (or `/profile/$uid`) shows only public fields (streak, longest streak, active days, total workouts, achievements, public calendar). Private data (weight, measurements, nutrition, AI chats) is never queried here.
4. **Leaderboards** — denormalize ranking metrics onto the user doc (`stats.totalWorkouts`, `stats.currentStreak`, `stats.longestStreak`, `stats.activeDays`, `stats.totalMissions`). Leaderboard screen queries `users` ordered by the chosen metric (global) or filters by friend list (friends-only). Weekly/monthly tabs use rolling counters updated on each write.
5. **Activity feed** — `activity_feed` collection with `uid`, `type`, `payload`, `createdAt`. Friends-only fan-out on read (query feed where `uid in friendUids`, capped at 10 per Firestore limit — paginate by friend group).
6. **Notification center** — `notifications/{uid}/items` subcollection. Write on friend request, accept, achievement, mission-available, streak-warning.
7. **Privacy settings** — `users.privacy = { feed, achievements, calendar, workouts, streak, leaderboard }` each one of `public`/`friends`/`private`. Public profile + feed reads honor these.
8. **Invites** — friend-code copy + share link (`/add/FRM-XXXXXX`). QR code via a small client lib if you want it now, otherwise stubbed.

## Out of scope for this pass

- Block user (foundation field only, no UI flow)
- Contacts import
- Push notifications (still local-only per earlier decision)
- Real-time presence / "online indicator" (would need RTDB or heavy Firestore writes — left as future)

## Deliverable per phase

After each phase I'll run the build, click through the main screens via Playwright if needed, and post a short report: fixed bugs, Firestore collections touched, remaining issues.

## Question before I start

Phase 1 alone is already a big pass. Do you want me to:
- **(A)** Ship Phase 1 first, report back, then do Phase 2 in a follow-up — safer, each phase is verified.
- **(B)** Do both phases in one go — faster but the social UI will be minimal (list + request + leaderboard + feed scaffolding, no polish) and harder to QA.

Reply A or B and I'll proceed.