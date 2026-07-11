# LEADERBOARD_V2.md

# Leaderboard System

## Overview

The Leaderboard is one of the main motivation systems inside Forme.

Unlike traditional rankings that only count workouts, the Forme Leaderboard measures overall activity and consistency.

The leaderboard should encourage healthy competition without discouraging beginners.

---

# Goals

The leaderboard should:

- motivate users
- increase daily activity
- reward consistency
- encourage community interaction

The goal is not to find the strongest athlete.

The goal is to reward healthy habits.

---

# Ranking Score

Every user has a Score.

The score determines leaderboard position.

Score is calculated from several metrics.

Example:

Workout = +100

Daily Challenge = +30

Friendship Challenge Day = +20

Post = +10

Comment = +2

Like Received = +1

10000 Steps = +15

Sleep Goal = +10

Nutrition Goal = +15

Perfect Day Bonus = +25

---

# Daily Reset

Daily score does not reset.

Weekly leaderboard resets weekly.

Monthly leaderboard resets monthly.

All-time leaderboard never resets.

---

# Leaderboard Types

Global

Friends

Followers

Country

City (future)

School (future)

Club (future)

Company (future)

---

# User Card

Each leaderboard row displays:

Rank

Avatar

Username

Current Level

Current Streak

Score

Trend Indicator

---

# Trend Indicator

▲ Moving Up

▼ Moving Down

▬ No Change

Trend is calculated daily.

---

# Rewards

Top users receive:

Badges

XP

Coins

Avatar Cosmetics

Special Titles

Seasonal Rewards

---

# Anti-Cheat

Ignore:

Duplicate workouts

Impossible activity

Spam posting

Artificial engagement

Future:

Automatic fraud detection.

---

# Firestore Structure

leaderboards

Fields

userId

score

weeklyScore

monthlyScore

allTimeScore

rank

level

lastUpdated

---

# UI

Leaderboard should display:

Top 3 users

Current User

Nearby Rankings

Search

Filters

Period Selector

---

# Future

Club Leaderboards

Friendship Challenge Rankings

Running Rankings

Weight Loss Rankings

Strength Rankings

AI Coach Rankings

School Rankings

Worldwide Events

Seasonal Competitions

---

# Success Criteria

✓ Realtime updates

✓ Fast loading

✓ Mobile friendly

✓ Fair ranking

✓ Anti-cheat protection

✓ Rewards delivered automatically