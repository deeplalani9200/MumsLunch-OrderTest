import React, {useEffect, useState} from 'react';
import {Modal, View, Text, StyleSheet, Pressable} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {financial} from '../Shared/functions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/Index';

const OrderCustomizedToppingModal = props => {
  const [orderItem, setOrderItem] = useState(null);

  const QuantityStatus = {
    Increase: 1,
    Decrease: 2,
  };

  useEffect(() => {
    setOrderItem(props.item);
  }, []);

  const getFinalToppingPrice = toppingItem => {
    if(orderItem.quantity == 0) return financial(0);
    const findToppingQuantity = orderItem.toppingQuantity.find(
      tq => tq.id == toppingItem.id_topping_item,
    );
    const quantity =
      findToppingQuantity.quantity -
      toppingItem.freebie_qty * orderItem.quantity;
    return financial(quantity > 0 ? toppingItem.item_price * quantity : 0);
  };

  const getToppingQuantity = toppingId => {
    if(orderItem.quantity == 0) return '';
    const findToppingQuantity = orderItem.toppingQuantity.find(
      tq => tq.id == toppingId,
    );
    return findToppingQuantity.quantity == 0
      ? ''
      : findToppingQuantity.quantity;
  };

  const isChecked = toppingId => {
    if(orderItem.quantity == 0) return false;
    const findToppingQuantity = orderItem.toppingQuantity.find(
      tq => tq.id == toppingId,
    );
    return findToppingQuantity.quantity == 0 ? false : true;
  };

  const handleCheck = toppingId => {
    if(orderItem.quantity == 0) return;
    const toppingQuantity = orderItem.toppingQuantity.map(topping => {
      if (topping.id == toppingId) {
        return {
          ...topping,
          quantity:
            topping.quantity == 0
              ? topping.freebieQuantity == 0
                ? 1
                : topping.freebieQuantity * orderItem.quantity
              : 0,
        };
      }

      return topping;
    });

    setOrderItem({...orderItem, toppingQuantity});
  };

  const updateToppingQuantity = (toppingId, status) => {
    if(orderItem.quantity == 0) return;
    const toppingQuantity = orderItem.toppingQuantity.map(topping => {
      if (topping.id == toppingId) {
        if (status == QuantityStatus.Decrease && topping.quantity <= 1) {
          return topping;
        }

        if (status == QuantityStatus.Increase && topping.quantity == 0) {
          return topping;
        }

        return {
          ...topping,
          quantity:
            topping.quantity + (status == QuantityStatus.Increase ? 1 : -1),
        };
      }

      return topping;
    });

    setOrderItem({...orderItem, toppingQuantity});
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onRequestClose={() => {
        props.closeModal(false);
      }}>
      <View style={{...componentStyles.modalBackground}}>
        <View style={{...componentStyles.modalContainer}}>
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <Text style={{...styles.headline6}}>Select Topping Items</Text>
            <MaterialIcons
              name="close"
              size={24}
              onPress={() => props.closeModal(false)}
            />
          </View>
          <View style={{paddingTop: 8}}>
            {orderItem &&
              orderItem.item &&
              orderItem.item.product_topping_items.length !== 0 &&
              orderItem.item.product_topping_items.map(toppingItem => {
                const quantityCount = getToppingQuantity(
                  toppingItem.id_topping_item,
                );
                return (
                  <View
                    key={toppingItem.id_topping_item}
                    style={{paddingVertical: 4}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <CheckBox
                        value={isChecked(toppingItem.id_topping_item)}
                        onValueChange={() =>
                          handleCheck(toppingItem.id_topping_item)
                        }
                      />
                      <Text style={{...styles.title1}}>
                        {toppingItem.topping_item_name}
                        <Text style={{...styles.body1, color: '#008b8b'}}>
                          {' '}
                          (Included Quantity:{' '}
                          {toppingItem.freebie_qty * orderItem.quantity})
                        </Text>
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingTop: 4,
                        paddingLeft: 32,
                      }}>
                      <Text style={{...styles.title1, flex: 2}}>
                        ${toppingItem.item_price}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 3,
                          justifyContent: 'center',
                        }}>
                        <Pressable
                          onPress={() =>
                            updateToppingQuantity(
                              toppingItem.id_topping_item,
                              QuantityStatus.Decrease,
                            )
                          }
                          style={{
                            ...componentStyles.quantityIcon,
                            borderTopStartRadius: 4,
                            borderBottomStartRadius: 4,
                          }}>
                          <Text style={{fontSize: 24, lineHeight: 24}}>-</Text>
                        </Pressable>
                        <View style={{...componentStyles.quantityLabel}}>
                          <Text style={{...styles.title1, textAlign: 'center'}}>
                            {quantityCount}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            updateToppingQuantity(
                              toppingItem.id_topping_item,
                              QuantityStatus.Increase,
                            )
                          }
                          style={{
                            ...componentStyles.quantityIcon,
                            borderTopEndRadius: 4,
                            borderBottomEndRadius: 4,
                          }}>
                          <Text style={{fontSize: 24, lineHeight: 24}}>+</Text>
                        </Pressable>
                      </View>
                      <Text
                        style={{
                          ...styles.title1,
                          flex: 2,
                          textAlign: 'right',
                        }}>
                        ${getFinalToppingPrice(toppingItem)}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
          {(orderItem && orderItem.quantity != 0) ? <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 24,
            }}>
            <Pressable
              style={{...componentStyles.bottomButton, backgroundColor: '#3F84AB'}}
              onPress={() => props.submitOrderItem(orderItem)}>
              <Text style={{...styles.body1, color: '#ffffff'}}>SAVE</Text>
            </Pressable> 
            <Pressable
              style={{
                ...componentStyles.bottomButton,
                backgroundColor: '#C82333',
                marginLeft: 12,
              }}
              onPress={() => props.closeModal(false)}>
              <Text style={{...styles.body1, color: '#ffffff'}}>CLOSE</Text>
            </Pressable>
          </View>:  <Text style={{ ...styles.title1, color: 'red', textAlign: 'center', padding: 16}}>First add item and then customized it's toopping items</Text>}
        </View>
      </View>
    </Modal>
  );
};

const componentStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 20,
  },
  bottomButton: {
    height: 32,
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  quantityIcon: {
    height: 32,
    width: 32,
    padding: 4,
    backgroundColor: '#bac3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityLabel: {
    height: 32,
    width: 32,
    borderBottomColor: '#bac3ff',
    borderTopColor: '#bac3ff',
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  headline6: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: '#000000',
  },
  title1: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.25,
    color: '#000000',
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: '#000000',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    color: '#000000',
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.25,
    color: '#2c00f2',
  },
});

export default OrderCustomizedToppingModal;
