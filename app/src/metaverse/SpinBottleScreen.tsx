// ═══════════════════════════════════════════════════════════════
// SpinBottleScreen.tsx — "Two-Way Spin the Bottle"
// Challenger vs Target — The Ultimate Social Game Room
//
// Architecture parity with TruthDareScreen & Galaverse rooms:
// • Split-Screen: Upper Game Table + Lower VIP Lounge
// • 8 VIP Seated Members around an isometric circle
// • Two-Ended Bottle: Top → Challenger 🔴, Bottom → Target 🔵
// • 3 Challenge Types: 💖 Romantic, 🔥 Savage Roast, 🎭 Duo Dare
// • Persistent LiveChat stream, Gift System, Draggable Audience
// • Quick Reaction Bar + Chat Input Bar at bottom
// • Voice equalizer, mic queue, full premium luxury UI
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  TextInput,
  Modal,
  Easing,
  Image,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';

import DraggableAudience from './galaverse/DraggableAudience';
import type { AudienceMode } from './galaverse/AudienceControlsPanel';

const { width: SW, height: SH } = Dimensions.get('window');

// ══════════════════════════════════════════════════════
// SPLIT-SCREEN DIMENSIONS (Galaverse Signature Layout)
// Upper 50%: Game table with bottle & seated players
// Lower 50%: VIP lounge with draggable crowd & live chat
// ══════════════════════════════════════════════════════
const UPPER_H = Math.round(SH * 0.50);
const LOWER_H = SH - UPPER_H;

// Image assets
const STAGE_BG = require('./anime_image/dancefloor_2.png');
const STAGE_BG_ALT = require('./anime_image/room_vip.jpg');
const LOUNGE_BG = require('./anime_image/belowroom.png');

// ── Premium Color Palette ──
const GOLD = '#f5c518';
const GOLD_LIGHT = '#ffd966';
const RUBY = '#ef4444';
const CRIMSON = '#dc2626';
const SAPPHIRE = '#3b82f6';
const CYAN_NEON = '#38bdf8';
const PINK_NEON = '#f472b6';
const PURPLE_NEON = '#c084fc';
const EMERALD = '#34d399';
const DARK_CARD = 'rgba(15, 12, 28, 0.96)';

// Challenger color (top of bottle)
const CHALLENGER_COLOR = '#ff4d6d';
// Target color (bottom of bottle)
const TARGET_COLOR = '#38bdf8';

// ── 8 Ghibli VIP Members ──
interface Member {
  id: number;
  name: string;
  role: string;
  emoji: string;
  color: string;
  isYou: boolean;
  angle: number;
}

const MEMBERS: Member[] = [
  { id: 1, name: 'You',      role: 'VIP Host',       emoji: '👑', color: '#ffd700', isYou: true,  angle: 90  },
  { id: 2, name: 'Chihiro',  role: 'Spirit Girl',    emoji: '🌸', color: '#f472b6', isYou: false, angle: 225 },
  { id: 3, name: 'Haku',     role: 'River Dragon',   emoji: '🐉', color: '#34d399', isYou: false, angle: 270 },
  { id: 4, name: 'Howl',     role: 'Grand Wizard',   emoji: '✨', color: '#c084fc', isYou: false, angle: 315 },
  { id: 5, name: 'Sophie',   role: 'Star Weaver',    emoji: '⭐', color: '#a3e635', isYou: false, angle: 180 },
  { id: 6, name: 'Kiki',     role: 'Sky Courier',    emoji: '🧹', color: '#fb923c', isYou: false, angle: 0   },
  { id: 7, name: 'Ashitaka', role: 'Empathy Prince', emoji: '🏹', color: '#38bdf8', isYou: false, angle: 135 },
  { id: 8, name: 'San',      role: 'Wolf Princess',  emoji: '🐺', color: '#e879f9', isYou: false, angle: 45  },
];

// ── Challenge Content ──
// 💖 Romantic / Compliment Challenges
const ROMANTIC_CHALLENGES = [
  "Say the sweetest thing you genuinely believe about {TARGET}. No sarcasm allowed! 💖",
  "Rate {TARGET}'s vibe from 1–10 and explain why they're at LEAST a 9 ✨",
  "Give {TARGET} a movie-worthy compliment that would make even Howl blush 🌹",
  "If {TARGET} was a song, what song would they be and why? 🎵",
  "Describe {TARGET}'s ideal romantic anime scene — starring them! 🌸",
  "Tell {TARGET} the ONE thing about their energy that makes people gravitate toward them 💫",
  "Write a 2-line love poem for {TARGET} on the spot! Rhyming mandatory! ✍️💕",
  "If you had to introduce {TARGET} to your parents, what would you brag about? 👨‍👩‍👧",
  "Give {TARGET} a new royal title based on their personality (e.g., 'Duchess of Good Vibes') 👑",
  "Tell {TARGET}: What's the first impression they gave you vs what you think of them now? 🔮",
  "If {TARGET} was a dessert, what would they be? Sweet answer only! 🍰",
  "Describe {TARGET} in exactly 3 emojis — then explain your choices 🤔✨",
];

// 🔥 Savage Roast Challenges
const SAVAGE_CHALLENGES = [
  "Roast {TARGET}'s style or bio in ONE savage sentence. No mercy! 🔥",
  "What's the most accurate meme that describes {TARGET}'s personality? 💀",
  "Give {TARGET} a superlative award: 'Most Likely To ___' (make it brutally funny) 🏆",
  "If {TARGET} was a villain, what would their hilariously lame evil plan be? 😈",
  "Describe {TARGET}'s love life using only a movie title 🎬💀",
  "What would {TARGET}'s autobiography be called? Make the title DEVASTATING 📖🔥",
  "If {TARGET}'s personality was a food, what expired dish would it be? 🍕",
  "Roast {TARGET}'s texting habits. We ALL know the truth! 📱💀",
  "What animal does {TARGET} secretly act like when nobody's watching? 🐒",
  "Give {TARGET} an honest 'Google Review' — star rating included ⭐💀",
  "If {TARGET} had a catchphrase, what would it ACTUALLY be? (Be honest) 🎤",
  "Describe {TARGET}'s dance moves using only words. Spare no detail 💃😂",
];

// 🎭 Duo Dare Challenges
const DUO_DARE_CHALLENGES = [
  "Both {CHALLENGER} & {TARGET}: Do a dramatic anime villain laugh on mic RIGHT NOW! 🎭😂",
  "Both of you must sing the chorus of ANY song together — harmony required! 🎤🎤",
  "Act out a 10-second drama scene: {CHALLENGER} is the hero, {TARGET} is the villain! ⚔️",
  "Both must speak in a posh British accent for the next 2 rounds! Cheerio! 🇬🇧☕",
  "Rock Paper Scissors — loser has to give the winner a genuine compliment! ✊✋✌️",
  "Both must simultaneously type the first word that comes to mind. Match = +50 coins! 🧠",
  "Do a dramatic Bollywood movie dialogue scene together — full emotion required! 🎬🇮🇳",
  "Both must post 'I lost to {OTHER} in Spin the Bottle 😭' on their story for 1 hour! 📱",
  "Recreate the 'Spider-Man pointing at Spider-Man' meme using only words! 🕸️",
  "Both must whisper an emotional apology to their phone screens like soap opera actors 😢📱",
  "Play 'Say the Same Word': Count 1-2-3 and say a word. Keep going until you MATCH! 🎯",
  "Both must describe each other using only food items. Most creative wins! 🍕🍣",
];

// ── VIP Luxury Gifts ──
const VIP_GIFTS = [
  { id: 'rose', emoji: '🌹', name: 'Velvet Rose', price: 'FREE', color: '#ff4d6d' },
  { id: 'champagne', emoji: '🍾', name: 'Vintage Moët', price: '₹50', color: '#ffd700' },
  { id: 'fire', emoji: '🔥', name: 'Dragon Flame', price: '₹100', color: '#ff7700' },
  { id: 'diamond', emoji: '💎', name: 'Royal Gem', price: '₹200', color: '#00d2ff' },
  { id: 'crown', emoji: '👑', name: 'Imperial Crown', price: '₹500', color: '#f5c518' },
  { id: 'stardust', emoji: '✨', name: 'Stardust Rain', price: '₹1,000', color: '#e879f9' },
];

const QUICK_EMOJIS = ['💖', '🔥', '💀', '😂', '🍾', '👑', '❤️', '✨'];

const BOT_REACTIONS = [
  "The TENSION between those two!! 😂🔥",
  "This room is getting SPICY tonight 🌶️",
  "OHHH that was either brave or insane 💀😭",
  "Somebody screenshot this moment!! 📸",
  "The chemistry is REAL 💖✨",
  "I can't breathe!! 🤣🤣🤣",
  "Main character energy from BOTH of them 👑",
  "Respect +1000 for that answer 👏",
  "This is better than any drama show 🎬🔥",
  "That was VIOLENTLY smooth 💀✨",
  "Pop the champagne! We witnessed history 🍾",
  "Someone get {name} a therapist after that roast 😂",
];

// Draggable audience slots in lower lounge
const DRAGGABLE_AUDIENCE_SLOTS = [
  { id: 1, size: 105, x: SW * 0.08, y: LOWER_H * 0.16, z: 12 },
  { id: 2, size: 120, x: SW * 0.40, y: LOWER_H * 0.22, z: 14 },
  { id: 3, size: 105, x: SW * 0.74, y: LOWER_H * 0.16, z: 12 },
];

interface ChatMessage {
  id: string;
  sender: string;
  color: string;
  text: string;
  isSystem: boolean;
  isVip?: boolean;
  time: string;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

// ── Challenge type definition ──
type ChallengeType = 'romantic' | 'savage' | 'duo';

interface ActiveChallenge {
  type: ChallengeType;
  text: string;
  challengerIdx: number;
  targetIdx: number;
}

interface SpinBottleScreenProps {
  onBack: () => void;
}

export default function SpinBottleScreen({ onBack }: SpinBottleScreenProps) {
  // ── Visual theme ──
  const [stageTheme, setStageTheme] = useState<'neon' | 'vip'>('neon');

  // ── Game State ──
  const [gamePhase, setGamePhase] = useState<'idle' | 'spinning' | 'pickChallenge' | 'reveal'>('idle');
  const [challengerIdx, setChallengerIdx] = useState<number | null>(null);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [coins, setCoins] = useState(850);
  const [scores, setScores] = useState<Record<number, number>>({});

  // ── Voice & Queue State ──
  const [activeSpeaker, setActiveSpeaker] = useState(2);
  const [micQueue, setMicQueue] = useState<number[]>([1, 7, 0]);
  const [tappedMember, setTappedMember] = useState<number>(0);

  // ── Audience & Activity State ──
  const [audienceCrowdMode, setAudienceCrowdMode] = useState<AudienceMode>('auto');
  const [showAudiencePanel, setShowAudiencePanel] = useState<boolean>(false);
  const allPositions = useRef<Record<number, { x: number; y: number }>>({});

  // ── Chat & Interaction ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [flyingGift, setFlyingGift] = useState<{ id: number; emoji: string; name: string } | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [currentChoreography, setCurrentChoreography] = useState<string | null>(null);

  // ── Animations ──
  const spotlightBeam = useRef(new Animated.Value(0.3)).current;
  const spotlightSway = useRef(new Animated.Value(0)).current;
  const tableFloorGlow = useRef(new Animated.Value(0.4)).current;
  const speakerWave1 = useRef(new Animated.Value(4)).current;
  const speakerWave2 = useRef(new Animated.Value(10)).current;
  const speakerWave3 = useRef(new Animated.Value(6)).current;
  const cardScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const spinAngle = useRef(new Animated.Value(0)).current;
  const dividerPulse = useRef(new Animated.Value(0.6)).current;
  const giftFlyY = useRef(new Animated.Value(0)).current;
  const giftFlyOpacity = useRef(new Animated.Value(0)).current;
  const giftFlyScale = useRef(new Animated.Value(0.5)).current;
  const bottleGlowPulse = useRef(new Animated.Value(0.5)).current;
  const challengerFlash = useRef(new Animated.Value(0)).current;
  const targetFlash = useRef(new Animated.Value(0)).current;

  // 8 Seat breathing animations
  const seatBobs = useRef(MEMBERS.map(() => new Animated.Value(0))).current;

  const chatListRef = useRef<FlatList>(null);
  const usedChallenges = useRef<Set<string>>(new Set());

  // ════════════════════════════════════════════════════
  // INITIALIZATION — Ambient Lights, Voice Viz, Seat Life
  // ════════════════════════════════════════════════════
  useEffect(() => {
    // Spotlight breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightBeam, { toValue: 0.8, duration: 2200, useNativeDriver: true }),
        Animated.timing(spotlightBeam, { toValue: 0.25, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Spotlight sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightSway, { toValue: 14, duration: 3500, useNativeDriver: true }),
        Animated.timing(spotlightSway, { toValue: -14, duration: 3500, useNativeDriver: true }),
      ])
    ).start();

    // Divider laser pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(dividerPulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(dividerPulse, { toValue: 0.45, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Table glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(tableFloorGlow, { toValue: 0.95, duration: 1400, useNativeDriver: true }),
        Animated.timing(tableFloorGlow, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    // Bottle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bottleGlowPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(bottleGlowPulse, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Staggered seat bobbing
    seatBobs.forEach((bob, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(bob, { toValue: -3.5, duration: 1200 + (i * 100), useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: 1200 + (i * 100), useNativeDriver: true }),
        ])
      ).start();
    });

    // Voice equalizer waves
    Animated.loop(
      Animated.sequence([
        Animated.timing(speakerWave1, { toValue: 14, duration: 280, useNativeDriver: false }),
        Animated.timing(speakerWave1, { toValue: 4, duration: 280, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(speakerWave2, { toValue: 6, duration: 420, useNativeDriver: false }),
        Animated.timing(speakerWave2, { toValue: 16, duration: 420, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(speakerWave3, { toValue: 15, duration: 360, useNativeDriver: false }),
        Animated.timing(speakerWave3, { toValue: 5, duration: 360, useNativeDriver: false }),
      ])
    ).start();

    // Welcome messages
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'msg-init-1',
        sender: '🍾 Bottle Master',
        color: GOLD,
        text: '✨ Welcome to Two-Way Spin the Bottle! The bottle has TWO glowing ends — it picks a Challenger AND a Target!',
        isSystem: true,
        time: timeNow,
      },
      {
        id: 'msg-init-2',
        sender: 'Howl',
        color: PURPLE_NEON,
        text: 'Finally a game with REAL chemistry! Who dares to spin first? 🍾✨',
        isSystem: false,
        isVip: true,
        time: timeNow,
      },
      {
        id: 'msg-init-3',
        sender: 'San',
        color: '#e879f9',
        text: 'The roast challenges here are BRUTAL. I love it 🐺🔥',
        isSystem: false,
        isVip: false,
        time: timeNow,
      },
    ]);
  }, []);

  // ════════════════════════════════════════════════════
  // CHAT HELPERS
  // ════════════════════════════════════════════════════
  const addSystemMessage = useCallback((text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}-${Math.random()}`,
        sender: '🍾 Bottle Master',
        color: GOLD,
        text,
        isSystem: true,
        time,
      },
    ]);
  }, []);

  const addBotReaction = useCallback(() => {
    const randomMember = MEMBERS[Math.floor(Math.random() * (MEMBERS.length - 1)) + 1];
    let text = BOT_REACTIONS[Math.floor(Math.random() * BOT_REACTIONS.length)];
    text = text.replace('{name}', randomMember.name);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        sender: randomMember.name,
        color: randomMember.color,
        text,
        isSystem: false,
        isVip: Math.random() > 0.35,
        time,
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ════════════════════════════════════════════════════
  // FLOATING LIVE REACTIONS
  // ════════════════════════════════════════════════════
  const triggerReaction = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    const rx = SW * 0.12 + Math.random() * (SW * 0.72);
    setFloatingReactions(prev => [...prev.slice(-14), { id, emoji, x: rx }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2400);
  }, []);

  // ════════════════════════════════════════════════════
  // AUDIENCE ACTIVITY
  // ════════════════════════════════════════════════════
  const handleAudienceActivity = useCallback((mode: AudienceMode) => {
    setAudienceCrowdMode(mode);
    const modeConfig: Record<AudienceMode, { title: string; icon: string }> = {
      auto: { title: 'Auto Vibe', icon: '✨' },
      dance: { title: 'Dance Floor', icon: '💃' },
      cheer: { title: 'Crowd Cheers', icon: '👏' },
      drink: { title: 'VIP Drinks', icon: '🥂' },
      special: { title: 'Heart Special', icon: '💖' },
    };
    const { title, icon } = modeConfig[mode];
    setCurrentChoreography(`Audience: ${title}`);
    triggerReaction(icon);
    addSystemMessage(`${icon} Audience crowd switched to "${title}"! Drag them around!`);
    setTimeout(() => setCurrentChoreography(null), 3200);
    setTimeout(() => addBotReaction(), 800);
  }, [triggerReaction, addSystemMessage, addBotReaction]);

  // ════════════════════════════════════════════════════
  // FLYING GIFT ANIMATION
  // ════════════════════════════════════════════════════
  const sendGift = useCallback((gift: typeof VIP_GIFTS[0]) => {
    setShowGifts(false);
    setFlyingGift({ id: Date.now(), emoji: gift.emoji, name: gift.name });

    giftFlyY.setValue(0);
    giftFlyOpacity.setValue(1);
    giftFlyScale.setValue(0.5);

    Animated.parallel([
      Animated.timing(giftFlyY, { toValue: -UPPER_H * 0.8, duration: 1700, useNativeDriver: true }),
      Animated.sequence([
        Animated.spring(giftFlyScale, { toValue: 1.9, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(giftFlyScale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(giftFlyOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start(() => setFlyingGift(null));

    const recipient = MEMBERS[tappedMember]?.name || 'The Table';
    addSystemMessage(`🍾 You showered ${recipient} with a ${gift.name} ${gift.emoji}!`);
    triggerReaction(gift.emoji);
    setTimeout(() => addBotReaction(), 800);
  }, [tappedMember, triggerReaction, addBotReaction, addSystemMessage]);

  // ════════════════════════════════════════════════════
  // CHALLENGE PICKING
  // ════════════════════════════════════════════════════
  const getChallenge = useCallback((type: ChallengeType, chIdx: number, tgIdx: number): string => {
    const pools: Record<ChallengeType, string[]> = {
      romantic: ROMANTIC_CHALLENGES,
      savage: SAVAGE_CHALLENGES,
      duo: DUO_DARE_CHALLENGES,
    };
    const pool = pools[type];
    let available = pool.filter(q => !usedChallenges.current.has(q));
    if (available.length === 0) {
      usedChallenges.current.clear();
      available = pool;
    }
    let q = available[Math.floor(Math.random() * available.length)];
    usedChallenges.current.add(q);

    // Replace placeholders
    q = q.replace(/\{CHALLENGER\}/g, MEMBERS[chIdx].name);
    q = q.replace(/\{TARGET\}/g, MEMBERS[tgIdx].name);
    q = q.replace(/\{OTHER\}/g, MEMBERS[tgIdx].name);
    return q;
  }, []);

  // ════════════════════════════════════════════════════
  // THE DUAL SPIN — Two-Ended Bottle Physics
  // ════════════════════════════════════════════════════
  const handleSpin = useCallback(() => {
    if (gamePhase === 'spinning') return;
    setGamePhase('spinning');
    setActiveChallenge(null);
    setShowChallengeModal(false);

    // Pick TWO different players
    let chIdx = Math.floor(Math.random() * MEMBERS.length);
    let tgIdx: number;
    do {
      tgIdx = Math.floor(Math.random() * MEMBERS.length);
    } while (tgIdx === chIdx);

    // Calculate bottle stop angle: bottle "top" (0deg) points at challenger
    // We use the challenger's angle to determine where the bottle neck points
    const spins = 5 + Math.floor(Math.random() * 4);
    const finalAngle = spins * 360 + MEMBERS[chIdx].angle;

    spinAngle.setValue(0);
    Animated.timing(spinAngle, {
      toValue: finalAngle,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setChallengerIdx(chIdx);
      setTargetIdx(tgIdx);
      setTappedMember(chIdx);
      setGamePhase('pickChallenge');
      setRoundNumber(prev => prev + 1);

      const challenger = MEMBERS[chIdx];
      const target = MEMBERS[tgIdx];

      addSystemMessage(`🔴 ${challenger.emoji} ${challenger.name} is the CHALLENGER!`);
      setTimeout(() => {
        addSystemMessage(`🔵 ${target.emoji} ${target.name} is the TARGET!`);
      }, 600);
      setTimeout(() => {
        addSystemMessage(`⚡ ${challenger.name} must now pick a challenge type for ${target.name}!`);
      }, 1200);

      setActiveSpeaker(chIdx);
      triggerReaction('🍾');

      // Flash animations for challenger and target
      challengerFlash.setValue(0);
      targetFlash.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(challengerFlash, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(challengerFlash, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        { iterations: 4 }
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(targetFlash, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(targetFlash, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        { iterations: 4 }
      ).start();

      setTimeout(() => addBotReaction(), 700);

      // Auto-pick for bots
      if (!challenger.isYou) {
        setTimeout(() => {
          const types: ChallengeType[] = ['romantic', 'savage', 'duo'];
          const autoType = types[Math.floor(Math.random() * types.length)];
          handleChallengeChoice(autoType, chIdx, tgIdx);
        }, 3000);
      }
    });
  }, [gamePhase, addSystemMessage, addBotReaction, triggerReaction]);

  // ════════════════════════════════════════════════════
  // CHALLENGE CHOICE REVEAL
  // ════════════════════════════════════════════════════
  const handleChallengeChoice = useCallback((type: ChallengeType, chIdx?: number, tgIdx?: number) => {
    const ci = chIdx ?? challengerIdx;
    const ti = tgIdx ?? targetIdx;
    if (ci === null || ti === null) return;

    const challenger = MEMBERS[ci];
    const target = MEMBERS[ti];
    const challengeText = getChallenge(type, ci, ti);

    const challenge: ActiveChallenge = {
      type,
      text: challengeText,
      challengerIdx: ci,
      targetIdx: ti,
    };

    setActiveChallenge(challenge);
    setGamePhase('reveal');
    setShowChallengeModal(true);

    cardScale.setValue(0.2);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    const typeLabels: Record<ChallengeType, string> = {
      romantic: '💖 ROMANTIC',
      savage: '🔥 SAVAGE ROAST',
      duo: '🎭 DUO DARE',
    };
    addSystemMessage(`⚡ ${challenger.name} chose ${typeLabels[type]} for ${target.name}!`);
    triggerReaction(type === 'romantic' ? '💖' : type === 'savage' ? '🔥' : '🎭');
    setTimeout(() => addBotReaction(), 1000);
  }, [challengerIdx, targetIdx, getChallenge, addSystemMessage, triggerReaction, addBotReaction]);

  // ════════════════════════════════════════════════════
  // NEXT ROUND
  // ════════════════════════════════════════════════════
  const handleNextRound = useCallback(() => {
    setShowChallengeModal(false);
    setActiveChallenge(null);
    setGamePhase('idle');
    setChallengerIdx(null);
    setTargetIdx(null);

    const updated = [...micQueue];
    if (activeSpeaker !== null) updated.push(activeSpeaker);
    const nextSpeaker = updated.shift() ?? 0;
    setActiveSpeaker(nextSpeaker);
    setMicQueue(updated);
  }, [micQueue, activeSpeaker]);

  // ════════════════════════════════════════════════════
  // SEND CHAT MESSAGE
  // ════════════════════════════════════════════════════
  const sendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'You',
        color: GOLD,
        text: inputText.trim(),
        isSystem: false,
        isVip: true,
        time,
      },
    ]);
    setInputText('');
    setTimeout(() => addBotReaction(), 1100);
  }, [inputText, addBotReaction]);

  // ── Spin rotation interpolation ──
  const spinRotation = spinAngle.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // ── Orbit coordinates for 8 seats ──
  const CENTER_X = SW / 2;
  const CENTER_Y = (UPPER_H - 45) / 2 + 38;
  const RADIUS_X = SW * 0.38;
  const RADIUS_Y = (UPPER_H - 100) * 0.38;

  // ════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* ══════════════════════════════════════════════════════
            1. UPPER HALF: THE LIVE GAME TABLE
            ══════════════════════════════════════════════════════ */}
        <View style={styles.upperStage}>
          <Image
            source={stageTheme === 'neon' ? STAGE_BG : STAGE_BG_ALT}
            style={styles.upperBgImage}
            resizeMode="cover"
          />
          <View style={styles.stageOverlayVignette} />

          {/* Animated Sweeping Spotlights */}
          <Animated.View
            style={[
              styles.spotlightConeLeft,
              {
                opacity: spotlightBeam,
                transform: [{ translateX: spotlightSway }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.spotlightConeRight,
              {
                opacity: spotlightBeam,
                transform: [{ translateX: Animated.multiply(spotlightSway, -1) }],
              },
            ]}
          />

          {/* Floating Stage Particles */}
          <View style={styles.particlesWrap} pointerEvents="none">
            <Text style={[styles.starParticle, { top: '18%', left: '8%' }]}>✦</Text>
            <Text style={[styles.starParticle, { top: '34%', right: '10%' }]}>✧</Text>
            <Text style={[styles.starParticle, { top: '60%', left: '18%' }]}>✦</Text>
            <Text style={[styles.starParticle, { top: '75%', right: '22%' }]}>✧</Text>
          </View>

          {/* ═══ VIP HEADER BAR ═══ */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <View style={styles.headerBadgeRow}>
                <View style={styles.liveTag}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveTagText}>LIVE</Text>
                </View>
                <TouchableOpacity
                  style={styles.themeToggleBtn}
                  onPress={() => setStageTheme(t => t === 'neon' ? 'vip' : 'neon')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.themeToggleText}>
                    {stageTheme === 'neon' ? '⚡ NEON STAGE' : '👑 ROYAL VIP'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.headerTitleText}>SPIN THE BOTTLE</Text>
              <Text style={styles.headerSubText}>Two-Way · Round #{roundNumber}</Text>
            </View>

            <View style={styles.walletBadge}>
              <Text style={styles.walletIcon}>🪙</Text>
              <Text style={styles.walletAmount}>{coins}</Text>
            </View>
          </View>

          {/* Choreography Banner */}
          {currentChoreography && (
            <View style={styles.actionBanner}>
              <Text style={styles.actionBannerText}>✨ {currentChoreography} ✨</Text>
            </View>
          )}

          {/* ═══ CHALLENGER vs TARGET INDICATOR ═══ */}
          {gamePhase === 'pickChallenge' && challengerIdx !== null && targetIdx !== null && (
            <View style={styles.vsIndicatorRow}>
              <View style={[styles.vsPlayerCard, { borderColor: CHALLENGER_COLOR }]}>
                <Text style={styles.vsRoleLabel}>🔴 CHALLENGER</Text>
                <Text style={styles.vsPlayerEmoji}>{MEMBERS[challengerIdx].emoji}</Text>
                <Text style={[styles.vsPlayerName, { color: CHALLENGER_COLOR }]}>{MEMBERS[challengerIdx].name}</Text>
              </View>
              <View style={styles.vsBoltContainer}>
                <Text style={styles.vsBoltText}>⚡</Text>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={[styles.vsPlayerCard, { borderColor: TARGET_COLOR }]}>
                <Text style={styles.vsRoleLabel}>🔵 TARGET</Text>
                <Text style={styles.vsPlayerEmoji}>{MEMBERS[targetIdx].emoji}</Text>
                <Text style={[styles.vsPlayerName, { color: TARGET_COLOR }]}>{MEMBERS[targetIdx].name}</Text>
              </View>
            </View>
          )}

          {/* ═══ ISOMETRIC TABLE WITH TWO-ENDED BOTTLE ═══ */}
          <View
            style={[
              styles.tableContainer,
              { left: CENTER_X - (SW * 0.32), top: CENTER_Y - (SW * 0.18) },
            ]}
          >
            <Animated.View style={[styles.tableFloorAura, { opacity: tableFloorGlow }]} />

            <View style={styles.isometricTable}>
              <View style={styles.tableInnerDisc}>
                <TouchableOpacity
                  style={styles.spinTouchable}
                  onPress={gamePhase === 'pickChallenge' ? undefined : handleSpin}
                  activeOpacity={0.8}
                  disabled={gamePhase === 'spinning'}
                >
                  {/* Two-Ended Bottle */}
                  <Animated.View
                    style={[
                      styles.bottlePointerWrap,
                      { transform: [{ rotate: spinRotation }] },
                    ]}
                  >
                    {/* Top End (Challenger) - Red Glow */}
                    <Animated.View style={[styles.bottleEndTop, { opacity: bottleGlowPulse }]}>
                      <View style={styles.bottleEndTopGlow} />
                    </Animated.View>
                    <Text style={styles.bottleEmoji}>🍾</Text>
                    {/* Bottom End (Target) - Blue Glow */}
                    <Animated.View style={[styles.bottleEndBottom, { opacity: bottleGlowPulse }]}>
                      <View style={styles.bottleEndBottomGlow} />
                    </Animated.View>
                  </Animated.View>

                  {/* Center Plaque */}
                  <View style={styles.centerPlaque}>
                    <Text style={styles.centerPlaqueText}>
                      {gamePhase === 'spinning' ? '...'
                        : gamePhase === 'idle' ? 'SPIN'
                        : gamePhase === 'pickChallenge' ? 'PICK'
                        : 'NEXT'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ═══ 8 SEATED VIP CHARACTERS ═══ */}
          {MEMBERS.map((member, idx) => {
            const rad = (member.angle * Math.PI) / 180;
            const seatX = CENTER_X + RADIUS_X * Math.cos(rad) - 27;
            const seatY = CENTER_Y + RADIUS_Y * Math.sin(rad) - 27;
            const isSpeaking = activeSpeaker === idx;
            const isTapped = tappedMember === idx;
            const isChallenger = challengerIdx === idx && (gamePhase === 'pickChallenge' || gamePhase === 'reveal');
            const isTarget = targetIdx === idx && (gamePhase === 'pickChallenge' || gamePhase === 'reveal');
            const qPos = micQueue.indexOf(idx);
            const bobAnim = seatBobs[idx];

            return (
              <Animated.View
                key={member.id}
                style={[
                  styles.seatNode,
                  {
                    left: seatX,
                    top: seatY,
                    transform: [{ translateY: bobAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.seatTouchable}
                  activeOpacity={0.75}
                  onPress={() => setTappedMember(idx)}
                >
                  {/* Challenger / Target Aura Ring */}
                  {isChallenger && (
                    <Animated.View
                      style={[
                        styles.challengerAuraRing,
                        { opacity: challengerFlash },
                      ]}
                    />
                  )}
                  {isTarget && (
                    <Animated.View
                      style={[
                        styles.targetAuraRing,
                        { opacity: targetFlash },
                      ]}
                    />
                  )}

                  {/* Speaking Glow */}
                  {isSpeaking && !isChallenger && !isTarget && (
                    <Animated.View
                      style={[
                        styles.speakerAuraRing,
                        { borderColor: member.color, opacity: tableFloorGlow },
                      ]}
                    />
                  )}

                  {/* Selected Outline */}
                  {isTapped && !isSpeaking && !isChallenger && !isTarget && (
                    <View style={[styles.selectedSeatRing, { borderColor: member.color }]} />
                  )}

                  {/* Avatar Orb */}
                  <View
                    style={[
                      styles.avatarOrb,
                      {
                        borderColor: isChallenger ? CHALLENGER_COLOR
                          : isTarget ? TARGET_COLOR
                          : isSpeaking ? GOLD
                          : member.color,
                        backgroundColor: member.isYou ? 'rgba(255, 215, 0, 0.28)' : 'rgba(18, 12, 32, 0.9)',
                      },
                    ]}
                  >
                    <Text style={styles.avatarOrbEmoji}>{member.emoji}</Text>
                  </View>

                  {/* Role Tags (Challenger/Target) */}
                  {isChallenger && (
                    <View style={[styles.roleTagBadge, { backgroundColor: CHALLENGER_COLOR }]}>
                      <Text style={styles.roleTagText}>🔴</Text>
                    </View>
                  )}
                  {isTarget && (
                    <View style={[styles.roleTagBadge, { backgroundColor: TARGET_COLOR }]}>
                      <Text style={styles.roleTagText}>🔵</Text>
                    </View>
                  )}

                  {/* Queue Badge */}
                  {qPos !== -1 && (
                    <View style={[styles.seatQueueBadge, { backgroundColor: member.color }]}>
                      <Text style={styles.seatQueueText}>{qPos + 1}</Text>
                    </View>
                  )}

                  {/* On-Mic */}
                  {isSpeaking && (
                    <View style={styles.onAirIndicator}>
                      <Text style={styles.onAirMicIcon}>🎙️</Text>
                    </View>
                  )}

                  {/* Name Tag */}
                  <View style={styles.seatNamePill}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.seatNameText,
                        {
                          color: isChallenger ? CHALLENGER_COLOR
                            : isTarget ? TARGET_COLOR
                            : isSpeaking ? GOLD
                            : '#ffffff',
                        },
                      ]}
                    >
                      {member.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* ═══ CHALLENGE TYPE PICK BUTTONS (when pickChallenge phase, and YOU are challenger) ═══ */}
          {gamePhase === 'pickChallenge' && challengerIdx !== null && MEMBERS[challengerIdx].isYou && (
            <View style={styles.challengePickRow}>
              <TouchableOpacity
                style={[styles.challengeTypeBtn, { backgroundColor: 'rgba(255, 77, 109, 0.25)', borderColor: '#ff4d6d' }]}
                onPress={() => handleChallengeChoice('romantic')}
                activeOpacity={0.8}
              >
                <Text style={styles.challengeTypeBtnEmoji}>💖</Text>
                <Text style={[styles.challengeTypeBtnText, { color: '#ff4d6d' }]}>Romantic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.challengeTypeBtn, { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: '#ef4444' }]}
                onPress={() => handleChallengeChoice('savage')}
                activeOpacity={0.8}
              >
                <Text style={styles.challengeTypeBtnEmoji}>🔥</Text>
                <Text style={[styles.challengeTypeBtnText, { color: '#ef4444' }]}>Savage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.challengeTypeBtn, { backgroundColor: 'rgba(192, 132, 252, 0.25)', borderColor: '#c084fc' }]}
                onPress={() => handleChallengeChoice('duo')}
                activeOpacity={0.8}
              >
                <Text style={styles.challengeTypeBtnEmoji}>🎭</Text>
                <Text style={[styles.challengeTypeBtnText, { color: '#c084fc' }]}>Duo Dare</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ══════════════════════════════════════════════════════
            2. GLOWING NEON DIVIDER
            ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            styles.neonDivider,
            { opacity: dividerPulse, shadowOpacity: dividerPulse },
          ]}
        />

        {/* ══════════════════════════════════════════════════════
            3. LOWER HALF: LOUNGE, DRAGGABLE AUDIENCE & CHAT
            ══════════════════════════════════════════════════════ */}
        <View style={styles.lowerLounge}>
          <Image source={LOUNGE_BG} style={styles.lowerBgImage} resizeMode="cover" />
          <View style={styles.loungeDarkOverlay} />

          {/* Draggable VIP Audience */}
          <View style={styles.draggableAudienceArea} pointerEvents="box-none">
            {DRAGGABLE_AUDIENCE_SLOTS.map(slot => (
              <DraggableAudience
                key={slot.id}
                id={slot.id}
                mode={audienceCrowdMode}
                size={slot.size}
                initialX={slot.x}
                initialY={slot.y}
                zIndex={slot.z}
                allPositions={allPositions}
                roomWidth={SW}
                roomHeight={LOWER_H}
              />
            ))}
          </View>

          {/* ═══ HUD STATUS & AUDIENCE ACTIVITY BAR ═══ */}
          <View style={styles.loungeHudBar}>
            <View style={styles.speakerEqualizerCard}>
              <View style={styles.equalizerBarsRow}>
                <Animated.View style={[styles.eqBar, { height: speakerWave1, backgroundColor: MEMBERS[activeSpeaker]?.color || GOLD }]} />
                <Animated.View style={[styles.eqBar, { height: speakerWave2, backgroundColor: MEMBERS[activeSpeaker]?.color || GOLD }]} />
                <Animated.View style={[styles.eqBar, { height: speakerWave3, backgroundColor: MEMBERS[activeSpeaker]?.color || GOLD }]} />
              </View>
              <View>
                <Text style={styles.hudSpeakerLabel}>ON MIC</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.hudSpeakerName, { color: MEMBERS[activeSpeaker]?.color || GOLD }]}
                >
                  {MEMBERS[activeSpeaker]?.name}
                </Text>
              </View>
            </View>

            <View style={styles.hudRightControlsRow}>
              <TouchableOpacity
                style={[styles.audienceMainBtn, showAudiencePanel && styles.audienceMainBtnActive]}
                onPress={() => setShowAudiencePanel(prev => !prev)}
                activeOpacity={0.75}
              >
                <Text style={styles.audienceMainBtnIcon}>👥</Text>
                <Text style={styles.audienceMainBtnText}>AUDIENCE</Text>
                <Text style={styles.audienceMainBtnArrow}>{showAudiencePanel ? '▴' : '▾'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.micQueueActionBtn,
                  micQueue.includes(tappedMember) && styles.micQueueActionBtnActive,
                ]}
                onPress={() => {
                  if (micQueue.includes(tappedMember)) {
                    setMicQueue(prev => prev.filter(i => i !== tappedMember));
                    addSystemMessage(`${MEMBERS[tappedMember].name} left the speaker queue.`);
                  } else {
                    setMicQueue(prev => [...prev, tappedMember]);
                    addSystemMessage(`🎙️ ${MEMBERS[tappedMember].name} joined the live speaker queue!`);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.micQueueActionIcon}>🎙️</Text>
                <Text style={styles.micQueueActionText}>
                  {micQueue.includes(tappedMember) ? 'Leave' : 'Queue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expandable Audience Panel */}
          {showAudiencePanel && (
            <View style={styles.audienceActivityDropdown}>
              <View style={styles.activityDropdownHeader}>
                <Text style={styles.activityDropdownTitle}>✦ AUDIENCE ACTIVITIES ✦</Text>
                <Text style={styles.activityDropdownHint}>Touch & drag characters anywhere on the floor!</Text>
              </View>
              <View style={styles.activityButtonsRow}>
                {(['auto', 'dance', 'cheer', 'drink', 'special'] as AudienceMode[]).map(mode => {
                  const isActive = audienceCrowdMode === mode;
                  const iconMap: Record<AudienceMode, string> = {
                    auto: '✨', dance: '💃', cheer: '👏', drink: '🥂', special: '💖',
                  };
                  const labelMap: Record<AudienceMode, string> = {
                    auto: 'Auto', dance: 'Dance', cheer: 'Cheer', drink: 'Drink', special: 'Love',
                  };
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.activityModeBtn, isActive && styles.activityModeBtnActive]}
                      onPress={() => handleAudienceActivity(mode)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.activityModeIcon}>{iconMap[mode]}</Text>
                      <Text style={[styles.activityModeText, isActive && styles.activityModeTextActive]}>
                        {labelMap[mode]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ═══ LIVE TRANSPARENT CHAT STREAM ═══ */}
          <View style={styles.chatStreamContainer} pointerEvents="box-none">
            <FlatList
              ref={chatListRef}
              data={messages}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatScrollContent}
              renderItem={({ item }) => {
                const isSys = item.isSystem;
                return (
                  <View style={[styles.chatRow, isSys && styles.systemChatRow]}>
                    {!isSys && (
                      <View style={[styles.chatAvatarThumb, { borderColor: item.color }]}>
                        <Text style={styles.chatAvatarText}>{item.sender.charAt(0)}</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.chatBubble,
                        isSys && styles.systemChatBubble,
                        item.isVip && styles.vipChatBubble,
                      ]}
                    >
                      <View style={styles.chatBubbleHeader}>
                        <Text style={[styles.chatSenderName, { color: item.color }]}>
                          {item.sender}
                        </Text>
                        {item.isVip && (
                          <View style={styles.vipTagPill}>
                            <Text style={styles.vipTagPillText}>VIP</Text>
                          </View>
                        )}
                        <Text style={styles.chatTimeText}>{item.time}</Text>
                      </View>
                      <Text style={[styles.chatMessageText, isSys && styles.systemMessageText]}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>

          {/* ═══ QUICK REACTION BAR ═══ */}
          <View style={styles.quickReactionBar}>
            {QUICK_EMOJIS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionChipBtn}
                onPress={() => triggerReaction(emoji)}
                activeOpacity={0.6}
              >
                <Text style={styles.reactionChipEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ═══ INPUT BAR & GIFT TRIGGER ═══ */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.inputBarArea}
          >
            <TouchableOpacity
              style={styles.giftTriggerBtn}
              onPress={() => setShowGifts(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.giftTriggerIcon}>🎁</Text>
            </TouchableOpacity>

            <View style={styles.textInputWrap}>
              <TextInput
                style={styles.textInputBox}
                placeholder="Drop a reaction or type something..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
            </View>

            <TouchableOpacity style={styles.sendTriggerBtn} onPress={sendMessage} activeOpacity={0.8}>
              <Text style={styles.sendTriggerIcon}>➤</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>

          {/* Floating Reactions */}
          {floatingReactions.map(r => (
            <AnimatedReaction key={r.id} emoji={r.emoji} x={r.x} />
          ))}

          {/* Flying Gift */}
          {flyingGift && (
            <Animated.View
              style={[
                styles.flyingGiftWrapper,
                {
                  opacity: giftFlyOpacity,
                  transform: [{ translateY: giftFlyY }, { scale: giftFlyScale }],
                },
              ]}
            >
              <Text style={styles.flyingGiftEmoji}>{flyingGift.emoji}</Text>
              <Text style={styles.flyingGiftTitle}>{flyingGift.name}</Text>
            </Animated.View>
          )}

          {/* ═══ VIP GIFT SHEET MODAL ═══ */}
          <Modal visible={showGifts} transparent animationType="slide">
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowGifts(false)}
            >
              <View style={styles.giftSheetPanel}>
                <View style={styles.giftSheetHandle} />
                <Text style={styles.giftSheetTitleText}>✦ SEND VIP GIFT ✦</Text>
                <Text style={styles.giftSheetSubText}>
                  Send gift to: <Text style={{ color: GOLD }}>{MEMBERS[tappedMember]?.name || 'The Table'}</Text>
                </Text>

                <View style={styles.giftTileGrid}>
                  {VIP_GIFTS.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={styles.giftTileItem}
                      onPress={() => sendGift(g)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.giftTileBox, { borderColor: g.color + '45' }]}>
                        <Text style={styles.giftTileEmoji}>{g.emoji}</Text>
                        <Text style={styles.giftTileName}>{g.name}</Text>
                        <View style={styles.giftPriceBadge}>
                          <Text style={[styles.giftPriceText, { color: g.color }]}>{g.price}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ═══ CHALLENGE REVEAL MODAL ═══ */}
          <Modal visible={showChallengeModal} transparent animationType="fade">
            <View style={styles.cardModalOverlay}>
              <Animated.View
                style={[
                  styles.cardFrame,
                  {
                    transform: [{ scale: cardScale }],
                    opacity: cardOpacity,
                  },
                ]}
              >
                {/* Holographic Aura */}
                <View
                  style={[
                    styles.cardAuraGlow,
                    {
                      backgroundColor:
                        activeChallenge?.type === 'romantic'
                          ? 'rgba(255, 77, 109, 0.4)'
                          : activeChallenge?.type === 'savage'
                          ? 'rgba(239, 68, 68, 0.4)'
                          : 'rgba(192, 132, 252, 0.4)',
                    },
                  ]}
                />

                <View
                  style={[
                    styles.cardBody,
                    {
                      borderColor:
                        activeChallenge?.type === 'romantic' ? '#ff4d6d'
                        : activeChallenge?.type === 'savage' ? '#ef4444'
                        : '#c084fc',
                    },
                  ]}
                >
                  {/* Challenge Type Badge */}
                  <View style={styles.cardTypeBadge}>
                    <Text style={styles.cardTypeEmoji}>
                      {activeChallenge?.type === 'romantic' ? '💖'
                        : activeChallenge?.type === 'savage' ? '🔥'
                        : '🎭'}
                    </Text>
                    <Text
                      style={[
                        styles.cardTypeTitle,
                        {
                          color:
                            activeChallenge?.type === 'romantic' ? '#ff4d6d'
                            : activeChallenge?.type === 'savage' ? '#ef4444'
                            : '#c084fc',
                        },
                      ]}
                    >
                      {activeChallenge?.type === 'romantic' ? 'ROMANTIC CHALLENGE'
                        : activeChallenge?.type === 'savage' ? 'SAVAGE ROAST'
                        : 'DUO DARE'}
                    </Text>
                  </View>

                  {/* Challenger vs Target in Card */}
                  <View style={styles.cardVsRow}>
                    <View style={styles.cardVsPlayer}>
                      <Text style={styles.cardVsEmoji}>
                        {activeChallenge ? MEMBERS[activeChallenge.challengerIdx].emoji : ''}
                      </Text>
                      <Text style={[styles.cardVsName, { color: CHALLENGER_COLOR }]}>
                        {activeChallenge ? MEMBERS[activeChallenge.challengerIdx].name : ''}
                      </Text>
                      <Text style={[styles.cardVsRole, { color: CHALLENGER_COLOR }]}>Challenger</Text>
                    </View>
                    <Text style={styles.cardVsBolt}>⚡</Text>
                    <View style={styles.cardVsPlayer}>
                      <Text style={styles.cardVsEmoji}>
                        {activeChallenge ? MEMBERS[activeChallenge.targetIdx].emoji : ''}
                      </Text>
                      <Text style={[styles.cardVsName, { color: TARGET_COLOR }]}>
                        {activeChallenge ? MEMBERS[activeChallenge.targetIdx].name : ''}
                      </Text>
                      <Text style={[styles.cardVsRole, { color: TARGET_COLOR }]}>Target</Text>
                    </View>
                  </View>

                  {/* Challenge Text */}
                  <View style={styles.cardQuestionBox}>
                    <Text style={styles.cardQuestionText}>{activeChallenge?.text}</Text>
                  </View>

                  <View style={styles.cardDividerBar}>
                    <View style={styles.cardDividerLine} />
                    <Text style={styles.cardDividerStar}>✦ 🍾 ✦</Text>
                    <View style={styles.cardDividerLine} />
                  </View>

                  <View style={styles.cardButtonColumn}>
                    <TouchableOpacity
                      style={[
                        styles.cardDoneBtn,
                        {
                          backgroundColor:
                            activeChallenge?.type === 'romantic' ? '#ff4d6d'
                            : activeChallenge?.type === 'savage' ? '#ef4444'
                            : '#c084fc',
                        },
                      ]}
                      onPress={() => {
                        setShowChallengeModal(false);
                        if (activeChallenge) {
                          const ch = MEMBERS[activeChallenge.challengerIdx].name;
                          const tg = MEMBERS[activeChallenge.targetIdx].name;
                          addSystemMessage(`🏆 ${ch} & ${tg} triumphantly completed the challenge!`);
                          // Add score
                          setScores(prev => ({
                            ...prev,
                            [activeChallenge.challengerIdx]: (prev[activeChallenge.challengerIdx] || 0) + 10,
                            [activeChallenge.targetIdx]: (prev[activeChallenge.targetIdx] || 0) + 10,
                          }));
                        }
                        triggerReaction('👑');
                        setTimeout(() => addBotReaction(), 600);
                        setTimeout(() => handleNextRound(), 1400);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardDoneBtnText}>CHALLENGE COMPLETE ✓</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardSkipBtn}
                      onPress={() => {
                        if (coins >= 25) {
                          setCoins(prev => prev - 25);
                          setShowChallengeModal(false);
                          if (activeChallenge) {
                            const tg = MEMBERS[activeChallenge.targetIdx].name;
                            addSystemMessage(`🐔 ${tg} paid 25 coins to dodge the challenge!`);
                          }
                          triggerReaction('💀');
                          setTimeout(() => handleNextRound(), 1200);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cardSkipBtnText}>Chicken Out (-25 🪙)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </Modal>

        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Floating Live Reaction Emojis ──
function AnimatedReaction({ emoji, x }: { emoji: string; x: number }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(floatY, {
        toValue: -LOWER_H * 0.85,
        duration: 2100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1100),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingEmojiContainer,
        {
          left: x,
          opacity,
          transform: [{ translateY: floatY }],
        },
      ]}
    >
      <Text style={styles.floatingEmojiGlyph}>{emoji}</Text>
    </Animated.View>
  );
}

// ══════════════════════════════════════════════════════
// STYLESHEET — Premium Luxury Dark Theme
// ══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#08060f',
  },
  container: {
    flex: 1,
    backgroundColor: '#08060f',
  },

  // ── UPPER STAGE ──
  upperStage: {
    height: UPPER_H,
    overflow: 'hidden',
  },
  upperBgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  stageOverlayVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 3, 15, 0.55)',
  },
  spotlightConeLeft: {
    position: 'absolute',
    top: 0,
    left: '10%',
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(245, 197, 24, 0.06)',
    transform: [{ skewX: '-12deg' }],
  },
  spotlightConeRight: {
    position: 'absolute',
    top: 0,
    right: '10%',
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(192, 132, 252, 0.06)',
    transform: [{ skewX: '12deg' }],
  },
  particlesWrap: {
    ...StyleSheet.absoluteFill,
  },
  starParticle: {
    position: 'absolute',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.25)',
  },

  // ── HEADER ──
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 50,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: '#ffffff',
    marginTop: -2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },
  themeToggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  themeToggleText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  headerTitleText: {
    fontSize: 14,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  headerSubText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 197, 24, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.25)',
  },
  walletIcon: {
    fontSize: 14,
    marginRight: 3,
  },
  walletAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: GOLD,
  },
  actionBanner: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    zIndex: 40,
  },
  actionBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e2b0ff',
    textAlign: 'center',
  },

  // ── VS INDICATOR ROW ──
  vsIndicatorRow: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 45,
    gap: 6,
  },
  vsPlayerCard: {
    backgroundColor: 'rgba(12, 8, 25, 0.88)',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 85,
  },
  vsRoleLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  vsPlayerEmoji: {
    fontSize: 22,
  },
  vsPlayerName: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  vsBoltContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsBoltText: {
    fontSize: 22,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 2,
    marginTop: -2,
  },

  // ── TABLE ──
  tableContainer: {
    position: 'absolute',
    width: SW * 0.64,
    height: SW * 0.40,
    zIndex: 10,
  },
  tableFloorAura: {
    position: 'absolute',
    width: '130%',
    height: '140%',
    left: '-15%',
    top: '-20%',
    borderRadius: SW * 0.5,
    backgroundColor: 'rgba(245, 197, 24, 0.06)',
  },
  isometricTable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableInnerDisc: {
    width: SW * 0.36,
    height: SW * 0.36,
    borderRadius: SW * 0.18,
    backgroundColor: 'rgba(20, 15, 40, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(245, 197, 24, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  spinTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottlePointerWrap: {
    position: 'absolute',
    width: SW * 0.30,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleEmoji: {
    fontSize: 36,
  },
  // Two-ended bottle glow effects
  bottleEndTop: {
    position: 'absolute',
    top: -8,
    left: -4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleEndTopGlow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: CHALLENGER_COLOR,
    shadowColor: CHALLENGER_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  bottleEndBottom: {
    position: 'absolute',
    bottom: -8,
    right: -4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleEndBottomGlow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: TARGET_COLOR,
    shadowColor: TARGET_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  centerPlaque: {
    position: 'absolute',
    backgroundColor: 'rgba(245, 197, 24, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
  },
  centerPlaqueText: {
    fontSize: 11,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 2,
  },

  // ── SEATS ──
  seatNode: {
    position: 'absolute',
    width: 58,
    height: 70,
    zIndex: 20,
  },
  seatTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  challengerAuraRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: 10,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: CHALLENGER_COLOR,
    shadowColor: CHALLENGER_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  targetAuraRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: 10,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: TARGET_COLOR,
    shadowColor: TARGET_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  speakerAuraRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: 12,
    borderRadius: 30,
    borderWidth: 2.5,
  },
  selectedSeatRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: 13,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  avatarOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarOrbEmoji: {
    fontSize: 22,
  },
  roleTagBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  roleTagText: {
    fontSize: 8,
  },
  seatQueueBadge: {
    position: 'absolute',
    top: -2,
    left: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatQueueText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
  },
  onAirIndicator: {
    position: 'absolute',
    top: -10,
    right: -12,
  },
  onAirMicIcon: {
    fontSize: 13,
  },
  seatNamePill: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  seatNameText: {
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── CHALLENGE TYPE PICK ROW ──
  challengePickRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    zIndex: 40,
    paddingHorizontal: 12,
  },
  challengeTypeBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 110,
  },
  challengeTypeBtnEmoji: {
    fontSize: 22,
  },
  challengeTypeBtnText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // ── NEON DIVIDER ──
  neonDivider: {
    height: 2,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 4,
  },

  // ── LOWER LOUNGE ──
  lowerLounge: {
    flex: 1,
    overflow: 'hidden',
  },
  lowerBgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  loungeDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 3, 15, 0.6)',
  },
  draggableAudienceArea: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
  },

  // ── HUD STATUS BAR ──
  loungeHudBar: {
    position: 'absolute',
    top: 4,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  speakerEqualizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 28, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
    gap: 6,
  },
  equalizerBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 18,
    gap: 2,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 3,
  },
  hudSpeakerLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  hudSpeakerName: {
    fontSize: 11,
    fontWeight: '800',
  },
  hudRightControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  audienceMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 28, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 3,
  },
  audienceMainBtnActive: {
    borderColor: 'rgba(245, 197, 24, 0.5)',
    backgroundColor: 'rgba(245, 197, 24, 0.1)',
  },
  audienceMainBtnIcon: {
    fontSize: 12,
  },
  audienceMainBtnText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  audienceMainBtnArrow: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
  },
  micQueueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 28, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 3,
  },
  micQueueActionBtnActive: {
    borderColor: 'rgba(56, 189, 248, 0.5)',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  micQueueActionIcon: {
    fontSize: 11,
  },
  micQueueActionText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },

  // ── AUDIENCE ACTIVITY DROPDOWN ──
  audienceActivityDropdown: {
    position: 'absolute',
    top: 34,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(12, 8, 28, 0.92)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
    zIndex: 35,
  },
  activityDropdownHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  activityDropdownTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1.5,
  },
  activityDropdownHint: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  activityButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityModeBtn: {
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  activityModeBtnActive: {
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.4)',
  },
  activityModeIcon: {
    fontSize: 18,
  },
  activityModeText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  activityModeTextActive: {
    color: GOLD,
  },

  // ── CHAT STREAM ──
  chatStreamContainer: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 38,
    bottom: 80,
    zIndex: 10,
  },
  chatScrollContent: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  systemChatRow: {
    justifyContent: 'center',
  },
  chatAvatarThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 12, 32, 0.9)',
    marginRight: 5,
    marginTop: 2,
  },
  chatAvatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  chatBubble: {
    flex: 1,
    backgroundColor: 'rgba(12, 8, 28, 0.65)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  systemChatBubble: {
    backgroundColor: 'rgba(245, 197, 24, 0.08)',
    borderColor: 'rgba(245, 197, 24, 0.15)',
  },
  vipChatBubble: {
    borderColor: 'rgba(245, 197, 24, 0.12)',
  },
  chatBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 1,
  },
  chatSenderName: {
    fontSize: 9,
    fontWeight: '800',
  },
  vipTagPill: {
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 0.5,
  },
  vipTagPillText: {
    fontSize: 6,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 0.5,
  },
  chatTimeText: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.25)',
    marginLeft: 'auto',
  },
  chatMessageText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 14,
  },
  systemMessageText: {
    color: GOLD_LIGHT,
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // ── QUICK REACTIONS ──
  quickReactionBar: {
    position: 'absolute',
    bottom: 44,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 20,
  },
  reactionChipBtn: {
    width: 34,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reactionChipEmoji: {
    fontSize: 16,
  },

  // ── INPUT BAR ──
  inputBarArea: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 25,
    gap: 5,
  },
  giftTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 197, 24, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.25)',
  },
  giftTriggerIcon: {
    fontSize: 18,
  },
  textInputWrap: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(12, 8, 28, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  textInputBox: {
    fontSize: 12,
    color: '#ffffff',
  },
  sendTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  sendTriggerIcon: {
    fontSize: 16,
    color: CYAN_NEON,
  },

  // ── FLOATING REACTIONS ──
  floatingEmojiContainer: {
    position: 'absolute',
    bottom: 80,
    zIndex: 50,
  },
  floatingEmojiGlyph: {
    fontSize: 26,
  },

  // ── FLYING GIFT ──
  flyingGiftWrapper: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 55,
  },
  flyingGiftEmoji: {
    fontSize: 52,
  },
  flyingGiftTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: GOLD,
    marginTop: 2,
  },

  // ── GIFT MODAL ──
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  giftSheetPanel: {
    backgroundColor: DARK_CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  giftSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  giftSheetTitleText: {
    fontSize: 14,
    fontWeight: '900',
    color: GOLD,
    textAlign: 'center',
    letterSpacing: 2,
  },
  giftSheetSubText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  giftTileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
  giftTileItem: {
    width: '28%',
  },
  giftTileBox: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
  },
  giftTileEmoji: {
    fontSize: 30,
  },
  giftTileName: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  giftPriceBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  giftPriceText: {
    fontSize: 9,
    fontWeight: '800',
  },

  // ── CHALLENGE REVEAL MODAL ──
  cardModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  cardFrame: {
    width: SW * 0.88,
    alignItems: 'center',
  },
  cardAuraGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    transform: [{ scale: 1.08 }],
  },
  cardBody: {
    width: '100%',
    backgroundColor: DARK_CARD,
    borderRadius: 22,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
  },
  cardTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTypeEmoji: {
    fontSize: 28,
  },
  cardTypeTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cardVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardVsPlayer: {
    alignItems: 'center',
    flex: 1,
  },
  cardVsEmoji: {
    fontSize: 30,
  },
  cardVsName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  cardVsRole: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 1,
  },
  cardVsBolt: {
    fontSize: 24,
    color: GOLD,
  },
  cardQuestionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  cardQuestionText: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  cardDividerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  cardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardDividerStar: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  cardButtonColumn: {
    width: '100%',
    gap: 8,
  },
  cardDoneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cardDoneBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  cardSkipBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardSkipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
