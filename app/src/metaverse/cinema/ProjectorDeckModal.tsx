// ═══════════════════════════════════════════════════════════════
// ProjectorDeckModal.tsx — Host Master Projector Control Deck
// • Option 3: Downloaded Phone Movie (WebSocket Relay to Node.js server)
// • Option 1: Android MediaProjection Screen Sharing (Live Mirror)
// • Web / YouTube Stream Link Input
// • Master Cinema Remote: Play/Pause, Timeline Scrubber, Volume, Eject
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

export interface MovieFilePreset {
  id: string;
  title: string;
  filename: string;
  size: string;
  duration: number; // in seconds
  emoji: string;
}

const PHONE_MOVIE_PRESETS: MovieFilePreset[] = [
  {
    id: 'ghibli_1',
    title: 'Spirited Away (Collector’s Cut)',
    filename: 'Spirited_Away_1080p.mp4',
    size: '1.85 GB',
    duration: 7500, // 2h 5m
    emoji: '🐉',
  },
  {
    id: 'anime_2',
    title: 'Your Name (Remastered Edition)',
    filename: 'Your_Name_1080p_DualAudio.mp4',
    size: '2.10 GB',
    duration: 6420, // 1h 47m
    emoji: '🌠',
  },
  {
    id: 'cyberpunk_3',
    title: 'Cyberpunk: Edgerunners Ep. 1',
    filename: 'Cyberpunk_S01E01_HDR.mp4',
    size: '890 MB',
    duration: 1560, // 26m
    emoji: '⚡',
  },
  {
    id: 'mononoke_4',
    title: 'Princess Mononoke (HD Special)',
    filename: 'Princess_Mononoke_4K.mp4',
    size: '2.40 GB',
    duration: 8040, // 2h 14m
    emoji: '🐺',
  },
  {
    id: 'lofi_5',
    title: 'Ghibli Cafe Lo-Fi Beats & Chill',
    filename: 'Ghibli_Lofi_Study_Relax.mp4',
    size: '620 MB',
    duration: 3600, // 1h
    emoji: '☕',
  },
];

const WEB_LINK_PRESETS = [
  {
    title: 'Studio Ghibli 4K Film Reel',
    url: 'https://cdn.ghibligossip.com/stream/ghibli_reel_4k.mp4',
    emoji: '✨',
  },
  {
    title: '24/7 Anime Lofi Chill Stream',
    url: 'https://youtube.com/live/anime_chill_lofi',
    emoji: '🎶',
  },
  {
    title: 'Demon Slayer New Arc Premiere Trailer',
    url: 'https://cdn.ghibligossip.com/trailers/demon_slayer_trailer.mp4',
    emoji: '🔥',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  currentTitle: string;
  sourceType: 'file' | 'screenshare' | 'web';
  initialTab?: 'file' | 'screenshare' | 'web';
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onSelectMovieFile: (movie: MovieFilePreset) => void;
  onToggleScreenShare: (enable: boolean) => void;
  onLoadWebUrl: (title: string, url: string) => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (volume: number) => void;
}

export default function ProjectorDeckModal({
  visible,
  onClose,
  currentTitle,
  sourceType,
  initialTab,
  isPlaying,
  currentTime,
  duration,
  volume,
  onSelectMovieFile,
  onToggleScreenShare,
  onLoadWebUrl,
  onTogglePlay,
  onSeek,
  onChangeVolume,
}: Props) {
  const [activeTab, setActiveTab] = useState<'file' | 'screenshare' | 'web'>(initialTab || sourceType);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(sourceType === 'screenshare');

  // Sync activeTab when modal opens with initialTab
  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialTab || sourceType);
    }
  }, [visible, initialTab, sourceType]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCustomFilePick = () => {
    Alert.alert(
      '📱 Android File Picker',
      'Choose any downloaded .mp4 or .mkv from your phone storage:',
      [
        {
          text: 'Downloads / Spirited_Away.mp4',
          onPress: () => {
            onSelectMovieFile(PHONE_MOVIE_PRESETS[0]);
            onClose();
          },
        },
        {
          text: 'Movies / Custom_Film.mp4',
          onPress: () => {
            onSelectMovieFile({
              id: 'custom_phone',
              title: 'My Downloaded Movie (Custom)',
              filename: 'Custom_Film.mp4',
              size: '1.45 GB',
              duration: 5400,
              emoji: '🎬',
            });
            onClose();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleToggleScreenSharePress = () => {
    const nextState = !isScreenSharingActive;
    setIsScreenSharingActive(nextState);
    onToggleScreenShare(nextState);
    if (nextState) {
      Alert.alert(
        '📺 Screen Sharing Active',
        'Your Android screen is now mirroring to the cinema screen. You can open VLC, MX Player, or your gallery to stream!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLoadCustomUrl = () => {
    if (!customUrl.trim()) {
      Alert.alert('Please enter a URL', 'Paste a YouTube or .mp4 link to stream.');
      return;
    }
    const title = customTitle.trim() || 'Online Web Stream';
    onLoadWebUrl(title, customUrl.trim());
    setCustomUrl('');
    setCustomTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        {/* Independent Backdrop Click Area */}
        <TouchableOpacity style={styles.backdropClickArea} activeOpacity={1} onPress={onClose} />

        {/* Modal Card */}
        <View style={styles.modalCard}>
          {/* Gold Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerCrown}>👑</Text>
              <View>
                <Text style={styles.headerTitle}>HOST PROJECTOR DECK</Text>
                <Text style={styles.headerSub}>Master Cinema Broadcast Console</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 3 Source Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'file' && styles.tabItemActive]}
              onPress={() => setActiveTab('file')}
              activeOpacity={0.8}
            >
              <Text style={styles.tabEmoji}>📁</Text>
              <Text style={[styles.tabText, activeTab === 'file' && styles.tabTextActive]}>
                PHONE FILE
              </Text>
              <Text style={styles.tabPill}>OPTION 3</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'screenshare' && styles.tabItemActive]}
              onPress={() => setActiveTab('screenshare')}
              activeOpacity={0.8}
            >
              <Text style={styles.tabEmoji}>📺</Text>
              <Text style={[styles.tabText, activeTab === 'screenshare' && styles.tabTextActive]}>
                SCREEN SHARE
              </Text>
              <Text style={styles.tabPill}>OPTION 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'web' && styles.tabItemActive]}
              onPress={() => setActiveTab('web')}
              activeOpacity={0.8}
            >
              <Text style={styles.tabEmoji}>🌐</Text>
              <Text style={[styles.tabText, activeTab === 'web' && styles.tabTextActive]}>
                WEB / YOUTUBE
              </Text>
              <Text style={styles.tabPill}>LINK</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content Body */}
          <ScrollView style={styles.tabBody} showsVerticalScrollIndicator={false}>
            {/* ── TAB 1: PHONE MOVIE FILE (Option 3 WebSocket Relay) ── */}
            {activeTab === 'file' && (
              <View style={styles.tabPane}>
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerIcon}>⚡</Text>
                  <View style={styles.infoBannerTextContainer}>
                    <Text style={styles.infoBannerTitle}>WebSocket Chunk Relay</Text>
                    <Text style={styles.infoBannerSub}>
                      Streams your downloaded movie chunks through your Node.js server to 15 VIP viewers in real-time.
                    </Text>
                  </View>
                </View>

                {/* Pick Custom File Button */}
                <TouchableOpacity
                  style={styles.pickFileBtn}
                  onPress={handleCustomFilePick}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickFileBtnIcon}>📂</Text>
                  <View style={styles.pickFileBtnTextGroup}>
                    <Text style={styles.pickFileBtnTitle}>Pick Movie from Phone Storage</Text>
                    <Text style={styles.pickFileBtnSub}>Opens Android Downloads / Videos</Text>
                  </View>
                  <Text style={styles.pickFileArrow}>›</Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeading}>DOWNLOADED MOVIES ON DEVICE</Text>

                {PHONE_MOVIE_PRESETS.map((m) => {
                  const isCurrent = currentTitle.includes(m.title) && sourceType === 'file';
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.movieRow, isCurrent && styles.movieRowActive]}
                      onPress={() => {
                        onSelectMovieFile(m);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.movieRowEmoji}>{m.emoji}</Text>
                      <View style={styles.movieRowInfo}>
                        <Text style={styles.movieRowTitle} numberOfLines={1}>
                          {m.title}
                        </Text>
                        <Text style={styles.movieRowMeta}>
                          {m.filename} · {m.size} · {formatTime(m.duration)}
                        </Text>
                      </View>
                      <View style={[styles.movieRowBadge, isCurrent && styles.movieRowBadgeActive]}>
                        <Text style={[styles.movieRowBadgeText, isCurrent && styles.movieRowBadgeTextActive]}>
                          {isCurrent ? 'STREAMING' : 'STREAM'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ── TAB 2: SCREEN SHARING (Option 1 Android MediaProjection) ── */}
            {activeTab === 'screenshare' && (
              <View style={styles.tabPane}>
                <View style={styles.screenShareHero}>
                  <Text style={styles.screenShareBigEmoji}>
                    {isScreenSharingActive ? '🟢' : '📺'}
                  </Text>
                  <Text style={styles.screenShareHeroTitle}>
                    {isScreenSharingActive ? 'Screen Share is ACTIVE' : 'Mirror Phone Screen'}
                  </Text>
                  <Text style={styles.screenShareHeroSub}>
                    Broadcasts your Android screen & audio directly to the cinema canvas. Use VLC Player, MX Player, or any video app!
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.screenShareActionBtn,
                      isScreenSharingActive && styles.screenShareActionBtnStop,
                    ]}
                    onPress={handleToggleScreenSharePress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.screenShareActionBtnText}>
                      {isScreenSharingActive ? '⏹️ STOP SCREEN SHARING' : '🔴 START SCREEN SHARING'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Specs Pill Grid */}
                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Text style={styles.specVal}>1080p</Text>
                    <Text style={styles.specLbl}>Resolution</Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specVal}>60 FPS</Text>
                    <Text style={styles.specLbl}>Frame Rate</Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specVal}>Internal</Text>
                    <Text style={styles.specLbl}>Audio Track</Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specVal}>15 / 15</Text>
                    <Text style={styles.specLbl}>Viewers</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── TAB 3: WEB / YOUTUBE URL ── */}
            {activeTab === 'web' && (
              <View style={styles.tabPane}>
                <Text style={styles.sectionHeading}>PASTE DIRECT VIDEO LINK</Text>

                <TextInput
                  style={styles.inputBox}
                  placeholder="Movie Title (e.g. Anime Movie 4K)..."
                  placeholderTextColor="#666"
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />

                <TextInput
                  style={styles.inputBox}
                  placeholder="Paste YouTube, Google Drive, or .mp4 URL..."
                  placeholderTextColor="#666"
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={styles.loadUrlBtn}
                  onPress={handleLoadCustomUrl}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loadUrlBtnText}>🎬 LOAD TO CINEMA SCREEN</Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeading}>CURATED ANIME REELS & STREAMS</Text>
                {WEB_LINK_PRESETS.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.webPresetRow}
                    onPress={() => {
                      onLoadWebUrl(p.title, p.url);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.webPresetEmoji}>{p.emoji}</Text>
                    <View style={styles.webPresetInfo}>
                      <Text style={styles.webPresetTitle}>{p.title}</Text>
                      <Text style={styles.webPresetUrl} numberOfLines={1}>
                        {p.url}
                      </Text>
                    </View>
                    <Text style={styles.webPresetPlay}>▶️</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* ── Docked Master Playback Controls ── */}
          <View style={styles.remoteDock}>
            <View style={styles.remoteTrackInfo}>
              <Text style={styles.remotePlayingLabel}>MASTER REMOTE:</Text>
              <Text style={styles.remotePlayingTitle} numberOfLines={1}>
                {currentTitle}
              </Text>
            </View>

            {/* Scrubber Progress Bar */}
            <View style={styles.scrubberRow}>
              <Text style={styles.scrubberTime}>{formatTime(currentTime)}</Text>
              <View style={styles.scrubberTrack}>
                <View
                  style={[
                    styles.scrubberFill,
                    {
                      width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.scrubberTime}>{formatTime(duration)}</Text>
            </View>

            {/* Remote Buttons */}
            <View style={styles.remoteButtonsRow}>
              <TouchableOpacity
                style={styles.remoteSkipBtn}
                onPress={() => onSeek(Math.max(0, currentTime - 15))}
                activeOpacity={0.7}
              >
                <Text style={styles.remoteSkipText}>-15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.remoteMainPlayBtn}
                onPress={onTogglePlay}
                activeOpacity={0.8}
              >
                <Text style={styles.remoteMainPlayText}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.remoteSkipBtn}
                onPress={() => onSeek(Math.min(duration, currentTime + 15))}
                activeOpacity={0.7}
              >
                <Text style={styles.remoteSkipText}>+15s</Text>
              </TouchableOpacity>

              {/* Volume Buttons */}
              <TouchableOpacity
                style={styles.volumeBtn}
                onPress={() => onChangeVolume(volume > 0.5 ? 0.3 : 0.9)}
                activeOpacity={0.7}
              >
                <Text style={styles.volumeBtnText}>{volume > 0.5 ? '🔊 90%' : '🔉 30%'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  backdropClickArea: {
    flex: 1,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#0d0810',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 14,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerCrown: {
    fontSize: 22,
  },
  headerTitle: {
    color: '#f0d078',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '700',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#d4af37',
  },
  tabPill: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.25)',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Body
  tabBody: {
    maxHeight: 280,
    paddingHorizontal: 16,
  },
  tabPane: {
    paddingTop: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 10,
    marginBottom: 12,
  },
  infoBannerIcon: {
    fontSize: 22,
  },
  infoBannerTextContainer: {
    flex: 1,
  },
  infoBannerTitle: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '800',
  },
  infoBannerSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },

  // Pick file button
  pickFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#a855f7',
    gap: 12,
    marginBottom: 16,
  },
  pickFileBtnIcon: {
    fontSize: 24,
  },
  pickFileBtnTextGroup: {
    flex: 1,
  },
  pickFileBtnTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  pickFileBtnSub: {
    color: '#c084fc',
    fontSize: 10.5,
    marginTop: 2,
  },
  pickFileArrow: {
    color: '#a855f7',
    fontSize: 22,
    fontWeight: '300',
  },

  sectionHeading: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },

  // Movie row
  movieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  movieRowActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  movieRowEmoji: {
    fontSize: 20,
  },
  movieRowInfo: {
    flex: 1,
  },
  movieRowTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  movieRowMeta: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 10,
    marginTop: 2,
  },
  movieRowBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  movieRowBadgeActive: {
    backgroundColor: '#d4af37',
  },
  movieRowBadgeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  movieRowBadgeTextActive: {
    color: '#000',
  },

  // Screen share hero
  screenShareHero: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  screenShareBigEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  screenShareHeroTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  screenShareHeroSub: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
    paddingHorizontal: 12,
  },
  screenShareActionBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  screenShareActionBtnStop: {
    backgroundColor: '#374151',
  },
  screenShareActionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  specBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  specVal: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '900',
  },
  specLbl: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    marginTop: 2,
  },

  // Web Link inputs
  inputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  loadUrlBtn: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadUrlBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  webPresetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  webPresetEmoji: {
    fontSize: 18,
  },
  webPresetInfo: {
    flex: 1,
  },
  webPresetTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  webPresetUrl: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  webPresetPlay: {
    fontSize: 16,
  },

  // Docked remote — Premium Master Controls
  remoteDock: {
    backgroundColor: '#080410',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  remoteTrackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  remotePlayingLabel: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  remotePlayingTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  scrubberTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scrubberTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 3,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 1,
  },
  remoteButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remoteSkipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  remoteSkipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  remoteMainPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 6,
  },
  remoteMainPlayText: {
    fontSize: 24,
  },
  volumeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  volumeBtnText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '800',
  },
});
