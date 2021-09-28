/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ColorSchemeName } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import HomeScreen from '../screens/HomeScreen';
import firebaseApi from '../servicses/apis/firebaseApi';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { skip, take } from 'rxjs';
import React, { useEffect, useState } from 'react';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = NativeStackScreenProps<RootStackParamList>;

function RootNavigator() {
  React.useEffect(() => {
    const s = firebaseApi.getPdf()?.pipe(take(1)).subscribe()
    return () => s?.unsubscribe()
  }, [])
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

const BottomTab = createMaterialTopTabNavigator<RootTabParamList>();

{/* <Text onPress={() => Linking.openURL(url)}>
    {url}
</Text> */}

function BottomTabNavigator({ navigation, route }: RootTabScreenProps<'Home' | 'TabTwo'>) {
  const colorScheme = useColorScheme();
  const [keys, setKeys] = useState([] as string[])
  // const [subscribes, setSubscribes] = React.useState([] as Subscription[])
  // const [ended, setEnded] = React.useState(false)

  // // stops all subscribes (by ended property) and unsubscribe them
  // const destroy = () => {
  //   setEnded(true)
  //   subscribes?.forEach(x => x?.unsubscribe())
  // }

  useEffect(() => {
    const s = firebaseApi.pdfChanged?.pipe(
      skip(1),
    )?.subscribe(pdf => {
      setKeys(Object.keys(pdf?.data || {}))
    })
    return () => s?.unsubscribe()
  }, [])

  if (!keys?.length) {
    return <></>
  }
  return (
    <BottomTab.Navigator
      initialRouteName='Home'
      tabBarPosition='bottom'
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      {
        keys?.map(i =>
          <BottomTab.Screen
            key={i}
            name={i as any}
            component={HomeScreen}
            initialParams={{ 'fileName': i }}
            options={() => ({
              tabBarIcon: ({ color }) => <TabBarIcon name='file' color={color} />,
              // headerRight: <Pressable
              //   // onPress={() => navigation.navigate('Modal')
              //   // onPress={() => navigation.navigate('Root', { screen: 'TabOne' ,  params: { fileName:'' }    } )
              //   // }
              //   style={({ pressed }) => ({
              //     opacity: pressed ? 0.5 : 1,
              //   })}>
              //   <FontAwesome
              //     name="info-circle"
              //     size={25}
              //     color={Colors[colorScheme].text}
              //     style={{ marginRight: 15 }}
              //   />
              // </Pressable>
              // ,
            })}
          />
        )
      }
      {/* <BottomTab.Screen
            name="TabTwo"
            component={TabTwoScreen}
            options={{
              title: 'Tab Two',
              tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}

      /> */}
    </BottomTab.Navigator >);
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number
}) {
  return <FontAwesome style={{ marginBottom: -3 }} size={30} {...props} />;
}
