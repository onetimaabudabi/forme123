# KNOWN_BUGS.md

# Known Bugs

This document contains all currently known issues in Forme.

Every issue listed here should eventually be resolved before a stable production release.

When fixing bugs:

- Never introduce mock data.
- Never remove existing functionality.
- Maintain backward compatibility.
- Verify that Firestore data persists after refresh.
- Test on both desktop and mobile.

---

# Critical Bugs

These bugs have the highest priority.

---

## Firestore Data Not Displaying

Status:
Resolved in some modules, still verify everywhere.

Problem:

Data is correctly saved inside Firestore but is not always displayed after page refresh.

Affected modules:

- Workout History
- Nutrition
- Sleep Tracking
- Body Measurements
- Daily Challenge
- User Statistics

Expected behavior:

If data exists inside Firestore it must always be displayed immediately after loading the application.

---

## Realtime Synchronization

Some screens still require manual refresh.

Expected behavior:

Realtime listeners should update:

- Feed
- Notifications
- Followers
- Following
- Comments
- Likes
- Friend Requests

without refreshing the page.

---

# Feed

---

## Feed Ranking

Current:

Posts from everyone are displayed.

Future improvement:

Prioritize posts from followed users while still showing content from all users.

---

## Infinite Loading

Sometimes Feed may continue loading longer than expected.

Expected behavior:

Display skeleton loading.

Timeout gracefully.

Never freeze the application.

---

## Duplicate Posts

Potential issue:

Realtime listeners can occasionally display duplicate posts.

Expected behavior:

Each post appears exactly once.

---

## Deleted Posts

Expected behavior:

Deleting a post should immediately remove it from:

- Feed
- Profile
- Search
- Saved collections (future)

without refresh.

---

# Media Upload

---

## Upload Progress

Current:

Basic progress.

Future:

Improve progress indicator.

Support:

- upload percentage
- cancel upload
- retry upload

---

## Video Processing

Large videos may take noticeable time.

Expected behavior:

Display processing state.

Do not allow duplicate uploads.

---

# Comments

---

## Slow Updates

Comments occasionally appear with delay.

Expected behavior:

Realtime updates.

---

## Comment Counter

Counter must always equal the actual number of comments.

---

# Likes

---

## Like Counter

Verify that:

- Like count updates immediately.
- Refresh preserves value.
- Multiple devices stay synchronized.

---

## Like Button Position

Known issue:

Likes label alignment may break on small mobile screens.

Expected behavior:

Perfect alignment on all devices.

---

# Profile

---

## User Posts

Previously fixed.

Continue verifying that:

Every user's profile always displays only their own posts.

---

## Settings Button

Settings should always remain in the upper-right corner.

Never inside the profile content.

---

## Leaderboard Shortcut

Leaderboard belongs in the profile header.

Not inside Settings.

---

## Join Date

Should display:

"Joined Month Year"

Example:

Joined July 2026

---

## Streak

Display:

Current streak

Longest streak

---

# Workout History

Verify:

- Completed workouts appear instantly.
- Refresh keeps history.
- Deleting a workout updates statistics.

---

# Nutrition

Verify:

Daily entries remain after refresh.

Totals update correctly.

Charts update automatically.

---

# Sleep Tracking

Verify:

Sleep sessions:

- save
- edit
- delete
- display correctly

---

# Body Measurements

Verify:

Measurements:

- persist
- display charts
- calculate progress

---

# Notifications

Verify:

Likes generate notifications.

Comments generate notifications.

Follow generates notification.

Friend request generates notification.

Challenge invitation generates notification.

Notifications should never duplicate.

Unread counter should always remain accurate.

---

# Followers

Verify:

Follow

Unfollow

Follower counts

Following counts

Realtime synchronization

Profile synchronization

Feed ranking

---

# Friends

Verify:

Friend requests

Accept

Reject

Remove friend

Realtime updates

---

# Friendship Challenge

Future feature.

Known tasks:

- Daily streak
- Shared progress
- Notifications
- Completion rewards
- Challenge history

---

# Avatar System

Future feature.

Verify later:

- Character saving
- Clothing persistence
- Outfit synchronization
- Public profile display

---

# Performance

Known improvements:

- Reduce Firestore reads
- Improve Feed loading
- Lazy load videos
- Optimize image loading
- Reduce unnecessary rerenders

---

# Mobile UI

Verify every screen on:

- iPhone SE
- iPhone 13
- iPhone 15
- Android small screens

Known issues:

- Share button overlapping bottom navigation.
- Like label alignment.
- Small spacing inconsistencies.

---

# AI

Verify:

AI Coach

Workout Generator

Meal Plans

Daily Challenges

Requirements:

Never lose generated content after refresh.

Never regenerate automatically unless requested.

---

# Future QA Checklist

Before every production release verify:

✓ Authentication

✓ Feed

✓ Posting

✓ Cloudinary Uploads

✓ Likes

✓ Comments

✓ Notifications

✓ Followers

✓ Friends

✓ AI Coach

✓ Workout Generator

✓ Workout History

✓ Nutrition

✓ Sleep Tracking

✓ Body Measurements

✓ Leaderboards

✓ Profile

✓ Settings

✓ Mobile Layout

✓ Dark Mode

✓ Firestore Persistence

✓ Performance

---

# Development Rule

A feature is considered complete only if:

- It works correctly.
- Data persists.
- Refresh works.
- Mobile works.
- Desktop works.
- Firestore stays synchronized.
- No console errors appear.
- No TypeScript errors exist.
- Build passes successfully.

Only then may the feature be considered production-ready.