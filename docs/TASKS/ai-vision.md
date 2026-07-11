# AI_VISION.md

# AI Vision System

## Overview

AI Vision is a premium feature that allows Forme AI to analyze photos and videos.

The goal is to provide helpful fitness feedback rather than medical diagnosis.

---

# Supported Inputs

Body Photos

Workout Photos

Workout Videos

Progress Photos

Exercise Videos

---

# Features

Body Progress Analysis

Workout Form Analysis

Posture Analysis

Muscle Symmetry

Progress Comparison

Exercise Recognition

Future:

Food Recognition

Calorie Estimation

Equipment Detection

---

# Body Progress

Users upload photos.

AI compares:

Weight Changes

Muscle Growth

Fat Reduction

Posture

Symmetry

Progress Timeline

---

# Exercise Form

Users upload workout videos.

AI detects:

Exercise

Joint Positions

Movement Quality

Range of Motion

Tempo

Balance

---

# AI Feedback

Feedback should always be positive.

Example:

Good squat depth.

Try keeping your knees more stable.

Great improvement compared to last month.

Avoid harsh wording.

---

# Weekly Comparison

Compare:

Current Week

Previous Week

Previous Month

Highlight improvements.

---

# Safety

Never diagnose disease.

Never estimate medical conditions.

Never provide dangerous recommendations.

If uncertain, recommend consulting a qualified professional.

---

# Firestore

visionScans

Fields

userId

type

analysis

score

imageUrl

createdAt

---

# Cloudinary

Original media stored in Cloudinary.

Firestore stores only secure_url.

---

# Privacy

Only the owner can access scans.

Users may delete scans permanently.

No photo should be shared publicly.

---

# Future

3D Body Scan

AI Running Analysis

AI Push-up Counter

AI Squat Counter

AI Yoga Correction

Live Camera Coaching

AR Exercise Guidance

Apple Vision Pro Integration

---

# Success Criteria

✓ Fast upload

✓ Secure storage

✓ Helpful feedback

✓ Firestore persistence

✓ Cloudinary integration

✓ Premium-only access