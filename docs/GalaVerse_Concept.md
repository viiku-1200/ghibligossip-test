# GalaVerse — Complete Concept Document

> **The Virtual Social Entertainment Engine Inside Lussovi**
> A 2D avatar-based live entertainment platform combining ticketed performances, social gifting, and luxury fashion — all inside the Lussovi app.

---

## 1. What is GalaVerse?

GalaVerse is Lussovi's **virtual social lounge / metaverse feature** — a 2D avatar-based live entertainment world where:

- **Creators** (singers, comedians, DJs) host ticketed live performances
- **Users** enter as chibi avatars, watch shows, chat, gift, and socialize
- **Revenue** flows through tickets, virtual gifts, VIP subscriptions, and digital fashion

**Think:** BIGO Live's gifting economy + BookMyShow's ticketing + a luxury 2D virtual world

---

## 2. The 8-Step User Flow

| Step | Screen | Description |
|:---:|:---|:---|
| 1 | **Grand Entry** | Dramatic golden doors with red velvet curtains. Two options: "Enter Backstage" (join public rooms) or "Create Private Room" (host your own). Stats: live rooms count + online users |
| 2 | **Room List** | 3 themed rooms — each showing preview image, user count (28/40), and Join button. VIP 🔒 locked rooms for subscribers |
| 3 | **Inside the Room** | Split screen — Chat on top (avatars + VIP badges + messages) + 2D Chibi Stage on bottom (themed backdrop, spotlight, avatars). Input bar with 🎁 gift & 📷 camera buttons |
| 4 | **Avatar Customization** | Create chibi avatar: Hair, Face, Tops, Bottoms, Shoes, Accessories. Free basic items + 🔒 premium designer outfits purchasable with Lussovi Coins |
| 5 | **Gifting Economy** | Virtual gifts: 🌹 Rose (₹50), 🍾 Champagne (₹200), 💎 Diamond Crown (₹500), 👑 Spotlight Pass (₹1,000). Animations fly across everyone's screen via Socket.io |
| 6 | **VIP Benefits** | Big avatar (2x), custom chat colors, gold/purple name, glowing aura, VIP badge, exclusive rooms, premium profile theme |
| 7 | **Profile Card** | Tap avatar → level (Bronze→Silver→Gold→Diamond), XP bar, stats (Followers/Following/Likes), actions (Add Friend, Send Gift, Block), digital item collection |
| 8 | **Spotlight Stage** | Pay ₹1,000 → avatar moves to center stage for 60 seconds. Dramatic entrance animation, system broadcast, outfit showcase, emoji reactions float up |

---

## 3. The 3 Themed Rooms

### 🎙️ Room 1: The Comedy Club — *"The Laugh Vault"*

- **Visual:** Dimly lit cellar, exposed brick wall, warm spotlight on single mic stand, round cabaret tables with chibi avatars holding drinks
- **Content:** Stand-up comedy, roast battles, crowd work
- **Reactions & Gifts:**
  - 👏 Clap / Cheering wave (free)
  - 😂 Floating LOL Emojis / Laugh Track (₹10)
  - 🍅 Virtual Tomato Toss — playful heckling (₹20)
  - 🍺 Send Drink to Comedian (₹50)
- **Why it works:** Indian stand-up is huge. Small comedians can test 20 min of fresh material with 35 paying fans at ₹99/ticket

### 🎸 Room 2: The Acoustic Lounge — *"Velvet Unplugged"*

- **Visual:** Romantic luxury lounge, dark purple/gold lighting, grand piano or acoustic guitar on stage, plush velvet couches
- **Content:** Indie singers, acoustic guitarists, pianists, cover artists
- **Reactions & Gifts:**
  - 🕯️ Swaying Lighters / Phone Flashlights (free crowd sway animation)
  - 🌹 Throw Red Roses onto Stage (₹50)
  - 🍾 Pop Champagne — room-wide cork pop animation (₹200)
  - 👑 Song Request Pass — pinned request with ₹500 tip
- **Why it works:** Intimate unplugged sessions in a 35-person room feel like the singer is performing in your living room

### 🎧 Room 3: The DJ Deck — *"Rooftop Afterhours"*

- **Visual:** Cyberpunk luxury rooftop overlooking city skyline, neon purple/cyan lighting, DJ booth with turntables
- **Content:** EDM, hip-hop, lo-fi beats, Bollywood remixes
- **Reactions & Gifts:**
  - 💃 Avatar Dance Moves — sync avatars to the beat
  - ⚡ Laser Light Show — flashes screen for everyone (₹100)
  - 🚀 Bass Drop Rocket — room-wide VIP effect (₹500)
- **Why it works:** Perfect for late nights (11 PM – 2 AM). Social hangout + party + avatar dancing

---

## 4. Monetization Engine

### A. Ticket Sales
- Creators set ticket price (₹49 – ₹999)
- Each room has limited seats (30–45)
- Scarcity drives urgency and higher prices
- Platform takes 20-30% cut

### B. Virtual Gifting (Micro-transactions)
| Gift | Price | Animation |
|:---|:---|:---|
| 🌹 Virtual Rose | ₹50 | Rose flies across screen to performer |
| 🍺 Beer / Drink | ₹50 | Avatar drinks animation |
| 🍾 Champagne | ₹200 | Cork pop + golden confetti room-wide |
| 💎 Diamond Crown | ₹500 | Crown descends onto performer's avatar |
| 👑 Spotlight Pass | ₹1,000 | User's avatar takes center stage for 60 seconds |

### C. VIP Subscription (Monthly)
- ₹299/month
- Benefits: 2x bigger avatar, custom chat colors, gold username, glowing aura ring, VIP badge, access to exclusive VIP-only rooms, premium profile theme

### D. Digital Fashion Marketplace
- Independent designers sell digital outfits for avatars
- Users buy to dress up their chibi avatars
- Platform takes commission on each sale

### E. Cross-Revenue with Lussovi Shopping
- Users enter GalaVerse for entertainment → after the show, browse the luxury fashion shop
- One user generates revenue from BOTH digital gifting AND physical product purchases

---

## 5. Revenue Projections (Realistic)

| Year | Creators | Users | Monthly Revenue | Annual Revenue |
|:---|:---|:---|:---|:---|
| Year 1 (Validation) | 50 | 5,000 | ₹1.5–2 lakh | ₹15–25 lakh |
| Year 2 (Growth) | 500 | 50,000 | ₹12–25 lakh | ₹1.5–3 crore |
| Year 3 (Scale) | 5,000 | 5,00,000 | ₹1.2–2.5 crore | ₹15–30 crore |

**Revenue per user is 5-10x higher than Spotify** because of uncapped gifting + tickets + VIP combined.

---

## 6. Technical Architecture

### Tech Stack
```
VPS Server
├── Node.js + Express (API)
├── Socket.io        ← chat, gifts, avatar movements (already built)
├── LiveKit Server   ← audio/video relay for host streaming (WebRTC-based, open-source)
└── MongoDB          ← rooms, users, wallets, tickets, inventory

Mobile App (React Native)
├── @livekit/react-native  ← host publishes audio/video
├── Socket.io client       ← chat + gifts + avatar sync
├── 2D Avatar Stage        ← Lottie / Sprite animations
└── Existing Lussovi app   ← shopping, auth, profiles
```

### Why LiveKit (Not Agora)
- ✅ Open-source, self-hosted = free forever
- ✅ Official React Native SDK
- ✅ Built-in room management + permissions
- ✅ Built-in recording (creators can sell replays later)
- ✅ WebRTC under the hood (same tech as Co-Shop)
- ✅ One VPS handles 20+ rooms of 40 users each

### Data Flow
```
Host Phone → LiveKit (1 upload) → Server relays → 40 audience phones
                                                     (subscribe only)

All Users → Socket.io → chat messages, gift animations, avatar positions
                         (lightweight JSON payloads)
```

### Why 2D Avatars (Not 3D)
- No phone overheating
- Smaller app size
- 50+ users per room without lag
- Faster to design new outfits (PNG layers)
- Works on ₹8,000 budget phones

### Avatar Rendering: 5-Layer Stack
```
Layer 1: Body (base sprite)
Layer 2: Face (expression)
Layer 3: Hair (style + color)
Layer 4: Outfit — Top + Bottom (purchasable)
Layer 5: Accessories + Aura (VIP glow ring)
```

---

## 7. Database Schemas Required

### Room Schema
```javascript
{
  roomId: String,
  type: "comedy" | "music" | "dj",
  name: "The Laugh Vault",
  hostId: ObjectId,
  maxSeats: 40,
  currentUsers: [ObjectId],
  ticketPrice: 149,
  status: "live" | "scheduled" | "ended",
  scheduledAt: Date,
  createdAt: Date
}
```

### Wallet Schema
```javascript
{
  userId: ObjectId,
  balance: Number,           // Lussovi Coins
  totalSpent: Number,
  totalEarned: Number,       // for creators
  transactions: [{
    type: "ticket_purchase" | "gift_sent" | "gift_received" | "vip_subscription" | "topup",
    amount: Number,
    relatedUserId: ObjectId,
    roomId: String,
    createdAt: Date
  }]
}
```

### Digital Inventory Schema
```javascript
{
  userId: ObjectId,
  equippedOutfit: {
    hair: String,
    face: String,
    top: String,
    bottom: String,
    shoes: String,
    accessory: String,
    aura: String           // VIP only
  },
  ownedItems: [{
    itemId: String,
    category: "hair" | "face" | "top" | "bottom" | "shoes" | "accessory" | "aura",
    rarity: "free" | "premium" | "vip_exclusive",
    purchasedAt: Date
  }]
}
```

### Social Graph Schema
```javascript
{
  userId: ObjectId,
  friends: [ObjectId],
  followers: [ObjectId],
  following: [ObjectId],
  blocked: [ObjectId],
  friendRequests: [{
    fromUserId: ObjectId,
    status: "pending" | "accepted" | "rejected",
    createdAt: Date
  }]
}
```

---

## 8. Competitive Landscape

**No one in India is doing this exact combination:**

| Feature | StageIt | Wave | BIGO | FRND | Instagram Live | **GalaVerse** |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Ticketed entry | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Limited seats (30-45) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 2D Avatar audience | ❌ | ✅ (3D) | ❌ | Partial | ❌ | ✅ |
| Social gifting | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Works on budget phones | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Available in India | ❌ | ❌ | **Banned** | ✅ | ✅ | ✅ |

**BIGO Live (₹25,000 crore/year revenue) is banned in India. The market is wide open.**

---

## 9. Roadmap

### Phase 1: Build Inside Lussovi (Now)
- GalaVerse golden entry screen
- 1 working room with live chat + static avatars
- Basic gifting (3 gift types)
- Socket.io integration (already exists)

### Phase 2: Full Experience (Month 2-3)
- All 3 themed rooms (Comedy, Music, DJ)
- LiveKit audio streaming for hosts
- Avatar customization (5-layer system)
- Wallet + coin purchase

### Phase 3: Monetize (Month 4-6)
- Ticket booking system
- VIP subscription
- Full gifting economy with animations
- Creator payout dashboard

### Phase 4: Standalone App (Month 6-12)
- If validated → extract GalaVerse into its own app
- Lussovi keeps GalaVerse as a feature
- GalaVerse standalone targets wider entertainment market
- Two products, one company

---

## 10. Key Success Factors

| Will Succeed If... | Will Fail If... |
|:---|:---|
| Recruit 50 talented creators in Year 1 | Try to build everything alone |
| Audio quality is flawless from day 1 | Launch with buggy streaming |
| Focus on India first (Hindi + regional) | Try to go global too early |
| Raise ₹50L–1Cr seed funding by Month 6 | Run out of runway before product-market fit |
| Start with 1 always-open room + bot avatars | Launch with empty rooms (kills the vibe) |
