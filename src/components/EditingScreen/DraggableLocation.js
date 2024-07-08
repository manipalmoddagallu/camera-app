import React from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { images } from '../../assets/images/image';
import { COLOR } from '../../utils/Config';

const DraggableLocation = (props) => {
  return (
    <View style={{ flex: 1 }}>
      {props.selectedLocation ? (
        <Animated.View
          style={{
            position: 'absolute',
            left: props.selectedLocation.x,
            top: props.selectedLocation.y,
          }}
        >
          <View
            style={{
              backgroundColor: '#000',
              padding: hp(0.4),
              borderRadius: hp(1.5),
              flexDirection: 'row',
              alignItems: 'center',
              width:10
            }}
          >
            <Image
              source={images.LocationPin}
              style={{
                width: 30,
                height: 30,
                resizeMode: 'contain',
                tintColor: COLOR.GREEN,
              }}
            />
            <Text style={{ fontSize: hp(2.5), color: '#000', marginLeft: 10 }}>
              {props.selectedLocation.text}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};

export default DraggableLocation;
