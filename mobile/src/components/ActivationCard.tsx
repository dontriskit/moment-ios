import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Play, Clock } from 'lucide-react-native';
import config from '../config';

interface Activation {
  id: string;
  title: string;
  imageUrl: string | null;
  durationSeconds: number | null;
  category?: {
    name: string;
    color: string | null;
  } | null;
}

interface ActivationCardProps {
  activation: Activation;
  showCategory?: boolean;
}

export default function ActivationCard({ activation, showCategory = true }: ActivationCardProps) {
  const navigation = useNavigation();
  const minutes = activation.durationSeconds ? Math.floor(activation.durationSeconds / 60) : 0;

  const handlePress = () => {
    navigation.navigate('Player' as never, { activationId: activation.id } as never);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      activeOpacity={0.8}
    >
      <View className="relative aspect-[3/4]">
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
            style={{
              backgroundColor: activation.category?.color || '#e5e7eb',
            }}
          />
        )}
        
        {/* Gradient overlay */}
        <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Play button */}
        <View className="absolute top-3 right-3 bg-white/20 rounded-full p-2">
          <Play size={20} color="white" fill="white" />
        </View>
        
        {/* Content */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <Text className="text-white font-bold text-base line-clamp-2" numberOfLines={2}>
            {activation.title}
          </Text>
          
          <View className="flex-row items-center mt-2">
            <Clock size={14} color="rgba(255, 255, 255, 0.8)" />
            <Text className="text-white/80 text-sm ml-1">
              {minutes} min
            </Text>
            
            {showCategory && activation.category && (
              <>
                <Text className="text-white/80 text-sm mx-2">•</Text>
                <Text className="text-white/80 text-sm">
                  {activation.category.name}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}