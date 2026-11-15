/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — WebRTC Voice Audio Service
 * ══════════════════════════════════════════════════
 * Handles live peer-to-peer microphone voice streaming:
 *   - Captures local microphone audio via mediaDevices.getUserMedia
 *   - RTCPeerConnection setup with Google public STUN servers
 *   - Sends & receives WebRTC Offers, Answers, and ICE candidates
 *   - Plays incoming remote voice audio automatically through device speakers
 */

import { Platform, PermissionsAndroid } from 'react-native';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import {
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  onEvent,
  offEvent,
  getSocket,
} from './socketService';

// ── Google Public STUN Configuration for Internet NAT Traversal ──
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

let localStream: MediaStream | null = null;
const peerConnections = new Map<string, RTCPeerConnection>();
let currentRoomId: string | null = null;
let isListenersBound = false;

// ── Request Android Microphone Permission ──
export const requestAudioPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'GhibliGossip needs microphone access for live voice chat.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('  ⚠️ Audio permission request failed:', err);
      return false;
    }
  }
  return true;
};

// ── Start Local Microphone Stream ──
export const startLocalAudio = async (): Promise<MediaStream | null> => {
  try {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      console.warn('  ⚠️ Microphone permission denied');
      return null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.enabled = true;
      });
      return localStream;
    }

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStream = stream as MediaStream;
    console.log('  🎙️ Local microphone audio stream started');
    return localStream;
  } catch (error: any) {
    console.error('  ❌ Error starting local audio:', error.message);
    return null;
  }
};

// ── Stop Local Microphone Stream ──
export const stopLocalAudio = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    localStream = null;
    console.log('  🔇 Local microphone audio stream stopped');
  }
};

// ── Mute / Unmute Local Microphone ──
export const setLocalMuted = (muted: boolean) => {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });
    console.log(`  🎙️ Local mic ${muted ? 'MUTED' : 'UNMUTED'}`);
  }
};

// ── Get or Create RTCPeerConnection for a remote socket ──
const getOrCreatePeerConnection = (
  remoteSocketId: string,
  onRemoteTrack?: (stream: MediaStream) => void,
): RTCPeerConnection => {
  if (peerConnections.has(remoteSocketId)) {
    return peerConnections.get(remoteSocketId)!;
  }

  const pc = new RTCPeerConnection(RTC_CONFIG);

  // Send ICE Candidates as they are discovered
  pc.addEventListener('icecandidate', (event: any) => {
    if (event.candidate) {
      sendIceCandidate(remoteSocketId, event.candidate);
    }
  });

  // When remote audio track arrives, connect it
  pc.addEventListener('track', (event: any) => {
    console.log(`  🔊 Received remote audio track from ${remoteSocketId}`);
    if (event.streams && event.streams[0]) {
      if (onRemoteTrack) {
        onRemoteTrack(event.streams[0]);
      }
    }
  });

  // Add local microphone audio track if we are speaking
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream!);
    });
  }

  peerConnections.set(remoteSocketId, pc);
  return pc;
};

// ── Speaker: Initiate WebRTC Call to a Listener (Create Offer) ──
export const callPeer = async (remoteSocketId: string) => {
  try {
    const pc = getOrCreatePeerConnection(remoteSocketId);

    // Ensure local stream is added to peer connection
    if (localStream) {
      const senders = pc.getSenders();
      localStream.getTracks().forEach(track => {
        const alreadyAdded = senders.some(s => s.track?.id === track.id);
        if (!alreadyAdded) {
          pc.addTrack(track, localStream!);
        }
      });
    }

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });

    await pc.setLocalDescription(offer);
    sendOffer(remoteSocketId, offer);
    console.log(`  📤 WebRTC offer sent to ${remoteSocketId}`);
  } catch (error: any) {
    console.error(`  ❌ Error calling peer ${remoteSocketId}:`, error.message);
  }
};

// ── Speaker: Broadcast Audio to All Participants in the Room ──
export const broadcastAudioToPeers = async (participantSocketIds: string[]) => {
  for (const socketId of participantSocketIds) {
    const mySocket = getSocket();
    if (socketId && socketId !== mySocket?.id) {
      await callPeer(socketId);
    }
  }
};

// ── Active Handlers for Cleanup ──
let activeOfferHandler: ((...args: any[]) => void) | null = null;
let activeAnswerHandler: ((...args: any[]) => void) | null = null;
let activeCandidateHandler: ((...args: any[]) => void) | null = null;

// ── Initialize Signaling Listeners ──
export const initWebRTCSignaling = (
  roomId: string,
  onRemoteAudioStream?: (stream: MediaStream) => void,
) => {
  currentRoomId = roomId;

  if (isListenersBound) return;
  isListenersBound = true;

  // 1. Handle incoming Offer (listener receiving audio from speaker)
  activeOfferHandler = async (senderSocketId: string, offer: any) => {
    try {
      console.log(`  📥 Received WebRTC offer from ${senderSocketId}`);
      const pc = getOrCreatePeerConnection(senderSocketId, onRemoteAudioStream);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendAnswer(senderSocketId, answer);
      console.log(`  📤 WebRTC answer sent to ${senderSocketId}`);
    } catch (err: any) {
      console.error('  ❌ Error handling offer:', err.message);
    }
  };

  // 2. Handle incoming Answer (speaker receiving answer from listener)
  activeAnswerHandler = async (senderSocketId: string, answer: any) => {
    try {
      console.log(`  📥 Received WebRTC answer from ${senderSocketId}`);
      const pc = peerConnections.get(senderSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`  ✅ WebRTC connected with ${senderSocketId}`);
      }
    } catch (err: any) {
      console.error('  ❌ Error handling answer:', err.message);
    }
  };

  // 3. Handle incoming ICE Candidate
  activeCandidateHandler = async (senderSocketId: string, candidate: any) => {
    try {
      const pc = peerConnections.get(senderSocketId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err: any) {
      console.error('  ❌ Error adding ICE candidate:', err.message);
    }
  };

  onEvent('offer', activeOfferHandler);
  onEvent('answer', activeAnswerHandler);
  onEvent('ice-candidate', activeCandidateHandler);
};

// ── Clean Up All WebRTC Resources on Room Exit ──
export const cleanupWebRTC = () => {
  stopLocalAudio();

  peerConnections.forEach(pc => {
    try {
      pc.close();
    } catch (e) {}
  });
  peerConnections.clear();

  if (activeOfferHandler) {
    offEvent('offer', activeOfferHandler);
    activeOfferHandler = null;
  }
  if (activeAnswerHandler) {
    offEvent('answer', activeAnswerHandler);
    activeAnswerHandler = null;
  }
  if (activeCandidateHandler) {
    offEvent('ice-candidate', activeCandidateHandler);
    activeCandidateHandler = null;
  }

  isListenersBound = false;
  currentRoomId = null;
  console.log('  🧹 WebRTC resources cleaned up');
};
