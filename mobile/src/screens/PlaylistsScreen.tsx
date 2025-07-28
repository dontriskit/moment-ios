import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Music } from 'lucide-react-native';

export default function PlaylistsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Create Playlist Button */}
        <TouchableOpacity className="bg-indigo-600 rounded-lg p-4 flex-row items-center justify-center mb-6">
          <Plus size={24} color="white" />
          <Text className="ml-2 text-white font-semibold text-base">
            Utwórz nową playlistę
          </Text>
        </TouchableOpacity>

        {/* Playlists */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Twoje playlisty</Text>
        
        {/* Empty State */}
        <View className="bg-white rounded-lg p-8 items-center shadow-sm">
          <Music size={48} color="#9ca3af" />
          <Text className="mt-4 text-gray-600 text-center">
            Nie masz jeszcze żadnych playlist.{'\n'}
            Utwórz swoją pierwszą playlistę!
          </Text>
        </View>

        {/* Example Playlists (hidden for now) */}
        {false && [1, 2, 3].map((item) => (
          <TouchableOpacity
            key={item}
            className="mb-3 bg-white rounded-lg shadow-sm p-4 flex-row"
          >
            <View className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-4" />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">
                Moja poranna rutyna
              </Text>
              <Text className="text-sm text-gray-600">
                5 medytacji · 45 min
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}