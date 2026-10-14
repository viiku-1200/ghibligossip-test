// ═══════════════════════════════════════════════════════════════
// RunwayControlsPanel.tsx — Upper Stage Glassmorphic Model Controls
// Matches the proven SingerControlsPanel architecture
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RunwayAction } from './RunwayModelController';

export type RunwayControlMode = RunwayAction | 'auto';

interface RunwayControlsPanelProps {
  activeMode: RunwayControlMode;
  onModeChange: (mode: RunwayControlMode) => void;
}

const MODES: { key: RunwayControlMode; label: string; icon: string }[] = [
  { key: 'auto',        label: 'Auto Show',  icon: '✨' },
  { key: 'walkForward', label: 'Walk Down',  icon: '🚶‍♀️' },
  { key: 'modelPose',   label: 'Vogue Pose', icon: '💃' },
  { key: 'flyingKiss',  label: 'Fly Kiss',   icon: '💋' },
  { key: 'turnAround',  label: 'Pivot Turn', icon: '🔄' },
  { key: 'wave',        label: 'Wave VIP',   icon: '👋' },
  { key: 'dance',       label: 'Dance',      icon: '🕺' },
  { key: 'laugh',       label: 'Laugh',      icon: '😄' },
  { key: 'walkBack',    label: 'Backstage',  icon: '🚪' },
];

export default function RunwayControlsPanel({
  activeMode,
  onModeChange,
}: RunwayControlsPanelProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedBtn}
        activeOpacity={0.8}
        onPress={() => setExpanded(true)}
      >
        <Text style={styles.collapsedBtnText}>MODEL ▾</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.panel}>
      <TouchableOpacity onPress={() => setExpanded(false)} activeOpacity={0.8}>
        <Text style={styles.title}>MODEL ▲</Text>
      </TouchableOpacity>
      {MODES.map(({ key, label, icon }) => (
        <TouchableOpacity
          key={key}
          style={[styles.btn, activeMode === key && styles.btnActive]}
          onPress={() => onModeChange(key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, activeMode === key && styles.btnTextActive]}>
            {icon} {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 95,
    right: 16,
    zIndex: 40,
    width: 120,
    backgroundColor: 'rgba(15, 10, 25, 0.88)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.45)',
    shadowColor: '#f5c518',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  collapsedBtn: {
    position: 'absolute',
    top: 95,
    right: 16,
    zIndex: 40,
    backgroundColor: 'rgba(20, 12, 35, 0.78)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.6)',
    shadowColor: '#f5c518',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  collapsedBtnText: {
    color: '#f5c518',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#f5c518',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  btn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnActive: {
    backgroundColor: 'rgba(255, 0, 127, 0.4)',
    borderWidth: 1,
    borderColor: '#ff007f',
  },
  btnText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  btnTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
});
