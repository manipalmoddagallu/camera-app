import React, { useState } from 'react';
import { Image, View, PanResponder } from 'react-native';

const ZoomableImage = ({ source, style }) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [imageError, setImageError] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (evt.nativeEvent.changedTouches.length === 2) {
        // Zooming
        const touch1 = evt.nativeEvent.changedTouches[0];
        const touch2 = evt.nativeEvent.changedTouches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.pageX - touch2.pageX, 2) +
          Math.pow(touch1.pageY - touch2.pageY, 2)
        );

        if (lastDistance !== 0) {
          const newScale = scale * (distance / lastDistance);
          setScale(Math.max(1, Math.min(newScale, 3))); // Limit scale between 1 and 3
        }
        setLastDistance(distance);
      } else {
        // Panning
        setTranslateX(translateX + gestureState.dx);
        setTranslateY(translateY + gestureState.dy);
      }
    },
    onPanResponderRelease: () => {
      setLastDistance(0);
    },
  });

 return (
    <View {...panResponder.panHandlers} style={[style, { overflow: 'hidden' }]}>
      <Image
        source={source}
        style={[
          style,
          {
            transform: [
              { scale: scale },
              { translateX: translateX },
              { translateY: translateY },
            ],
          },
        ]}
        resizeMode="contain"
        onError={(e) => {
          console.error('Image loading error:', e.nativeEvent.error);
          setImageError(true);
        }}
      />
      {imageError && <Text style={{ color: 'red' }}>Error loading image</Text>}
    </View>
  );
};
export default ZoomableImage;