// ═══════════════════════════════════════════════════════════════
// LiveChatOverlay.tsx — Instagram Live-style transparent chat
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';

const { height: SH } = Dimensions.get('window');

// ── Types ──
interface ChatMessage {
    id: string;
    username: string;
    text: string;
    isVip: boolean;
    isSystem: boolean;
    timestamp: number;
}

// ── Fake usernames for demo ──
const USERNAMES = [
    'VIPKing', 'CoolGirl', 'MusicLover', 'NightOwl', 'StarGazer',
    'DJVibes', 'PartyQueen', 'BeatDrop', 'NeonDream', 'GoldRush',
    'LuxLife', 'VibeCheck', 'ClubKing', 'DanceStar', 'MoonChild',
];

const MESSAGES = [
    'This is fire! 🔥', 'Love this song 🎵', 'Amazing vibes ✨',
    'Singer is incredible!', 'Best party ever 🎉', 'Wow!!',
    'Can we get a dance break? 💃', 'VIP life 👑', 'So good!',
    'I love this place!', 'Turn it up! 🔊', 'Yesss!! 🙌',
    'Champagne time 🍾', 'Who is this singer?!', 'Stunning performance',
    'This room is everything', 'VIP vibes only 💎', 'Obsessed 😍',
];

const SYSTEM_MESSAGES = [
    '✦ @{user} joined the VIP room',
    '✦ @{user} sent 🌹 Rose!',
    '✦ @{user} sent 🍾 Champagne!',
    '✦ @{user} is now following the singer',
];

let messageCounter = 0;

function generateMessage(): ChatMessage {
    messageCounter++;
    const isSystem = Math.random() < 0.15; // 15% system messages
    const isVip = !isSystem && Math.random() < 0.2; // 20% VIP users
    const username = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];

    let text: string;
    if (isSystem) {
        const template = SYSTEM_MESSAGES[Math.floor(Math.random() * SYSTEM_MESSAGES.length)];
        text = template.replace('{user}', username);
    } else {
        text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    }

    return {
        id: `msg-${messageCounter}-${Date.now()}`,
        username,
        text,
        isVip,
        isSystem,
        timestamp: Date.now(),
    };
}

// ── Single Chat Bubble ──
function ChatBubble({ item }: { item: ChatMessage }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    if (item.isSystem) {
        return (
            <Animated.View style={[styles.systemMsg, { opacity: fadeAnim }]}>
                <Text style={styles.systemText}>{item.text}</Text>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                styles.chatBubble,
                item.isVip && styles.chatBubbleVip,
                { opacity: fadeAnim },
            ]}
        >
            <Text style={styles.chatUsername}>
                {item.isVip && <Text style={styles.vipBadge}>👑 </Text>}
                <Text style={item.isVip ? styles.vipName : styles.normalName}>
                    @{item.username}
                </Text>
            </Text>
            <Text style={styles.chatText}>{item.text}</Text>
        </Animated.View>
    );
}

// ── Main Component ──
interface LiveChatOverlayProps {
    visible?: boolean;
}

export default function LiveChatOverlay({ visible = true }: LiveChatOverlayProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const flatListRef = useRef<FlatList>(null);

    // Auto-generate messages
    useEffect(() => {
        if (!visible) return;

        // Seed with a few initial messages
        const initial: ChatMessage[] = [];
        for (let i = 0; i < 4; i++) {
            initial.push(generateMessage());
        }
        setMessages(initial);

        // Add new messages every 2-5 seconds
        const interval = setInterval(() => {
            setMessages(prev => {
                const updated = [...prev, generateMessage()];
                // Keep max 30 messages
                if (updated.length > 30) {
                    return updated.slice(updated.length - 30);
                }
                return updated;
            });
        }, 2000 + Math.random() * 3000);

        return () => clearInterval(interval);
    }, [visible]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    if (!visible) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatBubble item={item} />}
                showsVerticalScrollIndicator={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        bottom: 155, // Above the reaction bar
        width: '55%', // Left half of screen
        height: SH * 0.28, // ~28% of screen
        zIndex: 50,
        paddingLeft: 12,
    },
    list: {
        flex: 1,
    },
    listContent: {
        justifyContent: 'flex-end',
        paddingVertical: 8,
    },

    // ── Chat Bubbles ──
    chatBubble: {
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 6,
        maxWidth: '95%',
        alignSelf: 'flex-start',
    },
    chatBubbleVip: {
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        borderWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    chatUsername: {
        marginBottom: 2,
    },
    normalName: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        fontWeight: '700',
    },
    vipName: {
        color: '#d4af37',
        fontSize: 11,
        fontWeight: '800',
    },
    vipBadge: {
        fontSize: 10,
    },
    chatText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        lineHeight: 16,
    },

    // ── System Messages ──
    systemMsg: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 6,
    },
    systemText: {
        color: 'rgba(233, 213, 255, 0.7)',
        fontSize: 11,
        fontStyle: 'italic',
    },
});
