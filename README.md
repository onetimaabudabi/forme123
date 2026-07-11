# Forme

> A next-generation AI-powered fitness social network.

---

# Overview

Forme is a modern fitness platform that combines artificial intelligence, workout tracking, social networking and personal health monitoring into a single application.

Unlike traditional fitness apps, Forme is designed to become a complete fitness ecosystem where users can:

- Generate AI workouts
- Generate AI meal plans
- Track body progress
- Monitor sleep
- Complete daily AI challenges
- Share fitness progress
- Build a community
- Compete with friends
- Stay motivated through gamification

The project is built as a production-ready application.

---

# Mission

Our mission is to make fitness engaging, social and intelligent.

Instead of simply logging workouts, Forme helps users stay consistent through AI coaching, social interaction and long-term motivation.

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite

## Backend

- Firebase Authentication
- Cloud Firestore

## Storage

- Cloudinary

## Artificial Intelligence

- Groq API

## Deployment

- Vercel

---

# Core Features

## AI Coach

Personal AI assistant capable of:

- answering fitness questions
- creating workout plans
- recommending exercises
- explaining nutrition
- motivating users

Chat history is permanently stored.

---

## Workout Generator

Users can generate personalized workouts based on:

- goal
- experience
- equipment
- workout duration
- muscle groups

Generated workouts remain available until the user generates a new one.

Completed workouts are automatically saved to Workout History.

---

## AI Meal Planner

Generate complete meal plans based on:

- calories
- dietary preferences
- fitness goals

Meal plans remain saved until replaced.

---

## Daily AI Challenge

Every day the AI generates a unique challenge.

Examples:

- Walk 8,000 steps
- Complete a push workout
- Drink 2 liters of water

Daily Challenge is tied to the user's streak.

---

## Workout History

Stores every completed workout.

Includes:

- date
- duration
- exercises
- calories
- completion status

---

## Nutrition

Track:

- calories
- protein
- carbohydrates
- fats
- water intake

---

## Sleep Tracking

Store:

- bedtime
- wake-up time
- sleep duration
- sleep quality

---

## Body Measurements

Track progress over time:

- weight
- chest
- waist
- hips
- arms
- thighs
- body fat %

---

## Progress Dashboard

Displays:

- weight trend
- streak
- completed workouts
- activity calendar
- statistics

---

# Social Network

Forme includes a full social network.

Users can:

- create posts
- upload images
- upload videos
- like posts
- comment
- follow users
- add friends
- receive notifications

Feed displays posts from everyone while prioritizing followed users.

---

# User Profiles

Each profile contains:

- Avatar
- Username
- Display Name
- Bio
- Join Date
- Workout Statistics
- Streak
- Followers
- Following
- Posts

---

# Notifications

Notifications include:

- Likes
- Comments
- Friend requests
- Friend request accepted
- Challenge invitations
- Challenge completed

---

# Cloudinary

Images and videos are uploaded to Cloudinary.

Only secure URLs are stored inside Firestore.

---

# Database

The application uses Cloud Firestore.

Realtime listeners are used whenever possible.

Firestore is the single source of truth.

---

# Design Philosophy

Forme follows Apple's Human Interface Guidelines.

Goals:

- Premium appearance
- Minimalistic interface
- Smooth animations
- Native feeling
- Beautiful typography
- Light & Dark mode

---

# Future Roadmap

Upcoming features include:

- Friendship Challenges
- 3D Character System
- Avatar Customization
- AI Vision
- Apple Health Integration
- Apple Watch
- Clubs
- Marketplace
- Achievement System
- Premium Subscription

---

# Project Status

Current Stage:

Active Development

Architecture:

Production Ready

Documentation:

Located inside `/docs`

---

# Contributing

Before implementing new features:

1. Read CLAUDE.md
2. Read PROJECT_SPEC.md
3. Follow existing architecture
4. Reuse existing components
5. Keep documentation updated

---

# License

Private Project

Copyright © Forme