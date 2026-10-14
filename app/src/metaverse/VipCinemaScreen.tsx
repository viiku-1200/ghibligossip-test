// ═══════════════════════════════════════════════════════════════
// VipCinemaScreen.tsx — VIP Cinema & Synchronized Watch Party
// Galaverse Architecture Parity:
// • Split-Screen: Upper 16:9 Cinema Canvas + Lower VIP Recliner Lounge
// • Option 3: Downloaded Phone Movie (WebSocket Relay to Node.js server)
// • Option 1: Android MediaProjection Screen Sharing (Live Mirror)
// • Web / YouTube Stream Link Input
// • Synchronized Host Remote (Play, Pause, Scrubber, Volume, Dim Lights)
// • 12–15 VIP Recliners with Draggable Avatars + 3D Glasses Mode
// • 🍿 Popcorn Toss, 🥤 Soda Slurp, 🤫 Whisper Gossip Chat
// • 3D Flying GiftSystem (Golden Ticket, Champagne, Royal Popcorn)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Alert,
  ScrollView,
} from 'react-native';

import CinemaScreenCanvas, { CinemaState } from './cinema/CinemaScreenCanvas';
import ProjectorDeckModal, { MovieFilePreset } from './cinema/ProjectorDeckModal';
import HostYouTubeModal, { extractYouTubeId } from './cinema/HostYouTubeModal';
import DraggableAudience from './galaverse/DraggableAudience';
import AudienceControlsPanel, { AudienceMode } from './galaverse/AudienceControlsPanel';
import LiveChatOverlay from './galaverse/LiveChatOverlay';
import GiftSystem from './galaverse/GiftSystem';

const { width: SW, height: SH } = Dimensions.get('window');
const HALF_H = SH / 2;

// Asset background for the lower VIP Lounge
const LOUNGE_BG = require('./anime_image/belowroom.png');

// 8 VIP Recliner Audience Slots in 2 tiered rows
const CINEMA_SLOTS = [
  // Back Row (Elevated Tier — smaller, higher up)
  { id: 1, name: 'Mira', seat: 'Row A · 1', size: 110, x: SW * 0.04, y: HALF_H * 0.10, z: 1 },
  { id: 2, name: 'Ren', seat: 'Row A · 2', size: 110, x: SW * 0.28, y: HALF_H * 0.08, z: 1 },
  { id: 3, name: 'Akari', seat: 'Row A · 3', size: 110, x: SW * 0.52, y: HALF_H * 0.10, z: 1 },
  { id: 4, name: 'Kenji', seat: 'Row A · 4', size: 110, x: SW * 0.76, y: HALF_H * 0.08, z: 1 },
  // Front Row (VIP Plush Recliners — larger, lower down)
  { id: 5, name: 'Sora', seat: 'Row B · 1', size: 150, x: SW * 0.04, y: HALF_H * 0.44, z: 2 },
  { id: 6, name: '👑 You (Host)', seat: '👑 HOST RECLINER', size: 165, x: SW * 0.28, y: HALF_H * 0.42, z: 3, isHostSeat: true },
  { id: 7, name: 'Hana', seat: 'Row B · 3', size: 150, x: SW * 0.54, y: HALF_H * 0.44, z: 2 },
  { id: 8, name: 'Yuki', seat: 'Row B · 4', size: 150, x: SW * 0.78, y: HALF_H * 0.42, z: 2 },
];

const SUBTITLE_PRESETS = [
  'Chihiro, don\'t look back until you reach the other side...',
  'Once you\'ve met someone, you never really forget them.',
  'It just takes a while for your memories to return.',
  'Take courage. You have to believe in yourself.',
  'I promise we\'ll meet again somewhere, Chihiro.',
];

// Floating Cinema Reactions (Popcorn, Soda, 3D Glasses, Hearts, Flames)
interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
  isPopcorn?: boolean;
}

function FloatingPopcornItem({ item }: { item: FloatingReaction }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const wobbleX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -HALF_H * 0.85, // Arcs up toward the movie screen
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.6,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 1650,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(wobbleX, {
          toValue: (Math.random() - 0.5) * 60,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleX, {
          toValue: (Math.random() - 0.5) * 90,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1300),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [opacity, scale, translateY, wobbleX]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingPopcorn,
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

interface Props {
  onBack: () => void;
}

export default function VipCinemaScreen({ onBack }: Props) {
  // Cinema State
  const [cinemaState, setCinemaState] = useState<CinemaState>({
    title: 'Spirited Away (Collector\'s Cut)',
    sourceType: 'file',
    sourceName: 'Spirited_Away_1080p.mp4 (Option 3 WS Relay)',
    isPlaying: true,
    currentTime: 864, // 14m 24s
    duration: 7500, // 2h 5m
    volume: 0.85,
    isCinemaDimmed: false,
    subtitle: SUBTITLE_PRESETS[0],
  });

  // Projector Deck & YouTube Modals
  const [isDeckVisible, setIsDeckVisible] = useState(false);
  const [isYouTubeModalVisible, setIsYouTubeModalVisible] = useState(false);
  const [projectorInitialTab, setProjectorInitialTab] = useState<'file' | 'screenshare' | 'web'>('file');

  // Audience State
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('drink');
  const [has3DGlasses, setHas3DGlasses] = useState(false);
  const [chatText, setChatText] = useState('');
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // Positions ref for DraggableAudience
  const audiencePositions = useRef<Record<number, { x: number; y: number }>>({});
  const reactionIdCounter = useRef(1);

  // Auto-progress film time and cycle subtitles when playing
  useEffect(() => {
    if (!cinemaState.isPlaying) return;

    const interval = setInterval(() => {
      setCinemaState((prev) => {
        const nextTime = prev.currentTime + 1;
        const subIndex = Math.floor(nextTime / 5) % SUBTITLE_PRESETS.length;
        return {
          ...prev,
          currentTime: nextTime > prev.duration ? 0 : nextTime,
          subtitle: SUBTITLE_PRESETS[subIndex],
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cinemaState.isPlaying]);

  // Spawn floating reactions (popcorn, soda, emojis)
  const spawnReaction = useCallback((emoji: string, isPopcorn = false) => {
    const burstCount = isPopcorn ? 4 : 2;
    const newItems: FloatingReaction[] = [];

    for (let i = 0; i < burstCount; i++) {
      const id = reactionIdCounter.current++;
      const jitter = (Math.random() - 0.5) * (SW * 0.35);
      const startX = Math.max(30, Math.min(SW - 50, SW * 0.5 + jitter));
      newItems.push({ id, emoji, x: startX, isPopcorn });
    }

    setFloatingReactions((prev) => [...prev.slice(-15), ...newItems]);

    // Clean up
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => !newItems.some((n) => n.id === r.id)));
    }, 2500);
  }, []);

  // Throw Popcorn
  const handleThrowPopcorn = () => {
    spawnReaction('🍿', true);
  };

  // Soda Slurp
  const handleSodaSip = () => {
    spawnReaction('🥤');
    spawnReaction('🫧');
  };

  // Toggle 3D Glasses
  const handleToggle3DGlasses = () => {
    setHas3DGlasses((prev) => {
      const next = !prev;
      Alert.alert(
        next ? '🕶️ 3D Glasses Equipped!' : '🕶️ 3D Glasses Removed',
        next
          ? 'You are now wearing retro Red/Cyan 3D Cinema Glasses!'
          : 'Normal VIP theater view restored.',
        [{ text: 'Enjoy the Show!' }]
      );
      return next;
    });
  };

  // Cinema Whisper
  const handleCinemaShhh = () => {
    spawnReaction('🤫');
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    setCinemaState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  // Toggle Cinema Lights
  const handleToggleLights = () => {
    setCinemaState((prev) => ({
      ...prev,
      isCinemaDimmed: !prev.isCinemaDimmed,
    }));
  };

  // Select Downloaded Movie File (Option 3)
  const handleSelectMovieFile = (movie: MovieFilePreset) => {
    setCinemaState((prev) => ({
      ...prev,
      title: movie.title,
      sourceType: 'file',
      sourceName: `${movie.filename} (WS Relay)`,
      duration: movie.duration,
      currentTime: 0,
      isPlaying: true,
    }));
    Alert.alert(
      '🎬 Screening Started',
      `Now streaming "${movie.title}" via pure WebSocket Chunk Relay to all 15 viewers!`,
      [{ text: 'Watch Now' }]
    );
  };

  // Toggle Screen Share (Option 1)
  const handleToggleScreenShare = (enable: boolean) => {
    if (enable) {
      setCinemaState((prev) => ({
        ...prev,
        title: 'Host Android Screen Share',
        sourceType: 'screenshare',
        sourceName: 'MediaProjection Live (1080p · 60fps)',
        isPlaying: true,
      }));
    } else {
      setCinemaState((prev) => ({
        ...prev,
        title: 'Spirited Away (Collector\'s Cut)',
        sourceType: 'file',
        sourceName: 'Spirited_Away_1080p.mp4',
      }));
    }
  };

  // Load Custom Web / YouTube URL
  const handleLoadWebUrl = (title: string, url: string) => {
    const ytId = extractYouTubeId(url);
    setCinemaState((prev) => ({
      ...prev,
      title: title || (ytId ? `YouTube Video (${ytId})` : 'Online Web Stream'),
      sourceType: 'web',
      sourceName: url,
      youtubeId: ytId,
      currentTime: 0,
      isPlaying: true,
    }));
  };

  // Host YouTube Video from Dedicated Modal
  const handleHostYouTubeVideo = (title: string, url: string, videoId: string | null) => {
    const ytId = videoId || extractYouTubeId(url);
    setCinemaState((prev) => ({
      ...prev,
      title: title || (ytId ? `YouTube Video (${ytId})` : 'Online Web Video'),
      sourceType: 'web',
      sourceName: url,
      youtubeId: ytId,
      currentTime: 0,
      isPlaying: true,
    }));
  };

  // Send Chat Message
  const handleSendChat = () => {
    if (!chatText.trim()) return;
    setChatText('');
    spawnReaction('💬');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ═══════════════════════════════════════════════════════════════
          UPPER HALF: The 16:9 Grand Cinema Stage & Curtains
          ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.upperStage}>
        <CinemaScreenCanvas
          state={cinemaState}
          onOpenDeck={() => {
            setProjectorInitialTab('file');
            setIsDeckVisible(true);
          }}
          onOpenYouTube={() => setIsYouTubeModalVisible(true)}
          onToggleLights={handleToggleLights}
          onTogglePlay={handleTogglePlay}
          onBack={onBack}
          isHost={true}
        />
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          PROJECTOR OPTIONS CONSOLE (JUST BELOW OF UPPER ROOM)
          ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.projectorConsoleDivider}>
        {/* Button 1: Direct YouTube Link (Highest Priority, Big Red Badge) */}
        <TouchableOpacity
          style={styles.projectorYouTubeDirectBtn}
          onPress={() => setIsYouTubeModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.projectorChipYouTubeBox}>
            <Text style={styles.projectorChipYouTubePlay}>▶</Text>
          </View>
          <Text style={styles.projectorChipYouTubeText}>YouTube</Text>
        </TouchableOpacity>

        {/* Button 2: Phone Downloaded Movie */}
        <TouchableOpacity
          style={[
            styles.projectorDividerBtn,
            cinemaState.sourceType === 'file' && styles.projectorDividerBtnActive,
          ]}
          onPress={() => {
            setProjectorInitialTab('file');
            setIsDeckVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.projectorDividerEmoji}>📁</Text>
          <Text style={styles.projectorDividerText}>Phone</Text>
        </TouchableOpacity>

        {/* Button 3: Android Screen Share */}
        <TouchableOpacity
          style={[
            styles.projectorDividerBtn,
            cinemaState.sourceType === 'screenshare' && styles.projectorDividerBtnActive,
          ]}
          onPress={() => handleToggleScreenShare(cinemaState.sourceType !== 'screenshare')}
          activeOpacity={0.7}
        >
          <Text style={styles.projectorDividerEmoji}>📺</Text>
          <Text style={styles.projectorDividerText}>
            {cinemaState.sourceType === 'screenshare' ? 'Sharing 🔴' : 'Screen'}
          </Text>
        </TouchableOpacity>

        {/* Button 4: Full Projector Deck */}
        <TouchableOpacity
          style={styles.projectorDeckSquareBtn}
          onPress={() => {
            setProjectorInitialTab('file');
            setIsDeckVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.projectorDeckSquareCrown}>👑</Text>
          <Text style={styles.projectorDeckSquareText}>DECK</Text>
        </TouchableOpacity>

        {/* Button 5: Master Play/Pause */}
        <TouchableOpacity
          style={styles.projectorPlayPauseChip}
          onPress={handleTogglePlay}
          activeOpacity={0.7}
        >
          <Text style={styles.projectorPlayPauseEmoji}>
            {cinemaState.isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          LOWER HALF: The Luxury VIP Recliner Lounge
          ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.lowerLounge}>
        {/* Background Lounge Image */}
        <Image source={LOUNGE_BG} style={styles.loungeBackground} resizeMode="cover" />

        {/* Cinema Dark Mode Dimmer Overlay */}
        <View
          pointerEvents="none"
          style={[
            styles.cinemaDimmerOverlay,
            {
              backgroundColor: cinemaState.isCinemaDimmed
                ? 'rgba(0, 0, 0, 0.75)'
                : 'rgba(0, 0, 0, 0.35)',
            },
          ]}
        />

        {/* ── Tiered VIP Recliner Rows (Visual Guide) ── */}
        <View pointerEvents="none" style={styles.reclinerRowsGuide}>
          {/* Back Row Shelf */}
          <View style={styles.backRowShelf}>
            <View style={styles.shelfGoldRailing} />
            <Text style={styles.shelfLabel}>TIER A · VIP BALCONY</Text>
          </View>
          {/* Front Row Floor */}
          <View style={styles.frontRowFloor}>
            <Text style={styles.floorLabel}>TIER B · ORCHESTRA RECLINERS</Text>
          </View>
        </View>

        {/* ── 8 Draggable VIP Audience Members ── */}
        {CINEMA_SLOTS.map((slot) => (
          <DraggableAudience
            key={slot.id}
            id={slot.id}
            mode={audienceMode}
            size={slot.size}
            initialX={slot.x}
            initialY={slot.y}
            zIndex={slot.z}
            allPositions={audiencePositions}
            roomWidth={SW}
            roomHeight={HALF_H}
          />
        ))}

        {/* ── Floating Seat Labels ── */}
        <View pointerEvents="none" style={styles.seatLabelsContainer}>
          {CINEMA_SLOTS.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.seatBadge,
                slot.isHostSeat && styles.hostSeatBadge,
                {
                  left: slot.x + slot.size * 0.1,
                  top: slot.y + slot.size * 0.9,
                },
              ]}
            >
              <Text style={[styles.seatBadgeText, slot.isHostSeat && styles.hostSeatBadgeText]}>
                {slot.name}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Interactive Cinema Actions Bar ── */}
        <View style={styles.cinemaActionsBar}>
          <TouchableOpacity
            style={styles.cinemaActionBtn}
            onPress={handleThrowPopcorn}
            activeOpacity={0.7}
          >
            <Text style={styles.cinemaActionEmoji}>🍿</Text>
            <Text style={styles.cinemaActionLabel}>Toss Popcorn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cinemaActionBtn}
            onPress={handleSodaSip}
            activeOpacity={0.7}
          >
            <Text style={styles.cinemaActionEmoji}>🥤</Text>
            <Text style={styles.cinemaActionLabel}>Sip Soda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cinemaActionBtn, has3DGlasses && styles.cinemaActionBtnActive]}
            onPress={handleToggle3DGlasses}
            activeOpacity={0.7}
          >
            <Text style={styles.cinemaActionEmoji}>🕶️</Text>
            <Text style={[styles.cinemaActionLabel, has3DGlasses && styles.cinemaActionLabelActive]}>
              {has3DGlasses ? '3D ON' : '3D Glasses'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cinemaActionBtn}
            onPress={handleCinemaShhh}
            activeOpacity={0.7}
          >
            <Text style={styles.cinemaActionEmoji}>🤫</Text>
            <Text style={styles.cinemaActionLabel}>Shhh!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cinemaActionBtn, styles.giftActionBtn]}
            onPress={() => {
              spawnReaction('🎟️');
              spawnReaction('🍿');
              spawnReaction('🍾');
              Alert.alert('🎁 VIP Cinema Gift Sent!', 'You sent a Golden VIP Cinema Pass to the host!');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cinemaActionEmoji}>🎁</Text>
            <Text style={styles.giftActionLabel}>VIP Gift</Text>
          </TouchableOpacity>
        </View>

        {/* ── Live Chat Overlay on the Left ── */}
        <View pointerEvents="box-none" style={styles.chatOverlayWrapper}>
          <LiveChatOverlay />
        </View>

        {/* ── Floating Popcorn & Reaction Stream ── */}
        {floatingReactions.map((item) => (
          <FloatingPopcornItem key={item.id} item={item} />
        ))}

        {/* ── 3D Gift System Overlay ── */}
        <GiftSystem
          onGiftSent={(_giftId: string) => {
            spawnReaction('🎁');
          }}
        />

        {/* ── Bottom Whisper Chat & Reaction Input ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomBar}
        >
          {/* Quick Reaction Emojis */}
          <View style={styles.quickReactionsRow}>
            {['🍿', '🥤', '🕶️', '😱', '🔥', '❤️', '👏'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.quickReactionBtn}
                onPress={() => spawnReaction(emoji, emoji === '🍿')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickReactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input Row */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Whisper in the cinema..."
              placeholderTextColor="#777"
              value={chatText}
              onChangeText={setChatText}
              onSubmitEditing={handleSendChat}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendChat} activeOpacity={0.8}>
              <Text style={styles.sendChatBtnText}>SEND</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          HOST PROJECTOR DECK MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <ProjectorDeckModal
        visible={isDeckVisible}
        onClose={() => setIsDeckVisible(false)}
        currentTitle={cinemaState.title}
        sourceType={cinemaState.sourceType}
        initialTab={projectorInitialTab}
        isPlaying={cinemaState.isPlaying}
        currentTime={cinemaState.currentTime}
        duration={cinemaState.duration}
        volume={cinemaState.volume}
        onSelectMovieFile={handleSelectMovieFile}
        onToggleScreenShare={handleToggleScreenShare}
        onLoadWebUrl={handleLoadWebUrl}
        onTogglePlay={handleTogglePlay}
        onSeek={(seconds) => setCinemaState((prev) => ({ ...prev, currentTime: seconds }))}
        onChangeVolume={(vol) => setCinemaState((prev) => ({ ...prev, volume: vol }))}
      />

      {/* ═══════════════════════════════════════════════════════════════
          DEDICATED INSTANT YOUTUBE / WEB VIDEO MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <HostYouTubeModal
        visible={isYouTubeModalVisible}
        onClose={() => setIsYouTubeModalVisible(false)}
        onHostVideo={handleHostYouTubeVideo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Upper Stage: Just under half
  upperStage: {
    height: HALF_H - 24,
    width: SW,
    backgroundColor: '#08050a',
    zIndex: 10,
  },

  // Projector Console Divider (Just Below Upper Room)
  projectorConsoleDivider: {
    width: '100%',
    height: 48,
    backgroundColor: '#0a050d',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(212, 175, 55, 0.45)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 6,
    zIndex: 25,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  projectorYouTubeDirectBtn: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#ff6666',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  projectorChipYouTubeBox: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectorChipYouTubePlay: {
    color: '#dc2626',
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 1,
  },
  projectorChipYouTubeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  projectorDividerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  projectorDividerBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderColor: '#d4af37',
  },
  projectorDividerEmoji: {
    fontSize: 12,
  },
  projectorDividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '800',
  },
  projectorDeckSquareBtn: {
    width: 44,
    height: 34,
    backgroundColor: '#d4af37',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  projectorDeckSquareCrown: {
    fontSize: 12,
  },
  projectorDeckSquareText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  projectorPlayPauseChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectorPlayPauseEmoji: {
    fontSize: 13,
  },

  // Lower Lounge: Just under half
  lowerLounge: {
    height: HALF_H - 24,
    width: SW,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#050308',
  },
  loungeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cinemaDimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },

  // Recliner Tier Guide
  reclinerRowsGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backRowShelf: {
    position: 'absolute',
    top: HALF_H * 0.18,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(127, 29, 29, 0.45)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  shelfGoldRailing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#d4af37',
  },
  shelfLabel: {
    color: 'rgba(212, 175, 55, 0.7)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
  frontRowFloor: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  floorLabel: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Seat Badges
  seatLabelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  seatBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  hostSeatBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#d4af37',
  },
  seatBadgeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontWeight: '700',
  },
  hostSeatBadgeText: {
    color: '#d4af37',
    fontWeight: '900',
  },

  // Cinema Actions Bar
  cinemaActionsBar: {
    position: 'absolute',
    top: 8,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 25,
    backgroundColor: 'rgba(10, 5, 12, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  cinemaActionBtn: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cinemaActionBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  cinemaActionEmoji: {
    fontSize: 14,
  },
  cinemaActionLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  cinemaActionLabelActive: {
    color: '#d4af37',
    fontWeight: '900',
  },
  giftActionBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
  },
  giftActionLabel: {
    color: '#d4af37',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 1,
  },

  // Chat Overlay
  chatOverlayWrapper: {
    position: 'absolute',
    top: 40,
    left: 8,
    bottom: 90,
    width: SW * 0.42,
    zIndex: 20,
  },

  // Floating Popcorn
  floatingPopcorn: {
    position: 'absolute',
    bottom: 70,
    zIndex: 40,
  },
  floatingEmojiText: {
    fontSize: 28,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 5, 12, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    zIndex: 30,
  },
  quickReactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  quickReactionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickReactionEmoji: {
    fontSize: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 19,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendChatBtn: {
    backgroundColor: '#d4af37',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  sendChatBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
