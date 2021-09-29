import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { RootTabScreenProps } from './types';
import firebase from 'firebase';
import firebaseApi from './servicses/apis/firebaseApi';


export default function App({ navigation }: RootTabScreenProps<'Home'>) {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // useEffect(() => { setTimeout(() => firebaseApi.initAuth(), 5000) }, [])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
