import React, { useState, useEffect } from 'react';
import { View, Image, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export interface SpriteAnimatorProps {
    spriteSheet: ImageSourcePropType;
    frameWidth: number;
    frameHeight: number;
    frameCount: number;
    row: number;
    fps?: number;
    loop?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function SpriteAnimator({
    spriteSheet,
    frameWidth,
    frameHeight,
    frameCount,
    row,
    fps = 10,
    loop = true,
    style,
}: SpriteAnimatorProps) {
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        setCurrentFrame(0);
        if (frameCount <= 1) return;

        const interval = setInterval(() => {
            setCurrentFrame(prev => {
                if (prev >= frameCount - 1) return loop ? 0 : prev;
                return prev + 1;
            });
        }, 1000 / fps);
        
        return () => clearInterval(interval);
    }, [frameCount, fps, loop, row]);

    return (
        <View style={[{ width: frameWidth, height: frameHeight, overflow: 'hidden' }, style]}>
            <Image
                source={spriteSheet}
                style={{
                    position: 'absolute',
                    left: -(currentFrame * frameWidth),
                    top: -(row * frameHeight),
                }}
            />
        </View>
    );
}
