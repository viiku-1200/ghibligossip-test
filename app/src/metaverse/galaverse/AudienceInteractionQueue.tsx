// ═══════════════════════════════════════════════════════════════
// AudienceInteractionQueue.tsx — Haute Couture Rate & Queue Console
// Ultra-Premium Glassmorphism with Micro-Animations & Full Queue Logic
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Modal,
} from 'react-native';

export interface QueueModel {
  id: string;
  name: string;
  style: string;
  emoji: string;
  isNowShowing: boolean;
  themeColor: string;
  waitTime?: string;
  verdictScore?: number;
}

interface AudienceInteractionQueueProps {
  onRate: (score: number) => void;
  onSendRose: () => void;
  onJoinQueue: (chosenStyle: string) => void;
  onSelectModel: (model: QueueModel) => void;
  currentRating?: number | null;
  totalVotes?: number;
}

const DEFAULT_QUEUE: QueueModel[] = [
  {
    id: '1',
    name: 'Mira Starling',
    style: 'Gothic glam · Now showing',
    emoji: '👑',
    isNowShowing: true,
    themeColor: '#ec4899',
    waitTime: 'LIVE NOW',
    verdictScore: 9.8,
  },
  {
    id: '2',
    name: 'Ren Kaito',
    style: 'Midnight couture',
    emoji: '🌙',
    isNowShowing: false,
    themeColor: '#8b5cf6',
    waitTime: 'Up next · 45s',
    verdictScore: 9.2,
  },
  {
    id: '3',
    name: 'Akari Bloom',
    style: 'Dream pastel',
    emoji: '🌸',
    isNowShowing: false,
    themeColor: '#f43f5e',
    waitTime: 'Queued · 2m',
    verdictScore: 8.9,
  },
];

const STYLE_OPTIONS = [
  { id: 'cyber', name: 'Cyber Royalty', emoji: '✨', color: '#38bdf8' },
  { id: 'goth',  name: 'Gothic Lolita',  emoji: '🖤', color: '#c084fc' },
  { id: 'pastel', name: 'Sakura Pastel',  emoji: '🌸', color: '#f472b6' },
  { id: 'gold',   name: 'Diamond Glam',   emoji: '💎', color: '#ffd700' },
];

export default function AudienceInteractionQueue({
  onRate,
  onSendRose,
  onJoinQueue,
  onSelectModel,
  currentRating = 9.4,
  totalVotes = 142,
}: AudienceInteractionQueueProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [queueList, setQueueList] = useState<QueueModel[]>(DEFAULT_QUEUE);
  const [hasJoinedQueue, setHasJoinedQueue] = useState(false);
  const [totalRosesGiven, setTotalRosesGiven] = useState(10);

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value((currentRating ?? 9.4) / 10)).current;
  const pulseButton = useRef(new Animated.Value(1)).current;

  // Pulse animation for the Send Rose button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseButton, {
          toValue: 1.03,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseButton, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseButton]);

  // Handle rating click with smooth progress animation
  const handleScorePress = (score: number) => {
    setSelectedScore(score);
    Animated.timing(progressAnim, {
      toValue: score / 10,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    onRate(score);
  };

  // Handle Send Rose with combo increment
  const handleSendRosePress = () => {
    setTotalRosesGiven((prev) => prev + 10);
    onSendRose();
  };

  // Handle Instant 1-Tap Join Queue
  const handleJoinQueuePress = () => {
    if (hasJoinedQueue) {
      setHasJoinedQueue(false);
      setQueueList((prev) => prev.filter((item) => item.name !== 'You (VIP Guest)'));
      return;
    }
    setHasJoinedQueue(true);
    const newEntry: QueueModel = {
      id: String(Date.now()),
      name: 'You (VIP Guest)',
      style: 'Cyber Royalty · In queue',
      emoji: '✨',
      isNowShowing: false,
      themeColor: '#38bdf8',
      waitTime: 'Slot #4 · ~2m',
    };
    setQueueList((prev) => [...prev, newEntry]);
    onJoinQueue('Cyber Royalty');
  };

  // Handle Switch Model / Show
  const handleShowModel = (model: QueueModel) => {
    setQueueList((prev) =>
      prev.map((item) => ({
        ...item,
        isNowShowing: item.id === model.id,
        style:
          item.id === model.id
            ? `${item.style.split(' · ')[0]} · Now showing`
            : item.style.replace(' · Now showing', ''),
        waitTime: item.id === model.id ? 'LIVE NOW' : 'Up next',
      }))
    );
    onSelectModel(model);
  };

  const displayRating = selectedScore !== null ? selectedScore : (currentRating ?? 9.4);

  // Critic verdict badge
  const getVerdictLabel = (score: number | null) => {
    if (!score) return '✨ AWAITING CRITIC REVIEWS';
    if (score >= 9.5) return '🏆 COUTURE MASTERPIECE';
    if (score >= 8.5) return '✨ RUNWAY PERFECTION';
    if (score >= 7.5) return '💅 ICONIC SILHOUETTE';
    if (score >= 6.0) return '👠 CHIC & POLISHED';
    return '⚡ BOLD EXPERIMENT';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ══════════════════════════════════════════════════════ */}
      {/* CARD 1: AUDIENCE INTERACTION — Rate this look         */}
      {/* ══════════════════════════════════════════════════════ */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.subHeader}>AUDIENCE INTERACTION</Text>
            <Text style={styles.cardTitle}>Rate this look</Text>
          </View>
          <View style={styles.liveScoreBadge}>
            <Text style={styles.liveScoreBadgeText}>
              ★ {displayRating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* 10-Button Rating Grid (2 rows of 5) */}
        <View style={styles.ratingGrid}>
          {/* Row 1: 1 - 5 */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = selectedScore === num;
              return (
                <TouchableOpacity
                  key={num}
                  style={[styles.rateBtn, isSelected && styles.rateBtnSelected]}
                  onPress={() => handleScorePress(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rateBtnText, isSelected && styles.rateBtnTextSelected]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Row 2: 6 - 10 */}
          <View style={styles.ratingRow}>
            {[6, 7, 8, 9, 10].map((num) => {
              const isSelected = selectedScore === num;
              return (
                <TouchableOpacity
                  key={num}
                  style={[styles.rateBtn, isSelected && styles.rateBtnSelected]}
                  onPress={() => handleScorePress(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rateBtnText, isSelected && styles.rateBtnTextSelected]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Current Rating & Progress Bar */}
        <View style={styles.ratingStatusRow}>
          <View style={styles.verdictRow}>
            <Text style={styles.ratingStatusLabel}>Current rating</Text>
            <Text style={styles.verdictPillText}>{getVerdictLabel(displayRating)}</Text>
          </View>
          <Text style={styles.ratingStatusValue}>
            {displayRating !== null ? `${displayRating.toFixed(1)} / 10` : '— / 10'}
          </Text>
        </View>

        {/* Glowing Progress Track */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        {/* Bottom Action Buttons: Send Rose & Join Queue */}
        <View style={styles.actionsRow}>
          <Animated.View style={{ flex: 1.15, transform: [{ scale: pulseButton }] }}>
            <TouchableOpacity
              style={styles.sendRoseBtn}
              onPress={handleSendRosePress}
              activeOpacity={0.8}
            >
              <Text style={styles.sendRoseBtnText}>
                🌹 Send Rose · {totalRosesGiven}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.joinQueueBtn, hasJoinedQueue && styles.joinQueueBtnActive]}
            onPress={handleJoinQueuePress}
            activeOpacity={0.7}
          >
            <Text style={[styles.joinQueueBtnText, hasJoinedQueue && styles.joinQueueBtnTextActive]}>
              {hasJoinedQueue ? '✓ In Queue (#4)' : '+ Join Queue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════ */}
      {/* CARD 2: UP NEXT — Runway Queue                        */}
      {/* ══════════════════════════════════════════════════════ */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.subHeader}>UP NEXT</Text>
            <Text style={styles.cardTitle}>Runway Queue</Text>
          </View>
          <View style={styles.queueCountPill}>
            <Text style={styles.queueCountPillText}>{queueList.length} Models</Text>
          </View>
        </View>

        <View style={styles.queueList}>
          {queueList.map((item) => (
            <View
              key={item.id}
              style={[
                styles.queueItemCard,
                item.isNowShowing && styles.queueItemCardActive,
              ]}
            >
              {/* Avatar Icon with Pink/Purple Gradient Glow */}
              <View style={[styles.avatarBox, { backgroundColor: item.themeColor }]}>
                <Text style={styles.avatarEmoji}>{item.emoji}</Text>
              </View>

              {/* Model Info */}
              <View style={styles.queueItemInfo}>
                <View style={styles.modelNameRow}>
                  <Text style={styles.queueItemName}>{item.name}</Text>
                  {item.isNowShowing && (
                    <View style={styles.liveNowDot}>
                      <View style={styles.liveInnerDot} />
                    </View>
                  )}
                </View>
                <Text style={styles.queueItemStyle}>{item.style}</Text>
                {item.waitTime && (
                  <Text style={styles.queueWaitTime}>{item.waitTime}</Text>
                )}
              </View>

              {/* Show Action Button */}
              <TouchableOpacity
                style={[
                  styles.showBtn,
                  item.isNowShowing && styles.showBtnActive,
                ]}
                onPress={() => handleShowModel(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.showBtnText,
                    item.isNowShowing && styles.showBtnTextActive,
                  ]}
                >
                  {item.isNowShowing ? 'Showing' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 95,
    gap: 12,
  },

  // ── Luxury Dark Glass Card ──
  card: {
    backgroundColor: 'rgba(16, 11, 30, 0.94)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subHeader: {
    color: '#22d3ee', // Cyan uppercase title matching screenshot
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  cardTitle: {
    color: '#fbcfe8', // Lavender pink heading
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  liveScoreBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ec4899',
  },
  liveScoreBadgeText: {
    color: '#fbcfe8',
    fontSize: 12,
    fontWeight: '900',
  },

  // ── 1-10 Rating Grid ──
  ratingGrid: {
    gap: 8,
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  rateBtn: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(28, 20, 50, 0.9)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateBtnSelected: {
    backgroundColor: '#9333ea',
    borderColor: '#c084fc',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 6,
  },
  rateBtnText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
  },
  rateBtnTextSelected: {
    color: '#ffffff',
    fontWeight: '900',
  },

  // ── Rating Status & Progress ──
  ratingStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStatusLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  verdictPillText: {
    color: '#ec4899',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ratingStatusValue: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#c084fc',
    borderRadius: 3,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // ── Actions Row ──
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sendRoseBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  sendRoseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  joinQueueBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(28, 20, 50, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinQueueBtnActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  joinQueueBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  joinQueueBtnTextActive: {
    color: '#4ade80',
    fontWeight: '900',
  },

  // ── Queue List ──
  queueCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  queueCountPillText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  queueList: {
    gap: 8,
  },
  queueItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 16, 44, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
  },
  queueItemCardActive: {
    borderColor: 'rgba(236, 72, 153, 0.6)',
    backgroundColor: 'rgba(38, 20, 60, 0.85)',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  queueItemInfo: {
    flex: 1,
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueItemName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  liveNowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveInnerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
  queueItemStyle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  queueWaitTime: {
    color: '#a855f7',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  showBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  showBtnActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.3)',
    borderColor: '#ec4899',
  },
  showBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
  },
  showBtnTextActive: {
    color: '#fbcfe8',
    fontWeight: '900',
  },

  // ── Modal Styles ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#160f2e',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#a855f7',
    padding: 20,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  modalSubHeader: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 6,
  },
  modalDescription: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  styleOptionsGrid: {
    gap: 8,
  },
  styleOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  styleOptionEmoji: {
    fontSize: 20,
  },
  styleOptionName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  modalCloseBtn: {
    marginTop: 14,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
