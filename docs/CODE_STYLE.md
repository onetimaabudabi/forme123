# CODE_STYLE.md

# Forme Development Guidelines

## Philosophy

Every change should improve the project.

Never rewrite working code without reason.

Always prefer extending existing functionality over replacing it.

---

# Code Quality

Requirements:

- Production-ready code only
- No placeholders
- No TODOs left unfinished
- No mock data
- No temporary hacks

Every feature should work immediately after implementation.

---

# TypeScript

Always use TypeScript.

Avoid:

- any
- unknown (unless necessary)

Prefer:

Interfaces

Types

Enums

Generics

Every function should have proper typing.

---

# React

Use:

Functional Components

React Hooks

Reusable Components

Avoid duplicated code.

Split large components into smaller ones.

---

# Components

One component = one responsibility.

Examples:

FeedCard

WorkoutCard

ProfileHeader

NotificationItem

ChallengeCard

AvatarCard

Never create giant components.

---

# State Management

Prefer:

React Context

Custom Hooks

Firestore Realtime

Avoid unnecessary local state.

---

# Firestore

Firestore is the source of truth.

Never create local copies of database state unless required.

Always synchronize UI with Firestore.

---

# Cloudinary

Only Cloudinary stores media.

Firestore stores only:

secure_url

Never store base64 images.

Never store blobs.

---

# Styling

Use existing design system.

Apple Human Interface Guidelines.

Large spacing.

Rounded corners.

Minimal interface.

Premium appearance.

Never introduce inconsistent styling.

---

# Naming

Components:

PascalCase

Example:

WorkoutCard

ProfileHeader

FeedPost

Hooks:

useSomething

Example:

useFeed()

useNotifications()

Variables:

camelCase

Constants:

UPPER_CASE

---

# Folder Structure

components/

pages/

hooks/

services/

contexts/

utils/

types/

firebase/

Never place unrelated files together.

---

# Performance

Always optimize:

Firestore reads

Cloudinary images

React rendering

Lazy loading

Memoization where useful

---

# Error Handling

Every async request must include:

Loading

Success

Error

Retry

Users should never see blank screens.

---

# Mobile

Every feature must work on:

Desktop

Tablet

Phone

No overlapping buttons.

No overflowing content.

---

# Accessibility

Buttons must be clickable.

Touch targets should be large.

Text must remain readable.

Support Dark Mode.

---

# Before Finishing

Always verify:

Build succeeds.

No TypeScript errors.

No console errors.

No Firestore errors.

No Cloudinary errors.

Feature survives refresh.

Feature works on mobile.

No duplicated code introduced.

---

# Development Rule

Every implementation should make Forme feel more polished, faster and easier to use.