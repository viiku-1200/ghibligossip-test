import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ImageBackground,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dummy users to simulate chat
const BOT_USERS = [
    { name: 'LuxGoddess', isVip: true, color: '#d4af37', initial: 'L' },
    { name: 'TrendSetter', isVip: false, color: '#a855f7', initial: 'T' },
    { name: 'VelvetRose', isVip: true, color: '#00e5ff', initial: 'V' },
    { name: 'StyleGuru', isVip: false, color: '#ff6b6b', initial: 'S' },
];

const BOT_MESSAGES = [
    "OMG, the outfits look incredible! ✨",
    "Just arrived! The energy is amazing 😊",
    "Ready for the show! Love this vibe! 👑",
    "That dress on stage is stunning!",
    "Who else is here for the exclusive drop?",
    "Love the lighting in here 🔥",
];

// Stage avatars with styled appearances
const STAGE_AVATARS = [
    { id: 'a1', initial: 'A', color: '#a855f7', x: '15%', y: '65%', scale: 0.85 },
    { id: 'a2', initial: 'M', color: '#00e5ff', x: '28%', y: '72%', scale: 0.9 },
    { id: 'a3', initial: 'K', color: '#ff6b6b', x: '68%', y: '72%', scale: 0.9 },
    { id: 'a4', initial: 'R', color: '#4ade80', x: '82%', y: '65%', scale: 0.85 },
];

interface ChatMessage {
    id: string;
    sender: string;
    isVip: boolean;
    color: string;
    initial: string;
    text: string;
    time: string;
}

interface LoungeScreenProps {
    roomId: string;
    onBack: () => void;
}

export default function LoungeScreen({ roomId, onBack }: LoungeScreenProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [showGifts, setShowGifts] = useState(false);
    const [flyingGift, setFlyingGift] = useState<{ id: number; emoji: string } | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Animations
    const giftY = useRef(new Animated.Value(0)).current;
    const giftX = useRef(new Animated.Value(0)).current;
    const giftOpacity = useRef(new Animated.Value(0)).current;
    const giftScale = useRef(new Animated.Value(0.5)).current;
    const spotlightPulse = useRef(new Animated.Value(0.6)).current;
    const stageGlow = useRef(new Animated.Value(0.3)).current;
    const sparkle1 = useRef(new Animated.Value(0)).current;
    const sparkle2 = useRef(new Animated.Value(0)).current;
    const sparkle3 = useRef(new Animated.Value(0)).current;

    // Spotlight pulse animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(spotlightPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(spotlightPulse, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(stageGlow, { toValue: 0.6, duration: 3000, useNativeDriver: true }),
                Animated.timing(stageGlow, { toValue: 0.2, duration: 3000, useNativeDriver: true }),
            ])
        ).start();

        // Sparkle animations (staggered)
        const animateSparkle = (sparkle: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(sparkle, { toValue: 1, duration: 600, useNativeDriver: true }),
                    Animated.timing(sparkle, { toValue: 0, duration: 600, useNativeDriver: true }),
                    Animated.delay(1500),
                ])
            ).start();
        };
        animateSparkle(sparkle1, 0);
        animateSparkle(sparkle2, 800);
        animateSparkle(sparkle3, 1600);
    }, []);

    // Auto-playing fake chat messages
    useEffect(() => {
        let messageCount = 0;
        const interval = setInterval(() => {
            if (messageCount > 10) return;

            const randomUser = BOT_USERS[Math.floor(Math.random() * BOT_USERS.length)];
            const randomText = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];

            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                sender: randomUser.name,
                isVip: randomUser.isVip,
                color: randomUser.color,
                initial: randomUser.initial,
                text: randomText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, newMessage]);
            messageCount++;
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'You',
            isVip: false,
            color: '#fff',
            initial: 'Y',
            text: inputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
    };

    const sendGift = (emoji: string) => {
        setShowGifts(false);

        // Set up flying gift with scale animation
        setFlyingGift({ id: Date.now(), emoji });
        giftY.setValue(200);
        giftX.setValue(-50);
        giftOpacity.setValue(0);
        giftScale.setValue(0.3);

        // Dramatic gift animation
        Animated.parallel([
            Animated.timing(giftY, {
                toValue: -150,
                duration: 2500,
                useNativeDriver: true,
            }),
            Animated.timing(giftX, {
                toValue: 100,
                duration: 2500,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(giftOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(giftScale, { toValue: 1.3, duration: 600, useNativeDriver: true }),
                ]),
                Animated.timing(giftScale, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(800),
                Animated.timing(giftOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]),
        ]).start(() => {
            setFlyingGift(null);
        });

        // System message
        const sysMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'System',
            isVip: false,
            color: '#d4af37',
            initial: '✦',
            text: `You sent a ${emoji} gift!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, sysMsg]);
    };

    // Select background based on roomId
    const getBackgroundImage = () => {
        if (roomId === 'comedy') return require('./anime_image/room_comedy.jpg');
        if (roomId === 'acoustic') return require('./anime_image/room_acoustic.jpg');
        if (roomId === 'dj') return require('./anime_image/room_dj.jpg');
        if (roomId === 'vip') return require('./anime_image/room_vip.jpg');
        return require('./anime_image/golden_door.jpg');
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isSystem = item.sender === 'System';
        const isYou = item.sender === 'You';

        return (
            <View style={[
                styles.messageRow,
                isSystem && styles.systemMessageRow,
            ]}>
                {/* Avatar with gradient border */}
                <View style={[
                    styles.avatarCircle,
                    { borderColor: item.color },
                    item.isVip && styles.avatarCircleVip,
                ]}>
                    <Text style={[styles.avatarInitial, { color: item.color }]}>
                        {item.initial}
                    </Text>
                </View>

                {/* Message bubble */}
                <View style={[
                    styles.messageBubble,
                    item.isVip && styles.messageBubbleVip,
                    isSystem && styles.messageBubbleSystem,
                    isYou && styles.messageBubbleYou,
                ]}>
                    <View style={styles.messageHeader}>
                        <Text style={[styles.senderName, { color: item.color }]}>
                            @{item.sender}
                        </Text>
                        {item.isVip && (
                            <View style={styles.msgVipBadge}>
                                <Text style={styles.msgVipIcon}>👑</Text>
                                <Text style={styles.msgVipText}>VIP</Text>
                            </View>
                        )}
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.messageText}>{item.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Premium Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerTitlePill}>
                        <View style={styles.headerLiveDot} />
                        <Text style={styles.headerTitle}>LUSSOVI BACKSTAGE</Text>
                    </View>
                    <Text style={styles.headerUsers}>30/40 viewers</Text>
                </View>

                <View style={styles.headerVipBadge}>
                    <Text style={styles.headerVipIcon}>👑</Text>
                    <Text style={styles.headerVipText}>VIP</Text>
                </View>
            </View>

            {/* Top Half - Chat Area */}
            <View style={styles.chatContainer}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Gold gradient divider */}
            <View style={styles.stageDivider}>
                <View style={styles.stageDividerLine} />
                <View style={styles.stageDividerDiamond}>
                    <Text style={styles.stageDividerIcon}>◆</Text>
                </View>
                <View style={styles.stageDividerLine} />
            </View>

            {/* Bottom Half - 2D Stage Area */}
            <View style={styles.stageContainer}>
                <ImageBackground
                    source={getBackgroundImage()}
                    style={styles.stageBackground}
                    resizeMode="cover"
                >
                    {/* Stage overlays for depth */}
                    <View style={styles.stageOverlayDark} />

                    {/* Spotlight center glow */}
                    <Animated.View
                        style={[
                            styles.spotlightGlow,
                            { opacity: spotlightPulse },
                        ]}
                    />

                    {/* Stage floor reflection */}
                    <View style={styles.stageFloor} />

                    {/* STAGING Badge */}
                    <View style={styles.stageBadge}>
                        <Text style={styles.stageBadgeText}>✦ STAGING ✦</Text>
                    </View>

                    {/* Ambient gold sparkles */}
                    <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkle1 }]}>
                        <Text style={styles.sparkleText}>✦</Text>
                    </Animated.View>
                    <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkle2 }]}>
                        <Text style={styles.sparkleText}>✧</Text>
                    </Animated.View>
                    <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkle3 }]}>
                        <Text style={styles.sparkleText}>✦</Text>
                    </Animated.View>

                    {/* Stage Avatars */}
                    <View style={styles.avatarStageArea}>
                        {/* Side avatars */}
                        {STAGE_AVATARS.map((avatar) => (
                            <View
                                key={avatar.id}
                                style={[
                                    styles.stageAvatar,
                                    {
                                         left: avatar.x as any,
                                         top: avatar.y as any,
                                         transform: [{ scale: avatar.scale }],
                                     },
                                ]}
                            >
                                <View style={[styles.stageAvatarCircle, { borderColor: avatar.color }]}>
                                    <Text style={[styles.stageAvatarInitial, { color: avatar.color }]}>
                                        {avatar.initial}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* Center stage performer */}
                        <View style={styles.centerStage}>
                            <Animated.View
                                style={[
                                    styles.centerStageGlow,
                                    { opacity: stageGlow },
                                ]}
                            />
                            <View style={styles.centerStageAvatar}>
                                <View style={styles.centerStageAvatarInner}>
                                    <Text style={styles.centerStageInitial}>★</Text>
                                </View>
                            </View>
                            <View style={styles.onStageBadge}>
                                <Text style={styles.onStageText}>ON STAGE</Text>
                            </View>
                        </View>
                    </View>

                    {/* Flying Gift Animation */}
                    {flyingGift && (
                        <Animated.View
                            style={[
                                styles.flyingGift,
                                {
                                    opacity: giftOpacity,
                                    transform: [
                                        { translateX: giftX },
                                        { translateY: giftY },
                                        { scale: giftScale },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.flyingGiftEmoji}>{flyingGift.emoji}</Text>
                        </Animated.View>
                    )}
                </ImageBackground>
            </View>

            {/* Premium Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <TouchableOpacity
                    style={styles.giftBtn}
                    onPress={() => setShowGifts(!showGifts)}
                >
                    <Text style={styles.giftBtnIcon}>🎁</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cameraBtn}>
                    <Text style={styles.cameraBtnIcon}>📷</Text>
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                    />
                </View>

                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                    <Text style={styles.sendBtnIcon}>➤</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>

            {/* Premium Gift Bottom Sheet */}
            {showGifts && (
                <View style={styles.giftSheet}>
                    <View style={styles.giftSheetHandle} />
                    <Text style={styles.giftSheetTitle}>Send a Gift</Text>
                    <View style={styles.giftGrid}>
                        {[
                            { emoji: '🌹', name: 'Rose', price: '₹50' },
                            { emoji: '🍾', name: 'Champagne', price: '₹200' },
                            { emoji: '💎', name: 'Diamond', price: '₹500' },
                            { emoji: '👑', name: 'Spotlight', price: '₹1,000' },
                        ].map((gift) => (
                            <TouchableOpacity
                                key={gift.name}
                                style={styles.giftItem}
                                onPress={() => sendGift(gift.emoji)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.giftItemInner}>
                                    <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                                    <Text style={styles.giftName}>{gift.name}</Text>
                                    <View style={styles.giftPricePill}>
                                        <Text style={styles.giftPrice}>{gift.price}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },

    // Premium Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#d4af37',
        fontSize: 22,
        fontWeight: '300',
        marginTop: -1,
    },
    headerCenter: {
        alignItems: 'center',
        gap: 4,
    },
    headerTitlePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    headerLiveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ff3b3b',
        // Glow
        shadowColor: '#ff3b3b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        color: '#d4af37',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
    headerUsers: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        fontWeight: '500',
    },
    headerVipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.4)',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        gap: 4,
        // Gold glow
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    headerVipIcon: {
        fontSize: 12,
    },
    headerVipText: {
        color: '#d4af37',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },

    // Chat area
    chatContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    chatContent: {
        padding: 14,
        gap: 4,
    },

    // Message styling
    messageRow: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 10,
    },
    systemMessageRow: {
        justifyContent: 'center',
    },

    // Avatar with gradient border
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircleVip: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        // VIP glow
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 3,
    },
    avatarInitial: {
        fontSize: 14,
        fontWeight: '800',
    },

    // Glass message bubble
    messageBubble: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 14,
        borderTopLeftRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    messageBubbleVip: {
        backgroundColor: 'rgba(212, 175, 55, 0.06)',
        borderColor: 'rgba(212, 175, 55, 0.15)',
    },
    messageBubbleSystem: {
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    messageBubbleYou: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    senderName: {
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.3,
    },
    msgVipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    msgVipIcon: {
        fontSize: 8,
    },
    msgVipText: {
        color: '#d4af37',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    timeText: {
        color: 'rgba(255, 255, 255, 0.25)',
        fontSize: 10,
        marginLeft: 'auto',
    },
    messageText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '400',
    },

    // Gold gradient divider
    stageDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    stageDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(212, 175, 55, 0.3)',
    },
    stageDividerDiamond: {
        paddingHorizontal: 12,
    },
    stageDividerIcon: {
        color: '#d4af37',
        fontSize: 8,
        opacity: 0.6,
    },

    // Stage area
    stageContainer: {
        height: '38%',
    },
    stageBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stageOverlayDark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    // Spotlight glow in center
    spotlightGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        top: '20%',
        alignSelf: 'center',
    },

    // Stage floor reflection
    stageFloor: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    // Stage badge
    stageBadge: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.4)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 12,
        // Gold glow
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    stageBadgeText: {
        color: '#d4af37',
        fontSize: 10,
        letterSpacing: 3,
        fontWeight: '800',
    },

    // Ambient sparkles
    sparkle: {
        position: 'absolute',
    },
    sparkle1: {
        top: '25%',
        left: '15%',
    },
    sparkle2: {
        top: '35%',
        right: '12%',
    },
    sparkle3: {
        top: '55%',
        left: '40%',
    },
    sparkleText: {
        color: '#d4af37',
        fontSize: 14,
        opacity: 0.6,
    },

    // Stage avatars
    avatarStageArea: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    stageAvatar: {
        position: 'absolute',
    },
    stageAvatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        // Glow
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    stageAvatarInitial: {
        fontSize: 18,
        fontWeight: '800',
    },

    // Center stage performer
    centerStage: {
        position: 'absolute',
        top: '35%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    centerStageGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        top: -20,
        alignSelf: 'center',
    },
    centerStageAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(212, 175, 55, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        // Gold glow
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    centerStageAvatarInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerStageInitial: {
        color: '#d4af37',
        fontSize: 28,
        fontWeight: '800',
    },
    onStageBadge: {
        marginTop: 8,
        backgroundColor: '#d4af37',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        // Gold glow
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 5,
    },
    onStageText: {
        color: '#1a0f00',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },

    // Flying gift
    flyingGift: {
        position: 'absolute',
        zIndex: 100,
        alignSelf: 'center',
    },
    flyingGiftEmoji: {
        fontSize: 60,
        // Glow effect
        textShadowColor: 'rgba(212, 175, 55, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },

    // Premium input area
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 175, 55, 0.1)',
        gap: 8,
    },
    giftBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    giftBtnIcon: {
        fontSize: 20,
    },
    cameraBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBtnIcon: {
        fontSize: 18,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    input: {
        color: '#fff',
        fontSize: 14,
        padding: 0,
        fontWeight: '400',
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        // Gold glow
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    sendBtnIcon: {
        color: '#d4af37',
        fontSize: 18,
        fontWeight: '600',
    },

    // Premium gift sheet
    giftSheet: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingTop: 14,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        borderBottomWidth: 0,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    giftSheetHandle: {
        width: 36,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 14,
    },
    giftSheetTitle: {
        color: '#d4af37',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 1,
    },
    giftGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 8,
    },

    // Glass gift cards
    giftItem: {
        flex: 1,
    },
    giftItemInner: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)',
        gap: 6,
    },
    giftEmoji: {
        fontSize: 32,
    },
    giftName: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        fontWeight: '600',
    },
    giftPricePill: {
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    giftPrice: {
        color: '#d4af37',
        fontSize: 11,
        fontWeight: '800',
    },
});
