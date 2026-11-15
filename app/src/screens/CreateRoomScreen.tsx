/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — Create Room Screen
 * ══════════════════════════════════════════════════
 * Lets any logged-in user create a new live room.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { createRoom } from '../services/roomService';

const { width } = Dimensions.get('window');

const ROOM_TYPES = [
  { key: 'chat', label: '💬 Chat Room', color: '#a855f7' },
  { key: 'music', label: '🎵 Music Room', color: '#00e5ff' },
  { key: 'comedy', label: '🎙️ Comedy Stage', color: '#e8a23a' },
  { key: 'gaming', label: '🎮 Gaming Lounge', color: '#4ade80' },
  { key: 'debate', label: '🔥 Debate Arena', color: '#ff6b6b' },
  { key: 'chill', label: '☕ Chill Vibes', color: '#7c4dff' },
];

interface CreateRoomScreenProps {
  onRoomCreated: (room: any) => void;
  onBack: () => void;
}

export default function CreateRoomScreen({ onRoomCreated, onBack }: CreateRoomScreenProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('chat');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Room Name Required', 'Please enter a name for your room.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createRoom({
        name: name.trim(),
        type: selectedType,
        description: description.trim(),
        maxParticipants: parseInt(maxParticipants, 10) || 50,
        isPrivate,
        themeColor: ROOM_TYPES.find(t => t.key === selectedType)?.color || '#a855f7',
      });

      if (result.success) {
        Alert.alert('🎉 Room Created!', `"${name}" is now live!`, [
          { text: 'Enter Room', onPress: () => onRoomCreated(result.room) },
        ]);
      } else {
        Alert.alert('Error', 'Failed to create room. Try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Room Name */}
        <Text style={styles.label}>Room Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Late Night Chill..."
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        {/* Description */}
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="What's this room about?"
          placeholderTextColor="#555"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={120}
        />

        {/* Room Type */}
        <Text style={styles.label}>Room Type</Text>
        <View style={styles.typeGrid}>
          {ROOM_TYPES.map(type => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeChip,
                selectedType === type.key && { borderColor: type.color, backgroundColor: type.color + '20' },
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === type.key && { color: type.color },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Max Participants */}
        <Text style={styles.label}>Max Participants</Text>
        <TextInput
          style={styles.input}
          placeholder="50"
          placeholderTextColor="#555"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="numeric"
          maxLength={3}
        />

        {/* Private Toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setIsPrivate(!isPrivate)}
        >
          <Text style={styles.label}>🔒 Private Room</Text>
          <View style={[styles.toggle, isPrivate && styles.toggleActive]}>
            <View style={[styles.toggleDot, isPrivate && styles.toggleDotActive]} />
          </View>
        </TouchableOpacity>
        {isPrivate && (
          <Text style={styles.privateHint}>
            A code will be generated. Share it with friends to let them join.
          </Text>
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createBtn, isLoading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>🚀 CREATE & GO LIVE</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: '#fff', marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16,
    fontSize: 16, color: '#fff', marginBottom: 20,
    borderWidth: 1, borderColor: '#2a2a4e',
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#2a2a4e', backgroundColor: '#1a1a2e',
  },
  typeLabel: { fontSize: 13, fontWeight: '600', color: '#888' },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingVertical: 4,
  },
  toggle: {
    width: 50, height: 28, borderRadius: 14, backgroundColor: '#2a2a4e',
    justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleActive: { backgroundColor: '#7c4dff' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#555' },
  toggleDotActive: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  privateHint: { fontSize: 12, color: '#666', marginBottom: 20, fontStyle: 'italic' },
  createBtn: {
    backgroundColor: '#7c4dff', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 10,
    shadowColor: '#7c4dff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  createBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
