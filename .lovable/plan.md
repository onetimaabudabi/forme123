This is an enormous scope — 17 sections covering persistence fixes, social interactions (likes/comments), XP/leveling, multi-conversation AI chat, and a proactive AI health assistant. Trying to ship it all in one pass will produce shallow, unverified work across every area. I'll split it into 4 phases so each phase is testable.

---

## Phase A — Persistence, navigation & workout share (sections 1–12)

Goal: every screen reliably reads/writes Firestore; Feed becomes the default tab; completed workouts can be shared.

1. **Workout completion modal (1)** — Apple-style sheet on workout finish with "Share" / "Not now". Share writes a `workout_completed` post (title, duration, exercises, kcal, date) to `activity_feed` so friends see it.
2. **Workout plan persistence (2)** — audit `getActivePlan` / generation flow. Plans never auto-regenerate; only on explicit tap or after completion archives the plan.
3. **Meal plan persistence (3)** — same pattern in `mealPlans.ts`. Add manual delete.
4. **Daily mission (4)** — single transactional `getOrCreateTodayMission`, shared by home + mission page, no duplicates.
5. **Streak (5)** — verify writes on mission complete AND workout complete; restore from Firestore; missed-day reset on app open.
6. **Activity calendar (6)** — confirm all 7 sources (workouts, missions, meals, water, sleep, weight, coach) feed `activity.ts`; refetch on focus.
7. **Friends page (7)** — fix load after accept; show avatar, username, streak; link to `/u/$uid`; loading + empty states.
8. **Progress persistence (8)** — sweep every route, replace lingering `useState`-only data with Firestore reads.
9. **Bottom nav reorder (9)** — Feed → Home → Workout → AI Coach → Profile. Feed becomes post-login landing. Move `/feed` under `_tabs`. No visual redesign.
10. **Social feed posts (10)** — already partially exists; ensure workout/achievement/mission/streak posts all write with avatar, username, timestamp, type, optional caption.
11. **Firestore audit (11)** — quick sweep matching writes ↔ reads.
12. **QA report (12)** — short status report at end of phase.

## Phase B — Social interactions + XP/level system (sections 13–14)

1. **Likes & comments (13)** — `activity_feed/{postId}/likes/{uid}` and `/comments/{commentId}`. Real-time `onSnapshot`. Apple-style bottom sheet for comments. Like/unlike toggle, comment create/delete-own. Counts on post card. Architecture leaves room for reactions/replies/mentions.
2. **XP & levels (14)** — `xp.ts` with action→XP table (workout, mission, weight log, nutrition log, sleep log, AI workout, streak day, achievement). Denormalize `xp`, `level` on user doc. Level curve + badges at 1/5/10/25/50. Progress bar component on profile + home. Schema supports future seasonal/boost multipliers.

## Phase C — AI chat 2.0 (sections 15–16)

1. **Multi-conversation schema** — `ai_chats/{chatId}` (uid, title, createdAt, updatedAt, messageCount, lastMessage, pinned), `ai_messages/{chatId}/items/{msgId}` (role, content, timestamp). Migrate existing `messages` collection on first read.
2. **Chat list screen** — sorted by `updatedAt`, search, pin, rename, delete. Apple list style.
3. **Auto-title** from first user message via Groq.
4. **Per-chat history + global memory** — `ai_memory/{uid}` snapshot regenerated nightly / on demand from profile, workouts, weights, missions, streak, achievements. Injected into every new chat's system prompt.
5. **Chat UX** — markdown (react-markdown + remark-gfm for tables), copy message, regenerate last, edit last user message, retry failed, streaming + typing indicator (already partly done).
6. **Memory settings** — Remember everything / health only / disabled, plus clear-one and clear-all.
7. **Pagination** — load latest 30 messages, fetch older on scroll-up.

## Phase D — Proactive AI health assistant (section 17)

1. **Daily Insight** — server-style function (client-side scheduled on app open, max once/day per user) generates one insight from yesterday's data → `ai_insights/{uid}/items`. Shown on Home.
2. **Weekly + monthly reports** — same pattern, gated by `lastWeeklyReportAt` / `lastMonthlyReportAt`.
3. **Smart detection** — `health-signals.ts` computes plateaus, missed workouts, sleep drops, streak risk. Feeds insight prompt + smart reminders.
4. **Recovery score & consistency score** — pure functions over Firestore data, surfaced on Home.
5. **AI timeline** — append milestones (PRs, streak records, weight milestones) to `ai_timeline/{uid}/items`.
6. **Smart Home dashboard** — Home shows: today's insight, mission, streak, next milestone, suggested workout/meal, recovery score, sleep score, hydration, weekly progress. All live from Firestore.
7. **Personalized coaching memory** — preferences / favorite exercises stored in `ai_memory.preferences`, updated when AI detects patterns.

---

## Out of scope (deferred — too speculative without product decisions)

- Voice mode, image/posture/food-photo recognition, wearable integration, AI-generated long-term plans — all listed as "future ready" in your message. I'll structure the schema to allow them but not build UI.
- Real-time presence indicators, blocking, contacts import.
- Push notifications (still local-only).

---

## Suggested execution order

Phase A is the biggest correctness win and unblocks everything social. Phase B adds the engagement layer. Phases C and D are net-new product surface.

**Which way do you want me to go?**

- **(1)** Ship Phase A only, report back, then decide on B/C/D. Safest, each phase is verified end-to-end.
- **(2)** Ship A + B in one pass — persistence + likes/comments + XP. Doable, social UI will be functional but minimal.
- **(3)** All four phases in one pass — fast, but AI chat 2.0 and proactive insights will be scaffolded (working schema + basic UI) not polished, and QA will be shallow.

Reply 1, 2, or 3.