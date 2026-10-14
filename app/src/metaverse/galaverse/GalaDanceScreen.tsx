// ═══════════════════════════════════════════════════════════════
// GalaDanceScreen.tsx — Main Galaverse Dance Room Screen
// ═══════════════════════════════════════════════════════════════
// Exact match to anime.html layout:
// • Split-screen: upper stage + lower audience
// • Singer with auto-cycling sprite animation
// • Glassmorphic side controls panel
// • Audience character on bottom half
// • Header overlay + reaction bar + input area

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import RoomRenderer from './RoomRenderer';
import SingerController from './SingerController';
import SingerControlsPanel, { SingerMode } from './SingerControlsPanel';
import AudienceControlsPanel, { AudienceMode } from './AudienceControlsPanel';
import AudienceController from './AudienceController';
import DraggableAudience from './DraggableAudience';
import LiveChatOverlay from './LiveChatOverlay';
import GiftSystem from './GiftSystem';

const { width: SW, height: SH } = Dimensions.get('window');
const HALF_H = SH / 2;
const PURPLE_ACCENT = '#a855f7';

// VIP Crowd — 8 draggable audience slots
// Initial positions spread evenly across the audience room
const INITIAL_SLOTS = [
    // Back Row (smaller, higher up)
    { id: 1, size: 120, x: SW * 0.02, y: HALF_H * 0.08, z: 1 },
    { id: 2, size: 120, x: SW * 0.26, y: HALF_H * 0.05, z: 1 },
    { id: 3, size: 120, x: SW * 0.50, y: HALF_H * 0.08, z: 1 },
    { id: 4, size: 120, x: SW * 0.74, y: HALF_H * 0.05, z: 1 },
    // Front Row (larger, lower)
    { id: 5, size: 170, x: SW * 0.05, y: HALF_H * 0.42, z: 2 },
    { id: 6, size: 170, x: SW * 0.30, y: HALF_H * 0.45, z: 2 },
    { id: 7, size: 170, x: SW * 0.55, y: HALF_H * 0.42, z: 2 },
    { id: 8, size: 170, x: SW * 0.78, y: HALF_H * 0.45, z: 2 },
];

interface GalaDanceScreenProps {
    onBack: () => void;
}

// ── Emoji → Reaction Mappings (outside component to avoid re-creation) ──
const EMOJI_TO_AUDIENCE: Record<string, AudienceMode> = {
    '👏': 'cheer',
    '💃': 'dance',
    '🔥': 'special',
    '❤️': 'cheer',
    '😂': 'special',
    '👋': 'dance',
};

const EMOJI_TO_SINGER: Record<string, SingerMode> = {
    '👏': 'emotion',
    '💃': 'movement',
    '🔥': 'special',
    '❤️': 'emotion',
    '😂': 'singing',
    '👋': 'movement',
};

export default function GalaDanceRoom({ onBack }: GalaDanceScreenProps) {
    // ── All hooks at the very top, always in the same order ──
    const [singerMode, setSingerMode] = useState<SingerMode>('auto');
    const [audienceMode, setAudienceMode] = useState<AudienceMode>('auto');
    const [chatMessage, setChatMessage] = useState('');
    const allPositions = useRef<Record<number, { x: number; y: number }>>({});
    const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleEmojiReaction = useCallback((emoji: string) => {
        const audMode = EMOJI_TO_AUDIENCE[emoji];
        const singMode = EMOJI_TO_SINGER[emoji];
        if (audMode) setAudienceMode(audMode);
        if (singMode) setSingerMode(singMode);

        if (reactionTimer.current) clearTimeout(reactionTimer.current);
        reactionTimer.current = setTimeout(() => {
            setAudienceMode('auto');
            setSingerMode('auto');
        }, 4000);
    }, []);

    const handleGiftSent = useCallback((giftId: string) => {
        if (giftId === 'crown' || giftId === 'diamond') {
            setSingerMode('special');
            setAudienceMode('cheer');
        } else if (giftId === 'champagne') {
            setSingerMode('emotion');
            setAudienceMode('cheer');
        } else if (giftId === 'beer') {
            setAudienceMode('drink');
        } else if (giftId === 'rose') {
            setSingerMode('emotion');
        } else {
            setAudienceMode('cheer');
        }

        if (reactionTimer.current) clearTimeout(reactionTimer.current);
        reactionTimer.current = setTimeout(() => {
            setAudienceMode('auto');
            setSingerMode('auto');
        }, 5000);
    }, []);

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" />

            {/* ═══ SPLIT-SCREEN ROOM BACKGROUND ═══ */}
            <RoomRenderer />

            {/* ═══ SINGER ON STAGE (upper half, bottom:13% from divider) ═══ */}
            <View style={styles.singerArea}>
                <SingerController mode={singerMode} size={220} />
            </View>

            {/* ═══ SINGER CONTROLS PANEL (left side of upper half) ═══ */}
            <SingerControlsPanel
                activeMode={singerMode}
                onModeChange={setSingerMode}
            />

            {/* ═══ AUDIENCE CONTROLS (left side of lower half) ═══ */}
            <View style={styles.audienceControlsContainer}>
                <AudienceControlsPanel
                    activeMode={audienceMode}
                    onModeChange={setAudienceMode}
                />
            </View>

            {/* ═══ DRAGGABLE VIP CROWD (lower half) ═══ */}
            <View style={styles.audienceArea}>
                {INITIAL_SLOTS.map((slot) => (
                    <DraggableAudience
                        key={slot.id}
                        id={slot.id}
                        mode={audienceMode}
                        size={slot.size}
                        initialX={slot.x}
                        initialY={slot.y}
                        zIndex={slot.z}
                        allPositions={allPositions}
                        roomWidth={SW}
                        roomHeight={HALF_H}
                    />
                ))}
            </View>

            {/* ═══ OVERLAY: Header (top) ═══ */}
            <View style={styles.header} pointerEvents="box-none">
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <Text style={styles.headerTitle}>GALAVERSE <Text style={styles.headerTitleVip}>VIP</Text></Text>
                </View>

                <View style={styles.viewerPill}>
                    <Text style={styles.viewerIcon}>👁</Text>
                    <Text style={styles.viewerCount}>1,248</Text>
                </View>
            </View>

            {/* ═══ LIVE CHAT OVERLAY (left side) ═══ */}
            <LiveChatOverlay />

            {/* ═══ OVERLAY: Reactions + Input (bottom) ═══ */}
            <View style={styles.bottomOverlay} pointerEvents="box-none">
                {/* Quick Reaction Bar */}
                <View style={styles.reactionBar}>
                    {['👏', '💃', '🔥', '❤️', '😂', '👋'].map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            style={styles.reactionBtn}
                            activeOpacity={0.6}
                            onPress={() => handleEmojiReaction(emoji)}
                        >
                            <Text style={styles.reactionEmoji}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <View style={{ width: 44 }} /> {/* Spacer for absolute Gift Button */}
                    <TextInput
                        style={styles.inputBox}
                        placeholder="Say something..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={chatMessage}
                        onChangeText={setChatMessage}
                        onSubmitEditing={() => setChatMessage('')}
                        returnKeyType="send"
                    />
                    <TouchableOpacity 
                        style={styles.sendBtn}
                        onPress={() => setChatMessage('')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.sendIcon}>➤</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ═══ GIFT SYSTEM (button + panel + animations) ═══ */}
            <GiftSystem onGiftSent={handleGiftSent} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0012',
    },

    // ── Singer positioned in upper half ──
    singerArea: {
        position: 'absolute',
        bottom: HALF_H + (HALF_H * 0.25), // Adjusted to 25% to center on stage
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 5,
    },

    // ── Audience positioned in lower half ──
    audienceArea: {
        position: 'absolute',
        top: HALF_H, // Fills the entire lower half
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 8,
    },
    audienceControlsContainer: {
        position: 'absolute',
        top: HALF_H, // Starts exactly at the divider
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        pointerEvents: 'box-none',
    },

    // ── Header (absolute, top of screen) ──
    header: {
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(20,15,30,0.6)',
        borderWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.4)', // Gold accent
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    backText: {
        color: '#d4af37',
        fontSize: 24,
        fontWeight: '300',
        marginTop: -2,
    },
    headerCenter: {
        alignItems: 'center',
        gap: 6,
    },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 50, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 0, 50, 0.4)',
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ff003c',
        shadowColor: '#ff003c',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    liveText: {
        color: '#ff003c',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 2,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: 4,
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    headerTitleVip: {
        color: '#d4af37', // Luxury Gold
        fontWeight: '700',
        fontStyle: 'italic',
    },
    viewerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20,15,30,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    viewerIcon: {
        fontSize: 12,
    },
    viewerCount: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // ── Bottom overlay (reactions + input) ──
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 25,
        zIndex: 100,
    },
    reactionBar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    reactionBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(25, 15, 35, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    reactionEmoji: {
        fontSize: 22,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
    },
    inputBox: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(25, 15, 35, 0.7)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 18,
        color: '#ffffff',
        fontSize: 13,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#d4af37', // Luxury Gold
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    sendIcon: {
        color: '#1a1025', // Dark icon on gold background
        fontSize: 18,
        fontWeight: '900',
    },
});
