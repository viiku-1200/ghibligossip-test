/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — Socket.IO Service
 * ══════════════════════════════════════════════════
 * Manages the real-time Socket.IO connection to the backend.
 * Used for: room events, voice chat signaling, chat messages,
 * reactions, gifts, and game events.
 */

import { io as socketIO, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

let socket: Socket | null = null;

// ── Connect to Socket.IO server ──
export const connectSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = socketIO(API_CONFIG.BASE_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('  ⚡ Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', (reason: string) => {
    console.log('  ⚡ Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error: Error) => {
    console.log('  ❌ Socket.IO connection error:', error.message);
  });

  return socket;
};

// ── Get current socket instance ──
export const getSocket = (): Socket | null => socket;

// ── Disconnect socket ──
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ═══════════════════════════════════════════════════
// ── ROOM EVENTS ──
// ═══════════════════════════════════════════════════

export const joinRoom = (roomId: string, userData: any) => {
  socket?.emit('join-room', roomId, userData);
};

export const leaveRoom = (roomId: string, userData: any) => {
  socket?.emit('leave-room', roomId, userData);
};

// ═══════════════════════════════════════════════════
// ── VOICE CHAT EVENTS (One Person at a Time) ──
// ═══════════════════════════════════════════════════

// User requests to speak
export const requestMic = (roomId: string, userData: any) => {
  socket?.emit('mic-request', roomId, userData);
};

// Host accepts a mic request
export const acceptMic = (
  roomId: string,
  targetSocketId: string,
  targetUserData: any,
) => {
  socket?.emit('mic-accepted', roomId, targetSocketId, targetUserData);
};

// Host denies a mic request
export const denyMic = (roomId: string, targetSocketId: string) => {
  socket?.emit('mic-denied', roomId, targetSocketId);
};

// User releases mic (done speaking)
export const releaseMic = (roomId: string) => {
  socket?.emit('release-mic', roomId);
};

// ═══════════════════════════════════════════════════
// ── HOST CONTROLS ──
// ═══════════════════════════════════════════════════

// Host mutes a user
export const muteUser = (roomId: string, targetSocketId: string) => {
  socket?.emit('mute-user', roomId, targetSocketId);
};

// Host kicks a user
export const kickUser = (
  roomId: string,
  targetSocketId: string,
  reason?: string,
) => {
  socket?.emit('kick-user', roomId, targetSocketId, reason || '');
};

// Host promotes user to co-host
export const promoteCohost = (
  roomId: string,
  targetSocketId: string,
  userData: any,
) => {
  socket?.emit('promote-cohost', roomId, targetSocketId, userData);
};

// Host takes mic directly
export const hostTakeMic = (roomId: string, hostUserData: any) => {
  socket?.emit('host-take-mic', roomId, hostUserData);
};

// Host mutes current speaker
export const hostMuteSpeaker = (roomId: string) => {
  socket?.emit('host-mute-speaker', roomId);
};

// Host ends the room
export const endRoom = (roomId: string) => {
  socket?.emit('end-room', roomId);
};

// Broadcast room created event
export const broadcastRoomCreated = (room: any) => {
  socket?.emit('room-created', room);
};

// ═══════════════════════════════════════════════════
// ── CHAT & REACTIONS ──
// ═══════════════════════════════════════════════════

export const sendMessage = (roomId: string, message: any) => {
  socket?.emit('room-message', roomId, message);
};

export const sendReaction = (roomId: string, reaction: any) => {
  socket?.emit('room-reaction', roomId, reaction);
};

export const sendGift = (roomId: string, giftData: any) => {
  socket?.emit('room-gift', roomId, giftData);
};

// ═══════════════════════════════════════════════════
// ── WebRTC SIGNALING ──
// ═══════════════════════════════════════════════════

export const sendOffer = (targetSocketId: string, offer: any) => {
  socket?.emit('offer', targetSocketId, offer);
};

export const sendAnswer = (targetSocketId: string, answer: any) => {
  socket?.emit('answer', targetSocketId, answer);
};

export const sendIceCandidate = (targetSocketId: string, candidate: any) => {
  socket?.emit('ice-candidate', targetSocketId, candidate);
};

// ═══════════════════════════════════════════════════
// ── GAME EVENTS ──
// ═══════════════════════════════════════════════════

export const spinBottle = (roomId: string, spinData: any) => {
  socket?.emit('bottle-spin', roomId, spinData);
};

export const selectChallenge = (roomId: string, challengeData: any) => {
  socket?.emit('challenge-selected', roomId, challengeData);
};

export const pickTruthDare = (roomId: string, pickData: any) => {
  socket?.emit('truth-dare-pick', roomId, pickData);
};

// ═══════════════════════════════════════════════════
// ── EVENT LISTENERS (for use in components) ──
// ═══════════════════════════════════════════════════

export const onEvent = (event: string, callback: (...args: any[]) => void) => {
  socket?.on(event, callback);
};

export const offEvent = (
  event: string,
  callback: (...args: any[]) => void,
) => {
  socket?.off(event, callback);
};
