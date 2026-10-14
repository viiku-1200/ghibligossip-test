// ═══════════════════════════════════════════════════════════════
// CinemaScreenCanvas.tsx — The 16:9 Grand Cinema Screen & Stage
// • Velvet Curtains with gold trim and ambient glow
// • Projector light beam from ceiling with floating dust particles
// • Film Marquee ticker with movie title & live sync status
// • Hardware-accelerated cinematic canvas with subtitles & audio spectrum
// • Full Host Play/Pause indicator & Screen Share overlay
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  UIManager,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SW } = Dimensions.get('window');
const SCREEN_WIDTH = SW * 0.92;
const SCREEN_HEIGHT = SCREEN_WIDTH * (9 / 16);

// Check if native RNCWebView is compiled into the current binary
const hasNativeWebView =
  typeof UIManager !== 'undefined' &&
  !!UIManager.getViewManagerConfig &&
  !!UIManager.getViewManagerConfig('RNCWebView');

export interface CinemaState {
  title: string;
  sourceType: 'file' | 'screenshare' | 'web';
  sourceName: string;
  youtubeId?: string | null;
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  volume: number;
  isCinemaDimmed: boolean;
  subtitle: string;
}

interface Props {
  state: CinemaState;
  onOpenDeck: () => void;
  onOpenYouTube?: () => void;
  onToggleLights: () => void;
  onTogglePlay: () => void;
  onBack: () => void;
  isHost: boolean;
}

export default function CinemaScreenCanvas({
  state,
  onOpenDeck,
  onOpenYouTube,
  onToggleLights,
  onTogglePlay,
  onBack,
  isHost,
}: Props) {
  // Projector beam flicker animation
  const beamOpacity = useRef(new Animated.Value(0.25)).current;
  // Ambient screen glow pulse
  const ambientGlow = useRef(new Animated.Value(0.4)).current;
  // Floating dust motes in projector light
  const dust1 = useRef(new Animated.Value(0)).current;
  const dust2 = useRef(new Animated.Value(0)).current;
  // Audio equalizer spectrum bars
  const eqBars = useRef([
    new Animated.Value(6),
    new Animated.Value(12),
    new Animated.Value(18),
    new Animated.Value(14),
    new Animated.Value(8),
    new Animated.Value(16),
    new Animated.Value(10),
  ]).current;
  // Cinematic pan/zoom for active film
  const filmZoom = useRef(new Animated.Value(1)).current;

  // Projector beam flicker
  useEffect(() => {
    const flickerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(beamOpacity, {
          toValue: 0.35,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beamOpacity, {
          toValue: 0.22,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    flickerAnim.start();
    return () => flickerAnim.stop();
  }, [beamOpacity]);

  // Ambient glow
  useEffect(() => {
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientGlow, {
          toValue: 0.7,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(ambientGlow, {
          toValue: 0.35,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnim.start();
    return () => glowAnim.stop();
  }, [ambientGlow]);

  // Floating dust particles
  useEffect(() => {
    const dustAnim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(dust1, {
            toValue: 1,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(dust1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dust2, {
            toValue: 1,
            duration: 5500,
            delay: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(dust2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    dustAnim.start();
    return () => dustAnim.stop();
  }, [dust1, dust2]);

  // Audio equalizer bars pulsing when playing
  useEffect(() => {
    if (!state.isPlaying) return;

    const anims = eqBars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 4 + (i % 3) * 6 + Math.random() * 8,
            duration: 250 + (i % 4) * 80,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 2 + Math.random() * 5,
            duration: 200 + (i % 3) * 70,
            useNativeDriver: false,
          }),
        ])
      )
    );
    anims.forEach((anim) => anim.start());
    return () => anims.forEach((anim) => anim.stop());
  }, [eqBars, state.isPlaying]);

  // Film subtle zoom
  useEffect(() => {
    if (!state.isPlaying) return;
    const zoomAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(filmZoom, {
          toValue: 1.05,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(filmZoom, {
          toValue: 1.0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    zoomAnim.start();
    return () => zoomAnim.stop();
  }, [filmZoom, state.isPlaying]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.stageContainer}>
      {/* ── Top Bar Controls ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        {/* Room & Stream Mode Badge */}
        <View style={styles.roomStatusPill}>
          <View style={[styles.statusDot, { backgroundColor: state.isPlaying ? '#4ade80' : '#f59e0b' }]} />
          <Text style={styles.roomStatusTitle}>
            {state.sourceType === 'screenshare'
              ? 'SCREEN SHARE'
              : state.sourceType === 'file'
              ? 'WEBSOCKET RELAY'
              : 'WEB STREAM'}
          </Text>
          <Text style={styles.viewerCountText}>👥 12/15</Text>
        </View>

        {/* Cinema Light Switch & Projector Deck Button */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[styles.actionIconBtn, state.isCinemaDimmed && styles.actionIconBtnActive]}
            onPress={onToggleLights}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIconEmoji}>{state.isCinemaDimmed ? '🌙' : '💡'}</Text>
          </TouchableOpacity>

          {isHost && (
            <TouchableOpacity style={styles.projectorDeckBtn} onPress={onOpenDeck} activeOpacity={0.8}>
              <Text style={styles.projectorDeckCrown}>👑</Text>
              <Text style={styles.projectorDeckText}>PROJECTOR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Projector Light Cone from Top Ceiling ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.projectorCone,
          {
            opacity: beamOpacity,
          },
        ]}
      />

      {/* ── Dust Particles in Light Beam ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.dustParticle,
          {
            top: SCREEN_HEIGHT * 0.2,
            left: SW * 0.45,
            opacity: dust1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.8, 0],
            }),
            transform: [
              {
                translateY: dust1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 40],
                }),
              },
            ],
          },
        ]}
      />

      {/* ── Top Valance Pelmet Curtain ── */}
      <View style={styles.topCurtainPelmet}>
        <View style={styles.pelmetFold} />
        <View style={styles.pelmetFold} />
        <View style={styles.pelmetFold} />
        <View style={styles.pelmetGoldTrim} />
      </View>

      {/* ── Grand 16:9 Cinema Frame ── */}
      <View style={styles.cinemaStageFrame}>
        {/* Left Velvet Curtain */}
        <View style={styles.curtainLeft}>
          <View style={styles.curtainShadow} />
          <View style={styles.curtainTassel}>
            <Text style={styles.curtainTasselText}>🎗️</Text>
          </View>
        </View>

        {/* Ambient Screen Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ambientScreenGlow,
            {
              opacity: ambientGlow,
            },
          ]}
        />

        {/* The 16:9 Movie Screen Surface */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onTogglePlay}
          style={styles.screenSurface}
        >
          {/* Film Visual Scene */}
          <Animated.View
            style={[
              styles.filmCanvas,
              {
                transform: [{ scale: filmZoom }],
              },
            ]}
          >
            {/* Film Background Backdrop */}
            <View style={styles.filmColorBackdrop}>
              {/* Scanlines / Cinema Grain Effect */}
              <View style={styles.filmScanlines} />

              {/* Central Film Graphic / Artwork */}
              <View style={styles.filmCenterVisual}>
                {state.sourceType === 'screenshare' ? (
                  <View style={styles.screenShareDisplay}>
                    <Text style={styles.screenShareIcon}>📱</Text>
                    <Text style={styles.screenShareTitle}>Host Phone Screen Mirror</Text>
                    <Text style={styles.screenShareSub}>Broadcasting Android Screen (1080p · 60fps)</Text>
                    <View style={styles.screenSharePill}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.screenShareStatus}>ACTIVE BROADCAST</Text>
                    </View>
                  </View>
                ) : state.youtubeId ? (
                  <View style={styles.youtubeDisplay}>
                    {hasNativeWebView && state.isPlaying ? (
                      <WebView
                        source={{
                          uri: `https://www.youtube-nocookie.com/embed/${state.youtubeId}?autoplay=1&controls=1&modestbranding=1&playsinline=1&rel=0`,
                        }}
                        style={styles.webView}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                      />
                    ) : (
                      <>
                        <Image
                          source={{
                            uri: `https://img.youtube.com/vi/${state.youtubeId}/hqdefault.jpg`,
                          }}
                          style={styles.youtubeThumbImage}
                          resizeMode="cover"
                        />
                        <View style={styles.youtubeDarkGrad} />
                        <View style={styles.youtubeCenterPill}>
                          <View style={styles.youtubeRedBox}>
                            <Text style={styles.youtubeWhitePlay}>▶</Text>
                          </View>
                          <Text style={styles.youtubeStreamTitle} numberOfLines={1}>
                            {state.title}
                          </Text>
                          <View style={styles.youtubeLiveBadge}>
                            <View style={styles.livePulseDot} />
                            <Text style={styles.youtubeLiveText}>YOUTUBE 1080p · SYNCED</Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                ) : (
                  <View style={styles.movieDisplay}>
                    <Text style={styles.movieEmoji}>🌌</Text>
                    <Text style={styles.movieTitleDisplay}>{state.title}</Text>
                    <Text style={styles.movieSourceInfo}>
                      {state.sourceType === 'file' ? '⚡ WS Chunks Relay · 1080p' : '🌐 Web Stream · Direct'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Subtitle Bar */}
              {state.isPlaying && (
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitleText}>"{state.subtitle}"</Text>
                </View>
              )}

              {/* Paused Overlay */}
              {!state.isPlaying && (
                <View style={styles.pauseOverlay}>
                  <View style={styles.pauseCircle}>
                    <Text style={styles.pauseIcon}>⏸️</Text>
                  </View>
                  <Text style={styles.pauseText}>PAUSED BY HOST</Text>
                </View>
              )}

              {/* Live Audio Equalizer in bottom-left */}
              {state.isPlaying && (
                <View style={styles.audioEqContainer}>
                  {eqBars.map((bar, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.eqBar,
                        {
                          height: bar,
                        },
                      ]}
                    />
                  ))}
                  <Text style={styles.audioLabel}>DOLBY 5.1</Text>
                </View>
              )}

              {/* Time Code Stamp in bottom-right */}
              <View style={styles.timecodePill}>
                <Text style={styles.timecodeText}>
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Right Velvet Curtain */}
        <View style={styles.curtainRight}>
          <View style={styles.curtainShadow} />
          <View style={styles.curtainTassel}>
            <Text style={styles.curtainTasselText}>🎗️</Text>
          </View>
        </View>
      </View>

      {/* ── Marquee Film Ticker below Screen ── */}
      <View style={styles.filmMarqueeBar}>
        <View style={styles.marqueeBadge}>
          <Text style={styles.marqueeBadgeText}>NOW SHOWING</Text>
        </View>
        <Text style={styles.marqueeTitle} numberOfLines={1}>
          🎬 {state.title} · {state.sourceName}
        </Text>
        <TouchableOpacity style={styles.marqueePlayBtn} onPress={onTogglePlay} activeOpacity={0.7}>
          <Text style={styles.marqueePlayText}>{state.isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Projector Options Just Below Upper Room Screen ── */}
      {isHost && (
        <View style={styles.projectorBarJustBelow}>
          {/* Direct YouTube Button */}
          <TouchableOpacity
            style={styles.directYouTubeBtnStage}
            onPress={onOpenYouTube}
            activeOpacity={0.8}
          >
            <View style={styles.directYouTubeBadge}>
              <Text style={styles.directYouTubeBadgeText}>▶</Text>
            </View>
            <Text style={styles.directYouTubeBtnText}>PASTE YOUTUBE LINK</Text>
          </TouchableOpacity>

          {/* Projector Deck Button */}
          <TouchableOpacity
            style={styles.projectorButtonBelow}
            onPress={onOpenDeck}
            activeOpacity={0.8}
          >
            <Text style={styles.projectorButtonBelowCrown}>👑</Text>
            <Text style={styles.projectorButtonBelowText}>DECK</Text>
            <Text style={styles.projectorOpenArrow}>▾</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0508',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Top Bar
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  roomStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  roomStatusTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  viewerCountText: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#d4af37',
  },
  actionIconEmoji: {
    fontSize: 16,
  },
  projectorDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4af37',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  projectorDeckCrown: {
    fontSize: 12,
  },
  projectorDeckText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Projector Cone
  projectorCone: {
    position: 'absolute',
    top: -20,
    width: SW * 0.7,
    height: SCREEN_HEIGHT + 60,
    backgroundColor: 'transparent',
    borderLeftWidth: SW * 0.35,
    borderRightWidth: SW * 0.35,
    borderTopWidth: SCREEN_HEIGHT + 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 248, 220, 0.08)',
    zIndex: 2,
  },
  dustParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    zIndex: 3,
  },

  // Top Pelmet Curtain
  topCurtainPelmet: {
    width: '100%',
    height: 18,
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 2,
    borderBottomColor: '#d4af37',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  pelmetFold: {
    width: '30%',
    height: '100%',
    backgroundColor: '#991b1b',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  pelmetGoldTrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#d4af37',
  },

  // Cinema Stage Frame
  cinemaStageFrame: {
    width: SW,
    height: SCREEN_HEIGHT + 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },

  // Velvet Curtains
  curtainLeft: {
    width: SW * 0.05,
    height: '100%',
    backgroundColor: '#7f1d1d',
    borderRightWidth: 2,
    borderRightColor: 'rgba(212, 175, 55, 0.4)',
    zIndex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curtainRight: {
    width: SW * 0.05,
    height: '100%',
    backgroundColor: '#7f1d1d',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(212, 175, 55, 0.4)',
    zIndex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curtainShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  curtainTassel: {
    position: 'absolute',
    bottom: 12,
  },
  curtainTasselText: {
    fontSize: 10,
  },

  // Screen Surface
  screenSurface: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#262626',
    overflow: 'hidden',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
  },
  ambientScreenGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_HEIGHT * 1.1,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    zIndex: 1,
  },
  filmCanvas: {
    width: '100%',
    height: '100%',
  },
  filmColorBackdrop: {
    width: '100%',
    height: '100%',
    backgroundColor: '#120d1e',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filmScanlines: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    opacity: 0.15,
  },
  filmCenterVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  movieDisplay: {
    alignItems: 'center',
  },
  movieEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  movieTitleDisplay: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  movieSourceInfo: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Screen share view
  screenShareDisplay: {
    alignItems: 'center',
  },
  screenShareIcon: {
    fontSize: 36,
  },
  screenShareTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  screenShareSub: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  screenSharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  screenShareStatus: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Subtitle
  subtitleContainer: {
    position: 'absolute',
    bottom: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    maxWidth: '85%',
  },
  subtitleText: {
    color: '#fffae0',
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Paused Overlay
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pauseCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1.5,
    borderColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    fontSize: 20,
  },
  pauseText: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Audio EQ
  audioEqContainer: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  eqBar: {
    width: 3,
    backgroundColor: '#d4af37',
    borderRadius: 1.5,
  },
  audioLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },

  // Timecode
  timecodePill: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timecodeText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Film Marquee
  filmMarqueeBar: {
    width: SW * 0.94,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 10, 15, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 8,
  },
  marqueeBadge: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  marqueeBadgeText: {
    color: '#d4af37',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  marqueeTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  marqueePlayBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  marqueePlayText: {
    fontSize: 14,
  },

  // Projector Bar Just Below
  projectorBarJustBelow: {
    width: SW * 0.94,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  directYouTubeBtnStage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#ff6666',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  directYouTubeBadge: {
    width: 20,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directYouTubeBadgeText: {
    color: '#dc2626',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 1,
  },
  directYouTubeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  projectorButtonBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d4af37',
    gap: 4,
  },
  projectorButtonBelowCrown: {
    fontSize: 14,
  },
  projectorButtonBelowText: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  projectorOpenArrow: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '900',
  },

  // YouTube Display
  youtubeDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  youtubeThumbImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  youtubeDarkGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  youtubeCenterPill: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  youtubeRedBox: {
    width: 48,
    height: 34,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  youtubeWhitePlay: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 2,
  },
  youtubeStreamTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  youtubeLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
  },
  youtubeLiveText: {
    color: '#ff4d4d',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
