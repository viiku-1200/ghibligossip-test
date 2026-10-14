# Making GalaVerse Rooms Feel Alive — Animation Architecture

> **Goal:** Transform static rooms into living, animated spaces with anime characters that dance, sit, laugh, drink, and hug — all inside React Native.

---

## The Problem Right Now

```
Current State:
┌────────────────────────────┐
│  Static Background Image   │ ← Just a .jpg
│                            │
│    ⬤  ⬤  ★  ⬤  ⬤         │ ← Circles with letters
│                            │
│    "ON STAGE"              │ ← Text badge
└────────────────────────────┘

What We Want:
┌────────────────────────────┐
│  🎤 Mic sways slightly    │ ← Animated props
│  💡 Spotlight moves        │ ← Dynamic lighting
│  🪑 Tables with depth     │ ← Parallax/3D feel
│                            │
│  🧍‍♂️ 💃 🧎 😂 🍺 🤗      │ ← Anime characters with
│  stand dance sit laugh     │   real animated poses
│         drink  hug         │
└────────────────────────────┘
```

---

## 🎯 Two Things to Solve

### 1. Animated Room Environment (stage, mic, chairs, lighting)
### 2. Animated Anime Characters (8 characters with poses)

---

## Solution: Sprite Sheet Animation + Lottie

This is how **every successful 2D avatar app** does it (BIGO, ZEPETO, LINE Play, Habbo).

### Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Room Background** | **Lottie** (`lottie-react-native`) | Animated room environment with moving elements |
| **Room Props** | **Sprite Sheets** + `Animated API` | Mic sway, spotlight beam, chair wobble |
| **Characters** | **Spine** or **Sprite Sheets** | Anime characters with skeletal animation |
| **Rendering** | **react-native-skia** | High-performance 2D canvas for smooth 60fps |
| **Sync** | **Socket.io** (already built) | Sync character positions & poses across users |

---

## 📐 How Each Part Works

### Part 1: Animated Room Environment

Instead of a static `.jpg`, the room becomes a **layered animated scene**:

```
Layer Stack (bottom to top):
─────────────────────────────
Layer 5: Floating particles (sparkles, smoke)     ← Animated.View
Layer 4: Foreground props (mic stand, tables)      ← Sprite animations
Layer 3: Characters (anime avatars)                ← Spine / Sprite sheets
Layer 2: Mid-ground (stage floor, spotlight cone)  ← Lottie animation
Layer 1: Background (brick wall, ceiling, decor)   ← Lottie or static with parallax
─────────────────────────────
```

**The mic stand** — animate with `react-native-reanimated`:
- Subtle sway left/right (like someone bumped it)
- Glow pulse on the mic head
- When comedian speaks → mic vibrates slightly

**The spotlight** — `Animated.View` with:
- Cone shape that slowly moves/breathes
- Color temperature shifts (warm → warmer)
- Intensity changes based on crowd reactions

**The chairs/tables** — SVG or sprite images:
- Slight wobble when someone sits down
- Drinks on tables have condensation shimmer

### Part 2: Animated Anime Characters (THE BIG ONE)

This is how you get characters that **dance, sit, laugh, drink, hug**:

#### Option A: Sprite Sheet Animation (Recommended to Start)

```
How it works:
────────────────────────────────────────────
One character = One PNG sprite sheet

┌───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │  ← "Dancing" frames
├───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │  ← "Standing idle" frames
├───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │  ← "Laughing" frames
├───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │   │   │  ← "Drinking beer" frames
├───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │ 5 │   │  ← "Sitting" frames
├───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │  ← "Hugging" frames (pair animation)
└───┴───┴───┴───┴───┴───┘

Each frame is ~100x150px. Total sprite sheet = ~600x900px
Animate by shifting the visible frame every 100-150ms
```

**Poses needed per character:**
| Pose | Frames | Trigger |
|:---|:---|:---|
| 🧍 Idle (standing) | 4-6 | Default state |
| 💃 Dancing | 6-8 | When music plays or user taps dance |
| 🪑 Sitting | 3-4 | When at a table |
| 😂 Laughing | 4-6 | When crowd LOL reaction triggers |
| 🍺 Drinking | 4-5 | Random idle action at tables |
| 🤗 Hugging | 6 | When two friends are near each other |
| 👏 Clapping | 4 | When clap reaction triggers |
| 👋 Waving | 4 | When user joins the room |

**How to create the sprites:**
1. **AI Generation**: Use tools like **PixAI**, **NovelAI**, or **Stable Diffusion** with ControlNet to generate consistent anime characters in different poses
2. **Hire on Fiverr**: Search "2D sprite sheet anime" — costs ₹2,000-5,000 per character
3. **Use pre-made**: Sites like **itch.io** have free anime sprite sheets
4. **Aseprite**: Pixel art tool to create/edit sprite sheets yourself

#### Option B: Spine Animation (Best Quality — Phase 2)

```
How Spine works:
────────────────────────────────────────────

Instead of 50+ drawn frames, you draw the character ONCE
and attach BONES to it:

     ○ Head bone
     │
  ┌──┼──┐ Shoulder bones
  │  │  │
  ─  │  ─ Arm bones
     │
  ┌──┼──┐ Hip bones
  │     │
  │     │ Leg bones
  ▄     ▄ Feet

Then you create animations by MOVING the bones:
- "Dance" = rotate hips, arms swing, head bobs
- "Laugh" = head tilts back, body shakes, arms hold stomach
- "Drink" = arm lifts, head tilts, arm lowers
- "Hug" = both characters lean in, arms wrap

ONE character rig = UNLIMITED smooth animations
File size: ~50KB per character (vs 2MB sprite sheets)
```

**Libraries:**
- `react-native-spine` — Native Spine runtime for React Native
- `@pixi-spine/runtime` — If using PixiJS in a WebView
- Export from **Spine Editor** ($69 one-time) or **DragonBones** (free)

#### Option C: Lottie Character Animations (Easiest)

```
Each pose = One .json Lottie file
Created in After Effects or Lottie Creator

Pros: Very easy to integrate (lottie-react-native already works)
Cons: Each animation is a separate file, harder to customize outfits
```

---

## 🏗️ Recommended Implementation Roadmap

### Phase 1: Quick Win (This Week) ← START HERE
**Use Animated API + Reanimated for room props**

```
What to animate NOW with just React Native Animated:
- Mic stand: subtle rotation oscillation
- Spotlight: opacity + scale breathing  
- Characters: bouncing idle animation (translateY oscillation)
- Stage smoke: multiple Animated.Views drifting across
- Table candles: flickering opacity
- Crowd wave: sequential translateY animation across avatars
```

> [!TIP]
> This is what we already started building! The current LaughVaultScreen 
> already has spotlight pulse, comedian bobbing, floating LOLs. 
> We just need to add MORE of these micro-animations.

### Phase 2: Sprite Characters (2-3 Weeks)
**Replace circles with actual anime sprite sheets**

```
Steps:
1. Create/download 8 anime character sprite sheets (idle + 3 poses each)
2. Build a <SpriteAnimator> component that cycles through frames
3. Each character gets: position, current pose, facing direction
4. Socket.io syncs pose changes across all users
5. When someone sends 😂 → all audience characters play "laugh" animation
6. When someone sends 🍺 → comedian plays "drink" animation
```

### Phase 3: Full Spine Animation (1-2 Months)
**Professional-quality character animation**

```
Steps:
1. Design 8 base character rigs in Spine/DragonBones
2. Create 8+ animations per character
3. Implement outfit layering (hair, top, bottom, accessories)
4. Add physics-based secondary motion (hair bounce, clothing sway)
5. Implement pair animations (hugging, high-five)
```

---

## 💻 Quick Code Example: Sprite Animator Component

```tsx
// How a SpriteAnimator would work in React Native:

interface SpriteAnimatorProps {
  spriteSheet: ImageSourcePropType;    // The full sprite sheet PNG
  frameWidth: number;                   // Width of each frame (e.g., 100px)
  frameHeight: number;                  // Height of each frame (e.g., 150px)
  frameCount: number;                   // Total frames in current animation
  row: number;                          // Which row = which pose
  fps: number;                          // Animation speed (8-12 fps for anime)
  loop: boolean;
}

function SpriteAnimator({ spriteSheet, frameWidth, frameHeight, frameCount, row, fps, loop }: SpriteAnimatorProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= frameCount - 1) return loop ? 0 : prev;
        return prev + 1;
      });
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [frameCount, fps, loop]);

  return (
    <View style={{ width: frameWidth, height: frameHeight, overflow: 'hidden' }}>
      <Image
        source={spriteSheet}
        style={{
          position: 'absolute',
          left: -(currentFrame * frameWidth),  // Shift horizontally to show current frame
          top: -(row * frameHeight),           // Shift vertically to show current pose row
        }}
      />
    </View>
  );
}

// Usage:
<SpriteAnimator
  spriteSheet={require('./sprites/comedian_sheet.png')}
  frameWidth={100}
  frameHeight={150}
  frameCount={6}
  row={0}       // 0=idle, 1=dance, 2=laugh, 3=drink, 4=sit, 5=hug
  fps={10}
  loop={true}
/>
```

---

## 🎨 Character Pose System Architecture

```
Socket.io Event Flow:
────────────────────────────────────────────

User A taps "Dance" button
       │
       ▼
Socket.emit('avatar:pose', { 
  oderId: 'user_a', 
  pose: 'dancing',
  position: { x: 0.5, y: 0.7 }
})
       │
       ▼
Server broadcasts to all users in room
       │
       ▼
All clients update User A's avatar:
  - SpriteAnimator switches to row 1 (dance frames)
  - Character starts dance animation loop
  - Other characters might react (turn to face, clap)
```

---

## 📊 Performance Budget (₹8,000 Phone)

| Asset | Size | Impact |
|:---|:---|:---|
| Room background Lottie | ~200KB | Low |
| 8 character sprite sheets | ~400KB each = 3.2MB total | Medium |
| Sound effects | ~500KB | Low |
| Total new assets | ~4MB | ✅ Acceptable |
| Target frame rate | 30fps minimum | Must test |

> [!IMPORTANT]
> **Key rule:** Keep it 2D. Do NOT try actual 3D (Unity, Three.js) — it will 
> destroy battery life and crash on budget phones. The best 2D animation 
> looks better than bad 3D animation.

---

## 🔑 Summary: What to Do Next

| Priority | Task | Effort |
|:---|:---|:---|
| **NOW** | Add more micro-animations to current room (smoke, candle flicker, crowd wave) | 1-2 days |
| **NEXT** | Create/find 8 anime sprite sheets with 4 poses each | 3-5 days |
| **THEN** | Build `<SpriteAnimator>` component + pose system | 2-3 days |
| **LATER** | Upgrade to Spine for smooth skeletal animation | 2-4 weeks |
| **FUTURE** | Add outfit customization layers on top of sprites | 1-2 weeks |
