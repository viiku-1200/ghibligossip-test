import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import SpriteAnimator from './SpriteAnimator';

// -- All available poses --
export type CharacterPose = 'idle' | 'dance' | 'laugh' | 'drink' | 'clap' | 'hug' | 'wave' | 'sing';

export type CharacterType = 'singerBoy' | 'singerGirl' | 'audienceGirl';

interface PoseData {
    row: number;
    frameCount: number;
    fps: number;
}

// -- Map character type to its sprite sheet --
const SPRITE_SHEETS: Record<CharacterType, ImageSourcePropType> = {
    singerBoy: require('./anime_image/comedian.png'), // UPDATE THIS TO REAL SPRITE SHEET
    singerGirl: require('./anime_image/comedian.png'), // UPDATE THIS TO REAL SPRITE SHEET
    audienceGirl: require('./anime_image/comedian.png'), // UPDATE THIS TO REAL SPRITE SHEET
};

// -- Map pose to sprite sheet row and frame count --
const POSE_MAP: Record<CharacterPose, PoseData> = {
    idle:  { row: 0, frameCount: 4, fps: 8 },
    dance: { row: 1, frameCount: 6, fps: 12 },
    laugh: { row: 2, frameCount: 4, fps: 10 },
    drink: { row: 3, frameCount: 5, fps: 6 },
    clap:  { row: 4, frameCount: 4, fps: 10 },
    hug:   { row: 5, frameCount: 4, fps: 6 },
    wave:  { row: 6, frameCount: 4, fps: 8 },
    sing:  { row: 7, frameCount: 6, fps: 10 },
};

interface SpriteCharacterProps {
    pose: CharacterPose;
    characterType?: CharacterType;
    frameWidth?: number;
    frameHeight?: number;
    style?: StyleProp<ViewStyle>;
    autoIdleMs?: number;
    onReturnToIdle?: () => void;
}

export default function SpriteCharacter({
    pose,
    characterType = 'singerBoy',
    frameWidth = 100,
    frameHeight = 150,
    style,
    autoIdleMs = 3000,
    onReturnToIdle,
}: SpriteCharacterProps) {
    const [currentPose, setCurrentPose] = useState<CharacterPose>(pose);

    const bobY = useRef(new Animated.Value(0)).current;
    const swayX = useRef(new Animated.Value(0)).current;
    const shakeY = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.8, duration: 50, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 50, useNativeDriver: true }),
        ]).start(() => {
            setCurrentPose(pose);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
            ]).start();
        });

        if (pose !== 'idle' && autoIdleMs > 0) {
            const timer = setTimeout(() => {
                onReturnToIdle?.();
            }, autoIdleMs);
            return () => clearTimeout(timer);
        }
    }, [pose]);

    useEffect(() => {
        bobY.stopAnimation();
        swayX.stopAnimation();
        shakeY.stopAnimation();
        bobY.setValue(0);
        swayX.setValue(0);
        shakeY.setValue(0);

        if (currentPose === 'idle' || currentPose === 'sing') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bobY, { toValue: -3, duration: 1500, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: 0, duration: 1500, useNativeDriver: true }),
                ])
            ).start();
        }

        if (currentPose === 'dance') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(swayX, { toValue: 8, duration: 300, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: -6, duration: 150, useNativeDriver: true }),
                    Animated.timing(swayX, { toValue: -8, duration: 300, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: 0, duration: 150, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [currentPose]);

    const currentPoseData = POSE_MAP[currentPose] || POSE_MAP['idle'];

    return (
        <Animated.View
            style={[
                { width: frameWidth, height: frameHeight },
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: Animated.add(bobY, shakeY) },
                        { translateX: swayX },
                        { scale: scaleAnim },
                    ],
                },
                style,
            ]}
        >
            <SpriteAnimator
                spriteSheet={SPRITE_SHEETS[characterType]}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                row={currentPoseData.row}
                frameCount={currentPoseData.frameCount}
                fps={currentPoseData.fps}
                loop={true}
                style={{ width: '100%', height: '100%' }}
            />
        </Animated.View>
    );
}
