import React, { useState, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import SpriteFrame from './SpriteFrame';

const COMEDIAN_IMAGE = require('../anime_image/comedi_sprite_sheet.png');

// 1024 x 512 -> 8 cols, 4 rows (128x128 per frame)
const FRAME_W = 1024 / 8;
const FRAME_H = 512 / 4;

const createRow = (rowIdx: number) => {
    return {
        frameCount: 8,
        frames: Array.from({ length: 8 }, (_, i) => ({
            x: i * FRAME_W,
            y: rowIdx * FRAME_H,
            w: FRAME_W,
            h: FRAME_H
        }))
    };
};

export const COMEDIAN_POSES: Record<string, any> = {
    talking: createRow(0),
    laughing: createRow(1),
    dodging: createRow(2),
    bowing: createRow(3),
    
    // Aliases to match the current inputs
    idle: createRow(0),
    sing: createRow(0),
    dance: createRow(1),
    gesture: createRow(0),
    special: createRow(1),
    auto: createRow(0),
};

interface ComedianControllerProps {
    mode: string;
    size?: number;
}

export default function ComedianController({ mode = 'talking', size = 240 }: ComedianControllerProps) {
    const [frameIndex, setFrameIndex] = useState(0);

    // Map mode to poses
    const poseData = COMEDIAN_POSES[mode] || COMEDIAN_POSES.talking;

    // Living motion values
    const bob = useRef(new Animated.Value(0)).current;

    // Frame Animation
    useEffect(() => {
        const timer = setTimeout(() => {
            const nextFrame = frameIndex + 1;
            if (nextFrame >= poseData.frameCount) {
                setFrameIndex(0);
            } else {
                setFrameIndex(nextFrame);
            }
        }, 120); // 120ms per frame for smooth 8-frame animation
        return () => clearTimeout(timer);
    }, [frameIndex, mode, poseData.frameCount]);

    // Reset frame on pose change
    useEffect(() => {
        setFrameIndex(0);
    }, [mode]);

    // Subtle Living Motion (Breathing)
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bob, { toValue: -3, duration: 1500, useNativeDriver: true }),
                Animated.timing(bob, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const currentFrame = poseData.frames[frameIndex];

    const aspectRatio = currentFrame.h / currentFrame.w;
    const displayWidth = size;
    const displayHeight = size * aspectRatio;

    return (
        <Animated.View style={{ transform: [{ translateY: bob }] }}>
            <SpriteFrame
                source={COMEDIAN_IMAGE}
                sheetWidth={1024}
                sheetHeight={512}
                sourceX={currentFrame.x}
                sourceY={currentFrame.y}
                frameWidth={currentFrame.w}
                frameHeight={currentFrame.h}
                displayWidth={displayWidth}
                displayHeight={displayHeight}
            />
        </Animated.View>
    );
}
