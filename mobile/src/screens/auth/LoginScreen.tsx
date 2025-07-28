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
import { Loader2 } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      let errorMessage = 'Nieprawidłowe dane logowania. Spróbuj ponownie.';
      
      if (error.message?.includes('credentials')) {
        errorMessage = 'Nieprawidłowy email lub hasło.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Błąd połączenia. Sprawdź internet i spróbuj ponownie.';
      }
      
      Alert.alert('Błąd logowania', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (error: any) {
      let errorMessage = 'Nie udało się zalogować przez Google';
      
      if (error.message?.includes('cancelled')) {
        // User cancelled, don't show error
        return;
      } else if (error.message?.includes('network')) {
        errorMessage = 'Błąd połączenia. Sprawdź internet i spróbuj ponownie.';
      } else if (error.message?.includes('configuration')) {
        errorMessage = 'Błąd konfiguracji Google. Skontaktuj się z obsługą.';
      }
      
      Alert.alert('Błąd Google', errorMessage);
    } finally {
      setGoogleLoading(false);
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
          <View className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 justify-center px-6">
            <Text className="text-3xl font-bold text-white">Witaj ponownie</Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-bold mb-6">Zaloguj się e-mailem</Text>

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
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2">Hasło</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                    placeholder="••••••••"
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

            {/* Login Button */}
            <TouchableOpacity
              className={`w-full rounded-full py-4 mb-4 ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-bold text-base">ZALOGUJ SIĘ</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
              <Text className="text-center text-indigo-600 font-medium">
                Zapomniałeś hasła?
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="mx-4 text-gray-500">Lub</Text>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            {/* Google Login */}
            <TouchableOpacity
              className={`w-full rounded-lg border border-gray-300 py-3 mb-6 ${
                googleLoading ? 'opacity-50' : ''
              }`}
              onPress={handleGoogleLogin}
              disabled={isLoading || googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#6366f1" />
              ) : (
                <Text className="text-center font-medium">Kontynuuj z Google</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Nie masz konta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text className="text-indigo-600 font-medium">Zarejestruj się</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}