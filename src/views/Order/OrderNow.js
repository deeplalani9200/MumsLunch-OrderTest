import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import {
  GET_RESTAURANT_MENU_ID,
  GET_CART_BY_ID,
  ADD_TO_CART,
  REMOVE_CART_ITEMS,
  UPDATE_CART_ITEM_QTY,
} from '../../services/ENDPOINT';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {financial, itemInformation} from '../../Shared/functions';
import OrderCustomizedToppingModal from '../../components/OrderCustomizedToppingModal';
import {NavigationContainer} from '@react-navigation/native';
import styles, {textColor, themeColor} from '../../styles/Index';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductInfoModal from '../../components/ProductInfoModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

const OrderNow = ({route, navigation}) => {
  const [eventItemList, setEventItemList] = useState([]);
  const [orderItemList, setOrderItemList] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [eventCartItemList, setEventCartItemList] = useState([]);
  const [isloader, setLoader] = useState(false);
  const [customizedToppingItem, setCustomizedToppingItem] = useState(null);
  const [showCustomizedToppingModal, setShowCustomizedToppingModal] =
    useState(false);
  const [showProductInfoModal, setShowProductInfoModal] = useState(false);
  const [infoItem, setInfoItem] = useState(null);
  const [shimmerLoading, setShimmerLoading] = useState(false);

  const RemoveCartItemTypes = {
    RemoveItems: 2,
    RemoveAllItems: 1,
  };

  const QuantityStatus = {
    Increase: 1,
    Decrease: 2,
  };

  useEffect(() => {
    setLoginUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo) {
      getEventInfo();
    }
  }, [userInfo]);

  const setLoginUserInfo = async () => {
    const loginInfo = await AsyncStorage.getItem('eb-mums-lunch:loginInfo');
    setUserInfo(JSON.parse(loginInfo));
  };

  const getEventInfo = async () => {
    try {
      setShimmerLoading(true);
      const payload = {
        id_vendor: route.params.vendorId,
        eventId: route.params.eventId,
      };
      const data = await GET_RESTAURANT_MENU_ID(payload);
      const cartData = await GET_CART_BY_ID(userInfo.id);
      if (
        (data.code === 200 || data.code === '200') &&
        (cartData.code === 200 || cartData.code === '200')
      ) {
        setEventItemList(data.data);
        setOrderItemFromCartItem(cartData.data, data.data);
      } else {
        console.log('error');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setShimmerLoading(false);
    }
  };

  const setOrderItemFromCartItem = (cartData, passedEventItemList) => {
    // console.log("passedEventItemList");
    // console.log(passedEventItemList);

    // for (const childCart of cartData.carts) {
    //   if (childCart.id == 41) {
    //     for (const eventCart of childCart.carts) {
    //       if (eventCart.id_event == route.params.eventId) {
    //         console.log("eventCart.cart_items")
    //         console.log(eventCart.cart_items)
    //         const tempEventItem = for(const eventItem of passedEventItemList){
    //           console.log("eventItem")
    //           console.log(eventItem)
    //           const findCartItem = eventCart.cart_items.find(cartItem => cartItem.id_vendor_menu_items == eventItem.id);
    //           console.log("findCartItem")
    //           console.log(findCartItem)
    //           if(findCartItem){

    //           }

    //           return {}
    //         }

    //       }}}}

    let objEventItemList = [];
    if (passedEventItemList) {
      objEventItemList = passedEventItemList;
    } else {
      objEventItemList = eventItemList;
    }

    let isOrderListSet = false;
    let totalCartItem = 0;
    // for (const childCart of cartData.carts) {
    //   for (const eventCart of childCart.carts) {
    //     for(const cartItem of eventCart.cart_items){
    //       totalCartItem += cartItem.quantity;
    //     }
    //   }
    // }

    // localStorage.setItem("eb-mums-lunch:cartItemTotal", totalCartItem);
    // props.addCartInfoHandler(totalCartItem);

    for (const childCart of cartData.carts) {
      if (childCart.id == route.params.childId) {
        for (const eventCart of childCart.carts) {
          if (eventCart.id_event == route.params.eventId) {
            setEventCartItemList(eventCart);
            let tempOrderItemList = [];
            for (const cartItem of eventCart.cart_items) {
              const findEventItem = objEventItemList.find(
                eventItem => eventItem.id == cartItem.id_vendor_menu_items,
              );
              let toppingQuantity = [];
              for (const topping of findEventItem.product_topping_items) {
                const findCartToppingItem = cartItem.cart_topping_items.find(
                  cartTopping =>
                    cartTopping.id_topping_item == topping.id_topping_item,
                );
                toppingQuantity.push({
                  id: topping.id_topping_item,
                  freebieQuantity: topping.freebie_qty,
                  quantity: findCartToppingItem
                    ? findCartToppingItem.ordered_qty
                    : 0,
                });
              }
              tempOrderItemList.push({
                item: findEventItem,
                toppingQuantity,
                quantity: cartItem.quantity,
              });
            }
            tempOrderItemList.sort((a, b) => {
              const keyA = a.item.id,
                keyB = b.item.id;
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            setOrderItemList(tempOrderItemList);
            isOrderListSet = true;
            break;
          }
        }
      }
    }

    if (!isOrderListSet) {
      setOrderItemList([]);
    }
    return 0;
  };

  const getParentCart = async () => {
    try {
      setLoader(true);
      const cartData = await GET_CART_BY_ID(userInfo.id);
      if (cartData.code === 200 || cartData.code === '200') {
        setOrderItemFromCartItem(cartData.data, null);
      } else {
        console.log('something wrong getParentcart');
      }
    } catch (e) {
      console.log('something wrong getParentcart');
    }
  };

  const checkApiCallAddToCart = async currentOrderItemList => {
    const timer = checkApiCallAddToCart.timer;
    if (timer) {
      clearTimeout(timer);
    }
    checkApiCallAddToCart.timer = setTimeout(async () => {
      const order_line_items = currentOrderItemList.map(orderItem => {
        let order_line_topping_items = [];
        for (const topping of orderItem.toppingQuantity) {
          if (topping.quantity != 0) {
            order_line_topping_items.push({
              id_topping_item: topping.id,
              ordered_qty: topping.quantity,
            });
          }
        }
        return {
          id_vendor_menu_items: orderItem.item.id,
          quantity: orderItem.quantity,
          order_line_topping_items,
        };
      });

      const requestData = {
        id_event: route.params.eventId,
        id_student: 41,
        id_vendor: route.params.vendorId,
        order_line_items,
        order_total_cost: getOrderTotalPrice(),
      };

      try {
        setLoader(true);
        const data = await ADD_TO_CART(requestData);
        if (data.code === 200 || data.code === '200') {
          getParentCart();
        } else {
          console.log('something wrong checkApiCallAddToCart');
        }
      } catch ({data}) {
        console.log('something wrong checkApiCallAddToCart');
      } finally {
        setLoader(false);
      }
    }, 500);
  };

  const getOrderTotalPrice = () => {
    let price = 0;
    for (const orderItem of orderItemList) {
      price +=
        orderItem.quantity * orderItem.item.item_price +
        getItemToppingPrice(orderItem);
    }
    return financial(price);
  };

  const addItemToCart = eventItem => {
    const timer = addItemToCart.timer;
    if (timer) {
      clearTimeout(timer);
    }
    addItemToCart.timer = setTimeout(async () => {
      const cartItem = orderItemList.find(i => eventItem.id == i.item.id);

      if (!cartItem) {
        let toppingQuantity = [];
        if (eventItem.product_topping_items.length !== 0) {
          for (const topping of eventItem.product_topping_items) {
            toppingQuantity.push({
              id: topping.id_topping_item,
              quantity: topping.freebie_qty,
              freebieQuantity: topping.freebie_qty,
            });
          }
        }
        const data = {
          item: eventItem,
          toppingQuantity: toppingQuantity,
          quantity: 1,
        };

        checkApiCallAddToCart([...orderItemList, data]);
      } else {
        const updatedOrderItemList = orderItemList.map(orderItem => {
          if (eventItem.id === orderItem.item.id) {
            const toppingQuantity = orderItem.toppingQuantity.map(topping => {
              return {
                ...topping,
                quantity: topping.freebieQuantity * (orderItem.quantity + 1),
              };
            });

            return {
              ...orderItem,
              toppingQuantity: toppingQuantity,
              quantity: orderItem.quantity + 1,
            };
          }
          return orderItem;
        });
        checkApiCallAddToCart(updatedOrderItemList);
      }
    }, 500);
  };

  const getItemQuantity = item => {
    const orderItem = orderItemList.find(i => item.id == i.item.id);
    return orderItem ? orderItem.quantity : 0;
  };

  const removeItemFromCart = async item => {
    const timer = removeItemFromCart.timer;
    if (timer) {
      clearTimeout(timer);
    }
    removeItemFromCart.timer = setTimeout(async () => {
      const tempOrderItem = orderItemList.find(i => item.id == i.item.id);
      let payload = {IDs: [], type: RemoveCartItemTypes.RemoveItems};
      for (const cartItem of eventCartItemList.cart_items) {
        if (cartItem.id_vendor_menu_items == tempOrderItem.item.id) {
          payload = {...payload, IDs: [cartItem.id]};
          break;
        }
      }
      try {
        setLoader(true);
        const data = await REMOVE_CART_ITEMS(payload);
        if (data.code === 200 || data.code === '200') {
          await getParentCart();
        } else {
          console.log('something wrong removeItemFromCart');
        }
      } catch (e) {
        console.log('something wrong removeItemFromCart');
      } finally {
        setLoader(false);
      }
    }, 500);
  };

  const getItemToppingPrice = orderItem => {
    let price = 0;
    for (const topping of orderItem.toppingQuantity) {
      if (topping.quantity != 0) {
        if (
          topping.quantity - topping.freebieQuantity * orderItem.quantity >
          0
        ) {
          const findToppingItem = orderItem.item.product_topping_items.find(
            item => topping.id == item.id_topping_item,
          );
          price +=
            findToppingItem.item_price *
            (topping.quantity - topping.freebieQuantity * orderItem.quantity);
        }
      }
    }
    return price;
  };

  const checkInOrderItemList = item => {
    const findItem = orderItemList.find(
      orderItem => orderItem.item.id == item.id,
    );
    return findItem ? true : false;
  };

  const updateOrderItemQuantity = async (orderItem, status) => {
    const timer = updateOrderItemQuantity.timer;
    if (timer) {
      clearTimeout(timer);
    }
    updateOrderItemQuantity.timer = setTimeout(async () => {
      if (status == QuantityStatus.Decrease && orderItem.quantity <= 1) {
        return;
      }

      const findEventCartItem = eventCartItemList.cart_items.find(
        cartItem => cartItem.id_vendor_menu_items == orderItem.item.id,
      );
      if (!findEventCartItem) return;

      const payload = {
        Id: findEventCartItem.id,
        qtyToUpdate:
          QuantityStatus.Increase == status
            ? orderItem.quantity + 1
            : orderItem.quantity - 1,
      };

      try {
        setLoader(true);
        const cartData = await UPDATE_CART_ITEM_QTY(payload);
        if (cartData.code === 200 || cartData.code === '200') {
          await getParentCart();
        } else {
          console.log('something wrong updateOrderItemQuantity');
        }
      } catch ({data}) {
        console.log('something wrong updateOrderItemQuantity');
      } finally {
        setLoader(false);
      }
    }, 500);
  };

  const getOrderTotalQuantity = () => {
    let quantity = 0;
    for (const orderItem of orderItemList) {
      quantity += orderItem.quantity + getItemToppingQuantity(orderItem);
    }
    return quantity;
  };

  const getItemToppingQuantity = orderItem => {
    let quantity = 0;
    for (const topping of orderItem.toppingQuantity) {
      quantity += topping.quantity;
    }
    return quantity;
  };

  const openCustomizedToppingModal = item => {
    console.log('item');
    console.log(item);
    // orderItemList.map(d => console.log(d));
    const findOrderItem = orderItemList.find(
      orderItem => orderItem.item.id == item.id,
    );
    console.log('findOrderItem');
    console.log(findOrderItem);
    console.log({item: item, toppingQuantity: [], quantity: 0});
    if (!findOrderItem) {
      setCustomizedToppingItem({item: item, toppingQuantity: [], quantity: 0});
    } else {
      setCustomizedToppingItem(findOrderItem);
    }
    setShowCustomizedToppingModal(true);
  };

  const submitCustomizedToppingModal = submitOrderItem => {
    const timer = updateOrderItemQuantity.timer;
    if (timer) {
      clearTimeout(timer);
    }
    updateOrderItemQuantity.timer = setTimeout(async () => {
      setCustomizedToppingItem(null);
      setShowCustomizedToppingModal(false);
      const tempOrderItemList = orderItemList.map(orderItem => {
        if (orderItem.item.id == submitOrderItem.item.id) {
          return submitOrderItem;
        }
        return orderItem;
      });
      checkApiCallAddToCart(tempOrderItemList);
    }, 500);
  };

  const removeAllItemFromCart = async () => {
    const timer = removeAllItemFromCart.timer;
    if (timer) {
      clearTimeout(timer);
    }
    removeAllItemFromCart.timer = setTimeout(async () => {
      const payload = {
        IDs: [eventCartItemList.id],
        type: RemoveCartItemTypes.RemoveAllItems,
      };
      try {
        setLoader(true);
        const data = await REMOVE_CART_ITEMS(payload);
        if (data.code === 200 || data.code === '200') {
          await getParentCart();
        } else {
          toast.error(data.message);
        }
      } catch ({data}) {
        toast.error(data?.message || UNKNOWN_ERROR_TRY_AGAIN);
      } finally {
        setLoader(false);
      }
    }, 500);
  };

  const openProductInfoModal = (item, info) => {
    setInfoItem({item, info});
    setShowProductInfoModal(true);
  };

  return (
    <SafeAreaView style={{backgroundColor: '#ffffff', height: '100%'}}>
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
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
            <Text style={{...styles.appBarTitle}}>Order Now</Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <MaterialIcons
                name="shopping-cart"
                size={28}
                color="#ffffff"
                onPress={() => navigation.navigate('Cart')}
              />
            </View>
          </View>
          <View style={{...componentStyles.header}}>
            <Text style={{...styles.title1, color: '#ffffff'}}>
              {route.params.info.childName} -{' '}
              <Text style={{color: textColor.tertiary}}>
                {route.params.info.gradeName}
              </Text>
            </Text>
            <Text
              style={{
                ...styles.body1,
                color: '#ffffff',
                paddingTop: 4,
              }}>
              {route.params.info.schoolName} |{' '}
              <Text style={{color: textColor.tertiary}}>
                {route.params.info.eventDate.substring(0, 10)}
              </Text>
            </Text>
          </View>
          <View style={{...componentStyles.itemContainer, flex: 1}}>
            {eventItemList.length !== 0 ? (
              <ScrollView>
                {eventItemList.map((item, index) => {
                  return (
                    <View
                      style={{...componentStyles.foodItemContainer}}
                      key={index}>
                      {getItemQuantity(item) > 0 && (
                        <View style={{...componentStyles.itemQuantityBadge}}>
                          <Text style={{...styles.body2, color: 'white'}}>
                            {getItemQuantity(item)}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                        }}>
                        <Image
                          style={componentStyles.foodImage}
                          source={require('../../Assets/images/pizza_3.jpg')}
                        />
                        <View style={{marginRight: 8, alignItems: 'flex-end'}}>
                          <Text style={{...styles.headline5}}>
                            ${item.item_price}
                          </Text>
                          <View style={{flexDirection: 'row', paddingTop: 8}}>
                            {checkInOrderItemList(item) && (
                              <View style={{marginRight: 8}}>
                                <MaterialIcons
                                  name="remove-circle-outline"
                                  color="#ed1a1a"
                                  onPress={() => removeItemFromCart(item)}
                                  size={32}
                                />
                              </View>
                            )}
                            <MaterialIcons
                              name="add-circle-outline"
                              color={themeColor.blue}
                              onPress={() => addItemToCart(item)}
                              size={32}
                            />
                          </View>
                        </View>
                      </View>
                      <Text style={{...styles.headline6, paddingTop: 4}}>
                        {item.product_name}
                        {item.product_topping_items.length !== 0 && (
                          <Text
                            style={{...styles.body1, color: textColor.darkcyan}}
                            onPress={() => openCustomizedToppingModal(item)}>
                            {' '}
                            topping items
                          </Text>
                        )}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingTop: 8,
                          alignItems: 'center',
                        }}>
                        <MaterialIcons
                          name="info-outline"
                          size={32}
                          color="#000000"
                          onPress={() =>
                            openProductInfoModal(item, itemInformation.Product)
                          }
                        />
                        {item.nutrition_values.length !== 0 && (
                          <Ionicons
                            style={{marginLeft: 12}}
                            name="nutrition-outline"
                            color="#2724c9"
                            size={32}
                            onPress={() =>
                              openProductInfoModal(
                                item,
                                itemInformation.Nutritional,
                              )
                            }
                          />
                        )}
                        {item.allergens.length !== 0 && (
                          <Feather
                            style={{marginLeft: 12}}
                            color="#e58342"
                            name="alert-triangle"
                            size={32}
                            onPress={() =>
                              openProductInfoModal(
                                item,
                                itemInformation.Allergen,
                              )
                            }
                          />
                        )}
                        {item.tags && item.tags.includes('Veg-Friendly') && (
                          <View
                            style={{
                              ...componentStyles.vegFriendlyBorder,
                              marginLeft: 12,
                            }}>
                            <MaterialCommunityIcons
                              name="square"
                              size={16}
                              color="#25d128"
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView>
                {Array.from(Array(10).keys()).map(item => (
                  <View
                    key={item}
                    style={{
                      justifyContent: 'center',
                      flexDirection: 'row',
                      marginVertical: 8,
                    }}>
                    <ShimmerPlaceHolder
                      LinearGradient={LinearGradient}
                      style={{...componentStyles.shimmerContainer}}
                      duration={1500}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
      {showCustomizedToppingModal && (
        <OrderCustomizedToppingModal
          closeModal={setShowCustomizedToppingModal}
          item={customizedToppingItem}
          submitOrderItem={submitCustomizedToppingModal}
        />
      )}
      {showProductInfoModal && (
        <ProductInfoModal
          closeModal={setShowProductInfoModal}
          infoItem={infoItem}
        />
      )}
    </SafeAreaView>
  );
};

const componentStyles = StyleSheet.create({
  shimmerContainer: {
    height: 140,
    width: '90%',
  },
  vegFriendlyBorder: {
    borderColor: '#25d128',
    borderWidth: 1,
    padding: 2,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    color: 'black',
    textAlign: 'center',
    letterSpacing: 0.25,
  },
  header: {
    borderRadius: 8,
    backgroundColor: '#003778',
    padding: 8,
    marginHorizontal: 16,
    elevation: 2,
    marginTop: 16,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingTop: 4,
    marginBottom: 8,
  },
  foodItemContainer: {
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6b6bea',
  },
  foodImage: {
    height: 72,
    width: 72,
    borderRadius: 8,
  },
  itemQuantityBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    borderRadius: 16,
    height: 28,
    width: 28,
    backgroundColor: '#e44e59',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OrderNow;
