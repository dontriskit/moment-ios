import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Heart, Clock } from 'lucide-react-native';

export default function ForYouScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Featured Section */}
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Polecane</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((item) => (
              <TouchableOpacity
                key={item}
                className="mr-4 bg-white rounded-lg shadow-sm overflow-hidden"
                style={{ width: 280 }}
              >
                <View className="h-40 bg-gradient-to-br from-purple-500 to-pink-500" />
                <View className="p-4">
                  <Text className="font-semibold text-gray-900 mb-1">
                    Medytacja na dobry sen
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    15 min · Relaksacja
                  </Text>
                  <View className="flex-row items-center">
                    <Play size={16} color="#6366f1" fill="#6366f1" />
                    <Text className="ml-2 text-sm text-indigo-600 font-medium">
                      Odtwórz
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* New Releases */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Nowości</Text>
          {[1, 2, 3, 4].map((item) => (
            <TouchableOpacity
              key={item}
              className="mb-3 bg-white rounded-lg shadow-sm p-4 flex-row"
            >
              <View className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-4" />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 mb-1">
                  Poranek pełen energii
                </Text>
                <Text className="text-sm text-gray-600 mb-2">
                  10 min · Motywacja
                </Text>
                <View className="flex-row items-center">
                  <Clock size={14} color="#6b7280" />
                  <Text className="ml-1 text-xs text-gray-500">
                    Dodano wczoraj
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="ml-4">
                <Heart size={24} color="#6b7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Favorites */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Twoje ulubione</Text>
          <View className="bg-gray-100 rounded-lg p-8 items-center">
            <Heart size={48} color="#9ca3af" />
            <Text className="mt-4 text-gray-600 text-center">
              Zapisuj swoje ulubione medytacje{'\n'}aby mieć do nich szybki dostęp
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}