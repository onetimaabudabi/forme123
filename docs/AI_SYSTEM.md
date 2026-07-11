# AI System Documentation

# Overview

Artificial Intelligence is one of the core features of Forme.

Unlike a standard fitness tracker, Forme uses AI to actively help users improve their health, create personalized plans and maintain motivation.

The current AI provider is **Groq**.

Future providers may include OpenAI, Anthropic or Google Gemini.

---

# Core Principles

The AI should never feel like a chatbot.

Instead, it should feel like a personal fitness coach.

The AI should:

- remember context
- personalize responses
- explain decisions
- motivate users
- adapt recommendations
- encourage healthy habits

---

# Current AI Features

The application currently includes:

- AI Coach
- Workout Generator
- Meal Plan Generator
- Daily Challenge Generator

Future versions will also include:

- AI Vision
- Voice Coach
- Weekly Reports
- Smart Progress Analysis
- Injury Prevention
- Recovery Recommendations

---

# AI Coach

The AI Coach is available through the chat screen.

Purpose:

- answer fitness questions
- answer nutrition questions
- explain exercises
- explain muscle groups
- explain calories
- explain supplements
- answer health-related fitness questions

The AI should always respond politely and professionally.

---

# AI Chat History

Conversation history must always persist.

History should never disappear after:

- closing the application
- refreshing
- logging out
- restarting the device

Every conversation is stored inside Firestore.

Fields:

- userId
- role
- message
- timestamp

Messages are loaded in chronological order.

---

# Workout Generator

The Workout Generator creates personalized workouts.

Input includes:

- goal
- experience
- available equipment
- workout duration
- preferred training style

Possible goals:

- Lose Weight
- Gain Muscle
- Strength
- Endurance
- General Fitness

Generated workouts must remain active until replaced.

Generating a new workout replaces the previous generated workout.

Completed workouts are automatically saved into Workout History.

---

# Workout Personalization

The AI should consider:

- user age
- height
- weight
- gender
- goal
- previous workouts
- workout frequency

Future versions may also consider:

- sleep quality
- recovery
- calorie intake
- wearable data

---

# AI Meal Plans

Meal plans are generated using user information.

Input:

- calories
- goal
- dietary restrictions
- preferred foods

Output:

- breakfast
- lunch
- dinner
- snacks
- total calories
- protein
- carbohydrates
- fats

Meal plans remain active until another plan is generated.

Refreshing the application must never remove the current meal plan.

---

# Daily Challenge Generator

Every day the AI generates one unique challenge.

Examples:

- Walk 8,000 steps
- Complete a leg workout
- Drink 2 liters of water
- Stretch for 10 minutes

Rules:

Exactly one challenge per day.

The challenge should remain unchanged until midnight.

Completed challenges increase streaks.

---

# Motivation

The AI should motivate users.

Examples:

- congratulate achievements
- encourage consistency
- celebrate streaks
- remind users about missed workouts

Messages should always feel positive.

---

# AI Memory

Future versions should include long-term memory.

The AI should remember:

- favorite exercises
- disliked exercises
- injuries
- training style
- preferred workout duration
- dietary preferences

This creates more personalized recommendations.

---

# AI Vision (Future)

Users will upload photos.

The AI will analyze:

- body posture
- body composition
- exercise form
- progress photos

The AI never stores analyzed images permanently unless requested.

---

# Voice Coach (Future)

Users will be able to speak with the AI.

The AI will:

- answer by voice
- guide workouts
- count repetitions
- motivate during exercise

---

# Weekly Progress Reports

Every week the AI generates a report.

Includes:

- workouts completed
- calories burned
- sleep quality
- streak progress
- weight changes
- body measurement changes

The report highlights improvements and suggests next steps.

---

# Safety

The AI must never:

- diagnose diseases
- replace a doctor
- recommend dangerous behavior
- recommend unsafe supplements
- provide harmful workout advice

Medical questions should encourage consulting healthcare professionals.

---

# Error Handling

If AI generation fails:

- display an informative message
- allow retry
- never delete previous generated workout
- never delete previous meal plan

The previous successful result should remain visible until a new one is successfully generated.

---

# Future AI Features

Planned improvements include:

- AI Vision
- Voice Conversations
- Smart Recovery
- Personalized Weekly Plans
- Adaptive Workout Difficulty
- Adaptive Meal Plans
- Habit Predictions
- Smart Notifications
- Personalized Challenges
- AI Running Coach
- AI Strength Coach

---

# AI Development Principles

Every new AI feature should:

- improve personalization
- reduce manual work
- increase motivation
- preserve user data
- integrate with existing systems
- maintain conversation history
- scale for future AI models

The AI should become the central intelligence of Forme, helping users achieve their fitness goals through personalized guidance, motivation and continuous adaptation.