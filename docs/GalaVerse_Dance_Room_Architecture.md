# Galaverse Dance Room — Complete Architecture Document

> **Phase-by-phase implementation plan for the VIP Dance Room**
> A 2.5D sprite-sheet-based live entertainment room with animated 3D-feel room, singer, audience, and Instagram Live-style chat.

---

## Technology Decision: Why NOT Three.js

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Three.js (react-three-fiber)** | True 3D rendering | Heavy (10MB+), overheats budget phones, complex setup | ❌ REJECTED |
| **React Native Animated** | Built-in, lightweight, works on ₹8K phones | Limited to transforms/opacity | ✅ For living effects |
| **React Native Reanimated v3** | UI-thread animations, 60fps, gesture-driven | Extra dependency | ✅ For sprite playback |
| **Sprite Sheet Clipping** | Extract frames from PNG using View+overflow:hidden | Need coordinate data | ✅ Core technique |

### Our Approach: **2.5D Parallax Sprite System**
- The "3D" feel comes from **layered parallax** (Background → Midground → Foreground) with depth-based scaling
- Characters animate by **clipping frames from sprite sheets** (same technique as the HTML demo you shared)
- Living effects (breathing, swaying, glow) use **React Native Animated**
- This works on budget phones and matches the GalaVerse concept: *"No phone overheating, works on ₹8,000 phones"*

---

## Asset Inventory

| Asset | File | Size | Contains |
|---|---|---|---|
| Room Sprite Sheet | `dancefloor_1.png` | 2.8MB | BG (4 frames), MID (4 frames), FG (4 frames), Disco Ball (8), Stage Lights (8), Neon Sign (6), Curtains (4), Fog (6), Confetti (6), City Lights (6), Candle (6), Wine Glass (4), Bottle (4), Floor Lights (4), Extra Props |
| Singer Sprite Sheet | `female_singer.png` | 3.2MB | Idle (10), Walk (10), Sing (10), Gesture (10), Dance (10), Jump (8), Spin (8), Mic Stand (8), Bow (6), Expressions (12), Extra Props, Effects |
| Audience Sprite Sheet | `f1.png` | 3.1MB | Enter Room (4), Notice Stage (4), Singer Performing (6), Dance (10), Standing/Idle (6), Clapping (6), Fly Kiss (6), Cheer/Excited (6), Wave (4), Hugging (4), Sitting (6), Drinking Beer (6), Laughing (6), Expressions (12), Props, Effects, Misc Actions, Fall/Lay Down |

---

## Module Architecture

```
metaverse/
└── galaverse/                         ← NEW folder (isolated from LaughVault)
    │
    ├── spriteData.ts                  ← All coordinate data for all 3 sprite sheets
    │                                     [x, y, width, height] for every frame
    │
    ├── RoomRenderer.tsx               ← MODULE 1: 3D Room
    │   └── Renders parallax BG/MID/FG layers
    │       Animates: disco ball, lights, fog, neon, curtains, candles
    │
    ├── SingerController.tsx           ← MODULE 2: Singer Character
    │   └── Renders singer on stage from female_singer.png
    │       All poses: Idle, Sing, Dance, Jump, Spin, Bow, Gesture, Walk
    │       Living effects: breathing, swaying, glow
    │
    ├── AudienceController.tsx         ← MODULE 3: Audience Characters
    │   └── Renders up to 10 audience from f1.png
    │       All actions: Sit, Clap, Dance, Cheer, Wave, Kiss, Hug, Drink, Laugh
    │       Each member can act independently
    │
    ├── LiveChatOverlay.tsx            ← MODULE 4: Instagram Live Chat
    │   └── Transparent scrolling chat over the room
    │       VIP gold names, badges, auto-scrolling
    │
    ├── GiftSystem.tsx                 ← MODULE 5: Gift Panel + Animations
    │   └── Gift selection sheet + flying gift animations
    │       🌹🍺🍾💎👑 with prices and particle effects
    │
    └── GalaDanceScreen.tsx            ← MAIN SCREEN: Assembles all modules
        └── Full-screen layout, state management
            Connects emoji reactions → audience poses
            Connects gifts → singer + audience reactions
```

---

## Phase-by-Phase Implementation

---

### 🔵 PHASE 1: The 3D Room (RoomRenderer.tsx)

**Goal:** Make the empty room look alive and VIP premium using `dancefloor_1.png`

#### Step 1.1 — Create `spriteData.ts` with room coordinates
- Map every frame from `dancefloor_1.png`:
  - `BG_1, BG_2, BG_3, BG_4` → Background layer frames
  - `MID_1, MID_2, MID_3, MID_4` → Midground layer frames
  - `FG_1, FG_2, FG_3, FG_4` → Foreground layer frames
  - `D1-D8` → Disco ball frames
  - `L1-L8` → Stage light frames
  - `N1-N6` → Neon sign frames
  - `C1-C4` → Curtain frames
  - `F1-F6` → Fog/smoke frames
  - `CF1-CF6` → Confetti frames
  - `CITY1-CITY6` → City lights frames
  - `CA1-CA6` → Candle frames
  - `WG1-WG4` → Wine glass frames
  - `BT1-BT4` → Bottle sparkle frames
  - `FLOOR_1-FLOOR_4` → Floor light pattern frames

#### Step 1.2 — Build RoomRenderer.tsx
```
Screen Layout:
┌───────────────────────────────┐
│  BG Layer (full width)        │  ← z-index: 1 — Animates between BG_1→BG_4
│  [VIP LOUNGE + City Skyline]  │     at ~2fps for subtle light shift
│                               │
│  ── Stage Lights (L1-L8) ──   │  ← z-index: 3 — Fast color cycling (4fps)
│  ── Disco Ball (D1-D8) ──     │  ← z-index: 4 — Rotating sparkle (3fps)
│  ── Neon Sign (N1-N6) ──      │  ← z-index: 5 — "Music Lives Here ♥" flicker
│                               │
│  MID Layer (full width)       │  ← z-index: 10 — Stage with instruments
│  [Stage + Curtains + Drums]   │     Curtain sway animation (C1-C4)
│                               │
│  ── Fog/Smoke (F1-F6) ──      │  ← z-index: 15 — Drifting across stage
│  ── Confetti (CF1-CF6) ──     │  ← z-index: 16 — Triggered by gifts
│                               │
│  FG Layer (full width)        │  ← z-index: 20 — VIP couches + tables
│  [Couches + Tables + Candles] │     Candle flicker (CA1-CA6)
│                               │
│  ── Floor Lights (FLOOR_1-4)──│  ← z-index: 25 — Pulsing VIP floor
└───────────────────────────────┘
```

**Living Room Effects (React Native Animated):**
- Camera parallax: Slow subtle pan left/right (entire room breathes)
- Fog drift: translateX animation across the stage
- Candle flicker: Random opacity changes (fast, irregular)
- Disco ball: Rotating scale + opacity pulse
- Stage lights: Color cycling through L1-L8 frames
- Neon sign: Flickering between N1-N6

**Deliverable:** A beautiful, living, VIP room with NO characters yet

---

### 🟣 PHASE 2: The Singer (SingerController.tsx)

**Goal:** Place the animated female singer on the center stage

#### Step 2.1 — Add singer coordinates to `spriteData.ts`
- Map every row from `female_singer.png`:
  - Row 0: IDLE (10 frames)
  - Row 1: WALK (10 frames)
  - Row 2: SING (10 frames)
  - Row 3: GESTURE (10 frames)
  - Row 4: DANCE (10 frames)
  - Row 5: JUMP (8 frames)
  - Row 6: SPIN (8 frames)
  - Row 7: MIC STAND (8 frames)
  - Row 8: BOW (6 frames)
  - Row 9: EXPRESSIONS (12 face close-ups)

#### Step 2.2 — Build SingerController.tsx
```
Position: Center of MID layer (on the stage)
Z-Index: 12 (between MID and FG layers = appears ON the stage)
Scale: 1.5x (singer is larger than audience)

Features:
- Auto-play: Cycles through Sing → Dance → Gesture → Idle
- React to gifts: 👑 → Bow, 🍾 → Jump + Spin, 💎 → Gesture
- React to emojis: 💃 → Dance, 🎵 → Sing, 🔥 → Spin
- Living effects: Subtle breathing (scaleY pulse), spotlight glow
- Mic Stand prop: Rendered beside singer (from extras)
```

**Deliverable:** Singer animating on stage inside the 3D room

---

### 🟠 PHASE 3: The Audience (AudienceController.tsx)

**Goal:** Place up to 10 animated audience members at VIP tables

#### Step 3.1 — Add audience coordinates to `spriteData.ts`
- Map every action from `f1.png`:
  - 1: ENTER ROOM (4 frames — door opening, walking in)
  - 2: NOTICE STAGE (4 frames — looking up at singer)
  - 3: SINGER PERFORMING (6 frames — watching with excitement)
  - 4: DANCE (10 frames — choreography moves)
  - 5: STANDING/IDLE (6 frames)
  - 6: CLAPPING (6 frames)
  - 7: FLY KISS (6 frames — with heart particles)
  - 8: CHEER/EXCITED (6 frames — arms up)
  - 9: WAVE (4 frames)
  - 10: HUGGING (4 frames — two girls hugging)
  - 11: SITTING (6 frames — on couch/chair)
  - 12: DRINKING BEER (6 frames)
  - 13: LAUGHING (6 frames)
  - 14: EXPRESSIONS (12 face close-ups)
  - 15-18: ACCESSORIES, EFFECTS, MISC, FALL

#### Step 3.2 — Build AudienceController.tsx
```
Placement: In FG layer area (at VIP couches/tables)
Z-Index: 18-22 (in front of stage, varies by "row")

Layout (10 audience members):
┌─────────────────────────────────┐
│            STAGE                │
│         🎤 SINGER               │
│                                 │
│  👤₁   👤₂   👤₃   👤₄   👤₅   │  ← Back row (scale: 0.7, z: 18)
│                                 │
│   👤₆   👤₇   👤₈   👤₉   👤₁₀  │  ← Front row (scale: 1.0, z: 22)
│  [couch] [table] [couch]       │
└─────────────────────────────────┘

Behavior:
- Default: SITTING (idle) or STANDING/IDLE
- When user taps 👏 → ALL play CLAPPING
- When user taps 💃 → ALL play DANCE
- When user taps ❤️ → Random 2-3 do FLY KISS
- When user taps 😂 → ALL play LAUGHING
- When user taps 👋 → ALL play WAVE
- When 🍺 gift sent → One does DRINKING BEER
- When 🍾 gift sent → ALL do CHEER/EXCITED
- When 👑 gift sent → ALL do CHEER + singer BOWS
- New user joins → One plays ENTER ROOM animation
- After reaction → Auto-return to SITTING after 3-4 seconds
- Random idle behavior: Some audience randomly WAVE or look at each other
```

**Deliverable:** 10 animated audience members reacting to user interactions

---

### 🟢 PHASE 4: Instagram Live Chat (LiveChatOverlay.tsx)

**Goal:** Transparent scrolling chat overlay like Instagram Live

```
Screen Layout with Chat:
┌─────────────────────────────┐
│ [‹] 🔴 GALAVERSE DANCE  👁28│  ← Header: back, LIVE dot, title, viewer count
│                              │
│       (3D ROOM + SINGER +    │
│        AUDIENCE visible       │
│        behind the chat)       │
│                              │
│ ┌──────────────┐             │
│ │ @VIPKing 👑   │     💃      │  ← Chat messages (left) + Floating emojis (right)
│ │ This is fire! │     🕺      │
│ │              │     ❤️      │
│ │ @CoolGirl    │             │
│ │ Love this 🔥  │             │
│ └──────────────┘             │
│                              │
│ [👏][💃][🔥][❤️][😂][👋]      │  ← Quick reaction bar
│ [🎁] [Type a message...] [➤] │  ← Gift + Input + Send
└─────────────────────────────┘

Chat Style:
- Background: rgba(0, 0, 0, 0.3) — semi-transparent
- Messages fade in from bottom, scroll up
- VIP users: Gold name + 👑 badge + glow border
- System messages: "✦ @User sent 🍾 Champagne!"
- Auto-scroll to latest message
- Max 50 messages visible (older ones removed)
```

**Deliverable:** Full chat system overlaid on the room

---

### 🔴 PHASE 5: Gift System (GiftSystem.tsx)

**Goal:** Gift panel with animated flying effects

```
Gift Panel (slides up from bottom):
┌─────────────────────────────┐
│ ──── handle ────            │
│ 🎁 Music Gifts              │
│                              │
│ [👏]    [🌹]    [🍺]         │
│ Clap    Rose    Beer         │
│ FREE    ₹50     ₹50         │
│                              │
│ [🍾]    [💎]    [👑]         │
│ Champagne Crown  Spotlight   │
│ ₹200    ₹500   ₹1,000       │
└─────────────────────────────┘

Gift Animations:
- 🌹 Rose: Rose flies from bottom to singer
- 🍺 Beer: Beer icon slides to random audience member
- 🍾 Champagne: Golden confetti explosion (room-wide) + cork pop
- 💎 Crown: Diamond crown descends onto singer's head
- 👑 Spotlight: Singer avatar moves to center, dramatic glow, 60-sec spotlight
```

**Deliverable:** Complete gifting with animations

---

### ⚪ PHASE 6: Assembly (GalaDanceScreen.tsx)

**Goal:** Wire everything together into the final screen

```
State Management:
- singerPose: Current singer animation
- audiencePoses: Array of 10 audience member poses
- messages: Chat message array
- gifts: Active gift animations
- roomProps: Which room props are currently animating

Event Flow:
  User taps emoji → audiencePoses update → audience animates
  User sends gift → gift animation plays → singer reacts → audience reacts
  Bot messages → chat scrolls → floating emojis appear
  Timer → singer auto-cycles poses → audience randomly idles
```

---

## Phase Timeline

| Phase | Module | Duration | Dependencies |
|---|---|---|---|
| Phase 1 | 3D Room (`RoomRenderer`) | 2-3 days | `spriteData.ts` coordinates |
| Phase 2 | Singer (`SingerController`) | 1-2 days | Phase 1 complete |
| Phase 3 | Audience (`AudienceController`) | 2-3 days | Phase 1 complete |
| Phase 4 | Live Chat (`LiveChatOverlay`) | 1 day | Phase 1 complete |
| Phase 5 | Gifts (`GiftSystem`) | 1-2 days | Phase 2 + 3 complete |
| Phase 6 | Assembly (`GalaDanceScreen`) | 1 day | All phases complete |
| **Total** | | **8-12 days** | |

---

## Key Design Principles

1. **VIP Premium Feel:** Dark purple/gold/neon pink color palette. Glassmorphism on chat overlay. Gold accents on buttons and badges.
2. **Easy to Use:** One-tap reactions. Gift panel slides up. Chat auto-scrolls. No complex menus.
3. **Interactive:** Every tap produces visible feedback. Audience reacts immediately. Singer responds to gifts.
4. **Performance:** Sprite sheet clipping (not individual PNGs). React Native Animated (not Three.js). Works on budget phones.
5. **Modular:** Each module is independent. Can swap singer sprite sheet without touching room code. Can add new audience actions without changing chat.

---

## File Dependencies

```
GalaDanceScreen.tsx
    ├── imports RoomRenderer.tsx
    │       └── reads spriteData.ts (room coordinates)
    │       └── uses dancefloor_1.png
    │
    ├── imports SingerController.tsx
    │       └── reads spriteData.ts (singer coordinates)
    │       └── uses female_singer.png
    │
    ├── imports AudienceController.tsx
    │       └── reads spriteData.ts (audience coordinates)
    │       └── uses f1.png
    │
    ├── imports LiveChatOverlay.tsx
    │       └── standalone (no sprite dependencies)
    │
    └── imports GiftSystem.tsx
            └── standalone (triggers events to Singer + Audience)
```
