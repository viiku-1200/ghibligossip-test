// ═══════════════════════════════════════════════════════════════
// HostYouTubeModal.tsx — Dedicated Instant YouTube / Web Video Host Modal
// Lets the host paste any YouTube video link, shorts, or web URL
// with 1-tap tested presets and instant URL parsing.
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';

export interface YouTubePreset {
  title: string;
  url: string;
  videoId: string;
  emoji: string;
  category: string;
}

export const TESTED_YOUTUBE_PRESETS: YouTubePreset[] = [
  {
    title: 'Studio Ghibli 4K Film Premiere',
    url: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    videoId: 'ByXuk9QqQkk',
    emoji: '🐉',
    category: 'Ghibli Film',
  },
  {
    title: '24/7 Anime Lo-Fi Chill Beats Live',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    videoId: 'jfKfPfyJRdk',
    emoji: '🎶',
    category: 'Live Stream',
  },
  {
    title: 'Cyberpunk: Edgerunners Official 4K Trailer',
    url: 'https://www.youtube.com/watch?v=JtqIas3bYhg',
    videoId: 'JtqIas3bYhg',
    emoji: '⚡',
    category: 'Anime Trailer',
  },
  {
    title: 'Your Name (Kimi no Na wa) 4K Trailer',
    url: 'https://www.youtube.com/watch?v=s0wTdCQoc2k',
    videoId: 's0wTdCQoc2k',
    emoji: '🌌',
    category: 'Anime Movie',
  },
  {
    title: 'Demon Slayer: Infinity Castle Arc Trailer',
    url: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
    videoId: 'VQGCKyvzIM4',
    emoji: '⚔️',
    category: 'Action Anime',
  },
];

// Helper to extract YouTube video ID from all link formats (watch, shorts, live, mobile, raw ID)
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  // All YouTube link variations: youtu.be, watch?v=, embed/, shorts/, live/
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onHostVideo: (title: string, url: string, videoId: string | null) => void;
}

export default function HostYouTubeModal({ visible, onClose, onHostVideo }: Props) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const handleHostCustomUrl = () => {
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) {
      Alert.alert('Empty Link', 'Please paste a YouTube or web video link first, or select one of the 4K presets below!');
      return;
    }

    const videoId = extractYouTubeId(trimmedUrl);
    const title =
      videoTitle.trim() ||
      (videoId ? `YouTube Premiere (${videoId})` : 'Online Web Video');

    onHostVideo(title, trimmedUrl, videoId);
    setVideoUrl('');
    setVideoTitle('');
    onClose();

    Alert.alert(
      '🎬 Video Hosted!',
      `Now playing "${title}" on the VIP Cinema screen for all 15 viewers!`,
      [{ text: 'Enjoy the Show' }]
    );
  };

  const handleSelectPreset = (preset: YouTubePreset) => {
    onHostVideo(preset.title, preset.url, preset.videoId);
    onClose();

    Alert.alert(
      '🎬 Video Hosted!',
      `Now streaming "${preset.title}" in the VIP Cinema!`,
      [{ text: 'Watch Now' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Absolute Background Dismissal Layer — strictly behind card */}
        <TouchableOpacity
          style={styles.modalOverlayDismiss}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Foreground Modal Card */}
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.youtubeBadge}>
                <Text style={styles.youtubeBadgeText}>▶</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>HOST YOUTUBE / WEB VIDEO</Text>
                <Text style={styles.headerSub}>Broadcast any video to the VIP Cinema</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerIcon}>💡</Text>
              <Text style={styles.infoBannerText}>
                Copy any link from the YouTube app or browser, paste it below, and hit{' '}
                <Text style={{ color: '#d4af37', fontWeight: '900' }}>HOST VIDEO</Text>!
              </Text>
            </View>

            {/* URL Input Box */}
            <Text style={styles.inputLabel}>PASTE YOUTUBE OR WEB VIDEO LINK</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>🔗</Text>
              <TextInput
                style={styles.urlInput}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor="#666"
                value={videoUrl}
                onChangeText={setVideoUrl}
                autoCapitalize="none"
                autoCorrect={false}
                selectTextOnFocus
              />
              {videoUrl.length > 0 && (
                <TouchableOpacity onPress={() => setVideoUrl('')} style={styles.clearInputBtn}>
                  <Text style={styles.clearInputText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Optional Title Input */}
            <Text style={[styles.inputLabel, { marginTop: 10 }]}>VIDEO TITLE (OPTIONAL)</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. My Favorite Anime Episode..."
              placeholderTextColor="#666"
              value={videoTitle}
              onChangeText={setVideoTitle}
            />

            {/* Big Host Button */}
            <TouchableOpacity
              style={styles.hostActionButton}
              onPress={handleHostCustomUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.hostActionCrown}>🎬</Text>
              <Text style={styles.hostActionText}>HOST & BROADCAST THIS VIDEO</Text>
            </TouchableOpacity>

            {/* Quick 1-Tap Tested Presets */}
            <Text style={styles.sectionHeading}>OR TAP A TESTED 4K ANIME STREAM</Text>
            {TESTED_YOUTUBE_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.presetRow}
                onPress={() => handleSelectPreset(preset)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <View style={styles.presetInfo}>
                  <View style={styles.presetTitleRow}>
                    <Text style={styles.presetTitle} numberOfLines={1}>
                      {preset.title}
                    </Text>
                    <View style={styles.presetCategoryPill}>
                      <Text style={styles.presetCategoryText}>{preset.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.presetUrl} numberOfLines={1}>
                    {preset.url}
                  </Text>
                </View>
                <View style={styles.presetPlayBtn}>
                  <Text style={styles.presetPlayBtnText}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  modalOverlayDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
  },
  modalCard: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#110b14',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  youtubeBadge: {
    width: 32,
    height: 24,
    backgroundColor: '#ff0000',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 1,
  },
  headerTitle: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
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
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 8,
    marginBottom: 14,
  },
  infoBannerIcon: {
    fontSize: 18,
  },
  infoBannerText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    lineHeight: 15,
  },
  inputLabel: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 12,
    height: 46,
  },
  inputPrefix: {
    fontSize: 16,
    marginRight: 8,
  },
  urlInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    paddingVertical: 0,
  },
  clearInputBtn: {
    padding: 6,
  },
  clearInputText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  titleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    height: 42,
    color: '#fff',
    fontSize: 12,
  },
  hostActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4af37',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 14,
    marginBottom: 18,
    gap: 8,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  hostActionCrown: {
    fontSize: 18,
  },
  hostActionText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionHeading: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 10,
  },
  presetEmoji: {
    fontSize: 22,
  },
  presetInfo: {
    flex: 1,
  },
  presetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  presetTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  presetCategoryPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  presetCategoryText: {
    color: '#d4af37',
    fontSize: 8,
    fontWeight: '900',
  },
  presetUrl: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  presetPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetPlayBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 1,
  },
});
