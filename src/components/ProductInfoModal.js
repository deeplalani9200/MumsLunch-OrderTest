import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Modal, Text} from 'react-native';
import styles from '../styles/Index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {itemInformation} from '../Shared/functions';

const ProductInfoModal = props => {
  const ProductInfo = () => {

    return (
      <View>
        <Text style={{...styles.title1}}>Description :</Text>
        <Text style={{...styles.body1}}>
          {props.infoItem.item.product_description}
        </Text>
        {props.infoItem.item.ingredients ? (
          <View>
            <Text style={{...styles.title1, paddingTop: 16}}>
              Ingrediants :
            </Text>
            <Text style={{...styles.body1}}>
              {props.infoItem.item.ingredients}
            </Text>
          </View>
        ) : (
          <View></View>
        )}
        {props.infoItem.item.tags ? (
          <View>
            <Text style={{...styles.title1, paddingTop: 16}}>Tags :</Text>
            <Text style={{...styles.body1}}>{props.infoItem.item.tags}</Text>
          </View>
        ) : (
          <View></View>
        )}
      </View>
    );
  };

  const NutritionalInfo = () => {
    return (
      <View>
        {props.infoItem.item.nutrition_values.map((nutrition, index) => {
          return (
            <View
              key={index}
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{...styles.body1}}>
                {nutrition.nutritional_name}:
              </Text>
              <Text style={{...styles.body1}}>
                {nutrition.nutrition_term_value}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const AllergenInfo = () => {
    return (
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {props.infoItem.item.allergens.map((allergen, index) => {
          return (
            <Text key={index} style={{...styles.body1}}>
              {allergen}
              {index + 1 !== props.infoItem.item.allergens.length ? ', ' : ''}
            </Text>
          );
        })}
      </View>
    );
  };

  const showInfo = () => {
    switch (props.infoItem.info) {
      case itemInformation.Product:
        return ProductInfo();
      case itemInformation.Nutritional:
        return NutritionalInfo();
      case itemInformation.Allergen:
        return AllergenInfo();
      default:
        return <View></View>;
    }
  };

  const getInfo = () => {
    switch (props.infoItem.info) {
      case itemInformation.Product:
        return 'Product Info';
      case itemInformation.Nutritional:
        return 'Nutritions';
      case itemInformation.Allergen:
        return 'Allergens';
      default:
        return '';
    }
  };

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
              {props.infoItem.item.product_name} {getInfo()}
            </Text>
            <MaterialIcons
              name="close"
              size={24}
              onPress={() => props.closeModal(false)}
            />
          </View>
          {showInfo()}
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
});
export default ProductInfoModal;
