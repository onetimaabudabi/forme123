# COMPONENTS.md

# Component Architecture

This document describes the main reusable UI components used throughout Forme.

Every new feature should reuse these components whenever possible.

Avoid creating duplicate components with similar functionality.

---

# Navigation

MainTabBar

Bottom navigation.

Contains:

Home

Workout

Feed

Progress

Profile

---

# ProfileHeader

Displays:

Avatar

Username

Followers

Following

Friends

Streak

Join Date

Settings Button

Leaderboard Button

---

# FeedCard

Displays one post.

Contains:

Avatar

Username

Time

Text

Images

Video

Workout Preview

Like Button

Comment Button

Share Button

---

# CommentCard

Displays one comment.

Contains:

Avatar

Username

Comment

Timestamp

---

# NotificationCard

Displays one notification.

Supports:

Like

Comment

Follow

Friend Request

Challenge Invite

---

# WorkoutCard

Displays workout preview.

Contains:

Workout Name

Duration

Exercises

Difficulty

Complete Button

---

# WorkoutHistoryCard

Displays completed workout.

Contains:

Date

Duration

Calories

Exercises

Completion Status

---

# MealCard

Displays one meal.

Contains:

Meal Name

Calories

Protein

Carbs

Fat

---

# DailyChallengeCard

Displays today's AI challenge.

Contains:

Challenge

Progress

Complete Button

---

# ProgressCard

Displays fitness statistics.

Examples:

Weight

Calories

Sleep

Body Fat

Workout Count

---

# LeaderboardCard

Displays one leaderboard entry.

Contains:

Rank

Avatar

Username

Level

Streak

XP (future)

---

# FriendCard

Displays one friend.

Contains:

Avatar

Username

Current Streak

Invite Button

Remove Friend

---

# ChallengeCard

Displays Friendship Challenge.

Contains:

Friend Avatar

Progress

Current Day

Remaining Days

Completion Status

---

# AvatarCard

Displays user's avatar.

Contains:

Avatar

Current Outfit

Achievements

Level

---

# SettingsButton

Appears only in Profile Header.

Navigates to Settings.

---

# FloatingActionButton

Used for:

Create Post

Future:

Quick Workout

Quick Meal

---

# EmptyState

Reusable component.

Displays:

Illustration

Title

Description

Action Button

Used whenever collections are empty.

---

# LoadingSkeleton

Reusable loading placeholder.

Used in:

Feed

Profile

Workout

Notifications

Leaderboards

Search

---

# ErrorState

Reusable error component.

Contains:

Message

Retry Button

---

# Modal Components

Reusable:

Image Viewer

Video Viewer

Friend Picker

Challenge Picker

Avatar Customization

Workout Details

---

# Future Components

StoryCard

StoryViewer

ClubCard

MarketplaceCard

AvatarInventory

AvatarShop

AchievementCard

SeasonPassCard

WeeklyReportCard

AIInsightCard

---

# Component Rules

Every component should:

Be reusable.

Have one responsibility.

Support mobile.

Support dark mode.

Receive typed props.

Avoid duplicated logic.

Never directly depend on unrelated components.

Always prefer composition over duplication.