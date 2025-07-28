import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';

const categories = [
  { id: '1', name: 'Relaksacja', color: 'from-purple-500 to-pink-500' },
  { id: '2', name: 'Sen', color: 'from-blue-500 to-indigo-500' },
  { id: '3', name: 'Skupienie', color: 'from-green-500 to-teal-500' },
  { id: '4', name: 'Stres', color: 'from-red-500 to-orange-500' },
  { id: '5', name: 'Motywacja', color: 'from-yellow-500 to-amber-500' },
  { id: '6', name: 'Oddychanie', color: 'from-cyan-500 to-blue-500' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Search Bar */}
        <View className="bg-white rounded-lg px-4 py-3 flex-row items-center shadow-sm mb-6">
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Szukaj medytacji..."
            className="ml-3 flex-1 text-gray-900"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Categories Grid */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Kategorie</Text>
        <View className="flex-row flex-wrap -mx-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="w-1/2 p-2"
            >
              <View className={`h-32 rounded-lg p-4 justify-end bg-gradient-to-br ${category.color}`}>
                <Text className="text-white font-bold text-lg">
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}