import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  Heart,
  ListPlus,
  Share2,
  Download,
} from 'lucide-react-native';
import { trpc } from '../api/trpc';
import Slider from '@react-native-community/slider';
import config from '../config';

type RouteParams = {
  Player: {
    activationId: string;
  };
};

export default function PlayerScreen() {
  const route = useRoute<RouteProp<RouteParams, 'Player'>>();
  const navigation = useNavigation();
  const { activationId } = route.params;

  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch activation data
  const { data: activation, isLoading: isLoadingData } = trpc.activation.getActivationById.useQuery({
    id: activationId,
  });

  // Progress tracking
  const updateProgressMutation = trpc.user.updateProgress.useMutation();
  const toggleFavoriteMutation = trpc.user.toggleFavorite.useMutation();

  // Initialize audio and favorite state
  useEffect(() => {
    if (activation?.audioUrl) {
      loadAudio();
    }
    if (activation?.isFavorited !== undefined) {
      setIsFavorite(activation.isFavorited);
    }
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [activation?.audioUrl, activation?.isFavorited]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load audio - prepend API URL if it's a relative path
      const audioUrl = activation!.audioUrl.startsWith('http') 
        ? activation!.audioUrl 
        : `${config.apiUrl}${activation!.audioUrl}`;
        
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Błąd', 'Nie udało się załadować audio');
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      // Update progress when playback updates
      if (status.positionMillis && status.durationMillis) {
        const progressSeconds = Math.floor(status.positionMillis / 1000);
        updateProgress(progressSeconds);
      }

      // Handle playback finished
      if (status.didJustFinish) {
        setIsPlaying(false);
        completeActivation();
      }
    }
  };

  const updateProgress = async (progressSeconds: number) => {
    try {
      await updateProgressMutation.mutateAsync({
        activationId,
        progressSeconds,
        isCompleted: false,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeActivation = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        activationId,
        progressSeconds: duration / 1000, // Convert to seconds
        isCompleted: true,
      });
    } catch (error) {
      console.error('Error completing activation:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const seekBackward = async () => {
    if (!sound) return;
    const newPosition = Math.max(0, position - 10000); // 10 seconds
    await sound.setPositionAsync(newPosition);
  };

  const seekForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(duration, position + 10000); // 10 seconds
    await sound.setPositionAsync(newPosition);
  };

  const onSliderValueChange = async (value: number) => {
    if (!sound) return;
    const newPosition = value * duration;
    await sound.setPositionAsync(newPosition);
  };

  const toggleFavorite = async () => {
    try {
      await toggleFavoriteMutation.mutateAsync({ activationId });
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać do ulubionych');
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoadingData || !activation) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Odtwarzacz</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="aspect-square mx-6 mt-6 rounded-lg overflow-hidden shadow-lg">
          {activation.imageUrl ? (
            <Image
              source={{ 
                uri: activation.imageUrl.startsWith('http') 
                  ? activation.imageUrl 
                  : `${config.apiUrl}${activation.imageUrl}`
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View 
              className="w-full h-full" 
              style={{ backgroundColor: activation.category?.color || '#e5e7eb' }}
            />
          )}
        </View>

        {/* Title and Info */}
        <View className="px-6 mt-6">
          <Text className="text-2xl font-bold text-gray-900 text-center">
            {activation.title}
          </Text>
          {activation.category && (
            <Text className="text-base text-gray-600 text-center mt-2">
              {activation.category.name}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View className="px-6 mt-8">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={duration > 0 ? position / duration : 0}
            onSlidingComplete={onSliderValueChange}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-600">{formatTime(position)}</Text>
            <Text className="text-sm text-gray-600">{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View className="flex-row items-center justify-center px-6 mt-8 mb-4">
          <TouchableOpacity onPress={seekBackward} className="p-3">
            <RotateCcw size={24} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            disabled={isLoading}
            className="mx-8 bg-indigo-600 rounded-full p-5"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : isPlaying ? (
              <Pause size={32} color="white" fill="white" />
            ) : (
              <Play size={32} color="white" fill="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={seekForward} className="p-3">
            <RotateCw size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around px-6 mt-8 mb-8">
          <TouchableOpacity 
            onPress={toggleFavorite}
            className="items-center p-3"
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#ef4444" : "#6b7280"} 
              fill={isFavorite ? "#ef4444" : "none"}
            />
            <Text className="text-xs text-gray-600 mt-1">Ulubione</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center p-3">
            <ListPlus size={24} color="#6b7280" />
            <Text className="text-xs text-gray-600 mt-1">Playlista</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center p-3">
            <Download size={24} color="#6b7280" />
            <Text className="text-xs text-gray-600 mt-1">Pobierz</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center p-3">
            <Share2 size={24} color="#6b7280" />
            <Text className="text-xs text-gray-600 mt-1">Udostępnij</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {activation.description && (
          <View className="px-6 mb-8">
            <Text className="text-lg font-semibold mb-2">Opis</Text>
            <Text className="text-gray-600 leading-relaxed">
              {activation.description}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}