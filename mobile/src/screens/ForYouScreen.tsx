import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useForYouData } from '../api/hooks/useActivations';
import ActivationCard from '../components/ActivationCard';
import { Heart } from 'lucide-react-native';

export default function ForYouScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = useForYouData();

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 17 ? 'Dzień dobry' : 'Dobry wieczór';
  const userName = user?.name?.split(' ')[0] || 'Przyjacielu';

  if (isLoading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Text className="text-gray-600 text-center mb-4">
          Nie udało się załadować zawartości.
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 px-6 py-3 rounded-full"
          onPress={() => refetch()}
        >
          <Text className="text-white font-medium">Spróbuj ponownie</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasContent = data && (
    data.featured.length > 0 || 
    data.newReleases.length > 0 || 
    data.favorites.length > 0
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-gray-600 font-medium">{greeting},</Text>
          <Text className="text-3xl font-bold text-gray-900">{userName}</Text>
        </View>

        {hasContent ? (
          <>
            {/* Featured Section */}
            {data.featured.length > 0 && (
              <View className="mt-6">
                <Text className="text-2xl font-bold text-gray-900 mb-4 px-4">
                  Polecane w tym tygodniu
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  {data.featured.map((activation, index) => (
                    <View
                      key={activation.id}
                      className="mr-4"
                      style={{ width: 200 }}
                    >
                      <ActivationCard activation={activation} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* New Releases */}
            {data.newReleases.length > 0 && (
              <View className="mt-8 px-4">
                <Text className="text-2xl font-bold text-gray-900 mb-4">
                  Najnowsze wydania
                </Text>
                <View className="flex-row flex-wrap -mx-2">
                  {data.newReleases.slice(0, 6).map((activation) => (
                    <View
                      key={activation.id}
                      className="w-1/2 px-2 mb-4"
                    >
                      <ActivationCard activation={activation} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Favorites */}
            {data.favorites.length > 0 && (
              <View className="mt-8 px-4 mb-8">
                <Text className="text-2xl font-bold text-gray-900 mb-4">
                  Twoje ulubione
                </Text>
                <View className="flex-row flex-wrap -mx-2">
                  {data.favorites.slice(0, 4).map((activation) => (
                    <View
                      key={activation.id}
                      className="w-1/2 px-2 mb-4"
                    >
                      <ActivationCard activation={activation} />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center px-4 mt-32">
            <Heart size={64} color="#9ca3af" />
            <Text className="text-gray-600 text-center mt-4 text-lg">
              Brak dostępnych ulepszeń
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Sprawdź ponownie później
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}