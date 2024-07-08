import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { images } from '../../assets/images/image';

const DraggableSticker = ({ items, onPositionChange, handleRemoveItem }) => {
  let position = useRef({});
  let positions = position.current ?? {};
  const scales = {};

  items?.map(item => {
    positions[item.id] = useSharedValue({ x: item.x ?? 0, y: item.y ?? 0 });
    scales[item.id] = useSharedValue(item.scale ?? 1);
  });

  const updatePosition = (id, x, y, index) => {
    onPositionChange(id, { x, y, scale: scales[id].value });
    positions[id].value = {
      x: x,
      y: y,
    };
  };

  const panGestures = items.map((item, index) =>
    Gesture.Pan()
      .averageTouches(true)
      .onStart(event => {
        event.translationX = positions[item.id].value.x;
        event.translationY = positions[item.id].value.y;
      })
      .onUpdate(event => {
        positions[item.id].value = {
          x: event.translationX,
          y: event.translationY,
        };
      })
      .onEnd(event => {
        const { translationX, translationY } = event;
        runOnJS(updatePosition)(item.id, translationX, translationY, index);
        positions[item.id].value = {
          x: event.translationX,
          y: event.translationY,
        };
      }),
  );

  const pinchGestures = items.map((item, index) =>
    Gesture.Pinch().onUpdate(event => {
      scales[item.id].value = event.scale;
    }),
  );

  const animatedStyles = items.map((item, index) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateX: positions[item.id].value.x },
        { translateY: positions[item.id].value.y },
        { scale: scales[item.id].value },
      ],
    })),
  );

  const composedGestures = items.map((item, index) =>
    Gesture.Simultaneous(panGestures[index], pinchGestures[index]),
  );

  const onPressRemove = id => {
    handleRemoveItem(id);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {items.map((item, index) => (
        <GestureDetector key={index} gesture={composedGestures[index]}>
          <View style={{ padding: 20 }}>
            <Animated.View
              style={[styles.stickerContainer, animatedStyles[index]]}
            >
              <FastImage
                style={styles.stickerImage}
                source={{
                  uri: item.imageUrl,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
              
            </Animated.View>
          </View>
        </GestureDetector>
      ))}
    </GestureHandlerRootView>
  );
};

export default DraggableSticker;

const styles = StyleSheet.create({
  stickerContainer: {
    position: 'absolute',
    borderColor: '#fff',
    borderWidth: 2,
    height: 120,
    width: 120,
    overflow: 'visible',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: 5,
    right: -30,
    backgroundColor: 'red',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
});