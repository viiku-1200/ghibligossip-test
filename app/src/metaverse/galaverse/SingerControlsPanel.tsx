// ═══════════════════════════════════════════════════════════════
// SingerControlsPanel.tsx — Glassmorphic side controls
// ═══════════════════════════════════════════════════════════════
// Matches anime.html's .singer-controls-panel: glassmorphic panel
// on the left side with Auto/Singing/Movement/Emotion/Special.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { height: SH } = Dimensions.get('window');
const HALF_H = SH / 2;

export type SingerMode = 'auto' | 'singing' | 'movement' | 'emotion' | 'special';

interface SingerControlsPanelProps {
    activeMode: SingerMode;
    onModeChange: (mode: SingerMode) => void;
}

const MODES: { key: SingerMode; label: string }[] = [
    { key: 'auto', label: 'Auto' },
    { key: 'singing', label: 'Singing' },
    { key: 'movement', label: 'Movement' },
    { key: 'emotion', label: 'Emotion' },
    { key: 'special', label: 'Special' },
];

export default function SingerControlsPanel({ activeMode, onModeChange }: SingerControlsPanelProps) {
    const [expanded, setExpanded] = React.useState(false);

    if (!expanded) {
        return (
            <TouchableOpacity 
                style={styles.collapsedBtn} 
                activeOpacity={0.8}
                onPress={() => setExpanded(true)}
            >
                <Text style={styles.collapsedBtnText}>SINGER</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.panel}>
            <TouchableOpacity onPress={() => setExpanded(false)} activeOpacity={0.8}>
                <Text style={styles.title}>SINGER ▾</Text>
            </TouchableOpacity>
            {MODES.map(({ key, label }) => (
                <TouchableOpacity
                    key={key}
                    style={[styles.btn, activeMode === key && styles.btnActive]}
                    onPress={() => onModeChange(key)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.btnText, activeMode === key && styles.btnTextActive]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const PANEL_HEIGHT = 220; // approximate total panel height

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        top: 110, // Positioned just below the viewer count in the header
        right: 20, // Aligned with the header's right padding
        zIndex: 20,
        width: 105,
        backgroundColor: 'rgba(15, 10, 25, 0.65)', // Deeper, richer glass
        borderRadius: 18,
        padding: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.4)', // Subtle gold border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    collapsedBtn: {
        position: 'absolute',
        top: 110, // Same position as expanded panel
        right: 20, // Aligned with the header's right padding
        zIndex: 20,
        backgroundColor: 'rgba(212, 175, 55, 0.12)', // Subtle gold glass
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.5)',
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    collapsedBtnText: {
        color: '#d4af37',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    title: {
        color: '#d4af37', // Gold title
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 12,
        textShadowColor: 'rgba(212, 175, 55, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    btn: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        marginBottom: 8,
    },
    btnActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.15)', // Gold tinted glow
        borderColor: 'rgba(212, 175, 55, 0.8)',
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    btnText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    btnTextActive: {
        color: '#d4af37', // Gold text
        fontWeight: '800',
        textShadowColor: 'rgba(212, 175, 55, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
});
