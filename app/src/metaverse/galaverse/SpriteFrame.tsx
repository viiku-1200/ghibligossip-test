// ═══════════════════════════════════════════════════════════════
// SpriteFrame.tsx — Clips a single frame from any sprite sheet
// ═══════════════════════════════════════════════════════════════
// This is the core building block for extracting frames from
// dancefloor_1.png, female_singer.png, and f1.png.

import React from 'react';
import { View, Image, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

interface SpriteFrameProps {
    /** The sprite sheet image source */
    source: ImageSourcePropType;
    /** Full sprite sheet width in pixels */
    sheetWidth: number;
    /** Full sprite sheet height in pixels */
    sheetHeight: number;
    /** X position of the frame on the sheet */
    sourceX: number;
    /** Y position of the frame on the sheet */
    sourceY: number;
    /** Width of the frame on the sheet */
    frameWidth: number;
    /** Height of the frame on the sheet */
    frameHeight: number;
    /** Display width (how big to render on screen) */
    displayWidth: number;
    /** Display height (how big to render on screen) */
    displayHeight: number;
    /** Optional container style */
    style?: StyleProp<ViewStyle>;
}

export default function SpriteFrame({
    source,
    sheetWidth,
    sheetHeight,
    sourceX,
    sourceY,
    frameWidth,
    frameHeight,
    displayWidth,
    displayHeight,
    style,
}: SpriteFrameProps) {
    // Calculate scale factor from source frame to display size
    const scaleX = displayWidth / frameWidth;
    const scaleY = displayHeight / frameHeight;

    return (
        <View
            style={[
                {
                    width: displayWidth,
                    height: displayHeight,
                    overflow: 'hidden',
                    position: 'relative',
                },
                style,
            ]}
        >
            <Image
                source={source}
                style={{
                    position: 'absolute',
                    width: sheetWidth * scaleX,
                    height: sheetHeight * scaleY,
                    left: -(sourceX * scaleX),
                    top: -(sourceY * scaleY),
                }}
            />
        </View>
    );
}
