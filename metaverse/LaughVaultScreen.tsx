import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Image,
    ImageBackground,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';

import AudienceController from './galaverse/AudienceController';
import ComedianController from './galaverse/ComedianController';
import AudienceControlsPanel from './galaverse/AudienceControlsPanel';
import DraggableAudience from './galaverse/DraggableAudience';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Comedy-themed bot users ──
const BOT_USERS = [
    { name: 'ComedyKing', isVip: true, color: '#e8a23a', initial: 'C' },
    { name: 'HecklerJoe', isVip: false, color: '#ff6b6b', initial: 'H' },
    { name: 'LaughRiot', isVip: true, color: '#f59e0b', initial: 'L' },
    { name: 'StageLight', isVip: false, color: '#c96d30', initial: 'S' },
    { name: 'PunchLine', isVip: false, color: '#fb923c', initial: 'P' },
];

const BOT_MESSAGES = [
    "That joke killed me 💀😂",
    "I can't breathe 🤣🤣🤣",
    "Roast him harder! 🔥🔥",
    "Bro that delivery was PERFECT 👏",
    "Someone call an ambulance I'm dying 😂",
    "The crowd is LOSING it 🎤🔥",
    "This man woke up and chose violence 💀",
    "EMOTIONAL DAMAGE! 😭😂",
    "Throw the tomato 🍅🍅🍅",
    "Best set tonight, no cap 🙌",
    "My stomach hurts from laughing 😂",
    "This guy needs a Netflix special fr 🎬",
];

// ── Audience avatars base config (6 users) ──
// We define their base sizes and IDs, but positions will be randomized organically on spawn
const AUDIENCE_AVATARS_BASE = [
    { id: 1, initial: 'R', color: '#ff6b6b', size: 90 },
    { id: 2, initial: 'D', color: '#f59e0b', size: 85 },
    { id: 3, initial: 'N', color: '#fb923c', size: 105 },
    { id: 4, initial: 'A', color: '#4ade80', size: 100 },
    { id: 5, initial: 'K', color: '#c084fc', size: 90 },
    { id: 6, initial: 'M', color: '#38bdf8', size: 85 },
];

// ── Comedy-specific gifts ──
const COMEDY_GIFTS = [
    { emoji: '👏', name: 'Clap', price: 'FREE' },
    { emoji: '😂', name: 'LOL', price: '₹10' },
    { emoji: '🍅', name: 'Tomato', price: '₹20' },
    { emoji: '🍺', name: 'Beer', price: '₹50' },
    { emoji: '💋', name: 'Fly Kiss', price: '₹100' },
    { emoji: '🎤', name: 'Mic Drop', price: '₹200' },
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

interface LaughVaultScreenProps {
    onBack: () => void;
}

// ── Map reaction emojis to character poses ──
const EMOJI_TO_POSE: Record<string, any> = {
    '👏': 'cheer',
    '😂': 'special',
    '🔥': 'dance',
    '💀': 'special',
    '🍅': 'auto',
    '💋': 'special',
};

export default function LaughVaultScreen({ onBack }: LaughVaultScreenProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [showGifts, setShowGifts] = useState(false);
    const [flyingGift, setFlyingGift] = useState<{ id: number; emoji: string } | null>(null);
    const [floatingLOLs, setFloatingLOLs] = useState<{ id: number; x: number; emoji: string }[]>([]);
    const [comedianPose, setComedianPose] = useState<any>('sing');
    const [audiencePose, setAudiencePose] = useState<any>('auto');
    const flatListRef = useRef<FlatList>(null);
    const audiencePositions = useRef<Record<number, { x: number; y: number }>>({});
    
    // Store organic random positions so they only compute once
    const [spawnPositions] = useState(() => {
        const positions: { x: number, y: number }[] = [];
        const STAGE_H = SCREEN_HEIGHT * 0.6;
        
        // Helper to check collision with already placed avatars
        const isTooClose = (x: number, y: number) => {
            return positions.some(p => {
                const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
                return dist < 85; // Give them plenty of breathing room
            });
        };

        // Generate organic random spots in the lower half of the stage
        for (let i = 0; i < AUDIENCE_AVATARS_BASE.length; i++) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 150) {
                // X: stay well within the left and right edges
                const rx = (SCREEN_WIDTH * 0.15) + Math.random() * (SCREEN_WIDTH * 0.6);
                // Y: keep them higher up so they don't overlap the reaction bar at the bottom
                const ry = (STAGE_H * 0.45) + Math.random() * (STAGE_H * 0.2);
                
                if (!isTooClose(rx, ry)) {
                    positions.push({ x: rx, y: ry });
                    placed = true;
                }
                attempts++;
            }
            // Fallback if too crowded: space them in a neat row
            if (!placed) {
                positions.push({ x: SCREEN_WIDTH * 0.15 + (i * 45), y: STAGE_H * 0.5 });
            }
        }
        return positions;
    });

    // Animations
    const giftY = useRef(new Animated.Value(0)).current;
    const giftX = useRef(new Animated.Value(0)).current;
    const giftOpacity = useRef(new Animated.Value(0)).current;
    const giftScale = useRef(new Animated.Value(0.5)).current;
    const spotlightPulse = useRef(new Animated.Value(0.4)).current;
    const spotlightConeAnim = useRef(new Animated.Value(0.3)).current;
    const micGlow = useRef(new Animated.Value(0.5)).current;
    const micSway = useRef(new Animated.Value(0)).current;
    const comedianBob = useRef(new Animated.Value(0)).current;
    const sparkle1 = useRef(new Animated.Value(0)).current;
    const sparkle2 = useRef(new Animated.Value(0)).current;
    const sparkle3 = useRef(new Animated.Value(0)).current;
    const brickFlicker = useRef(new Animated.Value(0.15)).current;
    const candleFlicker = useRef(new Animated.Value(0.3)).current;
    const smokeDrift = useRef(new Animated.Value(0)).current;
    const cameraPan = useRef(new Animated.Value(0)).current;

    // ── Ambient animations ──
    useEffect(() => {
        // Warm spotlight breathing
        Animated.loop(
            Animated.sequence([
                Animated.timing(spotlightPulse, { toValue: 0.8, duration: 2200, useNativeDriver: true }),
                Animated.timing(spotlightPulse, { toValue: 0.4, duration: 2200, useNativeDriver: true }),
            ])
        ).start();

        // Spotlight cone glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(spotlightConeAnim, { toValue: 0.55, duration: 3000, useNativeDriver: true }),
                Animated.timing(spotlightConeAnim, { toValue: 0.2, duration: 3000, useNativeDriver: true }),
            ])
        ).start();

        // Mic stand glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(micGlow, { toValue: 0.9, duration: 1800, useNativeDriver: true }),
                Animated.timing(micGlow, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
            ])
        ).start();

        // Comedian subtle bobbing
        Animated.loop(
            Animated.sequence([
                Animated.timing(comedianBob, { toValue: -4, duration: 1500, useNativeDriver: true }),
                Animated.timing(comedianBob, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();

        // Brick wall ambient flicker (like dim cellar lighting)
        Animated.loop(
            Animated.sequence([
                Animated.timing(brickFlicker, { toValue: 0.25, duration: 4000, useNativeDriver: true }),
                Animated.timing(brickFlicker, { toValue: 0.12, duration: 4000, useNativeDriver: true }),
            ])
        ).start();

        // Mic Stand Sway
        Animated.loop(
            Animated.sequence([
                Animated.timing(micSway, { toValue: 2, duration: 4000, useNativeDriver: true }),
                Animated.timing(micSway, { toValue: -2, duration: 4000, useNativeDriver: true }),
            ])
        ).start();

        // Candle Flicker (fast, irregular)
        Animated.loop(
            Animated.sequence([
                Animated.timing(candleFlicker, { toValue: 0.8, duration: 100, useNativeDriver: true }),
                Animated.timing(candleFlicker, { toValue: 0.4, duration: 150, useNativeDriver: true }),
                Animated.timing(candleFlicker, { toValue: 0.9, duration: 80, useNativeDriver: true }),
                Animated.timing(candleFlicker, { toValue: 0.3, duration: 200, useNativeDriver: true }),
            ])
        ).start();

        // Camera Parallax (Breathing / panning the whole room)
        Animated.loop(
            Animated.sequence([
                Animated.timing(cameraPan, { toValue: 1, duration: 8000, useNativeDriver: true }),
                Animated.timing(cameraPan, { toValue: 0, duration: 8000, useNativeDriver: true }),
                Animated.timing(cameraPan, { toValue: -1, duration: 8000, useNativeDriver: true }),
                Animated.timing(cameraPan, { toValue: 0, duration: 8000, useNativeDriver: true }),
            ])
        ).start();

        // Smoke drift across stage
        Animated.loop(
            Animated.timing(smokeDrift, { toValue: 1, duration: 15000, useNativeDriver: true })
        ).start();

        // Sparkle animations (warm particles)
        const animateSparkle = (sparkle: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(sparkle, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(sparkle, { toValue: 0, duration: 500, useNativeDriver: true }),
                    Animated.delay(2000),
                ])
            ).start();
        };
        animateSparkle(sparkle1, 0);
        animateSparkle(sparkle2, 1000);
        animateSparkle(sparkle3, 2000);
    }, []);

    // ── Auto-playing comedy chat messages ──
    useEffect(() => {
        let messageCount = 0;
        const interval = setInterval(() => {
            if (messageCount > 12) return;

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
        }, 3500);

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

    // ── Floating LOL trigger (from audience reactions) ──
    useEffect(() => {
        const lolInterval = setInterval(() => {
            if (Math.random() > 0.5) {
                triggerFloatingLOL();
            }
        }, 5000);
        return () => clearInterval(lolInterval);
    }, []);

    const triggerFloatingLOL = (emojiStr?: string) => {
        const id = Date.now() + Math.random();
        const x = 20 + Math.random() * (SCREEN_WIDTH - 80);
        
        const emojis = ['😂', '🤣', '💀', '😭', '👏'];
        const selectedEmoji = emojiStr || emojis[Math.floor(Math.random() * emojis.length)];

        // ── Switch audience and comedian pose based on reaction emoji ──
        const newPose = EMOJI_TO_POSE[selectedEmoji];
        if (newPose) {
            setAudiencePose(newPose);
            
            // Map to Comedian's 4 actions
            if (selectedEmoji === '😂' || selectedEmoji === '🤣' || selectedEmoji === '💀') {
                setComedianPose('laughing');
            } else if (selectedEmoji === '🍅') {
                setComedianPose('dodging');
            } else if (selectedEmoji === '👏' || selectedEmoji === '💋') {
                setComedianPose('bowing');
            } else {
                setComedianPose('talking');
            }
        }

        setFloatingLOLs(prev => [...prev, { id, x, emoji: selectedEmoji }]);

        // Remove after animation and reset poses
        setTimeout(() => {
            setFloatingLOLs(prev => prev.filter(l => l.id !== id));
            setComedianPose('talking');
            setAudiencePose('auto');
        }, 2500);
    };

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

    const sendGift = (emoji: string, name: string) => {
        setShowGifts(false);

        // Handle comedian reaction for specific non-floating gifts
        if (emoji === '🍅') {
            setComedianPose('dodging');
            setTimeout(() => setComedianPose('talking'), 2500);
        }

        // If it's a clap, LOL, or kiss, trigger floating reactions
        if (emoji === '😂' || emoji === '👏' || emoji === '💋') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => triggerFloatingLOL(emoji), i * 300);
            }
        }

        // Flying gift animation
        setFlyingGift({ id: Date.now(), emoji });
        giftY.setValue(200);
        giftX.setValue(-50);
        giftOpacity.setValue(0);
        giftScale.setValue(0.3);

        Animated.parallel([
            Animated.timing(giftY, { toValue: -150, duration: 2500, useNativeDriver: true }),
            Animated.timing(giftX, { toValue: 100, duration: 2500, useNativeDriver: true }),
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
            color: '#e8a23a',
            initial: '✦',
            text: `You sent a ${emoji} ${name}!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, sysMsg]);
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isSystem = item.sender === 'System';
        const isYou = item.sender === 'You';

        return (
            <View style={[
                styles.messageRow,
                isSystem && styles.systemMessageRow,
            ]}>
                {/* Avatar */}
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
                                <Text style={styles.msgVipIcon}>🎙️</Text>
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
            {/* ═══ Premium Comedy Header ═══ */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerTitlePill}>
                        <View style={styles.headerLiveDot} />
                        <Text style={styles.headerTitle}>THE LAUGH VAULT</Text>
                    </View>
                    <Text style={styles.headerUsers}>28/40 viewers  ·  Open Mic Night</Text>
                </View>

                <View style={styles.headerReactionBtn}>
                    <Text style={styles.headerReactionIcon}>😂</Text>
                </View>
            </View>

            {/* ═══ Chat Area (Top Half) ═══ */}
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

            {/* ═══ Comedy Stage Divider ═══ */}
            <View style={styles.stageDivider}>
                <View style={styles.stageDividerLine} />
                <View style={styles.stageDividerBadge}>
                    <Text style={styles.stageDividerIcon}>🎙️</Text>
                    <Text style={styles.stageDividerLabel}>STAGE</Text>
                </View>
                <View style={styles.stageDividerLine} />
            </View>

            {/* ═══ Comedy Stage (Bottom Half) ═══ */}
            <View style={styles.stageContainer}>
                <Animated.View style={[
                    styles.cameraContainer,
                    {
                        transform: [
                            { translateX: cameraPan.interpolate({ inputRange: [-1, 1], outputRange: [-15, 15] }) },
                            { scale: cameraPan.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.05, 1.02, 1.05] }) }
                        ]
                    }
                ]}>
                    <ImageBackground
                        source={require('./anime_image/comedi_room.jpg')}
                        style={styles.stageBackground}
                        resizeMode="cover"
                    >
                        {/* Dark cellar overlay */}
                    <View style={styles.stageOverlayDark} />

                    {/* Exposed brick wall effect */}
                    <Animated.View style={[styles.brickWallOverlay, { opacity: brickFlicker }]} />

                    {/* Drifting Stage Smoke */}
                    <Animated.View style={[styles.smokeLayer, { 
                        opacity: 0.4,
                        transform: [{ translateX: smokeDrift.interpolate({ inputRange: [0, 1], outputRange: [-200, SCREEN_WIDTH] }) }] 
                    }]} />
                    <Animated.View style={[styles.smokeLayer, styles.smokeLayer2, { 
                        opacity: 0.2,
                        transform: [{ translateX: smokeDrift.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_WIDTH, -200] }) }] 
                    }]} />

                    {/* Warm spotlight cone from above */}
                    <Animated.View style={[styles.spotlightCone, { opacity: spotlightConeAnim }]} />

                    {/* Center spotlight glow on floor */}
                    <Animated.View style={[styles.spotlightFloor, { opacity: spotlightPulse }]} />

                    {/* Stage badge */}
                    <View style={styles.stageBadge}>
                        <Text style={styles.stageBadgeText}>✦ THE LAUGH VAULT ✦</Text>
                    </View>

                    {/* Warm ambient sparkles */}
                    <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkle1 }]}>
                        <Text style={styles.sparkleText}>✦</Text>
                    </Animated.View>
                    <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkle2 }]}>
                        <Text style={styles.sparkleText}>✧</Text>
                    </Animated.View>
                    <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkle3 }]}>
                        <Text style={styles.sparkleText}>✦</Text>
                    </Animated.View>

                    {/* ── Stage Area with Avatars ── */}
                    <View style={styles.avatarStageArea}>
                        {/* ── Comedian Avatar (center stage) ── */}
                        <View style={styles.centerStage}>
                            <Animated.View
                                style={[
                                    styles.comedianGlow,
                                    { opacity: spotlightPulse },
                                ]}
                            />
                            {/* Animated Comedian Sprite */}
                            <ComedianController
                                mode={comedianPose}
                                size={100}
                            />
                            <View style={styles.onMicBadge}>
                                <Text style={styles.onMicText}>ON MIC</Text>
                            </View>
                        </View>

                        {/* ── Audience as Anime Characters (Draggable) ── */}
                        {AUDIENCE_AVATARS_BASE.map((avatar, index) => (
                            <DraggableAudience
                                key={avatar.id}
                                id={avatar.id}
                                mode={audiencePose}
                                size={avatar.size}
                                initialX={spawnPositions[index].x}
                                initialY={spawnPositions[index].y}
                                zIndex={10 + avatar.id}
                                allPositions={audiencePositions}
                                roomWidth={SCREEN_WIDTH}
                                roomHeight={SCREEN_HEIGHT * 0.6}
                            />
                        ))}
                    </View>

                    {/* Wooden stage floor */}
                    <View style={styles.stageFloor} />
                    </ImageBackground>
                </Animated.View>

                {/* ── Floating LOL reactions (keep outside camera pan so they float straight up screen) ── */}
                {floatingLOLs.map((lol) => (
                    <FloatingLOL key={lol.id} x={lol.x} emoji={lol.emoji} />
                ))}

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
            </View>

            {/* ═══ Quick Reaction Bar ═══ */}
            <View style={styles.reactionBar}>
                {['👏', '😂', '🔥', '💀', '🍅', '💋'].map((emoji) => (
                    <TouchableOpacity
                        key={emoji}
                        style={styles.reactionBtn}
                        activeOpacity={0.6}
                        onPress={() => triggerFloatingLOL(emoji)}
                    >
                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ═══ Input Area ═══ */}
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

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Drop a joke..."
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

            {/* ═══ Comedy Gift Sheet ═══ */}
            {showGifts && (
                <View style={styles.giftSheet}>
                    <View style={styles.giftSheetHandle} />
                    <Text style={styles.giftSheetTitle}>🎤 Comedy Gifts</Text>
                    <View style={styles.giftGrid}>
                        {COMEDY_GIFTS.map((gift) => (
                            <TouchableOpacity
                                key={gift.name}
                                style={styles.giftItem}
                                onPress={() => sendGift(gift.emoji, gift.name)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.giftItemInner}>
                                    <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                                    <Text style={styles.giftName}>{gift.name}</Text>
                                    <View style={[
                                        styles.giftPricePill,
                                        gift.price === 'FREE' && styles.giftPriceFree,
                                    ]}>
                                        <Text style={[
                                            styles.giftPrice,
                                            gift.price === 'FREE' && styles.giftPriceTextFree,
                                        ]}>{gift.price}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
            {/* Audience Controls Panel */}
            <View style={styles.audienceControlsContainer} pointerEvents="box-none">
                <AudienceControlsPanel
                    activeMode={audiencePose}
                    onModeChange={(mode) => setAudiencePose(mode)}
                />
            </View>
        </SafeAreaView>
    );
}

// ── Floating LOL component ──
function FloatingLOL({ x, emoji }: { x: number; emoji: string }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: -120, duration: 2200, useNativeDriver: true }),
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.2, duration: 400, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 0.8, duration: 1800, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.delay(1400),
                Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[
            styles.floatingLOL,
            {
                left: x,
                transform: [{ translateY }, { scale }],
                opacity,
            },
        ]}>
            <Text style={styles.floatingLOLText}>{emoji}</Text>
        </Animated.View>
    );
}

// ── Color Palette ──
const AMBER = '#e8a23a';
const AMBER_LIGHT = '#f5c563';
const AMBER_WARM = '#c96d30';
const CELLAR_DARK = '#1a0e04';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CELLAR_DARK,
    },

    // ══════════════════════════════
    // PREMIUM HEADER
    // ══════════════════════════════
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(26, 14, 4, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(232, 162, 58, 0.2)',
    },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: {
        color: AMBER,
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
        backgroundColor: 'rgba(232, 162, 58, 0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.25)',
    },
    headerLiveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ff3b3b',
        shadowColor: '#ff3b3b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        color: AMBER,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
    headerUsers: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        fontWeight: '500',
    },
    headerReactionBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(232, 162, 58, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerReactionIcon: {
        fontSize: 18,
    },

    // ══════════════════════════════
    // CHAT AREA
    // ══════════════════════════════
    chatContainer: {
        flex: 0.35,
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
        backgroundColor: 'rgba(232, 162, 58, 0.1)',
        shadowColor: AMBER,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 3,
    },
    avatarInitial: {
        fontSize: 14,
        fontWeight: '800',
    },
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
        backgroundColor: 'rgba(232, 162, 58, 0.06)',
        borderColor: 'rgba(232, 162, 58, 0.15)',
    },
    messageBubbleSystem: {
        backgroundColor: 'rgba(232, 162, 58, 0.08)',
        borderColor: 'rgba(232, 162, 58, 0.25)',
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
        backgroundColor: 'rgba(232, 162, 58, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.35)',
    },
    msgVipIcon: {
        fontSize: 8,
    },
    msgVipText: {
        color: AMBER,
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

    // ══════════════════════════════
    // STAGE DIVIDER
    // ══════════════════════════════
    stageDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 4,
        backgroundColor: 'rgba(26, 14, 4, 0.9)',
    },
    stageDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(232, 162, 58, 0.25)',
    },
    stageDividerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 5,
    },
    stageDividerIcon: {
        fontSize: 12,
    },
    stageDividerLabel: {
        color: AMBER,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        opacity: 0.7,
    },

    // ══════════════════════════════
    // COMEDY STAGE
    // ══════════════════════════════    // ── Stage Area ──
    stageContainer: {
        flex: 0.65,
        backgroundColor: '#000',
        overflow: 'hidden', // Clip the panning camera
    },
    cameraContainer: {
        flex: 1,
        // Give it slight extra width so it can pan without showing black edges
        width: '110%',
        left: '-5%',
    },
    stageBackground: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stageOverlayDark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 14, 4, 0.55)',
    },

    // Brick wall texture effect
    brickWallOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(107, 32, 32, 0.15)',
    },

    // Spotlight cone (triangular gradient from top)
    spotlightCone: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderLeftWidth: 80,
        borderRightWidth: 80,
        borderTopWidth: 0,
        borderBottomWidth: SCREEN_HEIGHT * 0.35,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'rgba(232, 162, 58, 0.06)',
        borderTopColor: 'transparent',
    },

    // Spotlight floor glow
    spotlightFloor: {
        position: 'absolute',
        bottom: '20%',
        alignSelf: 'center',
        width: 180,
        height: 100,
        borderRadius: 90,
        backgroundColor: 'rgba(232, 162, 58, 0.12)',
    },

    // Stage badge
    stageBadge: {
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.4)',
        backgroundColor: 'rgba(26, 14, 4, 0.75)',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 12,
        shadowColor: AMBER,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    stageBadgeText: {
        color: AMBER,
        fontSize: 10,
        letterSpacing: 3,
        fontWeight: '800',
    },

    // Warm sparkles
    sparkle: {
        position: 'absolute',
    },
    sparkle1: {
        top: '20%',
        left: '12%',
    },
    sparkle2: {
        top: '30%',
        right: '10%',
    },
    sparkle3: {
        top: '50%',
        left: '35%',
    },
    sparkleText: {
        color: AMBER_WARM,
        fontSize: 12,
        opacity: 0.15,
    },

    // ── Smoke Effects ──
    smokeLayer: {
        position: 'absolute',
        bottom: 20,
        width: 400,
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 200,
        transform: [{ scaleY: 0.2 }],
        filter: 'blur(20px)', // web only fallback
    },
    smokeLayer2: {
        bottom: 50,
        height: 150,
        backgroundColor: 'rgba(232, 162, 58, 0.03)',
    },

    // ── Spotlight ──floor (wooden brown)
    stageFloor: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 55,
        backgroundColor: 'rgba(60, 30, 10, 0.65)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(232, 162, 58, 0.15)',
    },

    // Stage avatar area
    avatarStageArea: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },

    // ── Comedian (center stage) ──
    centerStage: {
        position: 'absolute',
        top: '32%',
        left: '50%',
        transform: [{ translateX: -50 }], // Center horizontally based on new width
        alignItems: 'center',
    },
    comedianGlow: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(232, 162, 58, 0.12)',
        top: 20,
    },
    comedianSpriteContainer: {
        width: 180,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
    },
    comedianImage: {
        width: '100%',
        height: '100%',
    },
    onMicBadge: {
        marginTop: 6,
        backgroundColor: AMBER,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: AMBER,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 5,
    },
    onMicText: {
        color: CELLAR_DARK,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
    },

    // ── Audience cabaret seating ──
    audienceSeat: {
        position: 'absolute',
        alignItems: 'center',
    },
    cabaretTable: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(80, 40, 15, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -8,
        zIndex: 1,
    },
    cabaretTableTop: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(100, 50, 20, 0.5)',
    },
    candleLight: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 180, 100, 0.8)',
        shadowColor: '#ff9900',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        top: 2,
    },
    drinkGlass: {
        position: 'absolute',
    },
    drinkEmoji: {
        fontSize: 8,
    },
    audienceAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    audienceInitial: {
        fontSize: 14,
        fontWeight: '800',
    },

    // ── Floating LOL reactions ──
    floatingLOL: {
        position: 'absolute',
        bottom: '30%',
        zIndex: 50,
    },
    floatingLOLText: {
        fontSize: 28,
        textShadowColor: 'rgba(232, 162, 58, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },

    // Flying gift
    flyingGift: {
        position: 'absolute',
        zIndex: 100,
        alignSelf: 'center',
    },
    flyingGiftEmoji: {
        fontSize: 60,
        textShadowColor: 'rgba(232, 162, 58, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },

    // ══════════════════════════════
    // QUICK REACTION BAR
    // ══════════════════════════════
    reactionBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(26, 14, 4, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(232, 162, 58, 0.1)',
        gap: 6,
    },
    reactionBtn: {
        width: 42,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(232, 162, 58, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reactionEmoji: {
        fontSize: 16,
    },

    // ══════════════════════════════
    // INPUT AREA
    // ══════════════════════════════
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(26, 14, 4, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(232, 162, 58, 0.1)',
        gap: 8,
    },
    giftBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(232, 162, 58, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    giftBtnIcon: {
        fontSize: 20,
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
        backgroundColor: 'rgba(232, 162, 58, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: AMBER,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    sendBtnIcon: {
        color: AMBER,
        fontSize: 18,
        fontWeight: '600',
    },

    // ══════════════════════════════
    // GIFT SHEET
    // ══════════════════════════════
    giftSheet: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(30, 16, 5, 0.97)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingTop: 14,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.25)',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    giftSheetHandle: {
        width: 36,
        height: 4,
        backgroundColor: 'rgba(232, 162, 58, 0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 14,
    },
    giftSheetTitle: {
        color: AMBER,
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 1,
    },
    giftGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 6,
    },
    giftItem: {
        flex: 1,
    },
    giftItemInner: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(232, 162, 58, 0.15)',
        gap: 5,
    },
    giftEmoji: {
        fontSize: 28,
    },
    giftName: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
        fontWeight: '600',
    },
    giftPricePill: {
        backgroundColor: 'rgba(232, 162, 58, 0.12)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    giftPriceFree: {
        backgroundColor: 'rgba(74, 222, 128, 0.15)',
    },
    giftPrice: {
        color: AMBER,
        fontSize: 10,
        fontWeight: '800',
    },
    giftPriceTextFree: {
        color: '#4ade80',
    },
    audienceControlsContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    }
});
