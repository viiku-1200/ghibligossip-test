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
// Upper 48%: High-energy live stage for playing & spin
// Lower 52%: VIP lounge for draggable audience & live chat
// ══════════════════════════════════════════════════════
const UPPER_H = Math.round(SH * 0.48);
const LOWER_H = SH - UPPER_H;

// Image assets
const STAGE_BG_NEON = require('./anime_image/dancefloor_2.png');
const STAGE_BG_VIP = require('./anime_image/room_vip.jpg');
const LOUNGE_BG = require('./anime_image/belowroom.png');

// Palette
const GOLD = '#f5c518';
const GOLD_LIGHT = '#ffd966';
const PURPLE_NEON = '#c084fc';
const CYAN_NEON = '#38bdf8';
const PINK_NEON = '#f472b6';
const DARK_CARD = 'rgba(15, 12, 28, 0.96)';

// ── 8 Ghibli & Galaverse VIP Members ──
interface Member {
  id: number;
  name: string;
  role: string;
  emoji: string;
  color: string;
  isYou: boolean;
  angle: number; // in degrees around table ellipse
}

const MEMBERS: Member[] = [
  { id: 1, name: 'You',      role: 'VIP Host',      emoji: '👑', color: '#ffd700', isYou: true,  angle: 90  }, // Bottom center
  { id: 2, name: 'Chihiro',  role: 'Spirit Girl',   emoji: '🌸', color: '#f472b6', isYou: false, angle: 225 }, // Top-left
  { id: 3, name: 'Haku',     role: 'River Dragon',  emoji: '🐉', color: '#34d399', isYou: false, angle: 270 }, // Top center
  { id: 4, name: 'Howl',     role: 'Grand Wizard',  emoji: '✨', color: '#c084fc', isYou: false, angle: 315 }, // Top-right
  { id: 5, name: 'Sophie',   role: 'Star Weaver',   emoji: '⭐', color: '#a3e635', isYou: false, angle: 180 }, // Middle-left
  { id: 6, name: 'Kiki',     role: 'Sky Courier',   emoji: '🧹', color: '#fb923c', isYou: false, angle: 0   }, // Middle-right
  { id: 7, name: 'Ashitaka', role: 'Empathy Prince', emoji: '🏹', color: '#38bdf8', isYou: false, angle: 135 }, // Bottom-left
  { id: 8, name: 'San',      role: 'Wolf Princess', emoji: '🐺', color: '#e879f9', isYou: false, angle: 45  }, // Bottom-right
];

// ── Truths & Dares ──
const TRUTHS = [
  "What is the most embarrassing anime song you secretly know all the lyrics to? 🎵",
  "Have you ever stalked someone's profile for over 30 mins straight? 👀",
  "Who in this VIP circle would you secretly take to a candlelight dinner? 😏",
  "What is the biggest white lie you told in the last 48 hours?",
  "What's the weirdest dream you've ever woken up from in confusion?",
  "Who here gives off the most 'main character' energy? ✨",
  "If you had to swap lives with one person in this room for a week, who?",
  "What is your most unpopular opinion that triggers everyone? 🔥",
  "Who was your last secret crush and do they know? 💀",
  "Read the very last DM notification you received out loud right now! 📱",
  "What's the pettiest reason you've ever unfollowed someone?",
  "Describe your most awkward romantic date in 5 words or less 💀",
  "Have you ever pretended to be busy just to avoid someone in this circle?",
  "What's a truth about yourself that nobody here knows yet?",
];

const DARES = [
  "Do your most dramatic Bollywood/anime villain laugh into the live mic! 🎭",
  "Sing the chorus of your favorite song right now with full passion! 🎤",
  "Speak in a posh British royal accent for the next 2 rounds 🇬🇧",
  "Send 'Thinking about you ❤️' to the 3rd person on your chat list!",
  "Give a 15-second motivational speech like an eccentric tech billionaire 👑",
  "Drop 20 pushups or jumping jacks right now while counting out loud! 💪",
  "Post 'Looking for my anime soulmate ✨' on your story for 1 hour 🔥",
  "Let the group pick your chat status message for the rest of tonight 💬",
  "Do your best impression of Calcifer or an angry anime cat! 🐱🔥",
  "Do a 15-second model runway strut across your room right now 💃",
  "Whisper an emotional apology to your phone charger like it's a living soul 🔌",
  "Give everyone in the circle a compliment using only movie quotes! 🎬",
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

const QUICK_EMOJIS = ['👏', '😂', '🔥', '💀', '🍾', '👑', '❤️', '✨'];

const BOT_REACTIONS = [
  "NO WAYYY 😂😂😂 That's insane!",
  "This VIP lounge is getting SPICY 🔥🔥",
  "EXPOSED in 4K! 💀😭",
  "Bro took the dare like an absolute legend 🫡",
  "The drama tonight is completely unmatched ✨✨",
  "Someone record this moment right now 📱",
  "I am CRYING laughing 🤣🤣🤣",
  "Respect +100 for that confession 👏",
  "Down in history! What a round 🥂👑",
  "Pop the champagne! 🍾 That was wild",
  "Bro has no fear whatsoever 💀🔥",
];

// Initial draggable VIP crowd slots in lower lounge
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

interface TruthDareScreenProps {
  onBack: () => void;
}

export default function TruthDareScreen({ onBack }: TruthDareScreenProps) {
  // ── Room & Visual Mode ──
  const [stageTheme, setStageTheme] = useState<'neon' | 'vip'>('neon');

  // ── Game State ──
  const [gamePhase, setGamePhase] = useState<'idle' | 'spinning' | 'choosing' | 'reveal'>('idle');
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState<{ type: 'truth' | 'dare'; text: string } | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [coins, setCoins] = useState(850);

  // ── Voice & Queue State ──
  const [activeSpeaker, setActiveSpeaker] = useState(2); // Haku speaking
  const [micQueue, setMicQueue] = useState<number[]>([1, 7, 0]); // Chihiro, Ashitaka, You waiting
  const [tappedMember, setTappedMember] = useState<number>(0);

  // ── Draggable Audience & Activity State ──
  const [audienceCrowdMode, setAudienceCrowdMode] = useState<AudienceMode>('auto');
  const [showAudiencePanel, setShowAudiencePanel] = useState<boolean>(false);
  const allPositions = useRef<Record<number, { x: number; y: number }>>({});

  // ── Chat & Interaction ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
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

  // 8 Seat Breathing/Bobbing animations
  const seatBobs = useRef(MEMBERS.map(() => new Animated.Value(0))).current;

  const chatListRef = useRef<FlatList>(null);
  const usedQuestions = useRef<Set<string>>(new Set());

  // ── Ambient Stage Lights, Voice Visualizer & Seat Life ──
  useEffect(() => {
    // Stage spotlight breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightBeam, { toValue: 0.8, duration: 2200, useNativeDriver: true }),
        Animated.timing(spotlightBeam, { toValue: 0.25, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Stage spotlight sway
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

    // Table ambient glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(tableFloorGlow, { toValue: 0.95, duration: 1400, useNativeDriver: true }),
        Animated.timing(tableFloorGlow, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    // Staggered character bobbing (gives every seat a living breath)
    seatBobs.forEach((bob, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(bob, { toValue: -3.5, duration: 1200 + (i * 100), useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: 1200 + (i * 100), useNativeDriver: true }),
        ])
      ).start();
    });

    // Live speaker voice equalizer waves
    const animateWaves = () => {
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
    };
    animateWaves();

    // Initial lounge greetings
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'msg-init-1',
        sender: '👑 Gala Host',
        color: GOLD,
        text: '✨ Welcome to The Royal Circle! Audience characters below are draggable! Tap AUDIENCE for activities.',
        isSystem: true,
        time: timeNow,
      },
      {
        id: 'msg-init-2',
        sender: 'Howl',
        color: PURPLE_NEON,
        text: 'The crowd is buzzing tonight ✨ Who has the courage to spin first?',
        isSystem: false,
        isVip: true,
        time: timeNow,
      },
      {
        id: 'msg-init-3',
        sender: 'Chihiro',
        color: PINK_NEON,
        text: 'I am seated and ready! Tap the bottle to spin! 🍾',
        isSystem: false,
        isVip: false,
        time: timeNow,
      },
    ]);
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}-${Math.random()}`,
        sender: '👑 Gala System',
        color: GOLD,
        text,
        isSystem: true,
        time,
      },
    ]);
  }, []);

  const addBotReaction = useCallback(() => {
    const randomMember = MEMBERS[Math.floor(Math.random() * (MEMBERS.length - 1)) + 1];
    const text = BOT_REACTIONS[Math.floor(Math.random() * BOT_REACTIONS.length)];
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

  // ── Floating Live Reactions ──
  const triggerReaction = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    const rx = SW * 0.12 + Math.random() * (SW * 0.72);
    setFloatingReactions(prev => [...prev.slice(-14), { id, emoji, x: rx }]);

    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2400);
  }, []);

  // ── Audience Activity Mode Change ──
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

  // ── Flying Gift Animation ──
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

    const recipient = MEMBERS[tappedMember]?.name || 'The Stage';
    addSystemMessage(`🍾 You showered ${recipient} with a ${gift.name} ${gift.emoji}!`);
    triggerReaction(gift.emoji);
    setTimeout(() => addBotReaction(), 800);
  }, [tappedMember, triggerReaction, addBotReaction, addSystemMessage]);

  // ── Card Picking Logic ──
  const getQuestion = useCallback((type: 'truth' | 'dare') => {
    const pool = type === 'truth' ? TRUTHS : DARES;
    let available = pool.filter(q => !usedQuestions.current.has(q));
    if (available.length === 0) {
      usedQuestions.current.clear();
      available = pool;
    }
    const q = available[Math.floor(Math.random() * available.length)];
    usedQuestions.current.add(q);
    return q;
  }, []);

  // ── Spin The Bottle / Spinner ──
  const handleSpin = useCallback(() => {
    if (gamePhase === 'spinning') return;
    setGamePhase('spinning');
    setCurrentCard(null);
    setShowCardModal(false);

    const targetIdx = Math.floor(Math.random() * MEMBERS.length);
    const spins = 4 + Math.floor(Math.random() * 3);
    const targetAngle = MEMBERS[targetIdx].angle;
    // Rotate so bottle points at the target angle
    const finalAngle = spins * 360 + targetAngle;

    spinAngle.setValue(0);
    Animated.timing(spinAngle, {
      toValue: finalAngle,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSelectedMember(targetIdx);
      setTappedMember(targetIdx);
      setGamePhase('choosing');
      setRoundNumber(prev => prev + 1);

      const chosen = MEMBERS[targetIdx];
      addSystemMessage(`🎯 The bottle pointed directly at ${chosen.name}! Truth or Dare?`);
      setActiveSpeaker(targetIdx);

      triggerReaction('🍾');
      setTimeout(() => addBotReaction(), 700);

      // Bot automatically chooses after thinking
      if (!chosen.isYou) {
        setTimeout(() => {
          const autoType = Math.random() > 0.5 ? 'truth' : 'dare';
          handleChoice(autoType, targetIdx);
        }, 2200);
      }
    });
  }, [gamePhase, addSystemMessage, addBotReaction, triggerReaction]);

  // ── Choice Reveal ──
  const handleChoice = useCallback((type: 'truth' | 'dare', memberIdx?: number) => {
    const idx = memberIdx !== undefined ? memberIdx : selectedMember;
    if (idx === null) return;
    const chosen = MEMBERS[idx];
    const question = getQuestion(type);

    setCurrentCard({ type, text: question });
    setGamePhase('reveal');
    setShowCardModal(true);

    cardScale.setValue(0.2);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    addSystemMessage(`⚡ ${chosen.name} chose ${type.toUpperCase()}! Listen in... 🎙️`);
    triggerReaction(type === 'truth' ? '🤔' : '🔥');
    setTimeout(() => addBotReaction(), 1000);
  }, [selectedMember, getQuestion, addSystemMessage, triggerReaction, addBotReaction]);

  // ── Next Round ──
  const handleNextRound = useCallback(() => {
    setShowCardModal(false);
    setCurrentCard(null);
    setGamePhase('idle');
    setSelectedMember(null);

    // Rotate mic queue
    const updated = [...micQueue];
    if (activeSpeaker !== null) updated.push(activeSpeaker);
    const nextSpeaker = updated.shift() ?? 0;
    setActiveSpeaker(nextSpeaker);
    setMicQueue(updated);
  }, [micQueue, activeSpeaker]);

  // ── Send Chat ──
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

  const spinRotation = spinAngle.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate mathematical orbit coordinates inside upper stage
  const CENTER_X = SW / 2;
  const CENTER_Y = (UPPER_H - 45) / 2 + 35; // centered vertically below header
  const RADIUS_X = SW * 0.38;
  const RADIUS_Y = (UPPER_H - 100) * 0.38;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* ══════════════════════════════════════════════════════
            1. UPPER HALF: THE LIVE PLAYING STAGE
            ══════════════════════════════════════════════════════ */}
        <View style={styles.upperStage}>
          {/* Background Image: Dance Stage or VIP Lounge */}
          <Image
            source={stageTheme === 'neon' ? STAGE_BG_NEON : STAGE_BG_VIP}
            style={styles.upperBgImage}
            resizeMode="cover"
          />

          {/* Dark Stage Vignette */}
          <View style={styles.stageOverlayVignette} />

          {/* Animated Sweeping Spotlights (Galaverse Laser Effect) */}
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
            <Text style={[styles.starParticle, { top: '22%', left: '10%' }]}>✦</Text>
            <Text style={[styles.starParticle, { top: '38%', right: '12%' }]}>✧</Text>
            <Text style={[styles.starParticle, { top: '65%', left: '20%' }]}>✦</Text>
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
              <Text style={styles.headerTitleText}>THE ROYAL CIRCLE</Text>
              <Text style={styles.headerSubText}>Truth or Dare · Round #{roundNumber}</Text>
            </View>

            <View style={styles.walletBadge}>
              <Text style={styles.walletIcon}>🪙</Text>
              <Text style={styles.walletAmount}>{coins}</Text>
            </View>
          </View>

          {/* Choreography Floating Banner */}
          {currentChoreography && (
            <View style={styles.actionBanner}>
              <Text style={styles.actionBannerText}>✨ {currentChoreography} ✨</Text>
            </View>
          )}

          {/* ═══ 2.5D ISOMETRIC TABLE (Stage Center) ═══ */}
          <View
            style={[
              styles.tableContainer,
              { left: CENTER_X - (SW * 0.32), top: CENTER_Y - (SW * 0.18) },
            ]}
          >
            {/* Ambient Platform Glow */}
            <Animated.View style={[styles.tableFloorAura, { opacity: tableFloorGlow }]} />

            {/* Isometric Oval Surface */}
            <View style={styles.isometricTable}>
              <View style={styles.tableInnerDisc}>
                {/* Center Spin Trigger & Rotating Bottle */}
                <TouchableOpacity
                  style={styles.spinTouchable}
                  onPress={handleSpin}
                  activeOpacity={0.8}
                  disabled={gamePhase === 'spinning'}
                >
                  <Animated.View
                    style={[
                      styles.bottlePointerWrap,
                      { transform: [{ rotate: spinRotation }] },
                    ]}
                  >
                    <Text style={styles.bottleEmoji}>🍾</Text>
                    <View style={styles.bottlePointerTip} />
                  </Animated.View>

                  {/* Center Plaque */}
                  <View style={styles.centerPlaque}>
                    <Text style={styles.centerPlaqueText}>
                      {gamePhase === 'spinning' ? '...' : gamePhase === 'idle' ? 'SPIN' : 'NEXT'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ═══ 8 SEATED VIP CHARACTERS (Symmetrically Positioned & Animated) ═══ */}
          {MEMBERS.map((member, idx) => {
            const rad = (member.angle * Math.PI) / 180;
            const seatX = CENTER_X + RADIUS_X * Math.cos(rad) - 27;
            const seatY = CENTER_Y + RADIUS_Y * Math.sin(rad) - 27;
            const isSpeaking = activeSpeaker === idx;
            const isTapped = tappedMember === idx;
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
                  {/* Speaking Radiant Glow */}
                  {isSpeaking && (
                    <Animated.View
                      style={[
                        styles.speakerAuraRing,
                        { borderColor: member.color, opacity: tableFloorGlow },
                      ]}
                    />
                  )}

                  {/* Selected Outline */}
                  {isTapped && !isSpeaking && (
                    <View style={[styles.selectedSeatRing, { borderColor: member.color }]} />
                  )}

                  {/* Avatar Orb */}
                  <View
                    style={[
                      styles.avatarOrb,
                      {
                        borderColor: isSpeaking ? GOLD : member.color,
                        backgroundColor: member.isYou ? 'rgba(255, 215, 0, 0.28)' : 'rgba(18, 12, 32, 0.9)',
                      },
                    ]}
                  >
                    <Text style={styles.avatarOrbEmoji}>{member.emoji}</Text>
                  </View>

                  {/* Queue Rank Badge */}
                  {qPos !== -1 && (
                    <View style={[styles.seatQueueBadge, { backgroundColor: member.color }]}>
                      <Text style={styles.seatQueueText}>{qPos + 1}</Text>
                    </View>
                  )}

                  {/* On-Mic Indicator */}
                  {isSpeaking && (
                    <View style={styles.onAirIndicator}>
                      <Text style={styles.onAirMicIcon}>🎙️</Text>
                    </View>
                  )}

                  {/* Character Name Tag */}
                  <View style={styles.seatNamePill}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.seatNameText,
                        { color: isSpeaking ? GOLD : '#ffffff' },
                      ]}
                    >
                      {member.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ══════════════════════════════════════════════════════
            2. GLOWING NEON LASER DIVIDER
            ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            styles.neonDivider,
            {
              opacity: dividerPulse,
              shadowOpacity: dividerPulse,
            },
          ]}
        />

        {/* ══════════════════════════════════════════════════════
            3. LOWER HALF: LOUNGE, DRAGGABLE AUDIENCE & CHAT
            ══════════════════════════════════════════════════════ */}
        <View style={styles.lowerLounge}>
          {/* Below Room Background Image */}
          <Image
            source={LOUNGE_BG}
            style={styles.lowerBgImage}
            resizeMode="cover"
          />

          {/* Deep Dark Club Room Overlay */}
          <View style={styles.loungeDarkOverlay} />

          {/* ═══ DRAGGABLE VIP AUDIENCE CROWD ═══ */}
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

          {/* ═══ VIP HUD STATUS & AUDIENCE ACTIVITY BAR ═══ */}
          <View style={styles.loungeHudBar}>
            {/* Active Speaker Card with animated Equalizer */}
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

            {/* Right Side Control Buttons */}
            <View style={styles.hudRightControlsRow}>
              {/* 👥 MAIN AUDIENCE ACTIVITY BUTTON (Expands All Activity Modes) */}
              <TouchableOpacity
                style={[
                  styles.audienceMainBtn,
                  showAudiencePanel && styles.audienceMainBtnActive,
                ]}
                onPress={() => setShowAudiencePanel(prev => !prev)}
                activeOpacity={0.75}
              >
                <Text style={styles.audienceMainBtnIcon}>👥</Text>
                <Text style={styles.audienceMainBtnText}>AUDIENCE</Text>
                <Text style={styles.audienceMainBtnArrow}>{showAudiencePanel ? '▴' : '▾'}</Text>
              </TouchableOpacity>

              {/* Mic Queue Toggle */}
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

          {/* ═══ EXPANDABLE AUDIENCE ACTIVITY PANEL (All Activity Buttons) ═══ */}
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
                    auto: '✨',
                    dance: '💃',
                    cheer: '👏',
                    drink: '🥂',
                    special: '💖',
                  };
                  const labelMap: Record<AudienceMode, string> = {
                    auto: 'Auto',
                    dance: 'Dance',
                    cheer: 'Cheer',
                    drink: 'Drink',
                    special: 'Love',
                  };
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.activityModeBtn,
                        isActive && styles.activityModeBtnActive,
                      ]}
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
                placeholder="Say something or drop a dare..."
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

          {/* ═══ FLOATING LIVE REACTIONS (Rising Emojis) ═══ */}
          {floatingReactions.map(r => (
            <AnimatedReaction key={r.id} emoji={r.emoji} x={r.x} />
          ))}

          {/* ═══ FLYING VIP GIFT ANIMATION ═══ */}
          {flyingGift && (
            <Animated.View
              style={[
                styles.flyingGiftWrapper,
                {
                  opacity: giftFlyOpacity,
                  transform: [
                    { translateY: giftFlyY },
                    { scale: giftFlyScale },
                  ],
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
                  Send gift to: <Text style={{ color: GOLD }}>{MEMBERS[tappedMember]?.name || 'The Stage'}</Text>
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

          {/* ═══ TRUTH OR DARE REVEAL MODAL ═══ */}
          <Modal visible={showCardModal} transparent animationType="fade">
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
                {/* Holographic Glowing Aura */}
                <View
                  style={[
                    styles.cardAuraGlow,
                    {
                      backgroundColor:
                        currentCard?.type === 'truth'
                          ? 'rgba(56, 189, 248, 0.4)'
                          : 'rgba(239, 68, 68, 0.4)',
                    },
                  ]}
                />

                <View
                  style={[
                    styles.cardBody,
                    {
                      borderColor:
                        currentCard?.type === 'truth' ? CYAN_NEON : '#ef4444',
                    },
                  ]}
                >
                  <View style={styles.cardTypeBadge}>
                    <Text style={styles.cardTypeEmoji}>
                      {currentCard?.type === 'truth' ? '🔮' : '🔥'}
                    </Text>
                    <Text
                      style={[
                        styles.cardTypeTitle,
                        {
                          color:
                            currentCard?.type === 'truth' ? CYAN_NEON : '#ef4444',
                        },
                      ]}
                    >
                      {currentCard?.type === 'truth' ? 'ROYAL TRUTH' : 'HOT DARE'}
                    </Text>
                  </View>

                  <Text style={styles.cardPlayerTitle}>
                    Target: {selectedMember !== null ? MEMBERS[selectedMember].name : 'VIP Member'}
                  </Text>

                  <View style={styles.cardQuestionBox}>
                    <Text style={styles.cardQuestionText}>{currentCard?.text}</Text>
                  </View>

                  <View style={styles.cardDividerBar}>
                    <View style={styles.cardDividerLine} />
                    <Text style={styles.cardDividerStar}>✦ 👑 ✦</Text>
                    <View style={styles.cardDividerLine} />
                  </View>

                  <View style={styles.cardButtonColumn}>
                    <TouchableOpacity
                      style={[
                        styles.cardDoneBtn,
                        {
                          backgroundColor:
                            currentCard?.type === 'truth' ? CYAN_NEON : '#ef4444',
                        },
                      ]}
                      onPress={() => {
                        setShowCardModal(false);
                        const player = selectedMember !== null ? MEMBERS[selectedMember].name : '';
                        addSystemMessage(`🏆 ${player} triumphantly honored the challenge!`);
                        triggerReaction('👑');
                        setTimeout(() => addBotReaction(), 600);
                        setTimeout(() => handleNextRound(), 1400);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardDoneBtnText}>HONOR CHALLENGE ✓</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardSkipBtn}
                      onPress={() => {
                        if (coins >= 20) {
                          setCoins(prev => prev - 20);
                          setShowCardModal(false);
                          const player = selectedMember !== null ? MEMBERS[selectedMember].name : '';
                          addSystemMessage(`🐔 ${player} paid 20 coins to skip the challenge!`);
                          triggerReaction('💀');
                          setTimeout(() => handleNextRound(), 1200);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cardSkipBtnText}>Chicken Out (-20 🪙)</Text>
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
// STYLESHEET
// ══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#07060f',
  },
  container: {
    flex: 1,
    backgroundColor: '#07060f',
  },

  // ── UPPER HALF: PLAYING STAGE ──
  upperStage: {
    width: SW,
    height: UPPER_H,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0d091a',
  },
  upperBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  stageOverlayVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 5, 16, 0.45)',
  },

  // Spotlights
  spotlightConeLeft: {
    position: 'absolute',
    top: -20,
    left: '20%',
    width: SW * 0.35,
    height: UPPER_H * 0.95,
    borderRadius: SW * 0.2,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    transform: [{ rotate: '18deg' }],
  },
  spotlightConeRight: {
    position: 'absolute',
    top: -20,
    right: '20%',
    width: SW * 0.35,
    height: UPPER_H * 0.95,
    borderRadius: SW * 0.2,
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    transform: [{ rotate: '-18deg' }],
  },
  particlesWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  starParticle: {
    position: 'absolute',
    color: GOLD_LIGHT,
    fontSize: 13,
    opacity: 0.45,
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 6,
    zIndex: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(12, 10, 24, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    gap: 4,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
  },
  liveTagText: {
    color: '#ef4444',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  themeToggleBtn: {
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  themeToggleText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubText: {
    color: 'rgba(245, 197, 24, 0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 10, 24, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.4)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  walletIcon: {
    fontSize: 13,
  },
  walletAmount: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
  },

  // Action Banner
  actionBanner: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.45)',
    borderWidth: 1,
    borderColor: PURPLE_NEON,
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 25,
  },
  actionBannerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },

  // Table Cluster
  tableContainer: {
    position: 'absolute',
    width: SW * 0.64,
    height: SW * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableFloorAura: {
    position: 'absolute',
    width: '115%',
    height: '115%',
    borderRadius: SW * 0.25,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    transform: [{ perspective: 500 }, { rotateX: '30deg' }],
  },
  isometricTable: {
    width: '100%',
    height: '100%',
    borderRadius: SW * 0.22,
    backgroundColor: 'rgba(32, 18, 52, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(245, 197, 24, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ perspective: 500 }, { rotateX: '30deg' }],
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  tableInnerDisc: {
    width: '86%',
    height: '82%',
    borderRadius: SW * 0.18,
    backgroundColor: 'rgba(18, 12, 32, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinTouchable: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottlePointerWrap: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleEmoji: {
    fontSize: 26,
  },
  bottlePointerTip: {
    position: 'absolute',
    top: -5,
    width: 4,
    height: 10,
    backgroundColor: GOLD,
    borderRadius: 2,
    shadowColor: GOLD,
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  centerPlaque: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 197, 24, 0.25)',
    borderWidth: 1.5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlaqueText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Seat Node
  seatNode: {
    position: 'absolute',
    width: 54,
    alignItems: 'center',
    zIndex: 15,
  },
  seatTouchable: {
    width: 54,
    alignItems: 'center',
  },
  speakerAuraRing: {
    position: 'absolute',
    top: -4,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    shadowColor: GOLD,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  selectedSeatRing: {
    position: 'absolute',
    top: -3,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  avatarOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarOrbEmoji: {
    fontSize: 20,
  },
  seatQueueBadge: {
    position: 'absolute',
    top: -3,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  seatQueueText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  onAirIndicator: {
    position: 'absolute',
    top: -3,
    right: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onAirMicIcon: {
    fontSize: 9,
  },
  seatNamePill: {
    marginTop: 2,
    backgroundColor: 'rgba(10, 8, 20, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  seatNameText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── NEON LASER DIVIDER ──
  neonDivider: {
    width: SW,
    height: 3,
    backgroundColor: 'rgba(220, 170, 255, 0.9)',
    shadowColor: 'rgba(192, 132, 252, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 6,
    zIndex: 30,
  },

  // ── LOWER HALF: LOUNGE, DRAGGABLE AUDIENCE & CHAT ──
  lowerLounge: {
    width: SW,
    height: LOWER_H,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#070611',
  },
  lowerBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  loungeDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 6, 18, 0.65)',
  },

  // Draggable Audience Area
  draggableAudienceArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 12,
  },

  // Lounge HUD Bar
  loungeHudBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(14, 10, 24, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 20,
  },
  speakerEqualizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  equalizerBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
    width: 14,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
  },
  hudSpeakerLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudSpeakerName: {
    fontSize: 11,
    fontWeight: '800',
    maxWidth: 90,
  },
  hudRightControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // 👥 AUDIENCE MAIN BUTTON
  audienceMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#a855f7',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  audienceMainBtnActive: {
    backgroundColor: 'rgba(245, 197, 24, 0.25)',
    borderColor: GOLD,
    shadowColor: GOLD,
  },
  audienceMainBtnIcon: {
    fontSize: 12,
  },
  audienceMainBtnText: {
    color: '#e9d5ff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  audienceMainBtnArrow: {
    color: '#e9d5ff',
    fontSize: 10,
    fontWeight: '900',
  },

  // Mic Queue Action Button
  micQueueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 3,
  },
  micQueueActionBtnActive: {
    backgroundColor: 'rgba(245, 197, 24, 0.2)',
    borderColor: GOLD,
  },
  micQueueActionIcon: {
    fontSize: 11,
  },
  micQueueActionText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },

  // ── AUDIENCE ACTIVITY DROPDOWN PANEL ──
  audienceActivityDropdown: {
    position: 'absolute',
    top: 42,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(18, 12, 32, 0.95)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 25,
  },
  activityDropdownHeader: {
    marginBottom: 8,
  },
  activityDropdownTitle: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  activityDropdownHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  activityButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  activityModeBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 3,
  },
  activityModeBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: PURPLE_NEON,
    shadowColor: PURPLE_NEON,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  activityModeIcon: {
    fontSize: 16,
  },
  activityModeText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 9,
    fontWeight: '700',
  },
  activityModeTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },

  // Chat Stream
  chatStreamContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 4,
    zIndex: 8,
  },
  chatScrollContent: {
    paddingBottom: 6,
    gap: 5,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  systemChatRow: {
    justifyContent: 'center',
  },
  chatAvatarThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  chatBubble: {
    maxWidth: SW * 0.78,
    backgroundColor: 'rgba(20, 14, 32, 0.82)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  systemChatBubble: {
    maxWidth: SW * 0.9,
    backgroundColor: 'rgba(245, 197, 24, 0.14)',
    borderColor: 'rgba(245, 197, 24, 0.3)',
    alignSelf: 'center',
    paddingVertical: 3,
  },
  vipChatBubble: {
    borderColor: 'rgba(245, 197, 24, 0.35)',
    backgroundColor: 'rgba(26, 18, 42, 0.88)',
  },
  chatBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  chatSenderName: {
    fontSize: 10,
    fontWeight: '800',
  },
  vipTagPill: {
    backgroundColor: GOLD,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 3,
  },
  vipTagPillText: {
    color: '#000',
    fontSize: 7,
    fontWeight: '900',
  },
  chatTimeText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 8,
    marginLeft: 'auto',
  },
  chatMessageText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 15,
  },
  systemMessageText: {
    color: GOLD_LIGHT,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Quick Reactions
  quickReactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(12, 8, 20, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 10,
  },
  reactionChipBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  reactionChipEmoji: {
    fontSize: 16,
  },

  // Bottom Input
  inputBarArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(8, 6, 16, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 197, 24, 0.16)',
    gap: 7,
    zIndex: 10,
  },
  giftTriggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftTriggerIcon: {
    fontSize: 18,
  },
  textInputWrap: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInputBox: {
    color: '#ffffff',
    fontSize: 12,
    padding: 0,
  },
  sendTriggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 197, 24, 0.25)',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendTriggerIcon: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 2,
  },

  // Floating Live Reactions
  floatingEmojiContainer: {
    position: 'absolute',
    bottom: 80,
    zIndex: 99,
  },
  floatingEmojiGlyph: {
    fontSize: 30,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Flying Gift
  flyingGiftWrapper: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  flyingGiftEmoji: {
    fontSize: 50,
  },
  flyingGiftTitle: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Gift Sheet Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  giftSheetPanel: {
    backgroundColor: DARK_CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
    borderBottomWidth: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
  },
  giftSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 197, 24, 0.3)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  giftSheetTitleText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  giftSheetSubText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  giftTileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 7,
  },
  giftTileItem: {
    width: '31%',
  },
  giftTileBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingVertical: 9,
    borderWidth: 1,
    gap: 3,
  },
  giftTileEmoji: {
    fontSize: 24,
  },
  giftTileName: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  giftPriceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  giftPriceText: {
    fontSize: 9,
    fontWeight: '800',
  },

  // Card Reveal Modal
  cardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardFrame: {
    width: '100%',
    maxWidth: 350,
    position: 'relative',
    alignItems: 'center',
  },
  cardAuraGlow: {
    position: 'absolute',
    width: '104%',
    height: '104%',
    borderRadius: 22,
    opacity: 0.8,
  },
  cardBody: {
    width: '100%',
    backgroundColor: DARK_CARD,
    borderRadius: 20,
    borderWidth: 2,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  cardTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  cardTypeEmoji: {
    fontSize: 15,
  },
  cardTypeTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  cardPlayerTitle: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  cardQuestionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  cardQuestionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardDividerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    width: '75%',
  },
  cardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(245, 197, 24, 0.25)',
  },
  cardDividerStar: {
    color: GOLD,
    fontSize: 9,
  },
  cardButtonColumn: {
    width: '100%',
    gap: 7,
  },
  cardDoneBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDoneBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardSkipBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardSkipBtnText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '700',
  },
});
