import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {LOGIN} from '../../services/ENDPOINT';

const Login = ({ navigation }) => {
  const [loginCredential, setLoginCredential] = useState({
    email: '',
    password: '',
  });

  const [storage, setStorage] = useState('');

  const checkApiCall = async () => {
    // const payload = {
    //   email_address: loginCredential.email,
    //   password: loginCredential.password,
    //   ip: '00:00:00:00'
    // }

    const payload = {
      email_address: 'hinata@ml.com',
      password: 'Winner6431$$',
      ip: '00:00:00:00',
    };

    try {
      const data = await LOGIN(payload);
      if (data.code === 200 || data.code === '200') {
        await AsyncStorage.setItem('eb-mums-lunch:token', data.data.token);
        await AsyncStorage.setItem(
          'eb-mums-lunch:loginInfo',
          JSON.stringify(data.data.loginInfo),
        );
        navigation.navigate('Home');
      } else {
        console.log('error');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const printAsyncStorageValues = async () => {
    const token = await AsyncStorage.getItem('eb-mums-lunch:token');
    const loginInfo = await AsyncStorage.getItem('eb-mums-lunch:loginInfo');
    console.log(token);
    console.log(loginInfo);
    setStorage(token + JSON.stringify(loginInfo));
  };

  return (
    <SafeAreaView style={{height: '100%'}}>
      <View style={styles.ViewWrapper}>
        <Text style={styles.LoginText}>Login</Text>
        <TextInput
          style={{...styles.InputArea}}
          name="inputLogin"
          onChangeText={text =>
            setLoginCredential({...loginCredential, email: text})
          }
          value={loginCredential.email}
          placeholder="Email"
          placeholderTextColor="#020202"
        />
        <TextInput
          style={{...styles.InputArea, marginTop: 16}}
          name="inputPassword"
          onChangeText={text =>
            setLoginCredential({...loginCredential, password: text})
          }
          value={loginCredential.password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="#020202"
        />
        <View style={{alignItems: 'center', paddingTop: 24}}>
          <Pressable
            style={{...styles.PressableButton}}
            onPress={() => checkApiCall()}>
            <Text style={{color: 'white'}}>LOGIN</Text>
          </Pressable>
        </View>
        {/* <View style={{alignItems: 'center', paddingTop: 56}}>
          <Pressable
            style={{...styles.PressableButton}}
            onPress={() => printAsyncStorageValues()}>
            <Text style={{color: 'white'}}>PRINT STORAGE</Text>
          </Pressable>
        </View>
        <Text>{storage}</Text> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ViewWrapper: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  LoginText: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 40,
    color: '#000000',
  },
  InputArea: {
    fontSize: 16,
    borderRadius: 4,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#000000',
  },
  PressableButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
});

export default Login;
