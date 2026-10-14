// ═══════════════════════════════════════════════════════════════
// YouTubeTheaterPlayer.tsx — Premium Cinema YouTube Video Engine
// Fixes Error 153 and Error 152-4 with Auto-Fallback for Locked Music Videos
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SW } = Dimensions.get('window');
const SCREEN_WIDTH = SW * 0.92;
const SCREEN_HEIGHT = Math.max(SCREEN_WIDTH * (9 / 16), 204);

const APP_ORIGIN = 'https://ghibligossip.app';

interface Props {
  videoId: string;
  isPlaying: boolean;
}

const WebViewAny = WebView as any;

export default function YouTubeTheaterPlayer({ videoId, isPlaying }: Props) {
  const webViewRef = useRef<any>(null);
  const [useDirectFallback, setUseDirectFallback] = useState(false);

  // Reset fallback state whenever videoId changes
  useEffect(() => {
    setUseDirectFallback(false);
  }, [videoId]);

  // Sync play/pause with WebView player
  useEffect(() => {
    if (!webViewRef.current) return;
    if (useDirectFallback) {
      webViewRef.current.injectJavaScript(`
        (function() {
          var v = document.querySelector('video');
          if (v) {
            ${isPlaying ? 'v.play();' : 'v.pause();'}
          }
        })();
        true;
      `);
    } else {
      const cmd = isPlaying ? 'playVideo' : 'pauseVideo';
      webViewRef.current.injectJavaScript(`
        (function() {
          if (window.player && typeof window.player.${cmd} === 'function') {
            window.player.${cmd}();
          }
        })();
        true;
      `);
    }
  }, [isPlaying, useDirectFallback]);

  // Embed HTML with IFrame API and error listener
  const embedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #player { width: 100%; height: 100%; background: #000; overflow: hidden; border: none; }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script src="https://www.youtube.com/iframe_api"></script>
        <script>
          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
              width: '100%',
              height: '100%',
              videoId: '${videoId}',
              playerVars: {
                autoplay: ${isPlaying ? 1 : 0},
                playsinline: 1,
                controls: 1,
                rel: 0,
                origin: '${APP_ORIGIN}',
                widget_referrer: '${APP_ORIGIN}'
              },
              events: {
                onReady: function(e) {
                  ${isPlaying ? 'e.target.playVideo();' : ''}
                },
                onError: function(e) {
                  // Catch embed blocks (Error 152, 150, 101) and notify React Native to fallback
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('EMBED_BLOCKED_' + e.data);
                  }
                }
              }
            });
            window.player = player;
          }
        </script>
      </body>
    </html>
  `;

  // Injected CSS to hide mobile YouTube header, comments, and recommendations in fallback mode
  const hideYoutubeChromeJS = `
    (function() {
      var style = document.createElement('style');
      style.innerHTML = \`
        ytm-mobile-topbar-renderer, ytm-item-section-renderer, 
        ytm-single-column-watch-next-results-renderer,
        ytm-SingleColumnWatchNextResultsRenderer, .related-chips-slot-wrapper,
        ytm-companion-slot, ytm-comment-teaser-renderer, .watch-below-the-player { display: none !important; }
        body, html { background: #000 !important; overflow: hidden !important; }
        .player-container, #player-container-id, .video-stream { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 9999 !important; }
      \`;
      document.head.appendChild(style);
      var video = document.querySelector('video');
      if (video) {
        video.play();
      }
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <WebViewAny
        ref={webViewRef}
        key={`${videoId}-${useDirectFallback}`}
        originWhitelist={['*']}
        source={
          useDirectFallback
            ? { uri: `https://m.youtube.com/watch?v=${videoId}` }
            : {
                html: embedHtml,
                baseUrl: APP_ORIGIN,
                headers: { Referer: APP_ORIGIN },
              }
        }
        injectedJavaScript={useDirectFallback ? hideYoutubeChromeJS : undefined}
        onMessage={(event: any) => {
          const data = event.nativeEvent.data || '';
          if (data.startsWith('EMBED_BLOCKED')) {
            setUseDirectFallback(true);
          }
        }}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        mixedContentMode="always"
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 4,
    height: SCREEN_HEIGHT - 4,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
    opacity: 0.99,
  },
});
