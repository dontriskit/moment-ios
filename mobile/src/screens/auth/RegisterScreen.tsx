import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await register(data.email, data.password, data.name);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      let errorMessage = 'Nie udało się utworzyć konta. Spróbuj ponownie.';
      
      if (error.message?.includes('already exists')) {
        errorMessage = 'Konto z tym adresem email już istnieje.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Błąd połączenia. Sprawdź internet i spróbuj ponownie.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Hasło nie spełnia wymagań bezpieczeństwa.';
      }
      
      Alert.alert('Błąd rejestracji', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 justify-between px-6 pt-4 pb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-white">Utwórz konto</Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-bold mb-6">Zarejestruj się</Text>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Imię</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                    placeholder="Jan Kowalski"
                    placeholderTextColor="#9ca3af"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
              )}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">E-mail</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                    placeholder="twoj@email.com"
                    placeholderTextColor="#9ca3af"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Hasło</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                    placeholder="Minimum 6 znaków"
                    placeholderTextColor="#9ca3af"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    editable={!isLoading}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2">Potwierdź hasło</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                    placeholder="Wpisz hasło ponownie"
                    placeholderTextColor="#9ca3af"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    editable={!isLoading}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`w-full rounded-full py-4 mb-6 ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-bold text-base">ZAREJESTRUJ SIĘ</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-center text-gray-600 text-sm mb-6">
              Rejestrując się, akceptujesz nasze{' '}
              <Text className="text-indigo-600">Warunki korzystania</Text> oraz{' '}
              <Text className="text-indigo-600">Politykę prywatności</Text>
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Masz już konto? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-indigo-600 font-medium">Zaloguj się</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}