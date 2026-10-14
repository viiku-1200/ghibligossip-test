// ═══════════════════════════════════════════════════════════════
// RoomRenderer.tsx — Split-screen room (matches anime.html layout)
// ═══════════════════════════════════════════════════════════════
// Upper half: VIP Stage with dancefloor_2.png background + spotlight
// Lower half: Audience room with darker background
// Purple glowing divider between halves
// No camera pan/zoom — static split like anime.html

import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, StyleSheet, Dimensions } from 'react-native';

const ROOM_BG = require('../anime_image/dancefloor_2.png');
const BELOW_BG = require('../anime_image/belowroom.png');
const { width: SW, height: SH } = Dimensions.get('window');
const HALF_H = SH / 2;

export default function RoomRenderer() {
    const spotlightPulse = useRef(new Animated.Value(0.15)).current;
    const discoGlow = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Spotlight glow pulse (matches anime.html .stage-light)
        Animated.loop(
            Animated.sequence([
                Animated.timing(spotlightPulse, {
                    toValue: 0.35,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(spotlightPulse, {
                    toValue: 0.08,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Disco shimmer at top
        Animated.loop(
            Animated.sequence([
                Animated.timing(discoGlow, {
                    toValue: 0.1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(discoGlow, {
                    toValue: 0.02,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* ═══ UPPER STAGE HALF ═══ */}
            <View style={styles.upperStage}>
                {/* Room background — oversized for cinematic feel */}
                {/* Matches anime.html: left:-13%, top:-12%, width:126%, height:126% */}
                <Image
                    source={ROOM_BG}
                    style={styles.roomBg}
                    resizeMode="cover"
                />

                {/* Stage spotlight cone (matches anime.html .stage-light) */}
                <Animated.View
                    style={[styles.stageLight, { opacity: spotlightPulse }]}
                />

                {/* Disco shimmer top */}
                <Animated.View
                    style={[styles.discoShimmer, { opacity: discoGlow }]}
                />
            </View>

            {/* ═══ DIVIDER — Glowing purple line (matches anime.html .audience-divider) ═══ */}
            <View style={styles.divider} />

            {/* ═══ LOWER AUDIENCE HALF ═══ */}
            <View style={styles.lowerHalf}>
                {/* Audience room background — same image, darker */}
                <Image
                    source={BELOW_BG}
                    style={styles.audienceBg}
                    resizeMode="cover"
                />
                {/* Dark overlay (matches anime.html .audience-room-overlay) */}
                <View style={styles.audienceOverlay} />
                {/* Top gradient for audience area */}
                <View style={styles.audienceTopGrad} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SW,
        height: SH,
        backgroundColor: '#090817',
    },

    // ── Upper Stage (top 50%) ──
    upperStage: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: HALF_H,
        overflow: 'hidden',
    },
    // Render image precisely at 100% with cover, avoiding stretching crop blur
    roomBg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
    },
    // Stage spotlight cone
    stageLight: {
        position: 'absolute',
        left: '35%',
        top: '2%',
        width: '30%',
        height: '96%',
        borderRadius: 200,
        backgroundColor: 'rgba(235,225,255,0.20)',
        pointerEvents: 'none',
    },
    // Disco shimmer at top
    discoShimmer: {
        position: 'absolute',
        top: '5%',
        left: '25%',
        width: '50%',
        height: '18%',
        borderRadius: 150,
        backgroundColor: 'rgba(200,150,255,0.25)',
        pointerEvents: 'none',
    },

    // ── Divider (matches anime.html .audience-divider) ──
    divider: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: HALF_H,
        height: 3,
        backgroundColor: 'rgba(220,170,255,0.8)',
        zIndex: 10,
        shadowColor: 'rgba(190,130,255,1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 16,
        elevation: 5,
    },

    // ── Lower Audience Half (bottom 50%) ──
    lowerHalf: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: HALF_H,
        bottom: 0,
        overflow: 'hidden',
        backgroundColor: '#080812',
        borderTopWidth: 2,
        borderTopColor: 'rgba(180,120,255,0.35)',
    },
    audienceBg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        opacity: 0.88,
    },
    audienceOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5,5,15,0.22)',
        pointerEvents: 'none',
    },
    audienceTopGrad: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '30%',
        backgroundColor: 'rgba(5,5,15,0.18)',
        pointerEvents: 'none',
    },
});
