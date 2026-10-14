// ═══════════════════════════════════════════════════════════════
// AudienceControlsPanel.tsx — Premium glassmorphic side panel
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

export type AudienceMode = 'auto' | 'dance' | 'cheer' | 'drink' | 'special';

interface Props {
    activeMode: AudienceMode;
    onModeChange: (mode: AudienceMode) => void;
}

const MODES: AudienceMode[] = ['auto', 'dance', 'cheer', 'drink', 'special'];

export default function AudienceControlsPanel({ activeMode, onModeChange }: Props) {
    const [expanded, setExpanded] = React.useState(false);

    if (!expanded) {
        return (
            <TouchableOpacity 
                style={styles.collapsedBtn} 
                activeOpacity={0.8}
                onPress={() => setExpanded(true)}
            >
                <Text style={styles.collapsedBtnText}>AUDIENCE</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setExpanded(false)} activeOpacity={0.8}>
                <Text style={styles.title}>AUDIENCE ▾</Text>
            </TouchableOpacity>
            <View style={styles.buttonList}>
                {MODES.map((mode) => {
                    const isActive = activeMode === mode;
                    return (
                        <TouchableOpacity
                            key={mode}
                            onPress={() => onModeChange(mode)}
                            activeOpacity={0.7}
                            style={[
                                styles.btn,
                                isActive && styles.btnActive
                            ]}
                        >
                            <Text style={[
                                styles.btnText,
                                isActive && styles.btnTextActive
                            ]}>
                                {mode.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '25%', 
        right: '4%',
        zIndex: 20,
        width: 105,
        backgroundColor: 'rgba(15, 10, 25, 0.65)', // Deeper, richer glass
        borderRadius: 18,
        padding: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(168, 85, 247, 0.4)', // Subtle magenta/purple border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    collapsedBtn: {
        position: 'absolute',
        top: '25%', // Same position as expanded panel
        right: 15,
        zIndex: 20,
        backgroundColor: 'rgba(168, 85, 247, 0.12)', // Subtle magenta glass
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: 'rgba(168, 85, 247, 0.5)',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    collapsedBtnText: {
        color: '#e9d5ff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    title: {
        color: '#e9d5ff', // Light purple title
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 12,
        textShadowColor: 'rgba(168, 85, 247, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    buttonList: {
        gap: 8,
    },
    btn: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    btnActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)', // Purple tinted glow
        borderColor: 'rgba(168, 85, 247, 0.8)',
        shadowColor: '#a855f7',
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
        color: '#e9d5ff',
        fontWeight: '800',
        textShadowColor: 'rgba(168, 85, 247, 1)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
});
