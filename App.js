/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import Login from './src/views/login/Index';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UpcomingOrders from './src/views/Order/UpcomingOrders';
import Home from './src/views/Home/Index';
import EventList from './src/views/Event/Index';
import OrderNow from './src/views/Order/OrderNow';
import Cart from './src/components/Cart';

const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <NavigationContainer initialRouteName="Home">
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Event" component={EventList} />
        <Stack.Screen name="UpcomingOrders" component={UpcomingOrders} />
        <Stack.Screen name="OrderNow" component={OrderNow} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cart" component={Cart} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default App;
