/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — Auth Service
 * ══════════════════════════════════════════════════
 * Handles Google Sign-In + backend JWT authentication.
 *
 * Flow:
 *   1. User taps "Sign in with Google"
 *   2. Google returns user profile + idToken
 *   3. We send idToken to our backend: POST /api/auth/google
 *   4. Backend verifies with Google, creates/finds user, returns JWT
 *   5. We store JWT for future API calls
 */

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { API_CONFIG } from '../config/api';

// ── Types ──
export interface GhibliUser {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  avatar: string;
  username?: string;
  bio?: string;
  coins: number;
  vipTier: string;
  isVip: boolean;
  roomsHosted: number;
  roomsJoined: number;
  giftsReceived: number;
  giftsSent: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  isNewUser: boolean;
  token: string;
  user: GhibliUser;
}

// ── In-memory token storage (simple for now) ──
let authToken: string | null = null;
let currentUser: GhibliUser | null = null;

// ── Configure Google Sign-In ──
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: API_CONFIG.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

// ── Sign In with Google ──
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Trigger Google Sign-In popup
    const response = await GoogleSignin.signIn();

    // Extract user info
    const userInfo = response.data;

    if (!userInfo || !userInfo.user) {
      throw new Error('Google Sign-In returned no user data');
    }

    const { user, idToken } = userInfo;

    console.log('  ✅ Google Sign-In Success:', user.name);

    // Send to our backend for JWT
    const backendResponse = await fetch(
      `${API_CONFIG.BASE_URL}/api/auth/google`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: idToken || null,
          googleId: user.id,
          email: user.email,
          name: user.name,
          avatar: user.photo || '',
        }),
      },
    );

    const data: AuthResponse = await backendResponse.json();

    if (!data.success) {
      throw new Error('Backend authentication failed');
    }

    // Store token & user
    authToken = data.token;
    currentUser = data.user;

    console.log(
      `  🎉 Logged in as: ${data.user.name} (${data.isNewUser ? 'NEW' : 'RETURNING'} user)`,
    );

    return data;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('  ℹ️ User cancelled Google Sign-In');
      throw new Error('Sign-in cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('  ℹ️ Sign-in already in progress');
      throw new Error('Sign-in in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('  ❌ Google Play Services not available');
      throw new Error('Google Play Services not available');
    } else {
      console.error('  ❌ Google Sign-In Error:', error.message);
      throw error;
    }
  }
};

// ── Guest Sign-In (instant access for testing & hosting) ──
export const signInAsGuest = async (customName?: string): Promise<AuthResponse> => {
  const guestName = customName || 'Ghibli Host ' + Math.floor(100 + Math.random() * 900);
  const guestUser: GhibliUser = {
    _id: 'guest_' + Date.now(),
    googleId: 'guest_' + Date.now(),
    email: `${guestName.toLowerCase().replace(/\s+/g, '')}@ghibligossip.com`,
    name: guestName,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    coins: 500,
    vipTier: 'VIP',
    isVip: true,
    roomsHosted: 1,
    roomsJoined: 3,
    giftsReceived: 12,
    giftsSent: 5,
    createdAt: new Date().toISOString(),
  };

  authToken = 'guest_jwt_token_' + Date.now();
  currentUser = guestUser;

  console.log(`  🎉 Logged in as Guest: ${guestName}`);
  return {
    success: true,
    isNewUser: false,
    token: authToken,
    user: guestUser,
  };
};

// ── Sign Out ──
export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    authToken = null;
    currentUser = null;
    console.log('  👋 Signed out');
  } catch (error: any) {
    console.error('  ❌ Sign-Out Error:', error.message);
  }
};

// ── Check if already signed in ──
export const checkExistingSignIn = async (): Promise<GhibliUser | null> => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    if (userInfo && userInfo.user && authToken) {
      return currentUser;
    }
    return currentUser;
  } catch {
    return currentUser;
  }
};

// ── Getters ──
export const getAuthToken = () => authToken || 'guest_token';
export const getCurrentUser = (): GhibliUser => {
  if (!currentUser) {
    currentUser = {
      _id: 'host_' + Math.floor(1000 + Math.random() * 9000),
      googleId: 'guest_default',
      email: 'host@ghibligossip.com',
      name: 'Anime Host',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      coins: 300,
      vipTier: 'VIP',
      isVip: true,
      roomsHosted: 1,
      roomsJoined: 4,
      giftsReceived: 10,
      giftsSent: 2,
      createdAt: new Date().toISOString(),
    };
  }
  return currentUser;
};
export const setCurrentUser = (user: GhibliUser) => {
  currentUser = user;
};

// ── Authenticated API call helper ──
export const authFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      ...options.headers,
    },
  });

  return response.json();
};
