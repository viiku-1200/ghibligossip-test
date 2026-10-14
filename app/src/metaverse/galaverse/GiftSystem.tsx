// ═══════════════════════════════════════════════════════════════
// GiftSystem.tsx — Premium Gift Panel + Flying Animations
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Gift Data ──
interface Gift {
    id: string;
    emoji: string;
    name: string;
    price: string;
    color: string;
}

const GIFTS: Gift[] = [
    { id: 'clap', emoji: '👏', name: 'Clap', price: 'FREE', color: '#fff' },
    { id: 'rose', emoji: '🌹', name: 'Rose', price: '₹50', color: '#ff4d6d' },
    { id: 'beer', emoji: '🍺', name: 'Beer', price: '₹50', color: '#f9a825' },
    { id: 'champagne', emoji: '🍾', name: 'Champagne', price: '₹200', color: '#d4af37' },
    { id: 'diamond', emoji: '💎', name: 'Diamond', price: '₹500', color: '#00bfff' },
    { id: 'crown', emoji: '👑', name: 'Spotlight', price: '₹1,000', color: '#d4af37' },
];

// ── Flying Gift Animation ──
function FlyingGift({ emoji, onComplete }: { emoji: string; onComplete: () => void }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.3)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const targetX = (Math.random() - 0.5) * SW * 0.6;

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -SH * 0.5,
                duration: 1800,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(translateX, {
                    toValue: targetX * 0.5,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: targetX,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.5,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.8,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(1200),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1800,
                useNativeDriver: true,
            }),
        ]).start(() => onComplete());
    }, []);

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '25deg'],
    });

    return (
        <Animated.View
            style={[
                styles.flyingGift,
                {
                    transform: [
                        { translateY },
                        { translateX },
                        { scale },
                        { rotate },
                    ],
                    opacity,
                },
            ]}
        >
            <Text style={styles.flyingGiftEmoji}>{emoji}</Text>
        </Animated.View>
    );
}

// ── Confetti Particle ──
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
    const translateY = useRef(new Animated.Value(-50)).current;
    const translateX = useRef(new Animated.Value((Math.random() - 0.5) * SW)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(translateY, {
                    toValue: SH * 0.6,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(rotation, {
                    toValue: Math.random() * 4,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.delay(1800),
                    Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
                ]),
            ]),
        ]).start();
    }, []);

    const rotate = rotation.interpolate({
        inputRange: [0, 4],
        outputRange: ['0deg', '1440deg'],
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 0,
                left: SW / 2,
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: color,
                transform: [{ translateX }, { translateY }, { rotate }],
                opacity,
            }}
        />
    );
}

// ── Main Component ──
interface GiftSystemProps {
    onGiftSent?: (giftId: string) => void;
}

export default function GiftSystem({ onGiftSent }: GiftSystemProps) {
    const [panelVisible, setPanelVisible] = useState(false);
    const [flyingGifts, setFlyingGifts] = useState<{ id: number; emoji: string }[]>([]);
    const [confetti, setConfetti] = useState<{ id: number; color: string; delay: number }[]>([]);
    const slideAnim = useRef(new Animated.Value(0)).current;
    let giftIdCounter = useRef(0);

    const openPanel = useCallback(() => {
        setPanelVisible(true);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    }, []);

    const closePanel = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setPanelVisible(false));
    }, []);

    const sendGift = useCallback((gift: Gift) => {
        giftIdCounter.current++;
        const newId = giftIdCounter.current;

        // Add flying gift
        setFlyingGifts(prev => [...prev, { id: newId, emoji: gift.emoji }]);

        // Champagne and Crown trigger confetti
        if (gift.id === 'champagne' || gift.id === 'crown') {
            const confettiColors = ['#d4af37', '#ff3d9d', '#a855f7', '#00bfff', '#fff', '#ff4d6d'];
            const particles = Array.from({ length: 25 }, (_, i) => ({
                id: newId * 100 + i,
                color: confettiColors[i % confettiColors.length],
                delay: Math.random() * 600,
            }));
            setConfetti(prev => [...prev, ...particles]);

            // Clear confetti after 3s
            setTimeout(() => {
                setConfetti(prev => prev.filter(p => !particles.find(pp => pp.id === p.id)));
            }, 3500);
        }

        // Notify parent
        onGiftSent?.(gift.id);
        closePanel();
    }, [onGiftSent, closePanel]);

    const removeFlyingGift = useCallback((id: number) => {
        setFlyingGifts(prev => prev.filter(g => g.id !== id));
    }, []);

    const panelTranslateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [350, 0],
    });

    return (
        <>
            {/* ── Flying Gifts Layer ── */}
            {flyingGifts.map(fg => (
                <FlyingGift
                    key={fg.id}
                    emoji={fg.emoji}
                    onComplete={() => removeFlyingGift(fg.id)}
                />
            ))}

            {/* ── Confetti Layer ── */}
            {confetti.map(c => (
                <ConfettiParticle key={c.id} delay={c.delay} color={c.color} />
            ))}

            {/* ── Gift Button (replaces the 🎁 in the bottom bar) ── */}
            <TouchableOpacity style={styles.giftTrigger} onPress={openPanel} activeOpacity={0.7}>
                <Text style={styles.giftTriggerIcon}>🎁</Text>
            </TouchableOpacity>

            {/* ── Gift Panel Modal ── */}
            {panelVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={closePanel}
                    />
                    <Animated.View
                        style={[
                            styles.panel,
                            { transform: [{ translateY: panelTranslateY }] },
                        ]}
                    >
                        {/* Handle */}
                        <View style={styles.panelHandle} />

                        {/* Title */}
                        <Text style={styles.panelTitle}>🎁 Music Gifts</Text>

                        {/* Gift Grid */}
                        <View style={styles.giftGrid}>
                            {GIFTS.map((gift) => (
                                <TouchableOpacity
                                    key={gift.id}
                                    style={styles.giftItem}
                                    activeOpacity={0.7}
                                    onPress={() => sendGift(gift)}
                                >
                                    <View style={[styles.giftIconWrap, { shadowColor: gift.color }]}>
                                        <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                                    </View>
                                    <Text style={styles.giftName}>{gift.name}</Text>
                                    <Text style={[
                                        styles.giftPrice,
                                        gift.price === 'FREE' && styles.giftPriceFree,
                                    ]}>
                                        {gift.price}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    // ── Gift Trigger Button ──
    giftTrigger: {
        position: 'absolute',
        bottom: 28,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.6)',
        zIndex: 110,
    },
    giftTriggerIcon: {
        fontSize: 20,
    },

    // ── Flying Gift ──
    flyingGift: {
        position: 'absolute',
        bottom: 120,
        left: SW / 2 - 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    flyingGiftEmoji: {
        fontSize: 36,
    },

    // ── Modal ──
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 150,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    // ── Panel ──
    panel: {
        backgroundColor: 'rgba(15, 10, 30, 0.95)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 14,
        borderTopWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    panelHandle: {
        width: 44,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: 18,
    },
    panelTitle: {
        color: '#d4af37',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 24,
    },

    // ── Gift Grid ──
    giftGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    giftItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 24,
    },
    giftIconWrap: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    giftEmoji: {
        fontSize: 28,
    },
    giftName: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 3,
    },
    giftPrice: {
        color: '#d4af37',
        fontSize: 11,
        fontWeight: '800',
    },
    giftPriceFree: {
        color: '#4ade80',
    },
});
