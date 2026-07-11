# Firestore Database Documentation

# Overview

Cloud Firestore is the primary database used by Forme.

Firestore is the single source of truth for all application data.

Cloudinary is used only for media storage. Firestore stores only the returned `secure_url`.

All user-facing features must read and write real Firestore data. Mock data must never be used.

---

# General Rules

- Every document must contain `createdAt`.
- Every editable document should contain `updatedAt`.
- Every user-specific document must contain `userId`.
- All timestamps use Firebase Timestamp.
- Use realtime listeners (`onSnapshot`) whenever the UI should update automatically.

---

# Collections

## users

Stores user profile information.

Required fields:

- uid
- username (unique)
- displayName
- email
- avatar
- bio
- goal
- age
- gender
- height
- weight
- streak
- longestStreak
- followersCount
- followingCount
- friendsCount
- workoutsCompleted
- joinDate
- createdAt
- updatedAt

---

## posts

Stores all social feed posts.

Fields:

- authorId
- username
- displayName
- avatar
- text
- media (array of Cloudinary URLs)
- workoutId (optional)
- likeCount
- commentCount
- createdAt
- updatedAt

Media can contain:

- multiple images
- one video

Posts must remain visible after refresh.

---

## comments

Stores comments for posts.

Fields:

- postId
- authorId
- username
- text
- createdAt

Comments update in realtime.

---

## likes

Stores likes for posts.

Fields:

- postId
- userId
- createdAt

Each user can like a post only once.

---

## notifications

Stores user notifications.

Types:

- like
- comment
- follow
- friend_request
- friend_accept
- challenge_invite

Fields:

- receiverId
- senderId
- type
- entityId
- read
- createdAt

Notifications are displayed newest first.

---

## followers

Stores follow relationships.

Fields:

- followerId
- followingId
- createdAt

Follower counts should also be stored in the user document for fast loading.

---

## friends

Stores accepted friendships.

Fields:

- userA
- userB
- createdAt
- activeChallengeId (optional)

---

## friendRequests

Stores pending requests.

Fields:

- senderId
- receiverId
- status

Status values:

- pending
- accepted
- rejected

---

## workouts

Stores generated and completed workouts.

Fields:

- userId
- workout
- completed
- completedAt
- generatedByAI
- createdAt

The latest AI workout remains active until the user generates another one.

Completed workouts automatically appear in Workout History.

---

## mealPlans

Stores AI meal plans.

Fields:

- userId
- meals
- calories
- generatedAt

Only the newest plan is considered active.

Meal plans must persist until regenerated.

---

## nutrition

Stores daily nutrition logs.

Fields:

- date
- calories
- protein
- carbs
- fat
- water

---

## sleep

Stores sleep information.

Fields:

- date
- bedtime
- wakeTime
- duration
- quality

---

## bodyMeasurements

Stores body measurements.

Fields:

- date
- weight
- chest
- waist
- hips
- arms
- thighs
- bodyFat

---

## aiChats

Stores AI conversation history.

Fields:

- userId
- role
- message
- createdAt

Conversation history should persist until manually deleted.

---

## dailyChallenges

Stores one AI-generated challenge per day.

Fields:

- userId
- challenge
- generatedDate
- completed

Exactly one challenge exists for each user per day.

---

# Security

Users can modify only their own private documents.

Posts are public.

Profiles are public.

Notifications are private.

Authentication is required for:

- posting
- commenting
- liking
- following
- sending friend requests

---

# Performance

Use realtime listeners for:

- Feed
- Notifications
- Comments
- Followers
- Friend Requests

Avoid unnecessary listeners for historical data.

Denormalize counts (followers, following, comments, likes) when appropriate to reduce reads.

---

# Future Collections

Future versions may add:

- avatarInventory
- avatarItems
- avatarOutfits
- friendshipChallenges
- clubs
- achievements
- aiVision
- marketplace
- premiumSubscriptions

These collections should follow the same conventions as existing data structures.