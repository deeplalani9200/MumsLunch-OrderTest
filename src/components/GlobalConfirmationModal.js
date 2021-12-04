import React from 'react';
import {StyleSheet, View, Modal, Text, Pressable} from 'react-native';
import styles from '../styles/Index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const GlobalConfirmationModal = props => {
  
  return (
    <Modal animationType="slide" transparent visible>
      <View style={{...componentStyles.modalBackground}}>
        <View style={{...componentStyles.modalContainer}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 8,
            }}>
            <Text style={{...styles.headline6}}>
              {props.title}
            </Text>
            <MaterialIcons
              name="close"
              size={24}
              onPress={() => props.closeModal(false)}
            />
          </View>
          <Text style={{ ...styles.body1}}>{props.message}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 24,
            }}>
            <Pressable
              style={{...componentStyles.confirmationButton, backgroundColor: '#3F84AB'}}
              onPress={() => props.closeModal(true)}>
              <Text style={{...styles.body1, color: '#ffffff'}}>SAVE</Text>
            </Pressable> 
            <Pressable
              style={{
                ...componentStyles.confirmationButton,
                backgroundColor: '#C82333',
                marginLeft: 12,
              }}
              onPress={() => props.closeModal(false)}>
              <Text style={{...styles.body1, color: '#ffffff'}}>CLOSE</Text>
            </Pressable>
        </View>
        </View>
      </View>
    </Modal>
  );
};

const componentStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 20,
  },
  confirmationButton: {
    height: 32,
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
});
export default GlobalConfirmationModal;
