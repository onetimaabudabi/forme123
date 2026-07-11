# avatar-system.md

# Avatar System

## Overview

The Avatar System is one of the flagship features planned for Forme.

Every user has a customizable full-body character that represents them throughout the application.

The avatar is inspired by modern casual game characters (similar in style to GeoGuessr), but should have its own unique Forme identity.

The avatar is not just cosmetic.

It becomes part of the user's profile, achievements and social presence.

---

# Goals

The Avatar System should:

- Increase user engagement.
- Reward active users.
- Encourage long-term progression.
- Make profiles more personal.
- Replace static profile pictures as the main identity.

---

# Avatar Visibility

The avatar should appear in:

- Profile
- Feed
- Comments
- Leaderboards
- Friendship Challenges
- Notifications (future)
- Clubs (future)
- Search Results (future)

The classic profile picture may still exist as a small icon, but the avatar becomes the primary visual identity.

---

# Character Style

The visual style should be:

- Friendly
- Modern
- Minimalistic
- Slightly cartoonish
- High quality
- Premium

Inspirations:

- GeoGuessr
- Nintendo Miis
- Apple emojis (clean design)
- Modern casual games

The avatar should never look childish.

---

# Avatar Components

Every avatar consists of:

Head

Hair

Eyebrows

Eyes

Nose

Mouth

Beard

Skin Tone

Body

Top

Bottom

Shoes

Accessories

Background

Pose

Animation

---

# Customization

Users can customize:

Hair Style

Hair Color

Eye Color

Beard Style

Clothing

Shoes

Accessories

Glasses

Hat

Watch

Necklace

Backpack

Future:

Pets

Sports Equipment

Special Effects

---

# Clothing Categories

Upper Body

- T-Shirts
- Hoodies
- Jackets
- Tank Tops
- Sweatshirts

Lower Body

- Shorts
- Joggers
- Jeans
- Sports Pants

Shoes

- Running Shoes
- Sneakers
- Boots

Accessories

- Watches
- Glasses
- Caps
- Headphones

---

# Unlock System

Some items are free.

Others are unlocked by:

Achievements

Workout streaks

Friendship Challenges

Leaderboards

Seasonal Events

Premium Membership

Marketplace

---

# Rarity System

Items have rarity.

Common

Rare

Epic

Legendary

Limited

Exclusive

Limited items can never be obtained again after an event ends.

---

# Outfit Presets

Users can save multiple outfits.

Examples:

Gym

Running

Casual

Winter

Summer

Premium

Users switch outfits instantly.

---

# Avatar Animations

Idle

Walking

Running

Celebrating

Thinking

Stretching

Victory

Future:

Workout-specific animations.

---

# Profile Integration

Profiles display:

Large Avatar

Current Outfit

Level

Achievements

Current Streak

Workout Statistics

Followers

Following

The avatar becomes the center of the profile.

---

# Feed Integration

Posts display:

Avatar

Username

Verification Badge (future)

Instead of a simple profile picture.

---

# Leaderboards

Leaderboards display:

Avatar

Username

Level

Current Streak

Rank

Making rankings more visually engaging.

---

# Friendship Challenges

Challenge screen displays both avatars.

Animations:

Waiting

Workout Complete

Celebration

Challenge Failed

Victory

---

# Firestore Structure

Collection:

avatars

Fields:

userId

hair

eyes

mouth

beard

skinTone

shirt

pants

shoes

accessories

background

animation

createdAt

updatedAt

---

# Inventory

Collection:

avatarInventory

Fields:

userId

itemId

category

rarity

owned

equipped

obtainedAt

---

# Avatar Shop

Future feature.

Users spend coins on:

Hair

Clothes

Shoes

Accessories

Backgrounds

Animations

Special Effects

---

# Premium Content

Premium users receive:

Exclusive Clothing

Exclusive Animations

Premium Backgrounds

Exclusive Seasonal Items

Special Profile Effects

Premium Badge

---

# Seasonal Events

Examples:

Christmas

Halloween

Summer

Winter

Olympics

Marathons

Events unlock limited cosmetics.

---

# Achievements

Unlock cosmetics after:

10 Workouts

100 Workouts

365-Day Streak

100 Followers

Friendship Challenge

First Post

First AI Workout

Weight Goal Completed

---

# Performance

Avatar loading should be instant.

Images should be cached.

Animations should remain lightweight.

The system should not negatively affect application performance.

---

# Future Ideas

3D Avatars

Animated Expressions

Voice Reactions

Workout Equipment

Custom Poses

AI-generated Clothing

Avatar Marketplace

Avatar Gifts

Club Uniforms

---

# Success Criteria

The Avatar System is complete when:

✓ Every user has an avatar.

✓ Avatar customization works.

✓ Inventory persists.

✓ Outfits save correctly.

✓ Avatars appear throughout the application.

✓ Unlock system works.

✓ Animations perform smoothly.

✓ Firestore synchronization works.

✓ Mobile performance remains excellent.

---

# Long-Term Vision

The Avatar System should become one of the most recognizable features of Forme.

When users see an avatar, they should immediately recognize it as part of the Forme ecosystem.

The avatar should evolve alongside the user, reflecting their fitness journey, achievements and personality.