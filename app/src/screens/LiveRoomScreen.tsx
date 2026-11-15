/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — Live Room Screen (Real-time Voice & Host Controls)
 * ══════════════════════════════════════════════════
 * Full real-time room featuring:
 *   - Voice chat with real-time audio visualizer waves
 *   - Host voice controls: Direct mic take, force mute speaker, pass mic, kick user
 *   - Mic request queue with 1-tap host approval
 *   - Floating emoji reactions (❤️, 🔥, 👏, 🤣, 💎, 🎉)
 *   - Virtual gifts (🌹, 🏆, 💎, 🍾) with celebratory banners
 *   - Live participant list with real-time count
 *   - Real-time chat with color-coded badges
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import {
  connectSocket,
  getSocket,
  joinRoom as socketJoinRoom,
  leaveRoom as socketLeaveRoom,
  sendMessage as socketSendMessage,
  sendReaction as socketSendReaction,
  sendGift as socketSendGift,
  requestMic as socketRequestMic,
  acceptMic as socketAcceptMic,
  denyMic as socketDenyMic,
  releaseMic as socketReleaseMic,
  hostTakeMic,
  hostMuteSpeaker,
  muteUser as socketMuteUser,
  kickUser as socketKickUser,
  endRoom as socketEndRoom,
  onEvent,
  offEvent,
} from '../services/socketService';
import { getCurrentUser } from '../services/authService';
import * as roomAPI from '../services/roomService';
import {
  initWebRTCSignaling,
  cleanupWebRTC,
  startLocalAudio,
  stopLocalAudio,
  setLocalMuted,
  broadcastAudioToPeers,
  callPeer,
  requestAudioPermission,
} from '../services/webrtcService';

const { width } = Dimensions.get('window');

interface LiveRoomScreenProps {
  roomId: string;
  roomData?: any;
  onBack: () => void;
}

interface ChatMsg {
  id: string;
  sender: string;
  text: string;
  color: string;
  isSystem: boolean;
  timestamp?: string;
}

interface Participant {
  socketId: string;
  user: { _id?: string; name: string; avatar?: string };
  role?: string;
}

interface MicRequest {
  socketId: string;
  user: { _id?: string; name: string; avatar?: string };
  requestedAt: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  animY: Animated.Value;
  animOpacity: Animated.Value;
  x: number;
}

// ── Soundwave Equalizer Component ──
const SoundwaveVisualizer = ({ active, color }: { active: boolean; color: string }) => {
  const bar1 = useRef(new Animated.Value(4)).current;
  const bar2 = useRef(new Animated.Value(8)).current;
  const bar3 = useRef(new Animated.Value(14)).current;
  const bar4 = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    if (!active) {
      bar1.setValue(4);
      bar2.setValue(4);
      bar3.setValue(4);
      bar4.setValue(4);
      return;
    }

    const animateBar = (anim: Animated.Value, min: number, max: number, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: max, duration, useNativeDriver: false }),
          Animated.timing(anim, { toValue: min, duration, useNativeDriver: false }),
        ])
      ).start();
    };

    animateBar(bar1, 4, 18, 250);
    animateBar(bar2, 6, 26, 320);
    animateBar(bar3, 4, 22, 280);
    animateBar(bar4, 5, 16, 360);
  }, [active]);

  return (
    <View style={visualizerStyles.container}>
      <Animated.View style={[visualizerStyles.bar, { height: bar1, backgroundColor: color }]} />
      <Animated.View style={[visualizerStyles.bar, { height: bar2, backgroundColor: color }]} />
      <Animated.View style={[visualizerStyles.bar, { height: bar3, backgroundColor: color }]} />
      <Animated.View style={[visualizerStyles.bar, { height: bar4, backgroundColor: color }]} />
    </View>
  );
};

const visualizerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
    paddingHorizontal: 6,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});

export default function LiveRoomScreen({ roomId, roomData, onBack }: LiveRoomScreenProps) {
  const currentUser = getCurrentUser();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [currentSpeaker, setCurrentSpeaker] = useState<any>(null);
  const [micRequests, setMicRequests] = useState<MicRequest[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasRequestedMic, setHasRequestedMic] = useState(false);
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftBanner, setGiftBanner] = useState<{ sender: string; gift: string; emoji: string } | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(roomData || null);

  // Check if current user is host
  const hostId = roomData?.host?._id || roomData?.host || roomInfo?.host?._id || roomInfo?.host;
  const isHost = Boolean(hostId && hostId === currentUser?._id) || (roomData?.isHost === true);

  const chatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const speakerGlow = useRef(new Animated.Value(0.4)).current;
  const bannerFade = useRef(new Animated.Value(0)).current;

  // ── WebRTC Voice Audio Refs & Handlers ──
  const isSpeakingRef = useRef(false);
  isSpeakingRef.current = isSpeaking;
  const participantsRef = useRef<Participant[]>([]);
  participantsRef.current = participants;

  const beginSpeaking = async () => {
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    try {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        addSystemMsg('⚠️ Microphone permission required for live voice streaming.');
        return;
      }
      const stream = await startLocalAudio();
      if (stream) {
        addSystemMsg('🎙️ Microphone active — broadcasting live voice!');
        const currentSocket = getSocket();
        const peerIds = participantsRef.current
          .map(p => p.socketId)
          .filter(id => id && id !== currentSocket?.id);
        if (peerIds.length > 0) {
          await broadcastAudioToPeers(peerIds);
        }
      }
    } catch (err: any) {
      console.warn('Error broadcasting live voice:', err);
    }
  };

  const endSpeaking = () => {
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    stopLocalAudio();
  };

  // ── Pulsing glow for speaker card ──
  useEffect(() => {
    if (currentSpeaker) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(speakerGlow, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(speakerGlow, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [currentSpeaker]);

  // ── Live indicator pulse ──
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ═══════════════════════════════════════════
  // ── REAL-TIME SOCKET.IO INTEGRATION ──
  // ═══════════════════════════════════════════
  useEffect(() => {
    const socket = connectSocket();

    const userData = {
      _id: currentUser?._id,
      userId: currentUser?._id,
      name: currentUser?.name || 'Guest',
      avatar: currentUser?.avatar || '',
      isHost,
    };

    if (socket.connected) {
      socketJoinRoom(roomId, userData);
    } else {
      socket.once('connect', () => {
        socketJoinRoom(roomId, userData);
      });
    }

    // Fetch latest room info
    roomAPI.getRoom(roomId).then(res => {
      if (res.success && res.room) {
        setRoomInfo(res.room);
        if (res.room.participants) {
          setParticipantCount(Math.max(res.room.participants.length, 1));
        }
      }
    }).catch(() => {});

    // Initialize WebRTC peer-to-peer audio signaling
    initWebRTCSignaling(roomId);

    // Initial system greeting
    addSystemMsg(`✨ Welcome to ${roomInfo?.name || 'the Live Room'}!`);

    // ── Listeners ──
    const onUserJoined = (data: any) => {
      if (data.participantCount) setParticipantCount(data.participantCount);
      setParticipants(prev => {
        if (prev.some(p => p.socketId === data.socketId)) return prev;
        return [...prev, { socketId: data.socketId, user: data.user }];
      });
      addSystemMsg(`${data.user?.name || 'A traveler'} entered the room ✨`);

      // If we are currently speaking live on air, call new peer immediately to stream voice
      if (isSpeakingRef.current && data.socketId) {
        callPeer(data.socketId);
      }
    };

    const onUserLeft = (data: any) => {
      if (data.participantCount) setParticipantCount(data.participantCount);
      setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
      addSystemMsg(`${data.user?.name || 'Someone'} left`);
    };

    const onRoomState = (data: any) => {
      if (data.participantCount) setParticipantCount(data.participantCount);
      if (data.currentSpeaker) {
        setCurrentSpeaker(data.currentSpeaker);
        const speakerUserId = data.currentSpeaker?.userId || data.currentSpeaker?.user?._id;
        if (speakerUserId === currentUser?._id) {
          beginSpeaking();
        }
      }
    };

    const onMessage = (msg: any) => {
      if (msg.socketId === socket.id) return;
      addChatMsg(msg.senderName || msg.sender || 'Anonymous', msg.text || '', msg.color || '#fff');
    };

    const onMicRequest = (data: any) => {
      setMicRequests(prev => {
        if (prev.some(r => r.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
      if (isHost) {
        addSystemMsg(`🎙️ Mic Request: ${data.user?.name} wants to speak!`);
      }
    };

    const onMicAccepted = () => {
      setHasRequestedMic(false);
      addSystemMsg('🎉 Mic Granted! You are live to everyone in the room.');
      beginSpeaking();
    };

    const onMicDenied = () => {
      setHasRequestedMic(false);
      addSystemMsg('❌ Your mic request was declined by the host.');
    };

    const onSpeakerChanged = (data: any) => {
      setCurrentSpeaker(data.speaker);
      const speakerId = data.speaker?.userId || data.speaker?.user?._id;
      const speakerName = data.speaker?.user?.name || data.speaker?.name;

      if (data.speaker) {
        if (speakerId === currentUser?._id) {
          setHasRequestedMic(false);
          addSystemMsg('🎙️ You are currently speaking!');
          beginSpeaking();
        } else {
          endSpeaking();
          addSystemMsg(`🔊 ${speakerName || 'Host'} is now speaking`);
        }
      } else {
        endSpeaking();
        addSystemMsg('🎙️ Mic is open');
      }
    };

    const onForceMute = () => {
      endSpeaking();
      setHasRequestedMic(false);
      addSystemMsg('🔇 You were muted by the host.');
    };

    const onKicked = (data: any) => {
      endSpeaking();
      cleanupWebRTC();
      Alert.alert('Removed', data.message || 'You have been removed from the room by the host.', [
        { text: 'OK', onPress: onBack },
      ]);
    };

    const onRoomEnded = () => {
      endSpeaking();
      cleanupWebRTC();
      Alert.alert('Room Closed', 'The host has ended this live room.', [
        { text: 'OK', onPress: onBack },
      ]);
    };

    const onReaction = (data: any) => {
      triggerFloatingReaction(data.emoji || '❤️');
    };

    const onGift = (data: any) => {
      triggerGiftCelebration(data.senderName || 'Someone', data.giftName || 'Gift', data.emoji || '🎁');
    };

    // Bind all socket events
    onEvent('user-joined', onUserJoined);
    onEvent('user-left', onUserLeft);
    onEvent('room-state', onRoomState);
    onEvent('room-message', onMessage);
    onEvent('mic-request', onMicRequest);
    onEvent('mic-accepted', onMicAccepted);
    onEvent('mic-denied', onMicDenied);
    onEvent('speaker-changed', onSpeakerChanged);
    onEvent('force-mute', onForceMute);
    onEvent('kicked', onKicked);
    onEvent('room-ended', onRoomEnded);
    onEvent('room-reaction', onReaction);
    onEvent('room-gift', onGift);

    return () => {
      endSpeaking();
      cleanupWebRTC();
      socketLeaveRoom(roomId, userData);
      offEvent('user-joined', onUserJoined);
      offEvent('user-left', onUserLeft);
      offEvent('room-state', onRoomState);
      offEvent('room-message', onMessage);
      offEvent('mic-request', onMicRequest);
      offEvent('mic-accepted', onMicAccepted);
      offEvent('mic-denied', onMicDenied);
      offEvent('speaker-changed', onSpeakerChanged);
      offEvent('force-mute', onForceMute);
      offEvent('kicked', onKicked);
      offEvent('room-ended', onRoomEnded);
      offEvent('room-reaction', onReaction);
      offEvent('room-gift', onGift);
    };
  }, [roomId, isHost]);

  // ── Floating Emoji Generator ──
  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now().toString() + Math.random();
    const animY = new Animated.Value(0);
    const animOpacity = new Animated.Value(1);
    const x = Math.random() * (width - 120) + 40;

    const newReaction: FloatingReaction = { id, emoji, animY, animOpacity, x };
    setFloatingReactions(prev => [...prev, newReaction]);

    Animated.parallel([
      Animated.timing(animY, {
        toValue: -260,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(animOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(animOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    });
  };

  // ── Gift Celebration Banner ──
  const triggerGiftCelebration = (sender: string, gift: string, emoji: string) => {
    setGiftBanner({ sender, gift, emoji });
    addSystemMsg(`🎁 ${sender} sent ${emoji} ${gift}!`);
    bannerFade.setValue(0);

    Animated.sequence([
      Animated.timing(bannerFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(bannerFade, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setGiftBanner(null));
  };

  // ── Helper Message Append ──
  const addSystemMsg = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        sender: 'System',
        text,
        color: '#b388ff',
        isSystem: true,
      },
    ]);
  };

  const addChatMsg = (sender: string, text: string, color?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        sender,
        text,
        color: color || '#fff',
        isSystem: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ── Chat Send Action ──
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    socketSendMessage(roomId, {
      sender: currentUser?.name || 'You',
      senderName: currentUser?.name || 'You',
      text,
      color: isHost ? '#d4af37' : '#00e5ff',
    });

    addChatMsg('You', text, isHost ? '#d4af37' : '#00e5ff');
  };

  // ── Voice / Mic Controls ──
  const handleToggleMic = async () => {
    if (isHost) {
      // Host has instant 1-tap mic control without requesting!
      if (isSpeaking) {
        socketReleaseMic(roomId);
        endSpeaking();
        addSystemMsg('🎙️ Host mic released');
      } else {
        hostTakeMic(roomId, {
          _id: currentUser?._id,
          name: currentUser?.name || 'Host',
          avatar: currentUser?.avatar,
        });
        addSystemMsg('👑 You are now LIVE on mic as HOST!');
        await beginSpeaking();
      }
    } else {
      // Participant flow: request mic from host
      if (isSpeaking) {
        socketReleaseMic(roomId);
        endSpeaking();
        addSystemMsg('Mic released.');
      } else if (hasRequestedMic) {
        addSystemMsg('⏳ Mic request already sent to host.');
      } else {
        socketRequestMic(roomId, {
          _id: currentUser?._id,
          name: currentUser?.name || 'Guest',
          avatar: currentUser?.avatar,
        });
        setHasRequestedMic(true);
        addSystemMsg('🎙️ Mic request sent! Waiting for host approval...');
      }
    }
  };

  // ── Host Force Mute Current Speaker ──
  const handleHostForceMute = () => {
    hostMuteSpeaker(roomId);
    addSystemMsg('🔇 You muted the speaker');
  };

  // ── Host Mic Queue Accept / Deny ──
  const handleAcceptMic = (req: MicRequest) => {
    socketAcceptMic(roomId, req.socketId, req.user);
    setMicRequests(prev => prev.filter(r => r.socketId !== req.socketId));
    addSystemMsg(`✅ Mic granted to ${req.user.name}`);
  };

  const handleDenyMic = (req: MicRequest) => {
    socketDenyMic(roomId, req.socketId);
    setMicRequests(prev => prev.filter(r => r.socketId !== req.socketId));
  };

  // ── Host Participant Actions ──
  const handlePassMicToParticipant = (p: Participant) => {
    socketAcceptMic(roomId, p.socketId, p.user);
    addSystemMsg(`🎙️ Passed mic to ${p.user.name}`);
  };

  const handleMuteUser = (p: Participant) => {
    socketMuteUser(roomId, p.socketId);
    addSystemMsg(`🔇 Muted ${p.user.name}`);
  };

  const handleKickUser = (p: Participant) => {
    Alert.alert('Kick Participant', `Remove ${p.user.name} from this room?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Kick',
        style: 'destructive',
        onPress: () => {
          socketKickUser(roomId, p.socketId, 'Removed by room host');
          setParticipants(prev => prev.filter(item => item.socketId !== p.socketId));
          addSystemMsg(`🚫 Kicked ${p.user.name}`);
        },
      },
    ]);
  };

  // ── Send Reaction ──
  const handleSendReaction = (emoji: string) => {
    socketSendReaction(roomId, { emoji, sender: currentUser?.name });
    triggerFloatingReaction(emoji);
  };

  // ── Send Gift ──
  const handleSendGift = (giftName: string, emoji: string, cost: number) => {
    socketSendGift(roomId, {
      giftName,
      emoji,
      cost,
      senderName: currentUser?.name || 'Fan',
    });
    triggerGiftCelebration(currentUser?.name || 'You', giftName, emoji);
    setShowGiftModal(false);
  };

  // ── End / Leave Room ──
  const handleEndRoom = () => {
    Alert.alert('End Room', 'Close this room for everyone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Room',
        style: 'destructive',
        onPress: () => {
          endSpeaking();
          cleanupWebRTC();
          socketEndRoom(roomId);
          roomAPI.closeRoom(roomId).catch(() => {});
          onBack();
        },
      },
    ]);
  };

  const handleLeaveRoom = () => {
    endSpeaking();
    cleanupWebRTC();
    roomAPI.leaveRoom(roomId).catch(() => {});
    onBack();
  };

  const themeColor = roomInfo?.themeColor || '#7c4dff';
  const roomName = roomInfo?.name || 'Live Metaverse Room';

  return (
    <View style={styles.container}>
      {/* ── Floating Reactions Layer ── */}
      <View style={styles.reactionsLayer} pointerEvents="none">
        {floatingReactions.map(r => (
          <Animated.View
            key={r.id}
            style={[
              styles.floatingReaction,
              {
                left: r.x,
                transform: [{ translateY: r.animY }],
                opacity: r.animOpacity,
              },
            ]}
          >
            <Text style={{ fontSize: 32 }}>{r.emoji}</Text>
          </Animated.View>
        ))}
      </View>

      {/* ── Virtual Gift Banner ── */}
      {giftBanner && (
        <Animated.View style={[styles.giftBanner, { opacity: bannerFade }]}>
          <Text style={styles.giftBannerEmoji}>{giftBanner.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.giftBannerTitle}>GIFT SHOWER!</Text>
            <Text style={styles.giftBannerSub}>
              <Text style={{ fontWeight: '800', color: '#ffd700' }}>{giftBanner.sender}</Text> sent a {giftBanner.gift}!
            </Text>
          </View>
        </Animated.View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: themeColor + '30' }]}>
          <TouchableOpacity onPress={handleLeaveRoom} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.roomName, { color: '#fff' }]} numberOfLines={1}>
                {roomName}
              </Text>
              {isHost && (
                <View style={styles.hostPill}>
                  <Text style={styles.hostPillText}>👑 HOST</Text>
                </View>
              )}
            </View>
            <View style={styles.liveRow}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveLabel}>LIVE</Text>
              <Text style={styles.countLabel}>👥 {participantCount} online</Text>
            </View>
          </View>

          {/* Host Controls Button */}
          {isHost ? (
            <TouchableOpacity
              style={[styles.hostControlsBtn, { borderColor: themeColor }]}
              onPress={() => setShowHostPanel(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.hostControlsIcon}>⚙️</Text>
              {micRequests.length > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>{micRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.giftHeaderBtn}
              onPress={() => setShowGiftModal(true)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20 }}>🎁</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Active Voice Stage ── */}
        <View style={styles.speakerStage}>
          {currentSpeaker ? (
            <Animated.View
              style={[
                styles.speakerCard,
                {
                  borderColor: themeColor,
                  shadowColor: themeColor,
                  opacity: speakerGlow,
                },
              ]}
            >
              <View style={[styles.speakerAvatarContainer, { borderColor: themeColor }]}>
                <Text style={styles.speakerAvatarInitial}>
                  {(currentSpeaker.user?.name || currentSpeaker.name || '?')[0].toUpperCase()}
                </Text>
              </View>

              <View style={styles.speakerDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.speakerName} numberOfLines={1}>
                    {currentSpeaker.user?.name || currentSpeaker.name || 'Active Speaker'}
                  </Text>
                  {(currentSpeaker.user?._id === hostId || currentSpeaker.userId === hostId) && (
                    <Text style={styles.speakerHostTag}> 👑 HOST</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <SoundwaveVisualizer active={true} color={themeColor} />
                  <Text style={[styles.speakingStatus, { color: themeColor }]}>Speaking now...</Text>
                </View>
              </View>

              {/* Host Quick Mute Button for Current Speaker */}
              {isHost && (
                <TouchableOpacity
                  style={styles.quickMuteBtn}
                  onPress={handleHostForceMute}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickMuteText}>🔇 Mute</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            <View style={styles.openMicCard}>
              <Text style={styles.openMicEmoji}>🎙️</Text>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.openMicTitle}>The stage is currently quiet</Text>
                <Text style={styles.openMicSub}>
                  {isHost ? 'Tap your mic button below to take the stage!' : 'Tap mic button below to request speaking time.'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Chat Messages List ── */}
        <FlatList
          ref={chatRef}
          data={messages}
          keyExtractor={item => item.id}
          style={styles.chatList}
          contentContainerStyle={{ paddingBottom: 12, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.chatRow, item.isSystem && styles.systemChatRow]}>
              {item.isSystem ? (
                <View style={styles.systemBubble}>
                  <Text style={styles.systemText}>{item.text}</Text>
                </View>
              ) : (
                <View style={styles.chatBubble}>
                  <View style={styles.chatHeader}>
                    <Text style={[styles.chatSender, { color: item.color }]}>{item.sender}</Text>
                    {item.timestamp && <Text style={styles.chatTime}>{item.timestamp}</Text>}
                  </View>
                  <Text style={styles.chatMessageText}>{item.text}</Text>
                </View>
              )}
            </View>
          )}
        />

        {/* ── Quick Floating Reactions Strip ── */}
        <View style={styles.reactionsStrip}>
          {['❤️', '🔥', '👏', '🤣', '💎', '🎉'].map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionChip}
              onPress={() => handleSendReaction(emoji)}
              activeOpacity={0.6}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.giftChip}
            onPress={() => setShowGiftModal(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18 }}>🎁</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bottom Input & Voice Mic Bar ── */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Whisper in room..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? themeColor : '#222' }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>

          {/* ── Host / Participant Mic Button ── */}
          <TouchableOpacity
            style={[
              styles.micActionButton,
              isSpeaking
                ? styles.micBtnSpeaking
                : hasRequestedMic
                ? styles.micBtnPending
                : isHost
                ? [styles.micBtnHost, { borderColor: themeColor }]
                : styles.micBtnDefault,
            ]}
            onPress={handleToggleMic}
            activeOpacity={0.8}
          >
            <Text style={styles.micActionEmoji}>
              {isSpeaking ? '🔊' : hasRequestedMic ? '⏳' : isHost ? '👑' : '🎙️'}
            </Text>
            <Text style={styles.micActionLabel}>
              {isSpeaking
                ? 'ON AIR'
                : hasRequestedMic
                ? 'WAITING'
                : isHost
                ? 'HOST MIC'
                : 'SPEAK'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ═══════════════════════════════════════════ */}
      {/* ── HOST CONTROLS MODAL DECK ── */}
      {/* ═══════════════════════════════════════════ */}
      <Modal
        visible={showHostPanel}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHostPanel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.hostDeckModal}>
            <View style={styles.deckHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>👑</Text>
                <Text style={styles.deckTitle}>Host Voice Controls</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHostPanel(false)} style={styles.deckCloseBtn}>
                <Text style={styles.deckCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.deckContent} showsVerticalScrollIndicator={false}>
              {/* Mic Request Queue */}
              <View style={styles.deckSection}>
                <View style={styles.deckSectionHeader}>
                  <Text style={styles.deckSectionTitle}>🎙️ Mic Requests</Text>
                  <Text style={styles.deckSectionBadge}>{micRequests.length} waiting</Text>
                </View>

                {micRequests.length === 0 ? (
                  <Text style={styles.deckEmptyText}>No pending mic requests</Text>
                ) : (
                  micRequests.map(req => (
                    <View key={req.socketId} style={styles.micReqRow}>
                      <View style={styles.reqUserAvatar}>
                        <Text style={styles.reqUserInitial}>{(req.user.name || '?')[0].toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.reqUserName}>{req.user.name}</Text>
                        <Text style={styles.reqUserTime}>Requested to speak</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.reqAcceptBtn}
                        onPress={() => handleAcceptMic(req)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reqAcceptText}>Accept ✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.reqDenyBtn}
                        onPress={() => handleDenyMic(req)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reqDenyText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Active Speaker Controls */}
              <View style={styles.deckSection}>
                <Text style={styles.deckSectionTitle}>🔊 Current Speaker</Text>
                {currentSpeaker ? (
                  <View style={styles.speakerRow}>
                    <Text style={styles.speakerRowName}>
                      {currentSpeaker.user?.name || currentSpeaker.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.muteSpeakerBtn}
                      onPress={handleHostForceMute}
                    >
                      <Text style={styles.muteSpeakerText}>Force Mute 🔇</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.deckEmptyText}>No one is currently speaking</Text>
                )}
              </View>

              {/* Live Audience Management */}
              <View style={styles.deckSection}>
                <Text style={styles.deckSectionTitle}>👥 Room Members ({participants.length})</Text>
                {participants.length === 0 ? (
                  <Text style={styles.deckEmptyText}>Only you are in the room</Text>
                ) : (
                  participants.map(p => (
                    <View key={p.socketId} style={styles.participantRow}>
                      <View style={styles.partAvatar}>
                        <Text style={styles.partInitial}>{(p.user?.name || '?')[0].toUpperCase()}</Text>
                      </View>
                      <Text style={styles.partName} numberOfLines={1}>{p.user?.name || 'Member'}</Text>
                      <View style={styles.partActionGroup}>
                        <TouchableOpacity
                          style={styles.partActionBtn}
                          onPress={() => handlePassMicToParticipant(p)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 13 }}>🎙️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.partActionBtn}
                          onPress={() => handleMuteUser(p)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 13 }}>🔇</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.partActionBtn, styles.partKickBtn]}
                          onPress={() => handleKickUser(p)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 13 }}>🚫</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* End Room Action */}
              <TouchableOpacity style={styles.endRoomButton} onPress={handleEndRoom} activeOpacity={0.8}>
                <Text style={styles.endRoomButtonText}>🚪 END ROOM FOR EVERYONE</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════ */}
      {/* ── VIRTUAL GIFTS MODAL ── */}
      {/* ═══════════════════════════════════════════ */}
      <Modal
        visible={showGiftModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGiftModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGiftModal(false)}
        >
          <View style={styles.giftModalCard}>
            <Text style={styles.giftModalTitle}>🎁 Send Virtual Gift</Text>
            <Text style={styles.giftModalSub}>Show love to the room & host!</Text>

            <View style={styles.giftGrid}>
              {[
                { name: 'Red Rose', emoji: '🌹', cost: 10 },
                { name: 'Golden Trophy', emoji: '🏆', cost: 50 },
                { name: 'Pure Diamond', emoji: '💎', cost: 100 },
                { name: 'Champagne', emoji: '🍾', cost: 250 },
              ].map(gift => (
                <TouchableOpacity
                  key={gift.name}
                  style={styles.giftItem}
                  onPress={() => handleSendGift(gift.name, gift.emoji, gift.cost)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <Text style={styles.giftCost}>🪙 {gift.cost}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070712',
  },

  // Reactions Layer
  reactionsLayer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 99,
  },
  floatingReaction: {
    position: 'absolute',
    bottom: 0,
  },

  // Gift Banner
  giftBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(25, 20, 45, 0.95)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd700',
    zIndex: 100,
    elevation: 8,
  },
  giftBannerEmoji: { fontSize: 32 },
  giftBannerTitle: { fontSize: 13, fontWeight: '900', color: '#ffd700', letterSpacing: 1 },
  giftBannerSub: { fontSize: 13, color: '#fff', marginTop: 2 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
    backgroundColor: '#0c0c1e',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16162e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 26, color: '#fff', marginTop: -2 },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  roomName: { fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  hostPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  hostPillText: { fontSize: 10, fontWeight: '800', color: '#d4af37' },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#ff3344', marginRight: 6 },
  liveLabel: { fontSize: 10, fontWeight: '900', color: '#ff3344', letterSpacing: 1, marginRight: 8 },
  countLabel: { fontSize: 12, color: '#888' },
  hostControlsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1b1836',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  hostControlsIcon: { fontSize: 18 },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3344',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  giftHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1830',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Speaker Stage
  speakerStage: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  speakerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121026',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  speakerAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: '#242048',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerAvatarInitial: { fontSize: 20, fontWeight: '900', color: '#fff' },
  speakerDetails: { flex: 1, marginLeft: 12 },
  speakerName: { fontSize: 15, fontWeight: '800', color: '#fff' },
  speakerHostTag: { fontSize: 11, fontWeight: '800', color: '#ffd700' },
  speakingStatus: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
  quickMuteBtn: {
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  quickMuteText: { fontSize: 11, fontWeight: '700', color: '#ff4444' },

  openMicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0e20',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1d1a38',
  },
  openMicEmoji: { fontSize: 26 },
  openMicTitle: { fontSize: 14, fontWeight: '700', color: '#ccc' },
  openMicSub: { fontSize: 12, color: '#666', marginTop: 2 },

  // Chat
  chatList: { flex: 1 },
  chatRow: { marginBottom: 8 },
  systemChatRow: { alignItems: 'center', marginVertical: 3 },
  systemBubble: {
    backgroundColor: 'rgba(124, 77, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.25)',
  },
  systemText: { fontSize: 12, color: '#c5a3ff', textAlign: 'center' },
  chatBubble: {
    backgroundColor: '#111024',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '85%',
    borderLeftWidth: 3,
    borderLeftColor: '#7c4dff',
  },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatSender: { fontSize: 12, fontWeight: '800', marginRight: 8 },
  chatTime: { fontSize: 10, color: '#555' },
  chatMessageText: { fontSize: 14, color: '#e0e0e0', marginTop: 2, lineHeight: 19 },

  // Reactions Strip
  reactionsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0c0b1a',
    borderTopWidth: 1,
    borderTopColor: '#17152e',
  },
  reactionChip: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#15132a',
  },
  reactionEmoji: { fontSize: 18 },
  giftChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },

  // Bottom Input
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0a0918',
    borderTopWidth: 1,
    borderTopColor: '#17152e',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#141228',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#242044',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  sendIcon: { fontSize: 16, color: '#fff' },

  // Mic Action Button
  micActionButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  micBtnDefault: {
    backgroundColor: '#1b1836',
    borderColor: '#3a3466',
  },
  micBtnHost: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderColor: '#d4af37',
  },
  micBtnSpeaking: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderColor: '#4ade80',
  },
  micBtnPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#fbbf24',
  },
  micActionEmoji: { fontSize: 16, marginRight: 6 },
  micActionLabel: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  hostDeckModal: {
    backgroundColor: '#100e24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#26204c',
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1d193d',
  },
  deckTitle: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  deckCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1c1838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCloseText: { fontSize: 15, color: '#888' },
  deckContent: { paddingHorizontal: 20, paddingTop: 14 },
  deckSection: { marginBottom: 20 },
  deckSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  deckSectionTitle: { fontSize: 14, fontWeight: '800', color: '#b388ff' },
  deckSectionBadge: { fontSize: 11, color: '#888' },
  deckEmptyText: { fontSize: 13, color: '#555', fontStyle: 'italic', paddingVertical: 4 },

  micReqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181534',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  reqUserAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7c4dff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqUserInitial: { fontSize: 14, fontWeight: '800', color: '#fff' },
  reqUserName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  reqUserTime: { fontSize: 11, color: '#777' },
  reqAcceptBtn: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  reqAcceptText: { fontSize: 12, fontWeight: '800', color: '#000' },
  reqDenyBtn: {
    backgroundColor: '#ff4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqDenyText: { fontSize: 13, fontWeight: '900', color: '#fff' },

  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181534',
    padding: 12,
    borderRadius: 12,
  },
  speakerRowName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  muteSpeakerBtn: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  muteSpeakerText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#171432',
  },
  partAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#26204c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partInitial: { fontSize: 12, fontWeight: '700', color: '#fff' },
  partName: { flex: 1, marginLeft: 10, fontSize: 13, color: '#ddd' },
  partActionGroup: { flexDirection: 'row', gap: 6 },
  partActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1d193d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partKickBtn: { backgroundColor: 'rgba(255, 68, 68, 0.2)' },

  endRoomButton: {
    backgroundColor: '#ff3344',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  endRoomButtonText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 1 },

  // Gift Modal
  giftModalCard: {
    backgroundColor: '#13112a',
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#ffd700',
  },
  giftModalTitle: { fontSize: 18, fontWeight: '900', color: '#fff', textAlign: 'center' },
  giftModalSub: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  giftItem: {
    width: '48%',
    backgroundColor: '#1b1836',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2b2654',
  },
  giftEmoji: { fontSize: 36, marginBottom: 6 },
  giftName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  giftCost: { fontSize: 12, fontWeight: '800', color: '#ffd700', marginTop: 4 },
});
