# SOCIAL.md

# Forme Social System

## Overview

The Social System is one of the core pillars of Forme.

Unlike traditional fitness applications, Forme is designed as a fitness-focused social platform where users motivate each other through workouts, progress sharing and community interaction.

The social experience should feel familiar to Instagram while remaining focused entirely on health and fitness.

---

# Feed

The Home Feed displays posts from all users.

Feed ranking should prioritize:

1. Users you follow
2. Friends
3. High engagement posts
4. Recent posts
5. Suggested users

Posts should never be limited only to friends.

Every public user should be visible.

---

# Posts

Supported content:

- Text
- Images
- Videos
- Workout Posts
- AI Workout Results (future)
- Achievement Posts (future)

Posts are stored inside Firestore.

Media is stored inside Cloudinary.

Firestore stores only Cloudinary secure_url values.

---

# Publishing

Publishing flow:

Create Post

↓

Select Photos

↓

Select Video (optional)

↓

Write Caption

↓

Upload to Cloudinary

↓

Save Post in Firestore

↓

Display instantly

The user should immediately see the published post.

---

# Feed Ranking

Priority:

Following

↓

Friends

↓

Popular Posts

↓

Recent Posts

↓

Suggested Users

Future:

Machine learning ranking.

---

# Likes

Users may like posts.

Each user may only like a post once.

Like count updates immediately.

Likes create notifications.

---

# Comments

Comments update in realtime.

Comments generate notifications.

Future:

Replies

Comment likes

Pinned comments

---

# Notifications

Supported notifications:

Like

Comment

Follow

Friend Request

Friend Accepted

Challenge Invite

Challenge Completed

Future:

Story reactions

Mention

Club invite

---

# User Profiles

Every profile displays:

Avatar

Username

Bio

Followers

Following

Current Streak

Join Date

Workout Statistics

Posts

Users can navigate to profiles directly by tapping any post in the feed.

---

# Followers

Following creates a one-way relationship.

Users may:

Follow

Unfollow

View Followers

View Following

Posts from followed users receive higher priority inside the feed.

---

# Friends

Friends are separate from followers.

Friends enable:

Friendship Challenges

Future Chat

Future Shared Goals

Users may follow someone without being friends.

---

# Feed Performance

Posts should load lazily.

Images should lazy-load.

Videos should preload only when visible.

Infinite scrolling should be used.

---

# Future Features

Stories

Saved Posts

Collections

Draft Posts

Reels

Hashtags

Mentions

Verified Accounts

Club Feed

Trending Feed

Suggested Posts

Seasonal Events

Workout Sharing

AI Generated Progress Posts
