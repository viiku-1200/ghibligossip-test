// ═══════════════════════════════════════════════════════════════
// AudienceController.tsx — Audience character on the lower half
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import SpriteFrame from './SpriteFrame';
import { AUDIENCE_POSES, AUDIENCE_SHEET_SIZE } from './spriteData';
import type { AudienceMode } from './AudienceControlsPanel';

const AUDIENCE_IMAGE = require('../anime_image/boy1audience.png');

const SEQUENCE: string[] = ['dance', 'cheer', 'drink', 'special'];

interface AudienceControllerProps {
    mode: AudienceMode;
    size?: number;
}

export default function AudienceController({ mode = 'auto', size = 180 }: AudienceControllerProps) {
    const [frameIndex, setFrameIndex] = useState(0);
    const [sequenceIndex, setSequenceIndex] = useState(0);

    // Map AudienceMode to Audience Poses
    let currentPose = 'dance';
    if (mode === 'auto') {
        currentPose = SEQUENCE[sequenceIndex];
    } else {
        currentPose = mode;
    }

    const poseData = AUDIENCE_POSES[currentPose] || AUDIENCE_POSES.dance;

    // Living motion values
    const sway = useRef(new Animated.Value(0)).current;
    const bounce = useRef(new Animated.Value(0)).current;

    // ── Frame Animation ──
    useEffect(() => {
        const timer = setTimeout(() => {
            const nextFrame = frameIndex + 1;
            if (nextFrame >= poseData.frameCount) {
                setFrameIndex(0);
                if (mode === 'auto') {
                    setSequenceIndex(prev => (prev + 1) % SEQUENCE.length);
                }
            } else {
                setFrameIndex(nextFrame);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [frameIndex, mode, poseData.frameCount]);

    // Reset frame on pose change
    useEffect(() => {
        setFrameIndex(0);
        setSequenceIndex(0);
    }, [mode]);

    // ── Subtle Living Motion ──
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(sway, {
                    toValue: 2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(sway, {
                    toValue: -2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bounce, {
                    toValue: -2,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(bounce, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const frame = poseData.frames[frameIndex];
    if (!frame) return null;

    const aspectRatio = frame.w / frame.h;
    const displayWidth = size * aspectRatio;
    const displayHeight = size;

    return (
        <View style={styles.outerWrapper}>
            <View style={styles.shadow} />
            <Animated.View
                style={[
                    styles.characterWrap,
                    {
                        width: displayWidth,
                        height: displayHeight,
                        transform: [
                            { translateX: sway },
                            { translateY: bounce },
                        ],
                    },
                ]}
            >
                <SpriteFrame
                    source={AUDIENCE_IMAGE}
                    sheetWidth={AUDIENCE_SHEET_SIZE.width}
                    sheetHeight={AUDIENCE_SHEET_SIZE.height}
                    sourceX={frame.x}
                    sourceY={frame.y}
                    frameWidth={frame.w}
                    frameHeight={frame.h}
                    displayWidth={displayWidth}
                    displayHeight={displayHeight}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    characterWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadow: {
        position: 'absolute',
        bottom: 2,
        width: 80,
        height: 12,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
});
