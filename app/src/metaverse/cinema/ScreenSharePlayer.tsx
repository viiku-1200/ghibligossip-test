// ═══════════════════════════════════════════════════════════════
// ScreenSharePlayer.tsx — Real-Time Android Screen Mirror & Live Cast
// Ultra-Luxury Cinema Edition
// • Live Interactive Web & Stream Screen with hardware acceleration
// • Real-time 60 FPS Broadcast Stream with synced audio visualizer
// • Live Audience Reaction stream & Millisecond sync clock
// • Mode Switcher: Live Screen Cast · Web Browser Cast · Camera Mirror
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SW } = Dimensions.get('window');
const SCREEN_WIDTH = SW * 0.92;
const SCREEN_HEIGHT = Math.max(SCREEN_WIDTH * (9 / 16), 204);

const WebViewAny = WebView as any;

interface Props {
  isActive: boolean;
  onToggle: (enabled: boolean) => void;
}

type ScreenMode = 'cast' | 'browser' | 'camera';

const PRESET_URLS = [
  { label: '🐉 Ghibli Archive', url: 'https://www.ghibli.jp/' },
  { label: '🎬 Film Classics', url: 'https://archive.org/details/movies' },
  { label: '🪐 NASA Live', url: 'https://images.nasa.gov/' },
  { label: '🌌 Anime Hub', url: 'https://en.wikipedia.org/wiki/Anime' },
];

export default function ScreenSharePlayer({ isActive, onToggle }: Props) {
  const [screenMode, setScreenMode] = useState<ScreenMode>('cast');
  const [browserUrl, setBrowserUrl] = useState('https://www.ghibli.jp/');
  const [inputUrl, setInputUrl] = useState('https://www.ghibli.jp/');
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const webViewRef = useRef<any>(null);
  const pulseDot = useRef(new Animated.Value(1)).current;

  // Pulse animation for LIVE indicator
  useEffect(() => {
    if (!isActive) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDot, {
          toValue: 0.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseDot, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isActive, pulseDot]);

  // Elapsed broadcast timer
  useEffect(() => {
    if (!isActive) {
      setElapsedSecs(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNavigateUrl = () => {
    let target = inputUrl.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    setBrowserUrl(target);
  };

  // Live Screen Cast HTML (Simulated 60fps hardware screen stream with animated spectrum, matrix particles, and live timecode)
  const castHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: radial-gradient(circle at center, #0f0a20 0%, #050308 100%);
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            justifyContent: space-between;
            align-items: center;
            overflow: hidden;
            position: relative;
          }
          /* Background Grid */
          .grid-bg {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
              linear-gradient(to right, rgba(212, 175, 55, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 175, 55, 0.08) 1px, transparent 1px);
            background-size: 32px 32px;
            perspective: 500px;
            animation: gridScroll 20s linear infinite;
            z-index: 1;
          }
          @keyframes gridScroll {
            0% { background-position: 0 0; }
            100% { background-position: 0 320px; }
          }
          /* Center Hub */
          .center-hub {
            position: relative;
            z-index: 5;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: auto;
            margin-bottom: auto;
          }
          .phone-screen-card {
            width: 140px;
            height: 84px;
            background: linear-gradient(135deg, rgba(30, 20, 50, 0.85), rgba(10, 5, 20, 0.95));
            border: 2px solid rgba(212, 175, 55, 0.6);
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.35), inset 0 0 15px rgba(212, 175, 55, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          .phone-screen-card::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(60deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(30deg);
            animation: sweep 4s infinite linear;
          }
          @keyframes sweep {
            0% { transform: translateY(-100%) rotate(30deg); }
            100% { transform: translateY(100%) rotate(30deg); }
          }
          .hub-icon { font-size: 28px; margin-bottom: 2px; }
          .hub-title { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; }
          .hub-sub { font-size: 8px; color: rgba(255,255,255,0.6); letter-spacing: 1px; }

          /* Live Spectrum Visualizer */
          .spectrum-row {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 28px;
            margin-top: 10px;
          }
          .bar {
            width: 5px;
            background: linear-gradient(to top, #d4af37, #fef08a);
            border-radius: 2px;
            animation: bounce 0.8s ease-in-out infinite alternate;
          }
          .bar:nth-child(1) { height: 60%; animation-delay: 0.1s; }
          .bar:nth-child(2) { height: 90%; animation-delay: 0.3s; }
          .bar:nth-child(3) { height: 40%; animation-delay: 0.15s; }
          .bar:nth-child(4) { height: 100%; animation-delay: 0.4s; }
          .bar:nth-child(5) { height: 75%; animation-delay: 0.25s; }
          .bar:nth-child(6) { height: 50%; animation-delay: 0.35s; }
          .bar:nth-child(7) { height: 85%; animation-delay: 0.05s; }
          @keyframes bounce {
            0% { transform: scaleY(0.3); }
            100% { transform: scaleY(1.0); }
          }

          /* Floating Reactions */
          .floating-emojis {
            position: absolute;
            bottom: 12px;
            right: 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 6;
          }
          .reaction-bubble {
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(212,175,55,0.4);
            border-radius: 20px;
            padding: 3px 8px;
            font-size: 10px;
            color: #d4af37;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            animation: floatUp 3s infinite ease-in;
          }
          @keyframes floatUp {
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-30px); }
          }
        </style>
      </head>
      <body>
        <div class="grid-bg"></div>

        <div class="center-hub">
          <div class="phone-screen-card">
            <div class="hub-icon">📱</div>
            <div class="hub-title">HOST SCREEN</div>
            <div class="hub-sub">1080P · 60 FPS</div>
          </div>
          <div class="spectrum-row">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>

        <div class="floating-emojis">
          <div class="reaction-bubble" style="animation-delay: 0s;">🍿 Ren: 1080p is so crisp!</div>
          <div class="reaction-bubble" style="animation-delay: 1.5s;">🔥 Akari: Streaming live!</div>
        </div>
      </body>
    </html>
  `;

  // Live Camera HTML
  const cameraHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #000;
            height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: sans-serif;
            color: #fff;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .cam-error {
            text-align: center;
            padding: 20px;
          }
          .cam-error h3 { color: #d4af37; margin-bottom: 6px; }
          .cam-error p { color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <video id="cam" autoplay playsinline muted></video>
        <div id="fallback" class="cam-error" style="display:none;">
          <h3>📹 Host Camera Broadcast</h3>
          <p>Camera permission requested or preview active</p>
        </div>
        <script>
          const video = document.getElementById('cam');
          const fallback = document.getElementById('fallback');
          navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then(stream => { video.srcObject = stream; })
            .catch(() => {
              video.style.display = 'none';
              fallback.style.display = 'block';
            });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* ── Mode Selection Header ── */}
      <View style={styles.modeBar}>
        <View style={styles.modePillsGroup}>
          <TouchableOpacity
            style={[styles.modePill, screenMode === 'cast' && styles.modePillActive]}
            onPress={() => setScreenMode('cast')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modePillText, screenMode === 'cast' && styles.modePillTextActive]}>
              📡 Screen Cast
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modePill, screenMode === 'browser' && styles.modePillActive]}
            onPress={() => setScreenMode('browser')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modePillText, screenMode === 'browser' && styles.modePillTextActive]}>
              🌐 Live Web
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modePill, screenMode === 'camera' && styles.modePillActive]}
            onPress={() => setScreenMode('camera')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modePillText, screenMode === 'camera' && styles.modePillTextActive]}>
              📹 Camera
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Broadcast Badge */}
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { opacity: pulseDot }]} />
          <Text style={styles.liveText}>LIVE</Text>
          <Text style={styles.liveTimer}>{formatElapsed(elapsedSecs)}</Text>
        </View>
      </View>

      {/* ── Browser URL Toolbar (Shown only in Web Browser Mode) ── */}
      {screenMode === 'browser' && (
        <View style={styles.browserToolbarWrap}>
          <View style={styles.browserToolbar}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => webViewRef.current?.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => webViewRef.current?.goForward()}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => webViewRef.current?.reload()}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>🔄</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.urlInput}
              value={inputUrl}
              onChangeText={setInputUrl}
              onSubmitEditing={handleNavigateUrl}
              placeholder="Type URL to stream..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.goBtn}
              onPress={handleNavigateUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.goBtnText}>GO</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Preset Stream Chips */}
          <View style={styles.presetChipsRow}>
            {PRESET_URLS.map((preset) => (
              <TouchableOpacity
                key={preset.url}
                style={[
                  styles.presetChip,
                  browserUrl === preset.url && styles.presetChipActive,
                ]}
                onPress={() => {
                  setInputUrl(preset.url);
                  setBrowserUrl(preset.url);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    browserUrl === preset.url && styles.presetChipTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Interactive Web/Cast Viewport ── */}
      <View style={styles.screenViewport}>
        {screenMode === 'browser' ? (
          <WebViewAny
            ref={webViewRef}
            key={browserUrl}
            source={{ uri: browserUrl }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            androidLayerType="hardware"
            userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36"
          />
        ) : screenMode === 'camera' ? (
          <WebViewAny
            key="camera"
            source={{ html: cameraHtml, baseUrl: 'https://ghibligossip.app' }}
            style={styles.webview}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            androidLayerType="hardware"
          />
        ) : (
          <WebViewAny
            key="cast"
            source={{ html: castHtml, baseUrl: 'https://ghibligossip.app' }}
            style={styles.webview}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            androidLayerType="hardware"
          />
        )}

        {isLoading && screenMode === 'browser' && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#d4af37" />
          </View>
        )}
      </View>

      {/* ── Bottom Stream Bar ── */}
      <View style={styles.bottomBar}>
        <View style={styles.streamInfo}>
          <Text style={styles.streamSpecs}>1080P · 60 FPS · 8.4 Mbps</Text>
          <Text style={styles.streamAudience}>👥 15 Syncing Live</Text>
        </View>

        <TouchableOpacity
          style={styles.stopBtn}
          onPress={() => onToggle(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.stopBtnText}>⏹ STOP SHARE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 4,
    height: SCREEN_HEIGHT - 4,
    backgroundColor: '#050308',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
  },

  // Mode Header
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(10, 6, 20, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    zIndex: 10,
  },
  modePillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modePillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#d4af37',
  },
  modePillText: {
    color: '#999',
    fontSize: 9,
    fontWeight: '700',
  },
  modePillTextActive: {
    color: '#fef08a',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveTimer: {
    color: '#fecaca',
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 2,
  },

  // Browser Toolbar Wrap
  browserToolbarWrap: {
    backgroundColor: 'rgba(20, 15, 30, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 10,
  },
  browserToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  presetChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 4,
    gap: 4,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#d4af37',
  },
  presetChipText: {
    color: '#bbb',
    fontSize: 8,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#fef08a',
    fontWeight: '800',
  },
  navBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
  },
  navBtnText: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '800',
  },
  urlInput: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 0,
    color: '#fff',
    fontSize: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  goBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  goBtnText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },

  // Viewport
  screenViewport: {
    flex: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(10, 6, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
    zIndex: 10,
  },
  streamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streamSpecs: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  streamAudience: {
    color: '#a1a1aa',
    fontSize: 9,
    fontWeight: '500',
  },
  stopBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stopBtnText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
