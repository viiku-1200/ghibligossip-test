import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

// -- All available poses --
export type CharacterPose = 'idle' | 'dance' | 'laugh' | 'drink' | 'clap' | 'hug' | 'wave' | 'sing';

// -- Map pose names to image files --
// When you have real images, replace the require() paths below
const POSE_IMAGES: Record<CharacterPose, ImageSourcePropType> = {
    idle:  require('./anime_image/comedian.png'),   // Replace with char_idle.png
    dance: require('./anime_image/comedian.png'),   // Replace with char_dance.png
    laugh: require('./anime_image/comedian.png'),   // Replace with char_laugh.png
    drink: require('./anime_image/comedian.png'),   // Replace with char_drink.png
    clap:  require('./anime_image/comedian.png'),   // Replace with char_clap.png
    hug:   require('./anime_image/comedian.png'),   // Replace with char_hug.png
    wave:  require('./anime_image/comedian.png'),   // Replace with char_wave.png
    sing:  require('./anime_image/comedian.png'),   // Replace with char_sing.png
};

interface AnimeCharacterProps {
    /** Current pose to display */
    pose: CharacterPose;
    /** Width of the character container */
    width?: number;
    /** Height of the character container */
    height?: number;
    /** Optional extra styles */
    style?: StyleProp<ViewStyle>;
    /** Auto-return to idle after this many ms (0 = never) */
    autoIdleMs?: number;
    /** Callback when pose returns to idle */
    onReturnToIdle?: () => void;
}

export default function AnimeCharacter({
    pose,
    width = 100,
    height = 150,
    style,
    autoIdleMs = 3000,
    onReturnToIdle,
}: AnimeCharacterProps) {
    const [currentPose, setCurrentPose] = useState<CharacterPose>(pose);

    // -- Animation values --
    const bobY = useRef(new Animated.Value(0)).current;
    const swayX = useRef(new Animated.Value(0)).current;
    const shakeY = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // -- When pose prop changes, animate transition --
    useEffect(() => {
        // Fade out, swap image, fade in
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        ]).start(() => {
            setCurrentPose(pose);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
            ]).start();
        });

        // Auto-return to idle after timeout
        if (pose !== 'idle' && autoIdleMs > 0) {
            const timer = setTimeout(() => {
                onReturnToIdle?.();
            }, autoIdleMs);
            return () => clearTimeout(timer);
        }
    }, [pose]);

    // -- Continuous ambient animation based on current pose --
    useEffect(() => {
        // Stop all previous animations
        bobY.stopAnimation();
        swayX.stopAnimation();
        shakeY.stopAnimation();
        bobY.setValue(0);
        swayX.setValue(0);
        shakeY.setValue(0);

        if (currentPose === 'idle' || currentPose === 'sing') {
            // Gentle breathing bob (up and down slowly)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bobY, { toValue: -3, duration: 1500, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: 0, duration: 1500, useNativeDriver: true }),
                ])
            ).start();
        }

        if (currentPose === 'dance') {
            // Side-to-side sway + bounce
            Animated.loop(
                Animated.sequence([
                    Animated.timing(swayX, { toValue: 8, duration: 300, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: -6, duration: 150, useNativeDriver: true }),
                    Animated.timing(swayX, { toValue: -8, duration: 300, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: 0, duration: 150, useNativeDriver: true }),
                ])
            ).start();
        }

        if (currentPose === 'laugh') {
            // Fast vertical shake (shaking with laughter)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shakeY, { toValue: -4, duration: 80, useNativeDriver: true }),
                    Animated.timing(shakeY, { toValue: 4, duration: 80, useNativeDriver: true }),
                    Animated.timing(shakeY, { toValue: -2, duration: 80, useNativeDriver: true }),
                    Animated.timing(shakeY, { toValue: 0, duration: 80, useNativeDriver: true }),
                    Animated.delay(200),
                ])
            ).start();
        }

        if (currentPose === 'clap') {
            // Quick pulse scale (like clapping impact)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 0.97, duration: 150, useNativeDriver: true }),
                ])
            ).start();
        }

        if (currentPose === 'drink') {
            // Slight tilt (tilting head back to drink)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bobY, { toValue: -5, duration: 1000, useNativeDriver: true }),
                    Animated.timing(bobY, { toValue: 0, duration: 1000, useNativeDriver: true }),
                    Animated.delay(500),
                ])
            ).start();
        }

        if (currentPose === 'wave') {
            // Side-to-side gentle wave
            Animated.loop(
                Animated.sequence([
                    Animated.timing(swayX, { toValue: 5, duration: 400, useNativeDriver: true }),
                    Animated.timing(swayX, { toValue: -5, duration: 400, useNativeDriver: true }),
                ])
            ).start();
        }

        if (currentPose === 'hug') {
            // Gentle breathing + slight scale up (warm feeling)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, { toValue: 1.03, duration: 800, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [currentPose]);

    return (
        <Animated.View
            style={[
                { width, height },
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
            <Image
                source={POSE_IMAGES[currentPose]}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
            />
        </Animated.View>
    );
}
