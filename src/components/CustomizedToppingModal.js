import React, {useEffect, useState} from 'react';
import {Modal, View, Text, StyleSheet, Pressable} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {financial} from '../Shared/functions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CustomizedToppingModal = props => {
  const [cartItem, setCartItem] = useState(null);

  const QuantityStatus = {
    Increase: 1,
    Decrease: 2,
  };

  useEffect(() => {
    setCartItem(props.item);
  }, []);

  const isChecked = toppingId => {
    const findCartToppingId = cartItem.cart_topping_items.find(
      cti => cti.id == toppingId,
    );
    return findCartToppingId.ordered_qty == 0 ? false : true;
  };

  const handleCheck = toppingId => {
    if(cartItem.quantity == 0){return}
    const tempCartToppingItem = cartItem.cart_topping_items.map(toppingItem => {
      if (toppingId == toppingItem.id) {
        return {
          ...toppingItem,
          ordered_qty:
            toppingItem.ordered_qty == 0
              ? toppingItem.freebie_qty == 0
                ? 1
                : toppingItem.freebie_qty
              : 0,
        };
      }
      return toppingItem;
    });
    setCartItem({...cartItem, cart_topping_items: tempCartToppingItem});
  };

  const updateToppingQuantity = (toppingId, status) => {
    const tempCartToppingItem = cartItem.cart_topping_items.map(toppingItem => {
      if (toppingId == toppingItem.id) {
        if (status == QuantityStatus.Decrease && toppingItem.ordered_qty <= 1) {
          return toppingItem;
        } else if (
          status == QuantityStatus.Increase &&
          toppingItem.ordered_qty == 0
        ) {
          return toppingItem;
        }

        return {
          ...toppingItem,
          ordered_qty:
            toppingItem.ordered_qty +
            (status == QuantityStatus.Increase ? 1 : -1),
        };
      }

      return toppingItem;
    });

    setCartItem({...cartItem, cart_topping_items: tempCartToppingItem});
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onRequestClose={() => {
        props.closeModal(false);
      }}>
      <View style={{...styles.modalBackground}}>
        <View style={{...styles.modalContainer}}>
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <Text style={{...styles.headline6}}>Select Topping Items</Text>
            <MaterialIcons
              name="close"
              size={24}
              onPress={() => props.closeModal(false)}
            />
          </View>
          <View style={{paddingTop: 8}}>
            {cartItem &&
              cartItem.cart_topping_items.length !== 0 &&
              cartItem.cart_topping_items.map(toppingItem => {
                return (
                  <View key={toppingItem.id} style={{paddingVertical: 4}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <CheckBox
                        value={isChecked(toppingItem.id)}
                        onValueChange={() => handleCheck(toppingItem.id)}
                      />
                      <Text style={{...styles.title1}}>
                        {toppingItem.topping_item_name}
                        <Text style={{...styles.body1, color: '#008b8b'}}>
                          {' '}
                          (Included Quantity: {toppingItem.freebie_qty})
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
                        ${toppingItem.product_cost}
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
                              toppingItem.id,
                              QuantityStatus.Decrease,
                            )
                          }
                          style={{
                            ...styles.quantityIcon,
                            borderTopStartRadius: 4,
                            borderBottomStartRadius: 4,
                          }}>
                          <Text style={{fontSize: 24, lineHeight: 24}}>-</Text>
                        </Pressable>
                        <View style={{...styles.quantityLabel}}>
                          <Text style={{...styles.title1, textAlign: 'center'}}>
                            {toppingItem.ordered_qty == 0 ? '' : toppingItem.ordered_qty}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            updateToppingQuantity(
                              toppingItem.id,
                              QuantityStatus.Increase,
                            )
                          }
                          style={{
                            ...styles.quantityIcon,
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
                        $
                        {financial(
                          toppingItem.ordered_qty - toppingItem.freebie_qty > 0
                            ? toppingItem.product_cost *
                                (toppingItem.ordered_qty -
                                  toppingItem.freebie_qty)
                            : 0,
                        )}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 24,
            }}>
            <Pressable
              style={{...styles.bottomButton, backgroundColor: '#3F84AB'}}
              onPress={() => props.submitOrderItem(cartItem)}>
              <Text style={{...styles.body1, color: '#ffffff'}}>SAVE</Text>
            </Pressable>
            <Pressable
              style={{
                ...styles.bottomButton,
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

const styles = StyleSheet.create({
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

export default CustomizedToppingModal;
