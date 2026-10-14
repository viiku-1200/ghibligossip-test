# Lussovi: Metaverse Avatar Mechanics & Economy of Actions

This document outlines the architectural strategy and monetization features for the 2D Live Lounge avatars.

## 1. The Core Strategy: 2D Stylized Avatars
To ensure a buttery smooth mobile experience and an extremely fast time-to-market, Lussovi will use **2D Stylized Avatars** with fluid skeletal animations (using engines like Spine 2D or Lottie).
*   **Why 2D?** It prevents phone overheating, reduces app size, allows for 50+ users in a single room without lag, and makes selling digital streetwear much easier to implement.

## 2. The "Economy of Actions" (Monetization Engine)
Avatars in the Live Lounge are not static; they are highly interactive. We monetize these interactions by creating exclusive, premium animations that users purchase with Lussovi Credits (real money).

### A. The Host (Creator)
*   **Role:** The center of attention broadcasting live.
*   **Animations:** Specialized looping postures based on their skill (e.g., standing with a mic stand, sitting with an acoustic guitar, DJing at a booth).
*   **Tech Split:** Predominantly frontend. The host broadcasts audio/video while the avatar plays a continuous idle/performance animation.

### B. The VIP Audience (Users)
The audience populates the space around the stage and can interact with the environment, the host, and each other.

*   **Basic Actions (Free):** Standing idle, clapping, basic cheering.
*   **Premium Actions (Micro-transactions):** 
    *   **Consumables:** Buy a virtual beer (₹50) -> Avatar fluidly drinks it.
    *   **Social Gifts:** Buy a virtual rose -> Avatar blows a kiss that travels across the screen to a specific friend.
*   **Elite Actions (VIP Monthly Subscription):**
    *   Exclusive VIP dance moves.
    *   Special interactive postures (e.g., hugging another VIP user).

## 3. Engineering Architecture: How It Works

The live animation system is heavily weighted towards the frontend, relying on the backend strictly for message passing.

### Frontend (80% of the Work)
*   **Stack:** React Native + Lottie / Reanimated / Spine 2D.
*   **Responsibility:** The frontend stores all the animation files locally on the phone. It handles rendering the graphics and smoothly transitioning a character from "Standing" to "Dancing".

### Backend (20% of the Work)
*   **Stack:** Node.js + Socket.io / WebSockets.
*   **Responsibility:** Ultra-low latency message broadcasting.
*   **Flow:** 
    1. User A taps "Drink Beer".
    2. Frontend sends JSON payload to Socket.io: `{ userId: "A", action: "DRINK_BEER" }`.
    3. Socket.io broadcasts this payload to the other 49 users in the room.
    4. Everyone else's frontend receives the payload and triggers User A's avatar to play the "Drink Beer" animation locally.

## 4. Next Steps for Implementation
1.  Source or design the base 2D vector avatar and its skeletal rig.
2.  Create 3 base animations (Idle, Walk, Clap).
3.  Set up the Socket.io room logic in `server/sockets/index.js` to broadcast `{ action }` payloads.
4.  Wire the React Native frontend to listen to Socket.io and trigger the corresponding animation file.
