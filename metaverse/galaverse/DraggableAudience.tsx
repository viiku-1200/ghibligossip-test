// ═══════════════════════════════════════════════════════════════
// DraggableAudience.tsx — Canva-style draggable audience member
// ═══════════════════════════════════════════════════════════════
// Each audience character can be dragged anywhere in the audience
// room. A minimum gap is enforced so characters never overlap.

import React, { useRef, useCallback } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import AudienceController from './AudienceController';
import type { AudienceMode } from './AudienceControlsPanel';

const MIN_GAP = 70; // Minimum pixel distance between any two characters

interface Position {
    x: number;
    y: number;
}

interface DraggableAudienceProps {
    id: number;
    mode: AudienceMode;
    size: number;
    initialX: number;
    initialY: number;
    zIndex: number;
    // Shared ref to all positions so we can enforce gap
    allPositions: React.MutableRefObject<Record<number, Position>>;
    roomWidth: number;
    roomHeight: number;
}

export default function DraggableAudience({
    id,
    mode,
    size,
    initialX,
    initialY,
    zIndex,
    allPositions,
    roomWidth,
    roomHeight,
}: DraggableAudienceProps) {
    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
    const currentPos = useRef<Position>({ x: initialX, y: initialY });
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Register initial position
    allPositions.current[id] = { x: initialX, y: initialY };

    const enforceGap = useCallback((newX: number, newY: number): Position => {
        let finalX = newX;
        let finalY = newY;

        // Check distance to every other character
        for (const [otherId, otherPos] of Object.entries(allPositions.current)) {
            if (Number(otherId) === id) continue;

            const dx = finalX - otherPos.x;
            const dy = finalY - otherPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MIN_GAP && dist > 0) {
                // Push away from the other character
                const angle = Math.atan2(dy, dx);
                finalX = otherPos.x + Math.cos(angle) * MIN_GAP;
                finalY = otherPos.y + Math.sin(angle) * MIN_GAP;
            } else if (dist === 0) {
                // Exactly on top — nudge right
                finalX += MIN_GAP;
            }
        }

        // Clamp within room bounds
        const halfSize = size * 0.3;
        finalX = Math.max(-halfSize, Math.min(roomWidth - halfSize, finalX));
        finalY = Math.max(0, Math.min(roomHeight - size * 0.5, finalY));

        return { x: finalX, y: finalY };
    }, [id, size, roomWidth, roomHeight, allPositions]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                // Lift up effect
                Animated.spring(scaleAnim, {
                    toValue: 1.12,
                    useNativeDriver: true,
                    tension: 150,
                    friction: 5,
                }).start();

                // Set offset to current position
                pan.setOffset({
                    x: currentPos.current.x,
                    y: currentPos.current.y,
                });
                pan.setValue({ x: 0, y: 0 });
            },

            onPanResponderMove: (_evt, gestureState) => {
                const rawX = currentPos.current.x + gestureState.dx;
                const rawY = currentPos.current.y + gestureState.dy;
                const corrected = enforceGap(rawX, rawY);

                // Update the shared positions map in real-time
                allPositions.current[id] = corrected;

                pan.setOffset({ x: 0, y: 0 });
                pan.setValue({ x: corrected.x, y: corrected.y });
            },

            onPanResponderRelease: (_evt, gestureState) => {
                // Drop down effect
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 150,
                    friction: 8,
                }).start();

                pan.flattenOffset();

                const rawX = currentPos.current.x + gestureState.dx;
                const rawY = currentPos.current.y + gestureState.dy;
                const finalPos = enforceGap(rawX, rawY);

                currentPos.current = finalPos;
                allPositions.current[id] = finalPos;

                // Snap to final position smoothly
                Animated.spring(pan, {
                    toValue: finalPos,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 7,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.draggable,
                {
                    zIndex: zIndex + 10,
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                        { scale: scaleAnim },
                    ],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <AudienceController mode={mode} size={size} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    draggable: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
});
