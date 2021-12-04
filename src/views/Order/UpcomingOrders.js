import React, {useEffect} from 'react';
import {SafeAreaView, View, Text, StyleSheet, StatusBar} from 'react-native';
import styles, {themeColor} from '../../styles/Index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrderList = ({navigation}) => {
  useEffect(() => {}, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor={themeColor.darkBlue}
      />
      <View style={{...styles.appBarContainer}}>
        <View style={{...styles.appBarLeadingContainer}}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#ffffff"
            onPress={() => navigation.goBack()}
          />
        </View>
        <Text style={{...styles.appBarTitle}}>Upcoming Orders</Text>
      </View>
      <View style={{flex: 1}}></View>
    </SafeAreaView>
  );
};

const componentStyles = StyleSheet.create({
  headline5: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    color: 'black',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default OrderList;
