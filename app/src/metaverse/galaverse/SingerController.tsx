// ═══════════════════════════════════════════════════════════════
// SingerController.tsx — Singer sprite with auto-cycle animation
// ═══════════════════════════════════════════════════════════════
// Matches anime.html exactly:
// • Auto-cycles: singing → movement → emotion → special
// • Frame timing: 420ms normal, 1500ms on final frame (frame 11)
// • singerMotion: subtle sin-wave sway/bob/rotation per pose type
// • Accepts mode prop from SingerControlsPanel

import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import SpriteFrame from './SpriteFrame';
import { SINGER_POSES, SINGER_SHEET_SIZE } from './spriteData';
import type { SingerMode } from './SingerControlsPanel';

const SINGER_IMAGE = require('../anime_image/singer_girl1.png');

// Auto-cycle sequence — exactly matches anime.html
const SEQUENCE: string[] = ['singing', 'movement', 'emotion', 'special'];

interface SingerControllerProps {
    mode: SingerMode;
    size?: number;
}

export default function SingerController({ mode = 'auto', size = 220 }: SingerControllerProps) {
    const [frameIndex, setFrameIndex] = useState(0);
    const [sequenceIndex, setSequenceIndex] = useState(0);

    // Current pose row based on mode (auto cycles through SEQUENCE)
    const currentPose = mode === 'auto' ? SEQUENCE[sequenceIndex] : mode;
    const poseData = SINGER_POSES[currentPose] || SINGER_POSES.singing;

    // ── Living animation values (matching anime.html's singerMotion) ──
    const swayX = useRef(new Animated.Value(0)).current;
    const bobY = useRef(new Animated.Value(0)).current;
    const breatheScale = useRef(new Animated.Value(1)).current;
    const glowPulse = useRef(new Animated.Value(0.3)).current;

    // ── Frame Animation — matches anime.html timing ──
    useEffect(() => {
        // anime.html: frame === 11 ? 1500 : 420
        const duration = frameIndex === poseData.frameCount - 1 ? 1500 : 420;

        const timer = setTimeout(() => {
            const nextFrame = frameIndex + 1;
            if (nextFrame >= poseData.frameCount) {
                // Reset to frame 0, advance sequence if auto
                setFrameIndex(0);
                if (mode === 'auto') {
                    setSequenceIndex(prev => (prev + 1) % SEQUENCE.length);
                }
            } else {
                setFrameIndex(nextFrame);
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [frameIndex, mode, poseData.frameCount]);

    // ── Reset on mode change ──
    useEffect(() => {
        setFrameIndex(0);
        setSequenceIndex(0);
    }, [mode]);

    // ── Living Motion Animations (per-pose tuning like anime.html) ──
    useEffect(() => {
        // Reset values when pose changes
        swayX.setValue(0);
        bobY.setValue(0);
        breatheScale.setValue(1);

        // Determine motion amplitudes per pose (matching anime.html's singerMotion)
        // Default (singing): x=0, y=±1.2, scale=1±0.004
        // Movement: x=±3, y=±1.6
        // Emotion: y=±0.6, no sway
        // Special: x=±2, y=±1.4
        let swayAmp = 0;
        let bobAmp = 1.2;
        let swayPeriod = 1400;
        let bobPeriod = 980;

        if (currentPose === 'movement') {
            swayAmp = 3;
            bobAmp = 1.6;
            swayPeriod = 1430;
            bobPeriod = 750;
        } else if (currentPose === 'emotion') {
            swayAmp = 0;
            bobAmp = 0.6;
            bobPeriod = 1310;
        } else if (currentPose === 'special') {
            swayAmp = 2;
            bobAmp = 1.4;
            swayPeriod = 1570;
            bobPeriod = 1050;
        }

        // Horizontal sway
        const swayAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(swayX, {
                    toValue: swayAmp,
                    duration: swayPeriod,
                    useNativeDriver: true,
                }),
                Animated.timing(swayX, {
                    toValue: -swayAmp,
                    duration: swayPeriod,
                    useNativeDriver: true,
                }),
            ])
        );
        swayAnim.start();

        // Vertical bob
        const bobAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(bobY, {
                    toValue: -bobAmp,
                    duration: bobPeriod,
                    useNativeDriver: true,
                }),
                Animated.timing(bobY, {
                    toValue: bobAmp,
                    duration: bobPeriod,
                    useNativeDriver: true,
                }),
            ])
        );
        bobAnim.start();

        // Breathing scale (very subtle, matching anime.html's ±0.004)
        const scaleAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(breatheScale, {
                    toValue: 1.004,
                    duration: 1160,
                    useNativeDriver: true,
                }),
                Animated.timing(breatheScale, {
                    toValue: 0.996,
                    duration: 1160,
                    useNativeDriver: true,
                }),
            ])
        );
        scaleAnim.start();

        // Glow pulse
        const glowAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, {
                    toValue: 0.6,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(glowPulse, {
                    toValue: 0.2,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        );
        glowAnim.start();

        return () => {
            swayAnim.stop();
            bobAnim.stop();
            scaleAnim.stop();
            glowAnim.stop();
        };
    }, [currentPose]);

    const frame = poseData.frames[frameIndex];
    if (!frame) return null;

    const aspectRatio = frame.w / frame.h;
    const displayWidth = size * aspectRatio;
    const displayHeight = size;

    return (
        <View style={styles.outerWrapper}>
            {/* Floor glow under singer (matches anime.html .singer-floor-glow) */}
            <Animated.View style={[styles.floorGlow, { opacity: glowPulse }]} />

            {/* Stage shadow under feet */}
            <View style={styles.stageShadow} />

            <Animated.View
                style={[
                    styles.singerWrap,
                    {
                        width: displayWidth,
                        height: displayHeight,
                        transform: [
                            { translateX: swayX },
                            { translateY: bobY },
                            { scale: breatheScale },
                        ],
                    },
                ]}
            >
                {/* The Singer Sprite Frame */}
                <SpriteFrame
                    source={SINGER_IMAGE}
                    sheetWidth={SINGER_SHEET_SIZE.width}
                    sheetHeight={SINGER_SHEET_SIZE.height}
                    sourceX={frame.x}
                    sourceY={frame.y}
                    frameWidth={frame.w}
                    frameHeight={frame.h}
                    displayWidth={displayWidth}
                    displayHeight={displayHeight}
                />

                {/* Aura glow behind singer */}
                <Animated.View style={[styles.aura, { opacity: glowPulse }]} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    singerWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    floorGlow: {
        position: 'absolute',
        bottom: 0,
        width: 80,
        height: 14,
        borderRadius: 50,
        backgroundColor: 'rgba(190,170,255,0.30)',
    },
    stageShadow: {
        position: 'absolute',
        bottom: 4,
        width: 100,
        height: 14,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.50)',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    aura: {
        position: 'absolute',
        width: '120%',
        height: '110%',
        backgroundColor: 'rgba(216,75,247,0.15)',
        borderRadius: 140,
        zIndex: -1,
    },
});
