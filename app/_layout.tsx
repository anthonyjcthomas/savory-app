import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BookmarksProvider } from '@/components/BookmarksContext';
import { auth } from '@/firebaseConfig';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Current user:', currentUser);
      setUser(currentUser);
      setLoading(false);

      // After auth state is determined, navigate
      if (currentUser) {
        router.replace('(tabs)');  // Navigate to the tabs if authenticated
      } else {
        router.replace('landing');  // Navigate to landing if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    // Show loading spinner while checking auth state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#264117" />
      </View>
    );
  }

  // Render the actual layout once loading is done
  return (
    <BookmarksProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* All the screens are available here, navigation will take care of the redirection */}
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </BookmarksProvider>
  );
}
