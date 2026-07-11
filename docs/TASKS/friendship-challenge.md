# friendship-challenge.md

# Friendship Challenge

## Overview

The Friendship Challenge is a social gamification feature inspired by Duolingo Friend Streaks.

The purpose is to help users stay consistent by completing workouts together.

Instead of competing against each other, both users cooperate toward the same goal.

The challenge is only successful if both participants remain active.

---

# Goal

Increase motivation through accountability.

Users are far less likely to skip workouts if another person depends on them.

The feature should encourage:

- consistency
- communication
- healthy competition
- long-term retention

---

# Requirements

A challenge can only exist between two friends.

Users cannot start a challenge with someone who is not in their friends list.

Only one active Friendship Challenge may exist per user.

A new challenge can only be created after the previous one has ended.

---

# Creating a Challenge

Flow:

Workout Screen

↓

Friendship Challenge

↓

Invite Friend

↓

Choose Friend

↓

Choose Duration

↓

Send Invitation

↓

Friend Accepts

↓

Challenge Starts

---

# Challenge Length

Supported durations:

- 7 Days
- 14 Days
- 21 Days
- 30 Days
- 60 Days
- 90 Days

Future:

Custom duration.

---

# Invitation

When inviting a friend:

The sender selects:

- friend
- challenge duration

The invited user receives a notification.

Notification example:

**"Alex invited you to a 14-day Friendship Challenge."**

Buttons:

Accept

Decline

---

# Challenge Rules

Every day:

Both users must complete at least one workout.

Workouts may be:

- AI Workout
- Manual Workout
- Imported Workout (future)

Only completed workouts count.

Starting a workout does not count.

---

# Daily Completion

Every day has three possible states.

Completed

Missed

Pending

The UI should clearly display the current state.

---

# Missing a Day

If one participant misses a day:

The challenge immediately ends.

Both users receive a notification.

Example:

"You missed today's workout. Your Friendship Challenge has ended."

---

# Successful Completion

If both users complete every required day:

The challenge is completed successfully.

Rewards are granted to both participants.

---

# Rewards

Current rewards:

- Badge
- Challenge Completed statistic

Future rewards:

- XP
- Coins
- Avatar Items
- Exclusive Titles
- Profile Badge

---

# User Interface

Challenge Card should display:

Friend Avatar

Friend Name

Challenge Length

Current Day

Days Remaining

Current Streak

Completion Percentage

Progress Bar

---

Example:

Day 5 / 14

████████░░░░░░

36%

---

# Progress

Both users always see the same progress.

Progress updates immediately after a completed workout.

No refresh should be required.

Realtime listeners should be used.

---

# Workout Validation

A workout counts only if:

- Completed
- Saved to Firestore
- Belongs to the current day

Deleted workouts should remove that day's completion.

---

# Notifications

Notifications include:

Challenge Invitation

Challenge Accepted

Workout Completed

Friend Completed Today's Workout

One Day Remaining

Challenge Completed

Challenge Failed

Examples:

"Emma completed today's workout."

"You both have 3 days remaining."

"Congratulations! You completed your Friendship Challenge."

---

# Profile Integration

Profiles should display:

Current Active Challenge

Completed Challenges

Longest Challenge

Challenge Win Rate (future)

---

# Feed Integration

Completing a Friendship Challenge can automatically generate a Feed post.

Example:

🏆

Alex and Emma completed a 30-Day Friendship Challenge.

Users may choose:

Share

Don't Share

---

# Leaderboard Integration

Future versions may rank users by:

Completed Challenges

Longest Challenge

Perfect Challenges

---

# Firestore Structure

Collection:

friendshipChallenges

Suggested fields:

id

userA

userB

status

duration

currentDay

startDate

endDate

completedDaysUserA

completedDaysUserB

completed

failed

winner

createdAt

updatedAt

---

# Challenge Status

Possible values:

pending

active

completed

failed

cancelled

---

# Challenge History

Users can view previous challenges.

Each entry displays:

Friend

Duration

Result

Start Date

End Date

Completed Days

---

# Future Improvements

Future ideas:

Group Challenges

3+ participants

Weekly Goals

Monthly Events

Seasonal Challenges

Global Challenge Events

Club Challenges

AI-generated challenge recommendations

Apple Health workout validation

Watch synchronization

---

# Design Guidelines

The Friendship Challenge should feel motivating rather than stressful.

Visual style should be inspired by Duolingo:

- colorful progress
- clear streak visualization
- rewarding completion animations
- positive encouragement
- celebration after success

Users should always feel encouraged to continue, even after failing a challenge.

---

# Success Criteria

The feature is considered complete when:

✓ Friends can invite each other.

✓ Invitations are delivered.

✓ Challenges start correctly.

✓ Daily workouts update progress.

✓ Firestore stores all challenge data.

✓ Realtime synchronization works.

✓ Notifications are delivered.

✓ Challenge history is saved.

✓ Rewards are granted.

✓ Mobile and desktop UI work correctly.

✓ No data is lost after refresh.

✓ No duplicate challenges can exist.

---

# Long-Term Vision

Friendship Challenges should become one of the primary reasons users return to Forme every day.

The feature should encourage consistency, strengthen friendships, and make fitness feel collaborative instead of lonely.

Together with AI, social features and avatars, Friendship Challenges will become one of the defining features of the Forme ecosystem.