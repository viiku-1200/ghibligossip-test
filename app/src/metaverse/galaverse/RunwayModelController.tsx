// ═══════════════════════════════════════════════════════════════
// RunwayModelController.tsx — Animated Haute Couture Runway Model
// Slices the 8-row sprite sheet: model_runway_sprites.jpg
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import SpriteFrame from './SpriteFrame';

const MODEL_SPRITESHEET = require('../anime_image/model_runway_sprites.png');

export type RunwayAction =
  | 'walkForward'
  | 'walkBack'
  | 'turnAround'
  | 'modelPose'
  | 'wave'
  | 'flyingKiss'
  | 'dance'
  | 'laugh';

// Exact sheet metrics
const SHEET_WIDTH = 1024;
const SHEET_HEIGHT = 1011;
const LABEL_OFFSET_X = 114; // Skips leftmost label badge column
const FRAME_W = (SHEET_WIDTH - LABEL_OFFSET_X) / 8; // 113.75px per frame

interface RowMeta {
  y: number;
  h: number;
  frameCount: number;
  frameDuration: number;
}

const ROW_METADATA: Record<RunwayAction, RowMeta> = {
  walkForward: { y: 0,   h: 139, frameCount: 8, frameDuration: 130 },
  walkBack:    { y: 139, h: 138, frameCount: 8, frameDuration: 130 },
  turnAround:  { y: 277, h: 134, frameCount: 8, frameDuration: 140 },
  modelPose:   { y: 411, h: 126, frameCount: 8, frameDuration: 150 },
  wave:        { y: 537, h: 105, frameCount: 8, frameDuration: 140 },
  flyingKiss:  { y: 642, h: 103, frameCount: 8, frameDuration: 150 },
  dance:       { y: 745, h: 126, frameCount: 8, frameDuration: 130 },
  laugh:       { y: 871, h: 140, frameCount: 8, frameDuration: 140 },
};

interface RunwayModelControllerProps {
  action: RunwayAction;
  size?: number; // Base display height
  onActionComplete?: () => void;
  isCatwalkSequenceActive?: boolean;
}

export default function RunwayModelController({
  action = 'modelPose',
  size = 200,
  onActionComplete,
  isCatwalkSequenceActive = false,
}: RunwayModelControllerProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  // Perspective 3D Runway values
  // translateY moves the model down the catwalk runway: -50 (top/back) to 35 (front edge)
  const catwalkY = useRef(new Animated.Value(20)).current;
  // scaleAnim scales from 0.68 (distant backstage) to 1.05 (front of catwalk)
  const catwalkScale = useRef(new Animated.Value(1.0)).current;
  // Living breathing motion
  const breathingBob = useRef(new Animated.Value(0)).current;

  const currentMeta = ROW_METADATA[action] || ROW_METADATA.modelPose;

  // Frame cycling loop
  useEffect(() => {
    const timer = setTimeout(() => {
      setFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= currentMeta.frameCount) {
          if (onActionComplete) onActionComplete();
          return 0;
        }
        return next;
      });
    }, currentMeta.frameDuration);

    return () => clearTimeout(timer);
  }, [frameIndex, action, currentMeta, onActionComplete]);

  // Reset frame when action changes
  useEffect(() => {
    setFrameIndex(0);
  }, [action]);

  // Living breathing bob animation
  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingBob, {
          toValue: -2.5,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathingBob, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, [breathingBob]);

  // Catwalk 3D perspective locomotion based on action
  useEffect(() => {
    if (action === 'walkForward') {
      // Walk down the runway toward the front edge
      Animated.parallel([
        Animated.timing(catwalkY, {
          toValue: 20,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(catwalkScale, {
          toValue: 1.05,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (action === 'walkBack') {
      // Walk back up the catwalk toward the backstage curtain
      Animated.parallel([
        Animated.timing(catwalkY, {
          toValue: -32,
          duration: 2400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(catwalkScale, {
          toValue: 0.68,
          duration: 2400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // For stationary actions (pose, wave, kiss, dance, laugh, turn),
      // keep model positioned near the front of the stage spotlight
      Animated.parallel([
        Animated.timing(catwalkY, {
          toValue: 18,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(catwalkScale, {
          toValue: 1.0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [action, catwalkY, catwalkScale]);

  // Calculate current frame crop
  const sourceX = LABEL_OFFSET_X + frameIndex * FRAME_W;
  const sourceY = currentMeta.y;
  const frameWidth = FRAME_W;
  const frameHeight = currentMeta.h;

  const displayHeight = size;
  const displayWidth = size * (frameWidth / frameHeight);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: Animated.add(catwalkY, breathingBob) },
            { scale: catwalkScale },
          ],
        },
      ]}
    >
      <SpriteFrame
        source={MODEL_SPRITESHEET}
        sheetWidth={SHEET_WIDTH}
        sheetHeight={SHEET_HEIGHT}
        sourceX={sourceX}
        sourceY={sourceY}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        displayWidth={displayWidth}
        displayHeight={displayHeight}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff007f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
});
