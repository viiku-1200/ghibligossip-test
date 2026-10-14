import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

// Room data with mock user counts
const ROOMS = [
  {
    id: 'lobby',
    name: 'The Galaxy Lobby',
    emoji: '🍸',
    type: 'Main Hangout Lounge',
    description: 'Chill, chat, and meet people before the shows',
    image: require('./anime_image/room_lobby.jpg'),
    users: 154,
    maxUsers: 500,
    isVip: false,
    isLive: true,
    themeColor: '#d4af37',
  },
  {
    id: 'comedy',
    name: 'The Laugh Vault',
    emoji: '🎙️',
    type: 'Stand-up Comedy',
    description: 'Open mic, roast battles & crowd work',
    image: require('./anime_image/room_comedy.jpg'),
    users: 28,
    maxUsers: 40,
    isVip: false,
    isLive: true,
    themeColor: '#e8a23a',
  },
  {
    id: 'dance',
    name: 'Galaverse Dance',
    emoji: '💃',
    type: 'Open Singing & Dance',
    description: 'Animated 3D sprite sheet room',
    image: require('./anime_image/room_comedy.jpg'),
    users: 11,
    maxUsers: 50,
    isVip: false,
    isLive: true,
    themeColor: '#ff007f',
  },
  {
    id: 'acoustic',
    name: 'Velvet Unplugged',
    emoji: '🎸',
    type: 'Acoustic / Indie',
    description: 'Singers, guitarists & cover artists',
    image: require('./anime_image/room_acoustic.jpg'),
    users: 19,
    maxUsers: 40,
    isVip: false,
    isLive: true,
    themeColor: '#a855f7',
  },
  {
    id: 'dj',
    name: 'Rooftop Afterhours',
    emoji: '🎧',
    type: 'DJ / EDM / Lo-Fi',
    description: 'Late night beats & avatar dancing',
    image: require('./anime_image/room_dj.jpg'),
    users: 35,
    maxUsers: 45,
    isVip: false,
    isLive: true,
    themeColor: '#00e5ff',
  },
  {
    id: 'truthdare',
    name: 'The Circle',
    emoji: '🔮',
    type: 'Truth or Dare',
    description: '6 players, 1 spinner, zero mercy',
    image: require('./anime_image/room_vip.jpg'),
    users: 6,
    maxUsers: 6,
    isVip: false,
    isLive: true,
    themeColor: '#7c3aed',
  },
  {
    id: 'runway',
    name: 'The Catwalk',
    emoji: '👠',
    type: 'Haute Couture Runway',
    description: 'Model walking show, paparazzi flashes & live scoring',
    image: require('./anime_image/upperroom_runway.png'),
    users: 48,
    maxUsers: 100,
    isVip: false,
    isLive: true,
    themeColor: '#ff007f',
  },
  {
    id: 'vip',
    name: 'VIP Cinema',
    emoji: '🎬',
    type: 'Synchronized Movie Theater',
    description: 'Host downloaded movies, phone screen share & watch party in VIP recliners',
    image: require('./anime_image/room_vip.jpg'),
    users: 12,
    maxUsers: 15,
    isVip: false,
    isLive: true,
    themeColor: '#d4af37',
  },
];

// Fake user avatars for the user count display
const AVATAR_COLORS = ['#d4af37', '#a855f7', '#00e5ff', '#ff6b6b', '#4ade80'];
const AVATAR_INITIALS = ['L', 'S', 'V'];

interface RoomListScreenProps {
  onJoinRoom: (roomId: string, roomName: string) => void;
  onBack: () => void;
}

export default function RoomListScreen({ onJoinRoom, onBack }: RoomListScreenProps) {
  const fadeAnims = useRef(ROOMS.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(ROOMS.map(() => new Animated.Value(40))).current;
  const scaleAnims = useRef(ROOMS.map(() => new Animated.Value(0.95))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const liveGlow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Header entrance
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Staggered card entrance with scale
    ROOMS.forEach((_, i) => {
      Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 500,
          delay: 200 + i * 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 500,
          delay: 200 + i * 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[i], {
          toValue: 1,
          duration: 500,
          delay: 200 + i * 150,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Pulse for live dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.8, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Live badge glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveGlow, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
        Animated.timing(liveGlow, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>GALAVERSE</Text>
          <View style={styles.headerAccent} />
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveHeaderPill}>
            <View style={styles.liveHeaderDot} />
            <Text style={styles.liveHeaderText}>LIVE</Text>
          </View>
        </View>
      </Animated.View>

      {/* Room List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ROOMS.map((room, index) => (
          <Animated.View
            key={room.id}
            style={[
              styles.roomCard,
              {
                opacity: fadeAnims[index],
                transform: [
                  { translateY: slideAnims[index] },
                  { scale: scaleAnims[index] },
                ],
              },
              room.isVip && styles.roomCardVip,
            ]}
          >
            {/* Room Image — Full Width Hero */}
            <View style={styles.imageContainer}>
              <Image source={room.image} style={styles.roomImage} />
              {/* Gradient overlay on image */}
              <View style={styles.imageGradientTop} />
              <View style={styles.imageGradientBottom} />

              {/* LIVE Badge with glow */}
              {room.isLive && (
                <Animated.View style={[styles.liveBadge, { opacity: liveGlow }]}>
                  <Animated.View
                    style={[
                      styles.liveDotGlow,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </Animated.View>
              )}

              {/* VIP Crown Badge */}
              {room.isVip && (
                <View style={styles.vipImageBadge}>
                  <Text style={styles.vipImageIcon}>👑</Text>
                  <Text style={styles.vipImageText}>VIP</Text>
                </View>
              )}

              {/* User count overlay on image */}
              <View style={styles.userCountOverlay}>
                <View style={styles.avatarStack}>
                  {AVATAR_INITIALS.map((initial, i) => (
                    <View
                      key={i}
                      style={[
                        styles.miniAvatar,
                        {
                          backgroundColor: AVATAR_COLORS[i],
                          marginLeft: i > 0 ? -10 : 0,
                          zIndex: 3 - i,
                          borderColor: '#1a1a1a',
                        },
                      ]}
                    >
                      <Text style={styles.miniAvatarText}>{initial}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.userCountText}>
                  {room.users}/{room.maxUsers}
                </Text>
              </View>
            </View>

            {/* Room Info — Below Image */}
            <View style={styles.roomInfo}>
              <View style={styles.roomNameRow}>
                <Text style={[styles.roomEmoji]}>{room.emoji}</Text>
                <Text style={[styles.roomName, { color: room.themeColor }]}>
                  {room.name}
                </Text>
              </View>

              <Text style={styles.roomDescription}>{room.description}</Text>

              {/* Join Button — Full Width, Premium */}
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  room.isVip && styles.joinButtonVip,
                  { borderColor: room.isVip ? 'rgba(212, 175, 55, 0.5)' : room.themeColor },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (room.isVip) return;
                  onJoinRoom(room.id, room.name);
                }}
              >
                <Text
                  style={[
                    styles.joinText,
                    room.isVip && styles.joinTextVip,
                    room.id === 'vip' && { color: '#d4af37' },
                  ]}
                >
                  {room.id === 'vip' ? '🎬  ENTER CINEMA' : room.isVip ? '🔒  VIP ONLY' : 'JOIN ROOM'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Premium Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={onBack}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabIcon}>🚪</Text>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Rooms</Text>
          <View style={styles.tabActiveIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>🛍️</Text>
          <Text style={styles.tabLabel}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },

  // Premium Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(8, 8, 8, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: '300',
    marginTop: -1,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    // Gold glow
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerAccent: {
    width: 40,
    height: 2,
    backgroundColor: '#d4af37',
    marginTop: 6,
    borderRadius: 1,
    opacity: 0.5,
  },
  headerRight: {
    width: 42,
    alignItems: 'flex-end',
  },
  liveHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 59, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.3)',
  },
  liveHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff3b3b',
  },
  liveHeaderText: {
    color: '#ff3b3b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Room Card — Glassmorphism
  roomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    // Glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  roomCardVip: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
    // Gold shadow for VIP
    shadowColor: '#d4af37',
    shadowOpacity: 0.2,
  },

  // Image — Full Width Hero
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(8, 8, 8, 0.7)',
  },

  // LIVE Badge with glow
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.3)',
  },
  liveDotGlow: {
    position: 'absolute',
    left: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 59, 59, 0.3)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ff3b3b',
    // Red glow
    shadowColor: '#ff3b3b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  liveText: {
    color: '#ff3b3b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // VIP Badge on image
  vipImageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  vipImageIcon: {
    fontSize: 12,
  },
  vipImageText: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // User count overlay
  userCountOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  userCountText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },

  // Room Info
  roomInfo: {
    padding: 16,
    gap: 8,
  },
  roomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomEmoji: {
    fontSize: 20,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    // Subtle glow
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  roomDescription: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Join Button — Full Width Premium
  joinButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 1,
    // Shadow glow
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  joinButtonVip: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  joinText: {
    color: '#d4af37',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  joinTextVip: {
    color: 'rgba(212, 175, 55, 0.7)',
    fontSize: 12,
    letterSpacing: 2,
  },

  // Premium Bottom Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 17, 17, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.1)',
    paddingBottom: 24,
    paddingTop: 12,
    // Glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  tabActive: {},
  tabActiveIndicator: {
    position: 'absolute',
    top: -12,
    width: 24,
    height: 2,
    backgroundColor: '#d4af37',
    borderRadius: 1,
    // Gold glow
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#d4af37',
  },
});
