/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — Room Service
 * ══════════════════════════════════════════════════
 * API calls for room CRUD operations.
 * All calls require JWT authentication.
 */

import { authFetch } from './authService';

// ── Types ──
export interface RoomData {
  _id: string;
  name: string;
  type: string;
  description: string;
  host: {
    _id: string;
    name: string;
    avatar: string;
    username?: string;
    vipTier: string;
  };
  coHosts: any[];
  participants: Array<{
    user: {
      _id: string;
      name: string;
      avatar: string;
      username?: string;
      vipTier?: string;
    };
    role: 'speaker' | 'audience';
    isMuted: boolean;
  }>;
  micQueue: Array<{
    user: {
      _id: string;
      name: string;
      avatar: string;
    };
  }>;
  maxParticipants: number;
  isPrivate: boolean;
  roomCode?: string;
  status: 'live' | 'ended' | 'scheduled';
  themeColor: string;
  createdAt: string;
}

// ── Create a new room ──
export const createRoom = async (roomData: {
  name: string;
  type: string;
  description?: string;
  maxParticipants?: number;
  isPrivate?: boolean;
  themeColor?: string;
}): Promise<{ success: boolean; room: RoomData }> => {
  return authFetch('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(roomData),
  });
};

// ── Get all live rooms ──
export const getRooms = async (
  type?: string,
): Promise<{ success: boolean; count: number; rooms: RoomData[] }> => {
  const query = type ? `?type=${type}` : '';
  return authFetch(`/api/rooms${query}`);
};

// ── Get a single room ──
export const getRoom = async (
  roomId: string,
): Promise<{ success: boolean; room: RoomData }> => {
  return authFetch(`/api/rooms/${roomId}`);
};

// ── Join a room ──
export const joinRoom = async (
  roomId: string,
  roomCode?: string,
): Promise<{ success: boolean; room: RoomData }> => {
  return authFetch(`/api/rooms/${roomId}/join`, {
    method: 'POST',
    body: JSON.stringify({ roomCode }),
  });
};

// ── Leave a room ──
export const leaveRoom = async (
  roomId: string,
): Promise<{ success: boolean }> => {
  return authFetch(`/api/rooms/${roomId}/leave`, {
    method: 'POST',
  });
};

// ── Request mic (join queue) ──
export const requestMic = async (
  roomId: string,
): Promise<{ success: boolean; queuePosition: number }> => {
  return authFetch(`/api/rooms/${roomId}/request-mic`, {
    method: 'POST',
  });
};

// ── Accept mic request (host only) ──
export const acceptMic = async (
  roomId: string,
  userId: string,
): Promise<{ success: boolean }> => {
  return authFetch(`/api/rooms/${roomId}/accept-mic/${userId}`, {
    method: 'POST',
  });
};

// ── Mute a user (host only) ──
export const muteUser = async (
  roomId: string,
  userId: string,
): Promise<{ success: boolean }> => {
  return authFetch(`/api/rooms/${roomId}/mute/${userId}`, {
    method: 'POST',
  });
};

// ── Kick a user (host only) ──
export const kickUser = async (
  roomId: string,
  userId: string,
): Promise<{ success: boolean }> => {
  return authFetch(`/api/rooms/${roomId}/kick/${userId}`, {
    method: 'POST',
  });
};

// ── Close/End a room (host only) ──
export const closeRoom = async (
  roomId: string,
): Promise<{ success: boolean }> => {
  return authFetch(`/api/rooms/${roomId}`, {
    method: 'DELETE',
  });
};
