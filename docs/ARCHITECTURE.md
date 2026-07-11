# ARCHITECTURE.md

# Forme Architecture

## Overview

Forme follows a modern frontend architecture based on React, Firebase and Cloudinary.

The application should remain modular, scalable and easy to extend.

Every feature must fit into the existing architecture instead of introducing new patterns.

---

# Tech Stack

Frontend

- React
- TypeScript
- Vite

Authentication

- Firebase Authentication

Database

- Cloud Firestore

Storage

- Cloudinary

AI

- Groq API

Deployment

- Vercel

---

# Project Structure

src/

components/

pages/

hooks/

contexts/

services/

firebase/

types/

utils/

styles/

assets/

Never place business logic inside UI components.

---

# Data Flow

Firestore

↓

Services

↓

Hooks

↓

Components

↓

UI

Components should never communicate directly with Firestore.

Always use Services or Hooks.

---

# Services Layer

Every database operation belongs inside services.

Examples

UserService

FeedService

WorkoutService

NotificationService

FriendService

ChallengeService

AvatarService

AIService

Services should contain all Firestore logic.

---

# Hooks Layer

Hooks connect Services to Components.

Examples

useFeed()

useProfile()

useWorkout()

useNotifications()

useFollowers()

useLeaderboard()

useFriendChallenge()

Hooks manage loading states and realtime listeners.

---

# Components

Components should only display data.

Avoid:

Firestore

Cloudinary

Business Logic

API Requests

inside components.

---

# Firestore Rules

Firestore is always the source of truth.

Every screen should read directly from Firestore.

Do not duplicate Firestore data inside local state unless necessary.

---

# Cloudinary

Cloudinary stores:

Images

Videos

Firestore stores:

secure_url only.

Media should never be stored inside Firestore.

---

# AI

Every AI request goes through AIService.

The UI should never directly call Groq.

Future providers should be replaceable without changing components.

---

# State Management

Use:

React Context

Custom Hooks

Firestore Realtime

Avoid large global state unless required.

---

# Authentication Flow

User Login

↓

Firebase Auth

↓

Create / Load Firestore Profile

↓

Load User Data

↓

Navigate Home

---

# Feed Flow

Create Post

↓

Upload Media

↓

Cloudinary

↓

Receive secure_url

↓

Save Firestore Document

↓

Realtime Feed Update

---

# Notification Flow

User Likes Post

↓

Firestore Write

↓

Notification Created

↓

Realtime Listener

↓

Notification Screen Updates

---

# AI Flow

User Request

↓

AIService

↓

Groq API

↓

Response

↓

Firestore Save

↓

UI Update

---

# Future Modules

Avatar System

Friendship Challenges

Marketplace

Clubs

Stories

Voice AI

AI Vision

Apple Health

These modules should follow the same architecture.

---

# Rules

Never duplicate components.

Never duplicate services.

Never duplicate Firestore logic.

Always reuse existing code.

---

# Build Rules

Before every commit:

npm install

npm run build

No TypeScript errors.

No console errors.

No Firebase errors.

No Cloudinary errors.

---

# Long-Term Goal

The architecture should remain understandable even after hundreds of components and dozens of features.

Every developer should immediately understand where new functionality belongs.