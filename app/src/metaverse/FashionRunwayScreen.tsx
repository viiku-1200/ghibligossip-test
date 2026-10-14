// ═══════════════════════════════════════════════════════════════
// FashionRunwayScreen.tsx — Haute Couture Runway ("The Catwalk")
// Full Galaverse Architecture Parity with GalaDanceScreen & LaughVault:
// • Split-Screen: Upper Catwalk Stage + Lower VIP Lounge
// • Model on stage with RunwayControlsPanel IN UPPER ROOM
// • Draggable VIP Audience + AudienceControlsPanel IN LOWER ROOM
// • Persistent LiveChatOverlay stream on the left
// • 3D Flying GiftSystem (Roses, Champagne, Diamonds, Crowns)
// • Quick Reaction Bar + Chat Input Bar at bottom
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
} from 'react-native';

import RunwayModelController, { RunwayAction } from './galaverse/RunwayModelController';
import RunwayControlsPanel, { RunwayControlMode } from './galaverse/RunwayControlsPanel';
import AudienceControlsPanel, { AudienceMode } from './galaverse/AudienceControlsPanel';
import DraggableAudience from './galaverse/DraggableAudience';
import LiveChatOverlay from './galaverse/LiveChatOverlay';
import GiftSystem from './galaverse/GiftSystem';
import AudienceInteractionQueue, { QueueModel } from './galaverse/AudienceInteractionQueue';

const { width: SW, height: SH } = Dimensions.get('window');
const HALF_H = SH / 2;

// Asset images
const RUNWAY_BG = require('./anime_image/upperroom_runway.png');
const LOUNGE_BG = require('./anime_image/belowroom.png');

// VIP Crowd — 8 Draggable Audience Slots matching Galaverse standards
const INITIAL_SLOTS = [
  // Back Row (smaller, higher up)
  { id: 1, size: 120, x: SW * 0.03, y: HALF_H * 0.08, z: 1 },
  { id: 2, size: 120, x: SW * 0.28, y: HALF_H * 0.05, z: 1 },
  { id: 3, size: 120, x: SW * 0.52, y: HALF_H * 0.08, z: 1 },
  { id: 4, size: 120, x: SW * 0.76, y: HALF_H * 0.05, z: 1 },
  // Front Row (larger, lower down)
  { id: 5, size: 165, x: SW * 0.05, y: HALF_H * 0.42, z: 2 },
  { id: 6, size: 165, x: SW * 0.30, y: HALF_H * 0.45, z: 2 },
  { id: 7, size: 165, x: SW * 0.55, y: HALF_H * 0.42, z: 2 },
  { id: 8, size: 165, x: SW * 0.78, y: HALF_H * 0.45, z: 2 },
];

// Emoji → Reaction Mappings
const EMOJI_TO_AUDIENCE: Record<string, AudienceMode> = {
  '👏': 'cheer',
  '👠': 'special',
  '🔥': 'dance',
  '❤️': 'cheer',
  '💋': 'special',
  '✨': 'special',
};

const EMOJI_TO_MODEL: Record<string, RunwayAction> = {
  '👏': 'wave',
  '👠': 'walkForward',
  '🔥': 'dance',
  '❤️': 'flyingKiss',
  '💋': 'flyingKiss',
  '✨': 'modelPose',
};

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

function FloatingReactionItem({ item }: { item: FloatingReaction }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const wobbleX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -SH * 0.58,
        duration: 2200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1900,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(wobbleX, {
          toValue: (Math.random() - 0.5) * 40,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleX, {
          toValue: (Math.random() - 0.5) * 60,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [opacity, scale, translateY, wobbleX]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingItem,
        {
          left: item.x,
          transform: [{ translateY }, { translateX: wobbleX }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={styles.floatingEmojiText}>{item.emoji}</Text>
    </Animated.View>
  );
}

interface FashionRunwayScreenProps {
  onBack?: () => void;
}

export default function FashionRunwayScreen({ onBack }: FashionRunwayScreenProps) {
  // ── Model & Audience State ──
  const [modelMode, setModelMode] = useState<RunwayControlMode>('auto');
  const [resolvedModelAction, setResolvedModelAction] = useState<RunwayAction>('walkForward');
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('auto');
  const [chatMessage, setChatMessage] = useState('');

  // ── Audience Room Mode & Interaction State ──
  const [audienceTab, setAudienceTab] = useState<'interaction' | 'crowd'>('interaction');
  const [activeLookTitle, setActiveLookTitle] = useState('★ LOOK 01 : MIRA STARLING ★ GOTHIC GLAM ★');
  const [currentRating, setCurrentRating] = useState<number>(9.4);
  const [ratingNotice, setRatingNotice] = useState<string | null>(null);

  // ── Floating Gifts & Reactions Stream ──
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const isReactionHolding = useRef(false);

  const allPositions = useRef<Record<number, { x: number; y: number }>>({});
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Grand Catwalk Auto-Choreography Sequence ──
  const autoSequenceStep = useRef(0);
  const AUTO_SEQUENCE: RunwayAction[] = [
    'walkForward',
    'modelPose',
    'flyingKiss',
    'turnAround',
    'wave',
    'dance',
    'laugh',
    'walkBack',
  ];

  useEffect(() => {
    if (modelMode !== 'auto') {
      setResolvedModelAction(modelMode);
      return;
    }

    // Auto-cycle through the 8 catwalk actions (pauses while user reaction is playing)
    const interval = setInterval(() => {
      if (isReactionHolding.current) return;
      autoSequenceStep.current = (autoSequenceStep.current + 1) % AUTO_SEQUENCE.length;
      setResolvedModelAction(AUTO_SEQUENCE[autoSequenceStep.current]);
    }, 3200);

    return () => clearInterval(interval);
  }, [modelMode]);

  // ── Trigger Burst of Floating Emoji Gifts ──
  const triggerFloatingGift = useCallback((emoji: string) => {
    const burstCount = 4;
    const newItems: FloatingReaction[] = [];
    for (let i = 0; i < burstCount; i++) {
      const rx = SW * 0.15 + Math.random() * (SW * 0.7);
      newItems.push({
        id: Date.now() + Math.random() + i,
        emoji,
        x: rx,
      });
    }
    setFloatingReactions((prev) => [...prev.slice(-20), ...newItems]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => !newItems.some((n) => n.id === r.id)));
    }, 2500);
  }, []);

  // ── Ambient Stage Lights & Paparazzi Flashes ──
  const flashAnim = useRef(new Animated.Value(0)).current;
  const spotlightSweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightSweep, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(spotlightSweep, {
          toValue: 0,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Random Paparazzi Flashes
    const flashInterval = setInterval(() => {
      if (Math.random() < 0.45) {
        flashAnim.setValue(0.65);
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    }, 2200);

    return () => clearInterval(flashInterval);
  }, [spotlightSweep, flashAnim]);

  // ── Quick Reactions Handler ──
  const handleEmojiReaction = useCallback((emoji: string) => {
    // 1. Trigger bursting flying gifts/emojis on screen
    triggerFloatingGift(emoji);

    // 2. Map to audience and model
    const aud = EMOJI_TO_AUDIENCE[emoji];
    const mod = EMOJI_TO_MODEL[emoji];
    if (aud) setAudienceMode(aud);
    if (mod) {
      setResolvedModelAction(mod);
      isReactionHolding.current = true;
    }

    // 3. Trigger camera flash & stage banner
    flashAnim.setValue(0.75);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (emoji === '💋') {
      setRatingNotice('💋 FLYING KISS TO THE VIP AUDIENCE! 💋');
    } else if (emoji === '❤️') {
      setRatingNotice('❤️ AUDIENCE LOVE & APPLAUSE! ❤️');
    } else if (emoji === '🔥') {
      setRatingNotice('🔥 THE RUNWAY IS ON FIRE! 🔥');
    } else if (emoji === '👠') {
      setRatingNotice('👠 HIGH COUTURE RUNWAY STRUT! 👠');
    } else if (emoji === '✨') {
      setRatingNotice('✨ STRIKING THE SIGNATURE VOGUE POSE! ✨');
    } else if (emoji === '👏') {
      setRatingNotice('👏 FRONT-ROW STANDING OVATION! 👏');
    }

    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => {
      isReactionHolding.current = false;
      setRatingNotice(null);
      setAudienceMode('auto');
      if (modelMode === 'auto') {
        setResolvedModelAction(AUTO_SEQUENCE[autoSequenceStep.current]);
      }
    }, 5000);
  }, [modelMode, flashAnim, triggerFloatingGift]);

  // ── Gift Sent Handler (Rose, Champagne, Crown, etc.) ──
  const handleGiftSent = useCallback((giftId: string) => {
    const giftEmoji = giftId === 'rose' ? '🌹' : giftId === 'crown' ? '👑' : giftId === 'diamond' ? '💎' : '🍾';
    triggerFloatingGift(giftEmoji);
    isReactionHolding.current = true;

    if (giftId === 'rose') {
      setResolvedModelAction('flyingKiss');
      setAudienceMode('cheer');
      setRatingNotice('🌹 THREW ROSES ONTO THE CATWALK! 🌹');
    } else if (giftId === 'crown' || giftId === 'diamond') {
      setResolvedModelAction('modelPose');
      setAudienceMode('special');
      setRatingNotice('👑 CROWNED RUNWAY QUEEN! 👑');
    } else if (giftId === 'champagne' || giftId === 'beer') {
      setResolvedModelAction('wave');
      setAudienceMode('drink');
      setRatingNotice('🍾 POPPING MOËT CHAMPAGNE! 🍾');
    } else {
      setResolvedModelAction('dance');
      setAudienceMode('cheer');
    }

    flashAnim.setValue(0.8);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => {
      isReactionHolding.current = false;
      setRatingNotice(null);
      setAudienceMode('auto');
      if (modelMode === 'auto') {
        setResolvedModelAction(AUTO_SEQUENCE[autoSequenceStep.current]);
      }
    }, 5000);
  }, [modelMode, flashAnim, triggerFloatingGift]);

  // ── Audience Interaction & Queue Handlers ──
  const handleRate = useCallback((score: number) => {
    setCurrentRating(score);
    setRatingNotice(`★ AUDIENCE RATING: ${score}/10 ★`);
    flashAnim.setValue(0.7);
    Animated.timing(flashAnim, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    setAudienceMode('cheer');
    setTimeout(() => setRatingNotice(null), 3000);
  }, [flashAnim]);

  const handleSelectModel = useCallback((model: QueueModel) => {
    setActiveLookTitle(`★ LOOK 0${model.id} : ${model.name.toUpperCase()} ★ ${model.style.toUpperCase()} ★`);
    setResolvedModelAction('walkForward');
    setRatingNotice(`★ NOW STRUTTING: ${model.name.toUpperCase()} ★`);
    flashAnim.setValue(0.8);
    Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => setRatingNotice(null), 3500);
  }, [flashAnim]);

  const handleJoinQueue = useCallback((chosenStyle?: string) => {
    const styleLabel = chosenStyle ? chosenStyle.toUpperCase() : 'CYBER ROYALTY';
    setRatingNotice(`★ YOU JOINED THE CATWALK QUEUE! (${styleLabel}) ★`);
    flashAnim.setValue(0.7);
    Animated.timing(flashAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    setAudienceMode('cheer');
    setTimeout(() => setRatingNotice(null), 3500);
  }, [flashAnim]);

  const spotlightX = spotlightSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-SW * 0.22, SW * 0.22],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* ══════════════════════════════════════════════════════ */}
      {/* 1. UPPER HALF: THE CATWALK STAGE                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <View style={styles.upperStage}>
        {/* Stage Art Background */}
        <Image source={RUNWAY_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.stageVignette} />

        {/* Dynamic Sweeping Spotlights */}
        <Animated.View
          pointerEvents="none"
          style={[styles.spotlight, { transform: [{ translateX: spotlightX }, { rotate: '-16deg' }] }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlight,
            {
              right: 25,
              transform: [
                {
                  translateX: spotlightSweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SW * 0.22, -SW * 0.22],
                  }),
                },
                { rotate: '16deg' },
              ],
            },
          ]}
        />

        {/* Paparazzi Flash Overlay */}
        <Animated.View pointerEvents="none" style={[styles.flashOverlay, { opacity: flashAnim }]} />

        {/* Floating Notification Banner */}
        {ratingNotice && (
          <View style={styles.noticeBanner} pointerEvents="none">
            <Text style={styles.noticeBannerText}>{ratingNotice}</Text>
          </View>
        )}

        {/* MODEL ON CATWALK (Centered on Stage) */}
        <View style={styles.modelContainer} pointerEvents="none">
          <RunwayModelController
            action={resolvedModelAction}
            size={Math.round(HALF_H * 0.48)}
          />
        </View>

        {/* MODEL CONTROLS PANEL (Directly In Upper Room on the Right!) */}
        <RunwayControlsPanel
          activeMode={modelMode}
          onModeChange={setModelMode}
        />

        {/* Stage Edge Neon Divider */}
        <View style={styles.stageDivider}>
          <View style={styles.neonGlow} />
          <Text style={styles.dividerText}>{activeLookTitle}</Text>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 2. LOWER HALF: VIP FRONT-ROW AUDIENCE ROOM            */}
      {/* ══════════════════════════════════════════════════════ */}
      <View style={styles.lowerLounge}>
        {/* Lounge Background */}
        <Image source={LOUNGE_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.loungeDarkDim} />

        {/* Segmented Mode Switcher (RATE & QUEUE vs VIP SEATS) */}
        <View style={styles.lowerRoomNavBar}>
          <TouchableOpacity
            style={[styles.lowerNavBtn, audienceTab === 'interaction' && styles.lowerNavBtnActive]}
            onPress={() => setAudienceTab('interaction')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.lowerNavBtnText,
                audienceTab === 'interaction' && styles.lowerNavBtnTextActive,
              ]}
            >
              ⭐ RATE & QUEUE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.lowerNavBtn, audienceTab === 'crowd' && styles.lowerNavBtnActive]}
            onPress={() => setAudienceTab('crowd')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.lowerNavBtnText,
                audienceTab === 'crowd' && styles.lowerNavBtnTextActive,
              ]}
            >
              👥 VIP SEATS ({INITIAL_SLOTS.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: AUDIENCE INTERACTION & RUNWAY QUEUE (Matches Screenshot Exactly!) */}
        {audienceTab === 'interaction' ? (
          <AudienceInteractionQueue
            onRate={handleRate}
            onSendRose={() => handleGiftSent('rose')}
            onJoinQueue={handleJoinQueue}
            onSelectModel={handleSelectModel}
            currentRating={currentRating}
          />
        ) : (
          /* TAB 2: VIP DRAGGABLE CROWD */
          <View style={styles.crowdContainer} pointerEvents="box-none">
            {/* AUDIENCE CONTROLS PANEL (In Lower Room on the Left!) */}
            <View style={styles.audienceControlsContainer} pointerEvents="box-none">
              <AudienceControlsPanel
                activeMode={audienceMode}
                onModeChange={setAudienceMode}
              />
            </View>

            {/* DRAGGABLE VIP CROWD (8 Slots) */}
            <View style={styles.audienceArea} pointerEvents="box-none">
              {INITIAL_SLOTS.map((slot) => (
                <DraggableAudience
                  key={slot.id}
                  id={slot.id}
                  mode={audienceMode}
                  size={slot.size}
                  initialX={slot.x}
                  initialY={slot.y}
                  zIndex={slot.z}
                  allPositions={allPositions}
                  roomWidth={SW}
                  roomHeight={HALF_H}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 3. OVERLAYS: HEADER, LIVE CHAT, REACTIONS & GIFTS     */}
      {/* ══════════════════════════════════════════════════════ */}

      {/* Header Overlay (Top of Screen) */}
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.headerTitle}>
            THE CATWALK <Text style={styles.headerTitleVip}>VIP</Text>
          </Text>
        </View>

        <View style={styles.viewerPill}>
          <Text style={styles.viewerIcon}>👁</Text>
          <Text style={styles.viewerCount}>1,420</Text>
        </View>
      </View>

      {/* Persistent Live Chat Stream (Floating on the Left) */}
      <LiveChatOverlay />

      {/* Bottom Controls: Quick Reaction Bar + Chat Input */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        {/* Quick Reaction Bar */}
        <View style={styles.reactionBar}>
          {['👏', '👠', '🔥', '❤️', '💋', '✨'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionBtn}
              activeOpacity={0.6}
              onPress={() => handleEmojiReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={{ width: 44 }} /> {/* Spacer for Gift Button */}
          <TextInput
            style={styles.inputBox}
            placeholder="Comment on the couture look..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={chatMessage}
            onChangeText={setChatMessage}
            onSubmitEditing={() => setChatMessage('')}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => setChatMessage('')}
            activeOpacity={0.7}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Streaming Gifts / Reactions (Flykiss, Heart, Fire, Roses) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        {floatingReactions.map((item) => (
          <FloatingReactionItem key={item.id} item={item} />
        ))}
      </View>

      {/* Full 3D Gift System (Button + Panel + Flying Gifts) */}
      <GiftSystem onGiftSent={handleGiftSent} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07050d',
  },
  floatingItem: {
    position: 'absolute',
    bottom: 95,
    zIndex: 999,
  },
  floatingEmojiText: {
    fontSize: 32,
    textShadowColor: 'rgba(255, 0, 127, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // ── UPPER HALF ──
  upperStage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HALF_H,
    overflow: 'hidden',
    backgroundColor: '#05020a',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  stageVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 2, 10, 0.25)',
  },
  spotlight: {
    position: 'absolute',
    top: -40,
    left: 30,
    width: 90,
    height: HALF_H + 80,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    opacity: 0.8,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 90,
  },
  modelContainer: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stageDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(10, 5, 20, 0.88)',
    borderTopWidth: 1.5,
    borderTopColor: '#ff007f',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  neonGlow: {
    position: 'absolute',
    top: -3,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff007f',
    opacity: 0.6,
  },
  dividerText: {
    color: '#ffd966',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  noticeBanner: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd966',
    zIndex: 70,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  noticeBannerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // ── LOWER HALF ──
  lowerLounge: {
    position: 'absolute',
    top: HALF_H,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d091a',
  },
  loungeDarkDim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 8, 24, 0.72)',
  },
  lowerRoomNavBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 50,
  },
  lowerNavBtn: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 14, 38, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  lowerNavBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    borderColor: '#c084fc',
  },
  lowerNavBtnText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lowerNavBtnTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  crowdContainer: {
    flex: 1,
    position: 'relative',
  },
  audienceControlsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    pointerEvents: 'box-none',
  },
  audienceArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },

  // ── HEADER ──
  header: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 15, 30, 0.65)',
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 80, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 0, 80, 0.5)',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ff0050',
    marginRight: 4,
  },
  liveText: {
    color: '#ff0050',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitleVip: {
    color: '#d4af37',
  },
  viewerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 15, 30, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewerIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  viewerCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── BOTTOM OVERLAY ──
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    zIndex: 80,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reactionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(20, 15, 30, 0.75)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 18,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBox: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(20, 15, 30, 0.8)',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ff007f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
