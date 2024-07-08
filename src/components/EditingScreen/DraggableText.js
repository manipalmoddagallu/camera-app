import React, { useState } from 'react';
import { View, Text, PanResponder, Animated } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const DraggableText = (props) => {
  const [pan] = useState(
    props.NewPosition.map(() => new Animated.ValueXY())
  );

  const panResponder = props.NewPosition.map((item, index) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        pan[index].setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        pan[index].flattenOffset();
        const newX = item.x + gesture.dx;
        const newY = item.y + gesture.dy;

        // Update the position in the parent component
        props.onPositionChange(item.id, { x: newX, y: newY });

        // Reset the gesture value
        pan[index].setValue({ x: 0, y: 0 });
      },
    })
  );

  return (
    <View>
      {props.NewPosition.map((item, index) => (
        <Animated.View
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            transform: [{ translateX: pan[index].x }, { translateY: pan[index].y }],
          }}
          {...panResponder[index].panHandlers}
        >
          <Text
            style={[
              props.getTextStyles(),
              { fontSize: hp(2.5), color: '#fff' },
            ]}
          >
            {item.text}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

export default DraggableText;
