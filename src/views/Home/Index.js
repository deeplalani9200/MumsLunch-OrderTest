import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LOGOUT} from '../../services/ENDPOINT';

const Home = ({navigation}) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkTokenAvailable();
  });

  const checkTokenAvailable = async () => {
    const token = await AsyncStorage.getItem('eb-mums-lunch:token');
    const loginInfo = await AsyncStorage.getItem('eb-mums-lunch:loginInfo');
    if (!(token && loginInfo)) {
      navigation.navigate('Login');
    }
    setUserInfo(JSON.parse(loginInfo));
  };

  const logoutAlert = () => {
    Alert.alert(
      'Logout',
      'You are about to logout from the system. Would you like to proceed further?',
      [
        {
          text: 'Ok',
          onPress: () => logout(),
        },
        {
          text: 'Cancel',
        },
      ],
    );
  };

  const logout = async () => {
    try {
      const payload = {
        id_user: userInfo.user_id,
        ip_address: '00.00.00.00',
      };
      const data = await LOGOUT(payload);
      if (data.code === 200 || data.code === '200') {
        await AsyncStorage.removeItem('eb-mums-lunch:token');
        await AsyncStorage.removeItem('eb-mums-lunch:loginInfo');
        navigation.navigate('Login');
      } else {
        console.log('something goes wrong');
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={{height: '100%'}}>
      <View
        style={{flexDirection: 'column', justifyContent: 'center', flex: 1}}>
        <View style={{alignItems: 'center'}}>
          <Pressable
            style={{...styles.PressableButton}}
            onPress={() => navigation.navigate('Event')}>
            <Text style={{...styles.button}}>EVENTS</Text>
          </Pressable>
          <Pressable
            style={{...styles.PressableButton, marginTop: 24}}
            onPress={() => navigation.navigate('UpcomingOrders')}>
            <Text style={{...styles.button}}>UPCOMING ORDERS</Text>
          </Pressable>
          <Pressable
            style={{...styles.PressableButton, marginTop: 24}}
            onPress={() => logoutAlert()}>
            <Text style={{...styles.button}}>LOGOUT</Text>
          </Pressable>
          <Pressable
            style={{...styles.PressableButton, marginTop: 24}}
            onPress={() => navigation.navigate('Cart')}>
            <Text style={{...styles.button}}>CART</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  PressableButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.25,
    color: '#ffffff',
  },
});

export default Home;
