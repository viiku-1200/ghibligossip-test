/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — Login Screen
 * ══════════════════════════════════════════════════
 * Beautiful Ghibli-themed login screen with Google Sign-In.
 * Features floating particles, gradient background, and smooth animations.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  signInWithGoogle,
  signInAsGuest,
  configureGoogleSignIn,
} from '../services/authService';
import type { GhibliUser } from '../services/authService';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: (user: GhibliUser, isNewUser: boolean) => void;
}

// ── Floating particle for background animation ──
const FloatingParticle = ({ delay, size, startX }: any) => {
  const animY = useRef(new Animated.Value(height + 50)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animX = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const animate = () => {
      animY.setValue(height + 50);
      animOpacity.setValue(0);
      animX.setValue(startX + (Math.random() - 0.5) * 60);

      Animated.parallel([
        Animated.timing(animY, {
          toValue: -50,
          duration: 8000 + Math.random() * 5000,
          useNativeDriver: true,
          delay,
        }),
        Animated.sequence([
          Animated.timing(animOpacity, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(animOpacity, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ translateY: animY }, { translateX: animX }],
          opacity: animOpacity,
        },
      ]}
    />
  );
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const buttonSlide = useRef(new Animated.Value(80)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    configureGoogleSignIn();

    // Entrance animations
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(buttonSlide, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setStatusText('Connecting to Google...');

    try {
      const result = await signInWithGoogle();
      setStatusText(
        result.isNewUser
          ? '🎉 Welcome to GhibliGossip!'
          : `Welcome back, ${result.user.name}!`,
      );

      // Small delay for the welcome message to show
      setTimeout(() => {
        onLoginSuccess(result.user, result.isNewUser);
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      setStatusText('');
      if (error.message !== 'Sign-in cancelled') {
        Alert.alert(
          'Sign-In Failed',
          error.message || 'Something went wrong. Please try again.',
          [{ text: 'OK' }],
        );
      }
    }
  };

  // Generate floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: i * 600,
    size: 4 + Math.random() * 8,
    startX: Math.random() * width,
  }));

  return (
    <View style={styles.container}>
      {/* Background particles */}
      {particles.map(p => (
        <FloatingParticle
          key={p.id}
          delay={p.delay}
          size={p.size}
          startX={p.startX}
        />
      ))}

      {/* Glowing orb behind title */}
      <Animated.View style={[styles.glowOrb, { opacity: glowAnim }]} />

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: titleScale }],
          },
        ]}>
        <Text style={styles.titleEmoji}>☽</Text>
        <Text style={styles.titleMain}>GhibliGossip</Text>
        <Text style={styles.titleSub}>✦ Enter the Anime Metaverse ✦</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
        <Text style={styles.tagline}>
          Host rooms • Live voice chat • Play games{'\n'}
          Meet anime fans worldwide
        </Text>
      </Animated.View>

      {/* Google Sign-In Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ translateY: buttonSlide }],
            opacity: fadeAnim,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.googleButton,
            isLoading && styles.googleButtonDisabled,
          ]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            marginTop: 14,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: 'rgba(212, 175, 55, 0.4)',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={async () => {
            const res = await signInAsGuest();
            onLoginSuccess(res.user, false);
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>👑</Text>
          <Text style={{ color: '#d4af37', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 }}>
            Instant Access as Host
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Status text */}
      {statusText !== '' && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.statusText}>{statusText}</Text>
        </Animated.View>
      )}

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>
          ✦ 100 free coins on signup ✦
        </Text>
        <Text style={styles.versionText}>v1.0.0 • Made with ♡</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#b388ff',
    shadowColor: '#b388ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  glowOrb: {
    position: 'absolute',
    top: height * 0.18,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#7c4dff',
    shadowColor: '#7c4dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleEmoji: {
    fontSize: 48,
    marginBottom: 8,
    color: '#e0ccff',
    textShadowColor: '#b388ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleMain: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: '#7c4dff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  titleSub: {
    fontSize: 14,
    color: '#b388ff',
    letterSpacing: 4,
    marginTop: 8,
    fontWeight: '300',
  },
  tagline: {
    fontSize: 15,
    color: '#a0a0c0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#7c4dff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#7c4dff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 14,
    color: '#b388ff',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#7c4dff',
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 11,
    color: '#555',
  },
});
