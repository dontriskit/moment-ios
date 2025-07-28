import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Target, Flame } from 'lucide-react-native';

export default function ChallengesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Current Streak */}
        <View className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-600 mb-1">Aktualna seria</Text>
              <Text className="text-3xl font-bold text-indigo-600">7 dni</Text>
            </View>
            <Flame size={48} color="#dc2626" />
          </View>
        </View>

        {/* Daily Challenge */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Dzisiejsze wyzwanie</Text>
          <TouchableOpacity className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6">
            <View className="flex-row items-center mb-2">
              <Target size={24} color="white" />
              <Text className="ml-2 text-white font-semibold text-lg">
                5 minut oddychania
              </Text>
            </View>
            <Text className="text-white/90 mb-4">
              Wykonaj ćwiczenie oddechowe przez minimum 5 minut
            </Text>
            <View className="bg-white/20 rounded-full px-4 py-2 self-start">
              <Text className="text-white font-medium">Rozpocznij</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weekly Challenges */}
        <View>
          <Text className="text-xl font-bold text-gray-900 mb-4">Tygodniowe wyzwania</Text>
          {[
            { title: '7 dni z rzędu', progress: 3, total: 7 },
            { title: '30 minut medytacji', progress: 15, total: 30 },
            { title: 'Wypróbuj 3 kategorie', progress: 1, total: 3 },
          ].map((challenge, index) => (
            <View
              key={index}
              className="mb-4 bg-white rounded-lg shadow-sm p-4"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-gray-900">{challenge.title}</Text>
                <Text className="text-sm text-gray-600">
                  {challenge.progress}/{challenge.total}
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View className="mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Osiągnięcia</Text>
          <View className="flex-row flex-wrap -mx-2">
            {[1, 2, 3, 4].map((item) => (
              <View key={item} className="w-1/4 p-2">
                <View className="bg-gray-100 rounded-lg p-4 items-center aspect-square justify-center">
                  <Trophy size={32} color="#9ca3af" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}