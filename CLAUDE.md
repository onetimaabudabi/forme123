# CLAUDE.md

# Forme Development Guide
# Before writing any code

Before implementing any feature you MUST read the following documentation:

docs/PROJECT_SPEC.md

docs/ARCHITECTURE.md

docs/CODE_STYLE.md

docs/FIRESTORE.md

docs/UI_GUIDELINES.md

docs/SOCIAL.md

docs/KNOWN_BUGS.md

docs/FEATURE_REQUESTS.md

If the requested feature relates to AI:

docs/AI_SYSTEM.md

docs/AI_VISION.md

If the feature relates to avatars:

docs/avatar-system.md

If the feature relates to Friendship Challenges:

docs/friendship-challenge.md

If the feature relates to leaderboards:

docs/LEADERBOARD_V2.md

Always follow those documents.

Never ignore them.
## Project Overview

You are working on **Forme**, a production-quality fitness social network.

Forme combines:

- AI fitness coaching
- Social networking
- Workout tracking
- Nutrition
- Sleep tracking
- Body measurements
- Gamification
- Friends
- Challenges
- Progress analytics

This is NOT a prototype.

This is intended to become a production mobile application.

Every implementation must be production ready.

---

# Core Principles

Before making ANY code changes:

- Read the existing architecture.
- Understand how the current feature works.
- Reuse existing components.
- Never duplicate logic.
- Never create duplicate services.
- Never redesign existing UI unless explicitly requested.
- Keep backwards compatibility.
- Preserve existing user data.
- Always prefer extending existing code instead of replacing it.

---

# Tech Stack

Frontend

- React
- Vite
- TypeScript

Backend

- Firebase Authentication
- Cloud Firestore

Storage

- Cloudinary

Artificial Intelligence

- Groq API

Deployment

- Vercel

---

# Design Philosophy

Forme follows Apple's Human Interface Guidelines.

The application should feel native on iPhone.

Requirements:

- clean
- modern
- minimalistic
- premium
- elegant

UI rules:

- Large rounded corners
- Clean spacing
- High readability
- Smooth animations
- Native transitions
- Minimal shadows
- No unnecessary gradients

Support:

- Light Theme
- Dark Theme

Never redesign existing pages unless explicitly requested.

---

# Architecture

Always understand the architecture before coding.

Never create duplicate:

- components
- hooks
- utilities
- services
- Firebase helpers

Search the existing project first.

Reuse existing code whenever possible.

Keep code modular.

---

# Firestore Rules

Firestore is the single source of truth.

Never use mock data.

Never use fake data.

Always persist data.

Whenever possible:

Use realtime Firestore listeners.

Data must survive:

- refresh
- logout
- login
- browser restart
- device restart

---

# Authentication

Authentication uses Firebase Authentication.

User data must always be linked to the authenticated user.

Never expose private data.

---

# AI

Groq powers all AI features.

Current AI systems include:

- AI Coach
- Workout Generator
- Meal Plan Generator
- Daily Challenge Generator

Future AI:

- AI Vision
- Voice Coach
- Personal Trainer

Requirements:

Chat history always persists.

Workout generations remain until replaced.

Meal plans remain until replaced.

Daily challenges are generated once per day.

---

# Social Network

Forme is also a social network.

Current features:

- Feed
- Posts
- Images
- Videos
- Comments
- Likes
- Notifications
- Followers
- Following
- Friends

Feed requirements:

Show posts from everyone.

Prioritize followed users.

Never hide user content accidentally.

Profile must display the user's own posts.

Posts are stored in Firestore.

Media is stored in Cloudinary.

---

# Fitness

Current systems:

Workout Generator

Workout History

Nutrition

Meal Plans

Sleep Tracking

Body Measurements

Weight History

Activity Calendar

Progress Dashboard

Daily Challenge

Workout data must persist.

Workout history must always reflect completed workouts.

---

# Notifications

Notifications exist for:

Likes

Comments

Friend requests

Friend request accepted

Challenge invitations

Challenge completed

Future:

Mentions

Achievements

Milestones

---

# Friends

Users can:

Search by username

Send requests

Accept requests

Remove friends

View profiles

Future:

Friendship Challenge

Groups

Teams

---

# Performance

Always optimize:

Firestore reads

Firestore writes

Realtime listeners

Image loading

Video loading

Avoid unnecessary renders.

---

# Cloudinary

Cloudinary stores:

Images

Videos

Only secure_url should be stored inside Firestore.

Never store temporary upload URLs.

---

# Error Handling

Every feature must gracefully handle:

Offline mode

Permission denied

Network errors

Upload failures

Empty states

Loading states

---

# Code Quality

Always:

Run build before finishing.

Fix:

TypeScript errors

Build errors

Runtime errors

Lint warnings (when appropriate)

Never leave:

TODO

FIXME

placeholder implementations

dead code

unused imports

---

# Git

For every large feature:

Create a feature branch.

Use meaningful commit messages.

Never commit broken code.

---

# Response Format

Before coding:

Explain the implementation plan.

After coding:

Summarize:

- files changed
- components added
- services added
- hooks added
- Firestore collections changed
- security rules affected
- possible future improvements

---

# Documentation

Whenever implementing a major feature:

Update the documentation inside /docs.

Documentation should always match the implementation.

---

# Future Vision

Forme is evolving into a complete fitness ecosystem.

Future roadmap includes:

- Friendship Challenges
- 3D Avatars
- Wearable integration
- AI Vision
- Apple Health
- Apple Watch
- Fitness Clubs
- Marketplace
- Premium subscriptions

Every new feature should be implemented with future scalability in mind.