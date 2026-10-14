import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface GalaVerseEntryScreenProps {
  onEnterBackstage: () => void;
  onCreateRoom: () => void;
  onBack: () => void;
}

export default function GalaVerseEntryScreen({
  onEnterBackstage,
  onCreateRoom,
  onBack,
}: GalaVerseEntryScreenProps) {
  // ── Animations ──
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.85)).current;
  const ornamentFade = useRef(new Animated.Value(0)).current;
  const ornamentWidth = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(80)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const titleGlow = useRef(new Animated.Value(0)).current;
  const crownSpin = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.6)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ambient golden shimmer — breathing light
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Title glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(titleGlow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Button glow breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.7, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.2, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Crown star slow rotation
    Animated.loop(
      Animated.timing(crownSpin, { toValue: 1, duration: 12000, useNativeDriver: true }),
    ).start();

    // Halo breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloScale, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(haloScale, { toValue: 0.6, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // ── Entrance choreography ──
    Animated.sequence([
      Animated.delay(400),
      // 1. Title rises in with scale
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.spring(titleScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      // 2. Ornamental lines expand outward
      Animated.parallel([
        Animated.timing(ornamentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ornamentWidth, { toValue: 1, duration: 800, useNativeDriver: false }),
      ]),
      // 2.5 Tagline fades in
      Animated.timing(taglineFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      // 3. Buttons slide up from below
      Animated.parallel([
        Animated.spring(buttonSlide, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
        Animated.timing(buttonOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // 4. Stats fade in last
      Animated.timing(statsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.28],
  });

  const titleGlowOpacity = titleGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  const ornamentLineWidth = ornamentWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const crownRotation = crownSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('./anime_image/golden_door.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* Dark cinematic overlay */}
        <View style={styles.overlay} />

        {/* Ambient golden shimmer layer */}
        <Animated.View
          style={[styles.shimmerLayer, { opacity: shimmerOpacity }]}
        />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        {/* ═══ TITLE SECTION ═══ */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: titleFade,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          {/* ── Decorative starburst crown above ── */}
          <Animated.View style={[styles.crownContainer, { opacity: ornamentFade }]}>
            {/* Spinning star halo */}
            <Animated.View style={[
              styles.starburstOuter,
              { transform: [{ rotate: crownRotation }, { scale: haloScale }] },
            ]}>
              {[0, 45, 90, 135].map((deg) => (
                <View key={deg} style={[
                  styles.starburstRay,
                  { transform: [{ rotate: `${deg}deg` }] },
                ]} />
              ))}
            </Animated.View>
            {/* Center gem */}
            <View style={styles.crownGem}>
              <View style={styles.crownGemInner} />
            </View>
          </Animated.View>

          {/* Top ornamental crest */}
          <Animated.View style={[styles.crestRow, { opacity: ornamentFade }]}>
            <Animated.View style={[styles.crestLine, { width: ornamentLineWidth }]} />
            <View style={styles.crestDiamond}>
              <View style={styles.diamondShape} />
            </View>
            <View style={styles.crestCenterDot} />
            <View style={styles.crestDiamond}>
              <View style={styles.diamondShape} />
            </View>
            <Animated.View style={[styles.crestLine, { width: ornamentLineWidth }]} />
          </Animated.View>

          {/* ── GALAVERSE Title ── */}
          <View style={styles.titleWrap}>
            {/* Radial halo glow */}
            <Animated.View style={[styles.titleHalo, { opacity: titleGlowOpacity }]} />
            {/* Background glow behind text */}
            <Animated.View style={[styles.titleBackGlow, { opacity: titleGlowOpacity }]} />
            <Text style={styles.titleText}>GALAVERSE</Text>
            {/* Underline accent */}
            <Animated.View style={[styles.titleUnderline, { opacity: ornamentFade }]} />
          </View>

          {/* Bottom ornamental line */}
          <Animated.View style={[styles.bottomCrestRow, { opacity: ornamentFade }]}>
            <Animated.View style={[styles.crestLineSmall, { width: ornamentLineWidth }]} />
            <View style={styles.crestDotSmall} />
            <View style={styles.crestDotSmall} />
            <View style={styles.crestDotSmall} />
            <Animated.View style={[styles.crestLineSmall, { width: ornamentLineWidth }]} />
          </Animated.View>

          {/* ── Tagline below ── */}
          <Animated.View style={[styles.taglineWrap, { opacity: taglineFade }]}>
            <Text style={styles.taglineText}>Where Stars Come Alive</Text>
          </Animated.View>

          {/* ── Ornate wing flourish below ── */}
          <Animated.View style={[styles.flourishWrap, { opacity: ornamentFade }]}>
            {/* Left wing */}
            <View style={styles.flourishWing}>
              <View style={styles.flourishLineOuter} />
              <View style={styles.flourishLineInner} />
            </View>
            {/* Center star */}
            <View style={styles.flourishStar}>
              <View style={styles.flourishStarShape} />
            </View>
            {/* Right wing */}
            <View style={[styles.flourishWing, { transform: [{ scaleX: -1 }] }]}>
              <View style={styles.flourishLineOuter} />
              <View style={styles.flourishLineInner} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* ═══ BUTTONS ═══ */}
        <Animated.View
          style={[
            styles.buttonsWrap,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          {/* ENTER BACKSTAGE — solid gold */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={onEnterBackstage}
          >
            <Animated.View style={[styles.primaryBtnGlow, { opacity: glowPulse }]} />
            <View style={styles.primaryBtnBody}>
              <Text style={styles.primaryBtnText}>ENTER BACKSTAGE</Text>
            </View>
          </TouchableOpacity>

          {/* CREATE PRIVATE ROOM — outlined */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={onCreateRoom}
          >
            <Text style={styles.secondaryBtnText}>CREATE PRIVATE ROOM</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ STATS ═══ */}
        <Animated.View style={[styles.statsWrap, { opacity: statsOpacity }]}>
          <Text style={styles.statsLine}>
            24 rooms live now  ·  1,847 online
          </Text>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

// ── Styles ──
const GOLD = '#d4af37';
const GOLD_LIGHT = '#f0d080';
const GOLD_WARM = '#e8c163';
const DARK = '#0d0a06';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Cinematic dark overlay — no ugly border trick
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Ambient golden shimmer
  shimmerLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },

  // ── Back button ──
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '300',
    marginTop: -1,
  },

  // ══════════════════════════════
  // TITLE SECTION
  // ══════════════════════════════
  titleSection: {
    position: 'absolute',
    top: height * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // ── Ornamental crest (top) ──
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 6,
  },
  crestLine: {
    height: 1.5,
    backgroundColor: GOLD_WARM,
    opacity: 0.6,
  },
  crestDiamond: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamondShape: {
    width: 6,
    height: 6,
    backgroundColor: GOLD_WARM,
    transform: [{ rotate: '45deg' }],
    opacity: 0.7,
  },
  crestCenterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD_WARM,
    opacity: 0.9,
    marginHorizontal: 3,
  },

  // ── Crown starburst (above title) ──
  crownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
    height: 56,
  },
  starburstOuter: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starburstRay: {
    position: 'absolute',
    width: 1.5,
    height: 56,
    backgroundColor: GOLD_WARM,
    opacity: 0.35,
  },
  crownGem: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1.5,
    borderColor: GOLD_WARM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownGemInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD_LIGHT,
  },

  // ── Title ──
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  titleHalo: {
    position: 'absolute',
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.08)',
  },
  titleBackGlow: {
    position: 'absolute',
    width: width * 0.75,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
  },
  titleText: {
    color: GOLD_LIGHT,
    fontSize: 44,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '400',
    letterSpacing: 10,
    textAlign: 'center',
    // Rich gold glow — layered
    textShadowColor: 'rgba(240, 208, 128, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  titleUnderline: {
    width: width * 0.35,
    height: 1.5,
    backgroundColor: GOLD_WARM,
    marginTop: 8,
    opacity: 0.5,
    borderRadius: 1,
  },

  // ── Bottom ornamental crest ──
  bottomCrestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  crestLineSmall: {
    height: 1,
    backgroundColor: GOLD_WARM,
    opacity: 0.45,
  },
  crestDotSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: GOLD_WARM,
    opacity: 0.6,
  },

  // ── Tagline ──
  taglineWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  taglineText: {
    color: 'rgba(240, 210, 140, 0.7)',
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // ── Ornate wing flourish (below title) ──
  flourishWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 10,
  },
  flourishWing: {
    alignItems: 'flex-end',
    gap: 3,
  },
  flourishLineOuter: {
    width: 60,
    height: 1,
    backgroundColor: GOLD_WARM,
    opacity: 0.35,
    borderRadius: 1,
  },
  flourishLineInner: {
    width: 35,
    height: 1,
    backgroundColor: GOLD_WARM,
    opacity: 0.22,
    borderRadius: 1,
  },
  flourishStar: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flourishStarShape: {
    width: 7,
    height: 7,
    backgroundColor: GOLD_WARM,
    transform: [{ rotate: '45deg' }],
    opacity: 0.55,
  },

  // ══════════════════════════════
  // BUTTONS
  // ══════════════════════════════
  buttonsWrap: {
    position: 'absolute',
    bottom: height * 0.135,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    alignItems: 'center',
  },

  // Primary — ENTER BACKSTAGE
  primaryBtn: {
    width: '100%',
    marginBottom: 14,
    position: 'relative',
  },
  primaryBtnGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  primaryBtnBody: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 27,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryBtnText: {
    color: DARK,
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '700',
    letterSpacing: 3,
  },

  // Secondary — CREATE PRIVATE ROOM
  secondaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: GOLD_LIGHT,
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '600',
    letterSpacing: 2.5,
  },

  // ══════════════════════════════
  // STATS
  // ══════════════════════════════
  statsWrap: {
    position: 'absolute',
    bottom: height * 0.065,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statsLine: {
    color: 'rgba(224, 195, 120, 0.75)',
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '400',
    letterSpacing: 1,
  },
});
