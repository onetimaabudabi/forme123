# PROJECT_SPEC.md

# Forme Product Specification

> Version 1.0

## 1. Product Vision

Forme is a premium AI-powered fitness platform that combines workout generation,
nutrition planning, health tracking and a complete social network.

The long-term goal is to become the daily fitness application users open every day,
similar to how Duolingo is used for language learning.

Core pillars:

- Artificial Intelligence
- Social Fitness
- Health Tracking
- Motivation
- Gamification

---

## 2. Product Goals

Primary goals

- Help users stay consistent.
- Remove complexity from fitness.
- Personalize everything with AI.
- Build an engaging community.

Business goals

- Premium subscription
- Long retention
- Daily active users
- Strong social engagement

---

## 3. Target Audience

Age:
13–40+

Experience:

- Beginner
- Intermediate
- Advanced

Goals:

- Lose weight
- Gain muscle
- Improve health
- Build habits
- Stay motivated

---

## 4. Technology Stack

Frontend

- React
- Vite
- TypeScript

Backend

- Firebase Authentication
- Cloud Firestore

Storage

- Cloudinary

AI

- Groq API

Deployment

- Vercel

---

## 5. Core Screens

Authentication

- Login
- Registration
- Onboarding

Main

- Home Dashboard
- AI Coach
- Feed
- Workout
- Progress
- Profile

Additional

- Notifications
- Friends
- Leaderboard
- Settings

---

## 6. Home Dashboard

Displays:

- Greeting
- Today's AI Challenge
- Current streak
- Weight
- Goal
- Today's workout
- Calories
- Water
- Activity calendar preview

Daily Challenge must automatically generate once per day and remain fixed until the next day.

---

## 7. AI Coach

Persistent chat.

Capabilities:

- Fitness advice
- Nutrition
- Motivation
- Exercise explanations

Requirements

Chat history is permanently stored in Firestore.

---

## 8. Workout Generator

AI generates workouts based on:

- Goal
- Equipment
- Experience
- Duration

Requirements

Generated workout stays available until user generates another one.

Completed workouts automatically appear in Workout History.

---

## 9. AI Meal Plans

Meal plans are generated using Groq.

Requirements

- Persist after refresh
- Replace only when regenerated
- Store generation timestamp

---

## 10. Workout History

Every completed workout is saved.

Fields include:

- Date
- Duration
- Exercises
- Calories
- Completion status

History is always loaded from Firestore.

---

## 11. Nutrition

Track:

- Calories
- Protein
- Fat
- Carbs
- Water

Entries persist across sessions.

---

## 12. Sleep Tracking

Store

- Sleep time
- Wake time
- Hours
- Quality

Display historical charts.

---

## 13. Body Measurements

Track

- Weight
- Chest
- Waist
- Arms
- Legs
- Body Fat %

Show progress over time.

---

## 14. Activity Calendar

Displays completed workouts.

Calendar must load directly from Workout History.

---

## 15. Social Feed

Users can publish:

- Text
- Images
- Videos
- Completed workouts

Feed displays posts from all users.

Posts from followed users receive higher ranking.

---

## 16. Profiles

Each profile displays

- Avatar
- Username
- Bio
- Join date
- Followers
- Following
- Streak
- Workout statistics
- User posts

Posts shown exactly like Instagram profile grid/list.

---

## 17. Followers

Users may

- Follow
- Unfollow

Follower counts update in realtime.

---

## 18. Friends

Friend system exists independently from followers.

Friends can:

- Chat (future)
- Start Friendship Challenges
- Compare progress

---

## 19. Notifications

Support:

- Likes
- Comments
- Follow
- Friend requests
- Accepted requests
- Challenge invites

Realtime updates.

---

## 20. Gamification

Current

- Daily Challenge
- Streak

Future

- XP
- Levels
- Coins
- Achievements

---

## 21. Friendship Challenge

Two friends choose

- Friend
- Duration (7,14,30 days...)

Both must complete at least one workout each day.

Failure ends the streak.

Successful completion awards badges.

---

## 22. Avatar System (Future)

Custom full-body avatar inspired by modern casual characters.

Users unlock clothing through achievements and challenges.

Avatar is visible on every public profile.

---

## 23. Performance Requirements

- Fast startup
- Lazy loading
- Optimized Firestore reads
- Cloudinary media optimization
- Responsive mobile UI

---

## 24. Design Principles

Follow Apple Human Interface Guidelines.

Large rounded corners.

Minimal design.

Smooth animations.

Premium appearance.

---

## 25. Data Rules

Firestore is the source of truth.

Cloudinary stores only media.

Firestore stores Cloudinary secure_url values.

Never use mock data.

---

## 26. Future Roadmap

Version 1

- Stable social network
- Stable AI
- Reliable tracking

Version 2

- Avatar system
- Friendship Challenges
- Apple Health
- Apple Watch

Version 3

- Clubs
- Marketplace
- Coach Marketplace
- AI Vision

---

End of document.
