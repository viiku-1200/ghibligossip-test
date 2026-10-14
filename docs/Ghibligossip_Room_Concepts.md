# Ghibligossip: New Room Concepts & Architecture

This document outlines the detailed, step-by-step feature breakdown for the three new expansion rooms for the standalone app **ghibligossip**.

---

## 1. The Fashion Runway (The "Flex" Room)
**Concept:** A high-end fashion runway where users queue up to walk their avatars down the catwalk, showing off their expensive digital designer clothes. 

### Step-by-Step User Flow:
1. **Entering the Room:** The user enters a glamorous room that looks like a Paris or Tokyo fashion week runway.
2. **The Audience:** If the user is just watching, their avatar sits in the VIP chairs along the sides of the runway. 
3. **Queueing Up:** A user who wants to show off their outfit presses the "Join Runway Queue" button.
4. **The Walk:** When it is their turn, the user's avatar automatically walks down the center of the screen under bright spotlights.
5. **Audience Reaction:** While the avatar is walking, the audience members on the sides can tap buttons to "Cheer", "Take Photo" (flashes paparazzi lights), or rate the outfit out of 10.

### Technical Implementation:
*   **Animations:** Requires a specific "Walking Forward" sprite animation for the avatars.
*   **State Management (Socket.io):** A backend queue system that tracks whose turn it is to walk. When a user is at the front of the queue, the server broadcasts an event to all clients to trigger that avatar's walking animation down the center coordinates.
*   **Monetization:** Users must pay a small Gala Coin fee to join the runway queue. This heavily incentivizes users to buy better digital clothes from the Lussovi designers.

---

## 2. The VIP Cinema (The Watch Party Room)
**Concept:** A synchronized virtual movie theater where a host can cast video content, and 15 VIP avatars watch it together in real-time.

### Step-by-Step User Flow:
1. **Entering the Room:** The screen is split horizontally. The top half is a Video Player. The bottom half is a luxury theater with 15 plush recliner seats.
2. **Hosting the Video:** The Room Host taps a "Cast Video" button. They can either paste a YouTube/MP4 link, or tap "Cast Screen" to share their phone screen.
3. **Synchronized Playback:** The video begins playing on the top half of everyone's screen simultaneously. If the Host pauses, it pauses for everyone.
4. **Interactive Seating:** The 15 VIP avatars sit in the chairs on the bottom half of the screen. Users can press buttons to make their avatars eat popcorn, laugh, gasp, or chat in the text box below.

### Technical Implementation:
*   **Video Player:** Use `react-native-video` or `react-native-youtube-iframe` for the top-half display.
*   **Sync Engine:** Use `Socket.io` to broadcast `play`, `pause`, and `seek` events from the Host to all other clients to ensure everyone is watching the exact same frame.
*   **WebRTC:** If using the "Screen Share" method, implement `react-native-webrtc` to cast the host's screen data.
*   **Monetization:** The Host must pay a premium Gala Coin fee to create a VIP Cinema room. Audience members can buy special animated popcorn or drinks to consume during the movie.

---

## 3. The Gala Casino / Arcade (The Coin Room)
**Concept:** A high-energy, neon-lit room where users can socialize and bet their Gala Coins on quick, multiplayer mini-games.

### Step-by-Step User Flow:
1. **Entering the Room:** Users enter a glowing underground casino or cyberpunk arcade setting.
2. **Choosing a Game:** The center of the room features a large interactive object (e.g., a Roulette Table or a massive Arcade Cabinet). 
3. **Betting:** Users can tap the table to place a bet using their Gala Coins.
4. **The Game Loop:** The game runs on a global timer (e.g., the roulette wheel spins every 60 seconds). All avatars gather around the table and watch the spin together.
5. **Winning/Losing:** Winners get their coin balances updated instantly, accompanied by flashy winning animations above their avatars.

### Technical Implementation:
*   **Game Logic:** The backend server must be the single source of truth for the game logic (e.g., the server randomly determines the roulette outcome and broadcasts it to all clients to prevent cheating).
*   **Wallet Integration:** Requires tight integration with the user's database Wallet to deduct bets and add winnings safely.
*   **Monetization:** This room acts as a "Coin Sink." It gives users a highly entertaining way to spend the Gala Coins they purchased with real money, driving further in-app coin purchases.

---

## 4. The Talk Show (The "Hot Seat" Room)
**Concept:** A late-night talk show set designed specifically for drama, interviews, and "Gossip." Perfect for the `ghibligossip` brand.

### Step-by-Step User Flow:
1. **Entering the Room:** The room looks like a sleek late-night TV talk show set. There is a Host Desk and a "Guest Couch" in the center.
2. **The Hot Seat:** One VIP user is invited to sit on the Guest Couch.
3. **Spicy Q&A:** The audience avatars sit in the bleachers. Audience members pay 10 Gala Coins to submit an anonymous "Spicy Question" or "Truth or Dare" to a queue.
4. **The Drama:** The Host reads the paid questions out loud, and the Guest has to answer them live in the chat (or via voice).
*   **Why it is practical:** It only requires static avatars sitting on a couch and bleachers. The only "coding" needed is a simple text-submission queue powered by Socket.io. Very easy to build, highly engaging.

---

## 5. The Digital Auction House (The Trading Room)
**Concept:** A luxurious, Sotheby's-style auction room where users bid real Gala Coins to win ultra-rare digital clothing items.

### Step-by-Step User Flow:
1. **The Pedestal:** In the center of the room, a 1-of-1 digital designer dress or glowing cyberpunk jacket is displayed on a glowing pedestal.
2. **The Bidding War:** A 60-second timer starts. Users tap a "Bid +50 Coins" button. Every time someone bids, their avatar raises a paddle, and the current price goes up.
3. **The Winner:** When the timer hits zero, the highest bidder wins. Their avatar walks to the center to claim the item, and it is permanently added to their wardrobe.
*   **Why it is practical:** It is just a synchronized countdown timer and a single number (the current bid) updating in real-time over Socket.io. It creates massive FOMO and drives massive coin purchases without complex 3D mechanics.

---

## 6. The DJ Battle (The "Vote with your Feet" Room)
**Concept:** An underground neon club where two users compete to play the best music, and the audience votes by physically moving their avatars.

### Step-by-Step User Flow:
1. **The Setup:** The room has two DJ booths (Red Side and Blue Side). Two users pay a fee to step into the booths.
2. **The Battle:** The Red DJ plays a song (via a YouTube link), then the Blue DJ plays a song.
3. **The Vote:** The audience members drag and drop their avatars to the left side of the room if they liked Red, or the right side if they liked Blue.
4. **The Reward:** The DJ with the most avatars standing on their side of the room wins the battle and takes a prize pool of Gala Coins.
*   **Why it is practical:** You already built the drag-and-drop avatar mechanic in the Laugh Vault! This just uses that exact same code to act as a voting system.
