import React, {useEffect, useState} from 'react';

import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import {GET_PARENT_STUDENT_EVENT_LIST} from '../../services/ENDPOINT';
import styles, {textColor, themeColor} from '../../styles/Index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EventList = ({navigation}) => {
  const [eventList, setEventsList] = useState([]);

  useEffect(() => {
    getEventList();
  }, []);

  const getEventList = async () => {
    try {
      const data = await GET_PARENT_STUDENT_EVENT_LIST();
      if (data.code === 200 || data.code === '200') {
        console.log(data.data);
        setEventsList(data.data);
      } else {
        console.log(data);
      }
    } catch (e) {
      console.log(e);
    }
  };
  
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
        <Text style={{...styles.appBarTitle}}>Events</Text>
      </View>
      <View style={{flex: 1}}>
        {eventList.length > 0 ? (
          <ScrollView>
            {eventList.map((child, index) => {
              return (
                <View style={{...componentStyles.childContainer}} key={child.id}>
                  <View style={{...componentStyles.childHeader}}>
                    <View>
                      <Text style={{ ...styles.title1, color: textColor.white}}>{child.first_name + ' ' + child.last_name}</Text>
                      <Text style={{ ...styles.body1, color: textColor.white}}>{child.school.school_name}</Text>
                    </View>
                    <View style={{ flex:1, paddingLeft: 16}}>
                    <Text style={{ ...styles.title1, color: textColor.tertiary, textAlign: 'right',}}>{child.grade_division_name}</Text>
                    </View>
                  </View>
                  {child.school.events.map((event, index) => {
                    return (
                      <View
                        style={{...componentStyles.borderBox}}
                        key={event.id}>
                        <View
                          style={{
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                          }}>
                          <View>
                            <Text style={{...styles.title1}}>
                              {event.event_name}
                            </Text>
                            <Text style={{...styles.body1}}>
                              {event.vendor.restaurant_name}
                            </Text>
                          </View>
                          <View>
                            {event.id_order === null &&
                              new Date().getTime() <=
                                new Date(
                                  new Date(event.cutoff_date).setHours(
                                    23,
                                    60,
                                    60,
                                  ),
                                ).getTime() && (
                                <MaterialIcons
                                  name="shopping-cart"
                                  size={28}
                                  color={themeColor.darkBlue}
                                  onPress={() =>
                                    navigation.navigate('OrderNow', {
                                      eventId: event.id,
                                      vendorId: event.vendor.id,
                                      childId: child.id,
                                      info: {
                                        childName:
                                        child.first_name +
                                          ' ' +
                                          child.last_name,
                                        gradeName:
                                        child.grade_division_name,
                                        schoolName:
                                        child.school.school_name,
                                        eventDate: event.cutoff_date,
                                      },
                                    })
                                  }
                                />
                              )}
                          </View>
                        </View>
                        <View
                          style={{...componentStyles.dateRow, paddingTop: 8}}>
                          <View>
                            <Text style={{...styles.body2}}>Event Date</Text>
                            <Text style={{...styles.body2}}>
                              {event.scheduled_date.substring(0, 10)}
                            </Text>
                          </View>
                          <View>
                            <Text
                              style={{
                                ...styles.body2,
                                color: themeColor.darkBlue,
                              }}>
                              Cutoff Date
                            </Text>
                            <Text
                              style={{
                                ...styles.body2,
                                color: themeColor.darkBlue,
                              }}>
                              {event.cutoff_date.substring(0, 10)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View></View>
        )}
      </View>
    </SafeAreaView>
  );
};

const componentStyles = StyleSheet.create({
  borderBox: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: themeColor.darkBlue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  childContainer: {
    borderRadius: 4,
    borderWidth: 1,
    paddingBottom: 8,
    borderColor: themeColor.darkBlue,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  childHeader: {
    backgroundColor: themeColor.darkBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EventList;
