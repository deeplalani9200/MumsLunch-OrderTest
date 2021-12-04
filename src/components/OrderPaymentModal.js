import React from 'react';
import {StyleSheet, View, Modal, Text, Pressable} from 'react-native';
import styles, {textColor, themeColor} from '../styles/Index';
import {CardField, useConfirmPayment} from '@stripe/stripe-react-native';
import {STRIPE_CREATE_ORDER, STRIPE_PAYMENT_CAPTURE, CANCEL_ORDER_NOW} from '../services/api/Index';
import { financial, getIpAddress } from '../Shared/functions';

const OrderPaymentModal = props => {

  const {confirmPayment, loading} = useConfirmPayment();

  const handlePayment = async () => {
    try {
      const ip = await getIpAddress();
      const data = {
        email: "hinata@ml.com",
        amount: Math.round(Number(props.amount)*100),
        currency: "cad",
      };
  
      try {
        const order = await STRIPE_CREATE_ORDER(data);
        const clientSecret = order["client_secret"]; 

      const {paymentIntent, error} = await confirmPayment(clientSecret, {
        type: 'Card',
        // billingDetails: {email: 'payreactnative@ml.com', name: 'payreactnative'},
      });

      if (error) {
        console.log('Payment confirmation error', error);
      } else if (paymentIntent) {
        console.log('Success from promise', paymentIntent);
        try {
          const stripePaymentCapturePayload = {
            id: paymentIntent.id,
            orderIds: props.orderIdList,
            ip_address: ip,
          }
          const captureDetails = await STRIPE_PAYMENT_CAPTURE(stripePaymentCapturePayload)
          if (captureDetails.data.paymentId && captureDetails.data.status == 'succeeded' && (captureDetails.status == 200 || captureDetails.status == '200')) {
            console.log("Order placed successfully");
            props.closeModal(true);
          }else{
            console.log(captureDetails?.message, 'else stripe capture');
            props.closeModal(false);
          }
        } catch (e) {
          console.log(e);
          console.log("Payment failed!");
          props.closeModal(false);
        }
      }
    } catch (e) {
      console.log(e);
      console.log('error catched');
    }
  }catch(e){
    console.log(e)
    console.log('error catch in first part')
  }
  };

  const handleCancelOrder = async () => {
    try{ 
      const ip =  await getIpAddress();
      for(let i=0; i<props.orderIdList.length; i++){
        const cancelOrderStatus = await CANCEL_ORDER_NOW({id:  props.orderIdList[i], ip_address: ip});
        if(cancelOrderStatus.code == 200 || cancelOrderStatus.code == '200'){
        }else{
          console.log(data.message, 'in else cancel order');
        }
      }
      console.log('Your order has been cancelled successfully');
      props.closeModal(false);
    }catch(e){
      console.log(e)
      console.log('something goes wrong handleCancelOrder');
    }
  }

  return (
    <Modal animationType="slide" transparent visible>
      <View style={{...componentStyles.modalBackground}}>
        <View style={{...componentStyles.modalContainer}}>
          <Text style={{...styles.headline6, paddingBottom: 8}}>
            Order Payment
          </Text>
          <View>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
              }}
              style={{
                width: '100%',
                height: 50,
                marginVertical: 30,
              }}
              onCardChange={cardDetails => {
                console.log('cardDetails', cardDetails);
              }}
              onFocus={focusedField => {
                console.log('focusField', focusedField);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 24,
            }}>
            <Pressable
              style={{
                ...componentStyles.confirmationButton,
                backgroundColor: themeColor.darkBlue,
              }}
              onPress={() => handleCancelOrder()}>
              <Text style={{...styles.body1, color: textColor.white}}>
                CANCEL ORDER
              </Text>
            </Pressable>
            <Pressable
              style={{
                ...componentStyles.confirmationButton,
                backgroundColor: themeColor.darkBlue,
              }}
              disabled={loading}
              onPress={() => handlePayment()}>
              <Text style={{...styles.body1, color: textColor.white}}>
                Pay <Text style={{color: textColor.tertiary}}>{financial(props.amount)}</Text>
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 20,
  },
  confirmationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
});
export default OrderPaymentModal;
