import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  GET_CART_BY_ID,
  UPDATE_CART_ITEM_QTY,
  ADD_TO_CART,
  REMOVE_CART_ITEMS,
  ADD_ORDER_NOW
} from '../services/ENDPOINT';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, {textColor, themeColor, appBar} from '../styles/Index';
import {financial, UserType} from '../Shared/functions';
import CustomizedToppingModal from './CustomizedToppingModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import GlobalConfirmationModal from './GlobalConfirmationModal';
import {StripeProvider} from '@stripe/stripe-react-native';
import OrderPaymentModal from './OrderPaymentModal';

const Cart = ({navigation}) => {
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoader, setLoader] = useState(false);
  const [iscartItemFetched, setIsCartItemFetched] = useState(false);
  const [showCustomizedToppingModal, setShowCustomizedToppingModal] =
    useState(false);
  const [customizedToppingItem, setCustomizedToppingItem] = useState(null);
  const [showEmptyCartConfirmationModal, setShowEmptyCartConfirmationModal] =
    useState(false);
  const [emptyCartPassedDetails, setEmptyCartPassedDetails] = useState(null);
  const [orderIdList, setOrderIdList] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const QuantityStatus = {
    Increase: 1,
    Decrease: 2,
  };

  const CartType = {
    Event: 1,
    Child: 2,
    Full: 3,
  };

  useEffect(() => {
    setLoginUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo) {
      getParentCart();
    }
  }, [userInfo]);

  const setLoginUserInfo = async () => {
    const loginInfo = await AsyncStorage.getItem('eb-mums-lunch:loginInfo');
    setUserInfo(JSON.parse(loginInfo));
  };

  const getParentCart = async () => {
    try {
      const cartData = await GET_CART_BY_ID(userInfo.id);
      if (cartData.code === 200 || cartData.code === '200') {
        setExtraDetailsToCartItems(cartData.data.carts);
      } else {
        console.log('something wrong getParentcart');
      }
    } catch (e) {
      console.log('something wrong getParentcart');
    } finally {
      setIsCartItemFetched(true);
    }
  };

  const setExtraDetailsToCartItems = ParentCart => {
    let cartTotalCost = 0;
    let cartTotalItem = 0;
    const tempParentCart = ParentCart.map(childCart => {
      let childTotalCost = 0;
      let childTotalItem = 0;
      let childEventIdList = [];
      const tempCarts = childCart.carts.map(eventCart => {
        childEventIdList.push(eventCart.id);
        let eventTotalCost = 0;
        let eventTotalItem = 0;

        const tempCartItem = eventCart.cart_items.map(cartItem => {
          let extraToppingTotal = 0;
          let extraToppingQuantity = 0;
          let totalToppingQuantity = 0;
          const tempCartToppingItem = cartItem.cart_topping_items.map(
            cartToppingItem => {
              totalToppingQuantity += cartToppingItem.ordered_qty;
              const toppingQuantity =
                cartToppingItem.ordered_qty - cartToppingItem.freebie_qty;
              if (toppingQuantity > 0) {
                extraToppingTotal +=
                  cartToppingItem.product_cost * toppingQuantity;
                extraToppingQuantity += toppingQuantity;
              }
              return cartToppingItem;
            },
          );
          eventTotalCost +=
            extraToppingTotal + cartItem.product_cost * cartItem.quantity;
          eventTotalItem += totalToppingQuantity + cartItem.quantity;

          return {
            ...cartItem,
            cart_topping_items: tempCartToppingItem,
            totalToppingQuantity,
            extraToppingTotal,
            extraToppingQuantity,
          };
        });

        childTotalCost += eventTotalCost;
        childTotalItem += eventTotalItem;

        return {
          ...eventCart,
          cart_items: tempCartItem,
          eventTotalCost,
          eventTotalItem,
        };
      });

      cartTotalCost += childTotalCost;
      cartTotalItem += childTotalItem;

      return {
        ...childCart,
        carts: tempCarts,
        childTotalCost,
        childTotalItem,
        childEventIdList,
      };
    });

    setCartItems({parentCarts: tempParentCart, cartTotalCost, cartTotalItem});
  };

  const updateOrderItemQuantity = async (cartItem, status) => {
    const timer = updateOrderItemQuantity.timer;
    if (timer) {
      clearTimeout(timer);
    }
    updateOrderItemQuantity.timer = setTimeout(async () => {
      if (status == QuantityStatus.Decrease && cartItem.quantity <= 1) {
        return;
      }

      const payload = {
        Id: cartItem.id,
        qtyToUpdate:
          QuantityStatus.Increase == status
            ? cartItem.quantity + 1
            : cartItem.quantity - 1,
      };

      try {
        setLoader(true);
        const cartData = await UPDATE_CART_ITEM_QTY(payload);
        if (cartData.code === 200 || cartData.code === '200') {
          await getParentCart();
        } else {
          console.log('something wrong updateOrderItemQuantity');
        }
      } catch (e) {
        console.log('something wrong updateOrderItemQuantity');
      } finally {
        setLoader(false);
      }
    }, 500);
  };

  const openCustomizedToppingModal = (item, childId, eventId, vendorId) => {
    setCustomizedToppingItem({item, childId, eventId, vendorId});
    setShowCustomizedToppingModal(true);
  };

  const submitCustomizedToppingModal = async submitCartItem => {
    let order_line_items = [];
    let order_total_cost = 0;
    const temCartItems = cartItems.parentCarts.map(childCart => {
      if (childCart.id == customizedToppingItem.childId) {
        const tempCarts = childCart.carts.map(eventCart => {
          if (eventCart.id_event == customizedToppingItem.eventId) {
            const tempCartItem = eventCart.cart_items.map(cartItem => {
              let objCartItem;
              let order_line_topping_items = [];
              if (cartItem.id == submitCartItem.id) {
                objCartItem = submitCartItem;
              } else {
                objCartItem = cartItem;
              }
              const tempToppingItems = objCartItem.cart_topping_items.map(
                cartToppingItem => {
                  order_line_topping_items.push({
                    id_topping_item: cartToppingItem.id_topping_item,
                    ordered_qty: cartToppingItem.ordered_qty,
                  });
                  const toppingQuantity =
                    cartToppingItem.ordered_qty - cartToppingItem.freebie_qty;
                  if (toppingQuantity > 0) {
                    order_total_cost +=
                      cartToppingItem.product_cost * toppingQuantity;
                  }
                },
              );
              order_line_items.push({
                id_vendor_menu_items: objCartItem.id_vendor_menu_items,
                quantity: objCartItem.quantity,
                order_line_topping_items,
              });
              order_total_cost +=
                objCartItem.product_cost * objCartItem.quantity;
            });
          }
        });
      }
    });

    const requestData = {
      id_event: customizedToppingItem.eventId,
      id_student: customizedToppingItem.childId,
      id_vendor: customizedToppingItem.vendorId,
      order_line_items,
      order_total_cost: financial(order_total_cost),
    };

    setCustomizedToppingItem(null);
    setShowCustomizedToppingModal(false);

    try {
      setLoader(true);
      const data = await ADD_TO_CART(requestData);
      if (data.code === 200 || data.code === '200') {
        await getParentCart();
      } else {
        console.log('something wrong checkApiCallAddToCart');
      }
    } catch ({data}) {
      console.log('something wrong checkApiCallAddToCart');
    } finally {
      setLoader(false);
    }
  };

  const checkApiCallEmptyCart = async () => {
    const timer = checkApiCallEmptyCart.timer;
    if (timer) {
      clearTimeout(timer);
    }
    checkApiCallEmptyCart.timer = setTimeout(async () => {
      const payload = {
        IDs: emptyCartPassedDetails.recordId,
        type: emptyCartPassedDetails.type,
        parentId: userInfo.user_type == UserType.Parent ? userInfo.id : null,
        teacherId: userInfo.user_type == UserType.Parent ? null : userInfo.id,
      };
      try {
        setLoader(true);
        const data = await REMOVE_CART_ITEMS(payload);
        if (data.code === 200 || data.code === '200') {
          setEmptyCartPassedDetails(null);
          setShowEmptyCartConfirmationModal(false);
          await getParentCart();
        } else {
          toast.error(data.message);
        }
      } catch (e) {
        console.log('something goes wrong: empty cart ');
      } finally {
        setLoader(false);
      }
    }, 500);
  };

  const openEmptyCartConfirmationModal = (recordId, messageDetails) => {
    let message = '';
    switch (messageDetails.type) {
      case CartType.Full:
        message =
          'You are going to remove items from your cart. Would you like to proceed further?';
        break;
      case CartType.Child:
        message =
          'You are going to remove items from your cart for ' +
          messageDetails.childName +
          '. Would you like to proceed further?';
        break;
      case CartType.Event:
        message =
          'You are going to remove items from your cart for ' +
          messageDetails.eventName +
          ' for ' +
          messageDetails.childName +
          '. Would you like to proceed further?';
        break;
    }
    const type = emptyCartPassedDetails.type == CartType.Full ? -1 : 1;
    setEmptyCartPassedDetails({recordId, type: type, message});
    setShowEmptyCartConfirmationModal(true);
  };

  const closeEmptyCartConfirmationModal = status => {
    if (status) {
      checkApiCallEmptyCart();
    } else {
      setShowEmptyCartConfirmationModal(false);
    }
  };

  const closeOrderPaymentModal = async (success) => {
    if(success){
      await checkApiCallEmptyCart();
    }
    setShowPaymentModal(false);
  };
  
  const checkApiCallAddOrder = async (type, childId, eventId) => {
    
    if(type == CartType.Full){
      setPaymentAmount(cartItems.cartTotalCost);
      setEmptyCartPassedDetails({
        recordId: [],
        type: -1,
        message: ''
      });
    }

    let orderPayloadList = [];
    for(const childCart of cartItems.parentCarts){
      if(!childId || childCart.id == childId){
        let eventCartIds = [];
        for(const eventCart of childCart.carts){
          eventCartIds.push(eventCart.id);
          if(!eventId || eventCart.id == eventId){
            let orderLineItems = [];
            for(const cartItem of eventCart.cart_items){
              let orderLineToppingItems = []
              for(const cartToppingItem of cartItem.cart_topping_items){
                orderLineToppingItems.push({
                  id_topping_item: cartToppingItem.id_topping_item,
                  ordered_qty: cartToppingItem.ordered_qty,
                });
              }
              orderLineItems.push({
                id_vendor_menu_items: cartItem.id_vendor_menu_items,
                quantity: cartItem.quantity,
                order_line_topping_items: orderLineToppingItems,
              })
            }
            orderPayloadList.push({
              id_event: eventCart.id_event,
              id_student: childCart.id,
              id_vendor: eventCart.id_vendor,
              order_line_items: orderLineItems,
              order_total_cost: eventCart.eventTotalCost,
            });
            if(type == CartType.Event){
              setPaymentAmount(eventCart.eventTotalCost)
              setEmptyCartPassedDetails({
                recordId: [eventCart.id],
                type: 1,
                message: ''
              });
            }
          }
        }
        
        if(type == CartType.Child){
          setPaymentAmount(childCart.childTotalCost);
          setEmptyCartPassedDetails({
            recordId: eventCartIds,
            type: 1,
            message: ''
          });
        }
      }
    }

    try {
      const data = await ADD_ORDER_NOW(orderPayloadList);
      if (data.code === 200 || data.code === "200") {
        setOrderIdList(data.data.orderId);
        setShowPaymentModal(true);
      } else {
        setEmptyCartPassedDetails(null)
        console.log(data.message);
      }
    } catch (e) {
      setEmptyCartPassedDetails(null)
      console.log('something goes wrong add order now');
    }

    return;
  }

  return (
    <SafeAreaView style={{height: '100%'}}>
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
        <Text style={{...styles.appBarTitle}}>Cart</Text>
      </View>
      {cartItems.parentCarts && cartItems.parentCarts.length !== 0 ? (
        <ScrollView style={{flex: 1, marginTop: 12}}>
          {cartItems.parentCarts.map((childCart, index) => {
            return (
              <View
                style={{paddingHorizontal: 12, paddingBottom: 12}}
                key={index}>
                <View style={{...componentStyles.childCartContainer}}>
                  <View style={{...componentStyles.childCartHeader}}>
                    <Text style={{...styles.title1, color: textColor.white}}>
                      {childCart.first_name + ' ' + childCart.last_name}
                    </Text>
                    <Text style={{...styles.title1, color: textColor.tertiary}}>
                      {childCart.grade_division_name}{' '}
                    </Text>
                  </View>
                  {childCart.carts.map((eventCarts, index) => {
                    return (
                      <View
                        style={{...componentStyles.eventCartContainer}}
                        key={index}>
                        <View style={{...componentStyles.eventCartHeader}}>
                          <View>
                            <Text
                              style={{
                                ...styles.title1,
                                color: textColor.white,
                              }}>
                              {eventCarts.event_name}
                            </Text>
                            <Text
                              style={{
                                ...styles.title1,
                                color: textColor.white,
                              }}>
                              {eventCarts.restaurant_name}
                            </Text>
                          </View>
                          <Text
                            style={{
                              ...styles.title1,
                              color: textColor.tertiary,
                            }}>
                            {eventCarts.scheduled_date.substring(0, 10)}
                          </Text>
                        </View>
                        {eventCarts.cart_items.map((cartItem, index) => {
                          return (
                            <View key={index} style={{paddingHorizontal: 12}}>
                              <Text style={{...styles.title1, paddingTop: 8}}>
                                {cartItem.product_name}
                                {cartItem.cart_topping_items.length !== 0 && (
                                  <Text
                                    style={{...styles.body1, color: '#008b8b'}}
                                    onPress={() =>
                                      openCustomizedToppingModal(
                                        cartItem,
                                        childCart.id,
                                        eventCarts.id_event,
                                        eventCarts.id_vendor,
                                      )
                                    }>
                                    {' '}
                                    topping items
                                  </Text>
                                )}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingTop: 6,
                                }}>
                                <Text style={{...styles.title1, flex: 2}}>
                                  ${cartItem.product_cost}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    flex: 3,
                                    justifyContent: 'center',
                                  }}>
                                  <Pressable
                                    onPress={() =>
                                      updateOrderItemQuantity(
                                        cartItem,
                                        QuantityStatus.Decrease,
                                      )
                                    }
                                    style={{
                                      ...componentStyles.quantityIcon,
                                      borderTopStartRadius: 4,
                                      borderBottomStartRadius: 4,
                                    }}>
                                    <Text
                                      style={{fontSize: 24, lineHeight: 24}}>
                                      -
                                    </Text>
                                  </Pressable>
                                  <View
                                    style={{...componentStyles.quantityLabel}}>
                                    <Text
                                      style={{
                                        ...styles.title1,
                                        textAlign: 'center',
                                      }}>
                                      {cartItem.quantity}
                                    </Text>
                                  </View>
                                  <Pressable
                                    onPress={() =>
                                      updateOrderItemQuantity(
                                        cartItem,
                                        QuantityStatus.Increase,
                                      )
                                    }
                                    style={{
                                      ...componentStyles.quantityIcon,
                                      borderTopEndRadius: 4,
                                      borderBottomEndRadius: 4,
                                    }}>
                                    <Text
                                      style={{fontSize: 24, lineHeight: 24}}>
                                      +
                                    </Text>
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
                                    cartItem.product_cost * cartItem.quantity,
                                  )}
                                </Text>
                              </View>
                              {cartItem.cart_topping_items.length !== 0 && (
                                <View style={{flexDirection: 'row'}}>
                                  <Text style={{...styles.title1, flex: 2}}>
                                    Topping
                                  </Text>
                                  <Text
                                    style={{
                                      ...styles.title1,
                                      flex: 3,
                                      textAlign: 'center',
                                    }}>
                                    {cartItem.totalToppingQuantity}
                                  </Text>
                                  <Text
                                    style={{
                                      ...styles.title1,
                                      flex: 2,
                                      textAlign: 'right',
                                    }}>
                                    ${financial(cartItem.extraToppingTotal)}
                                  </Text>
                                </View>
                              )}
                              <View
                                style={{
                                  paddingTop: 8,
                                  borderBottomColor: 'black',
                                  borderBottomWidth: 1,
                                }}
                              />
                            </View>
                          );
                        })}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignSelf: 'flex-end',
                            paddingTop: 16,
                            alignItems: 'center',
                          }}>
                          <View style={{flex: 1, paddingRight: 16}}>
                            <Text
                              style={{...styles.title1, textAlign: 'right'}}>
                              {eventCarts.event_name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignSelf: 'flex-end',
                            }}>
                            <Text
                              style={{
                                ...styles.title1,
                                ...componentStyles.orderTotalLabel,
                                marginRight: 16,
                              }}>
                              {eventCarts.eventTotalItem}
                            </Text>

                            <Text
                              style={{
                                ...styles.title1,
                                ...componentStyles.orderTotalLabel,
                                marginRight: 16,
                              }}>
                              ${financial(eventCarts.eventTotalCost)}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignSelf: 'flex-end',
                            paddingTop: 16,
                          }}>
                          <Text
                            onPress={() =>
                              openEmptyCartConfirmationModal([eventCarts.id], {
                                type: CartType.Event,
                                eventName: eventCarts.event_name,
                                childName:
                                  childCart.first_name +
                                  ' ' +
                                  childCart.last_name,
                              })
                            }
                            style={{
                              ...styles.title1,
                              ...componentStyles.orderTotalLabel,
                              marginRight: 16,
                            }}>
                            Empty Cart
                          </Text>
                          <Text
                            onPress={() => checkApiCallAddOrder(CartType.Event, childCart.id, eventCarts.id)}
                            style={{
                              ...styles.title1,
                              ...componentStyles.orderTotalLabel,
                              marginRight: 16,
                            }}>
                            Checkout
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'flex-end',
                      paddingTop: 16,
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 1, paddingRight: 16}}>
                      <Text style={{...styles.title1, textAlign: 'right'}}>
                        {childCart.first_name + ' ' + childCart.last_name}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
                      <Text
                        style={{
                          ...styles.title1,
                          ...componentStyles.orderTotalLabel,
                          marginRight: 16,
                        }}>
                        {childCart.childTotalItem}
                      </Text>
                      <Text
                        style={{
                          ...styles.title1,
                          ...componentStyles.orderTotalLabel,
                          marginRight: 16,
                        }}>
                        ${financial(childCart.childTotalCost)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'flex-end',
                      paddingTop: 16,
                      paddingBottom: 12,
                    }}>
                    <Text
                      onPress={() =>
                        openEmptyCartConfirmationModal(
                          childCart.childEventIdList,
                          {
                            type: CartType.Child,
                            eventName: '',
                            childName:
                              childCart.first_name + ' ' + childCart.last_name,
                          },
                        )
                      }
                      style={{
                        ...styles.title1,
                        ...componentStyles.orderTotalLabel,
                        marginRight: 16,
                      }}>
                      Empty Cart
                    </Text>
                    <Text
                      onPress={() => checkApiCallAddOrder(CartType.Child, childCart.id, null)}
                      style={{
                        ...styles.title1,
                        ...componentStyles.orderTotalLabel,
                        marginRight: 16,
                      }}>
                      Checkout
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              paddingTop: 4,
              alignItems: 'center',
            }}>
            <View style={{flex: 1, paddingRight: 16}}>
              <Text style={{...styles.title1, textAlign: 'right'}}>Total</Text>
            </View>
            <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
              <Text
                style={{
                  ...styles.title1,
                  ...componentStyles.orderTotalLabel,
                  marginRight: 16,
                }}>
                {cartItems.cartTotalItem}
              </Text>
              <Text
                style={{
                  ...styles.title1,
                  ...componentStyles.orderTotalLabel,
                  marginRight: 16,
                }}>
                ${financial(cartItems.cartTotalCost)}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              paddingTop: 16,
              paddingBottom: 12,
            }}>
            <Text
              onPress={() =>
                openEmptyCartConfirmationModal([], {
                  type: CartType.Full,
                  eventName: '',
                  childName: '',
                })
              }
              style={{
                ...styles.title1,
                ...componentStyles.orderTotalLabel,
                marginRight: 16,
              }}>
              Empty Cart
            </Text>
            <Text
              onPress={() => checkApiCallAddOrder(CartType.Full, null, null)}
              style={{
                ...styles.title1,
                ...componentStyles.orderTotalLabel,
                marginRight: 16,
              }}>
              Checkout
            </Text>
          </View>
        </ScrollView>
      ) : (
        iscartItemFetched && (
          <View style={{...componentStyles.emtyCartTextContainer}}>
            <Text style={{...styles.title1}}>
              There is no item added to the the cart.
            </Text>
          </View>
        )
      )}
      {showCustomizedToppingModal && (
        <CustomizedToppingModal
          closeModal={setShowCustomizedToppingModal}
          item={customizedToppingItem.item}
          submitOrderItem={submitCustomizedToppingModal}
        />
      )}
      {showEmptyCartConfirmationModal && (
        <GlobalConfirmationModal
          closeModal={closeEmptyCartConfirmationModal}
          title={'Empty Cart'}
          message={emptyCartPassedDetails.message}
        />
      )}
      {showPaymentModal && (
        <StripeProvider publishableKey="pk_test_HqQgfXNd8VDztXMky4n234de00uAgNy4k2">
          <OrderPaymentModal
            amount={paymentAmount}
            orderIdList={orderIdList}
            closeModal={closeOrderPaymentModal}
          />
        </StripeProvider>
      )}
    </SafeAreaView>
  );
};

const componentStyles = StyleSheet.create({
  childCartContainer: {
    borderColor: themeColor.darkBlue,
    borderRadius: 4,
    borderWidth: 1,
  },
  childCartHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: themeColor.darkBlue,
  },
  eventCartContainer: {
    borderColor: themeColor.darkBlue,
    borderRadius: 4,
    borderWidth: 1,
    marginHorizontal: 12,
    paddingBottom: 12,
    marginTop: 12,
  },
  eventCartHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: themeColor.darkBlue,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cartItemBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  orderTotalLabel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#003778',
    color: 'white',
  },
  emtyCartTextContainer: {
    marginTop: 16,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#002b7854',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default Cart;
