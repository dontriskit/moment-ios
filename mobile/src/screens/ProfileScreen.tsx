import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, BarChart3, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const menuItems = [
    { icon: User, label: 'Edytuj profil', onPress: () => {} },
    { icon: BarChart3, label: 'Statystyki', onPress: () => {} },
    { icon: Settings, label: 'Ustawienia', onPress: () => {} },
    { icon: LogOut, label: 'Wyloguj się', onPress: () => {}, danger: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white p-6 items-center shadow-sm">
          <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center">
            <User size={48} color="#6b7280" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-1">
            Jan Kowalski
          </Text>
          <Text className="text-gray-600">jan.kowalski@example.com</Text>
        </View>

        {/* Stats */}
        <View className="flex-row p-4">
          <View className="flex-1 bg-white rounded-lg p-4 mr-2 shadow-sm">
            <Text className="text-2xl font-bold text-indigo-600 text-center">156</Text>
            <Text className="text-sm text-gray-600 text-center mt-1">Minut medytacji</Text>
          </View>
          <View className="flex-1 bg-white rounded-lg p-4 ml-2 shadow-sm">
            <Text className="text-2xl font-bold text-indigo-600 text-center">23</Text>
            <Text className="text-sm text-gray-600 text-center mt-1">Ukończone sesje</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 pb-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                className="bg-white rounded-lg mb-2 p-4 flex-row items-center justify-between shadow-sm"
                onPress={item.onPress}
              >
                <View className="flex-row items-center">
                  <Icon
                    size={24}
                    color={item.danger ? '#dc2626' : '#6b7280'}
                  />
                  <Text
                    className={`ml-3 font-medium ${
                      item.danger ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}