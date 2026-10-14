import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ImageBackground,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';

import AudienceController from './galaverse/AudienceController';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 18 Avatars spread across the Mega Penthouse
// Left side: 9 avatars sitting along the massive blue couch
// Right side: 9 avatars standing at the neon bar
const LOBBY_AVATARS = [
    // Left side (Massive Couch)
    { id: 1, x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.45, size: 85 },
    { id: 2, x: SCREEN_WIDTH * 0.30, y: SCREEN_HEIGHT * 0.48, size: 85 },
    { id: 3, x: SCREEN_WIDTH * 0.10, y: SCREEN_HEIGHT * 0.52, size: 90 },
    { id: 4, x: SCREEN_WIDTH * 0.25, y: SCREEN_HEIGHT * 0.55, size: 95 },
    { id: 5, x: SCREEN_WIDTH * 0.40, y: SCREEN_HEIGHT * 0.55, size: 95 },
    { id: 6, x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.60, size: 100 },
    { id: 7, x: SCREEN_WIDTH * 0.35, y: SCREEN_HEIGHT * 0.62, size: 105 },
    { id: 8, x: SCREEN_WIDTH * 0.12, y: SCREEN_HEIGHT * 0.68, size: 110 },
    { id: 9, x: SCREEN_WIDTH * 0.30, y: SCREEN_HEIGHT * 0.70, size: 110 },

    // Right Side (Standing at the Neon Bar)
    { id: 10, x: SCREEN_WIDTH * 0.70, y: SCREEN_HEIGHT * 0.40, size: 80 },
    { id: 11, x: SCREEN_WIDTH * 0.85, y: SCREEN_HEIGHT * 0.42, size: 80 },
    { id: 12, x: SCREEN_WIDTH * 0.65, y: SCREEN_HEIGHT * 0.46, size: 85 },
    { id: 13, x: SCREEN_WIDTH * 0.80, y: SCREEN_HEIGHT * 0.48, size: 90 },
    { id: 14, x: SCREEN_WIDTH * 0.95, y: SCREEN_HEIGHT * 0.50, size: 90 },
    { id: 15, x: SCREEN_WIDTH * 0.68, y: SCREEN_HEIGHT * 0.55, size: 95 },
    { id: 16, x: SCREEN_WIDTH * 0.85, y: SCREEN_HEIGHT * 0.58, size: 100 },
    { id: 17, x: SCREEN_WIDTH * 0.72, y: SCREEN_HEIGHT * 0.62, size: 105 },
    { id: 18, x: SCREEN_WIDTH * 0.88, y: SCREEN_HEIGHT * 0.65, size: 110 },
];

const BOT_MESSAGES = [
    { id: '1', sender: 'System', text: 'Welcome to the Main Lobby! Hang out before the shows start.' },
    { id: '2', sender: 'LuxGoddess', text: 'Is anyone going to the comedy show later?' },
    { id: '3', sender: 'VelvetRose', text: 'Yes! Im just waiting for my friend.' },
];

export default function MainLobbyScreen({ onBack, onShowRooms }: { onBack: () => void, onShowRooms: () => void }) {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState(BOT_MESSAGES);
    const flatListRef = useRef<FlatList>(null);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* ── Background & Avatars ── */}
                <View style={styles.roomContainer}>
                    <ImageBackground
                        source={require('./anime_image/room_lobby.jpg')}
                        style={styles.bgImage}
                        resizeMode="cover"
                    >
                        <View style={styles.overlay} />

                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                                <Text style={styles.backBtnText}>×</Text>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>THE GALAXY LOBBY</Text>
                            <TouchableOpacity onPress={onShowRooms} style={styles.liveBtn}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveBtnText}>LIVE ROOMS</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Chilling Anime Characters */}
                        {LOBBY_AVATARS.map((avatar) => (
                            <View 
                                key={avatar.id}
                                style={[
                                    styles.avatarWrapper,
                                    { left: avatar.x - (avatar.size / 2), top: avatar.y }
                                ]}
                            >
                                {/* We use the 'auto' mode so they just breathe and blink normally */}
                                <AudienceController mode="auto" size={avatar.size} />
                            </View>
                        ))}
                    </ImageBackground>
                </View>

                {/* ── Chat Area ── */}
                <View style={styles.chatSection}>
                    <FlatList
                        ref={flatListRef}
                        data={chat}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 15 }}
                        renderItem={({ item }) => (
                            <View style={styles.chatMessage}>
                                <Text style={styles.senderName}>{item.sender}: </Text>
                                <Text style={styles.messageText}>{item.text}</Text>
                            </View>
                        )}
                    />
                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Say hi to the lobby..."
                            placeholderTextColor="#888"
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity style={styles.sendBtn}>
                            <Text style={styles.sendBtnText}>SEND</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    roomContainer: { flex: 0.65, backgroundColor: '#111' },
    bgImage: { flex: 1, width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' }, // Darken bg so characters pop
    
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 15,
        zIndex: 10,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, 
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#d4af37'
    },
    backBtnText: { color: '#d4af37', fontSize: 24, marginTop: -3 },
    headerTitle: { color: '#d4af37', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
    liveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d4af37',
    },
    liveDot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: '#ff3366',
        marginRight: 6,
    },
    liveBtnText: { color: '#d4af37', fontSize: 10, fontWeight: 'bold' },
    
    avatarWrapper: {
        position: 'absolute',
        zIndex: 5,
    },

    chatSection: {
        flex: 0.35,
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderColor: '#333',
    },
    chatMessage: { flexDirection: 'row', marginBottom: 10 },
    senderName: { color: '#d4af37', fontWeight: 'bold' },
    messageText: { color: '#fff' },
    
    inputArea: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderColor: '#222',
        backgroundColor: '#111',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#222',
        color: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
    },
    sendBtn: {
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    sendBtnText: { color: '#d4af37', fontWeight: 'bold' },
});
