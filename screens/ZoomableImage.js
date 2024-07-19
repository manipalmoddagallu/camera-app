import React, { useState, useRef } from 'react';
import { Image, View, PanResponder, Animated, Text, Dimensions } from 'react-native';

const ZoomableImage = ({ source, style }) => {
  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const pan = useRef(new Animated.ValueXY()).current;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value
      });
    },
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
          const newScale = lastScale * (distance / lastDistance);
          setScale(Math.max(1, Math.min(newScale, 3))); // Limit scale between 1 and 3
        }
        setLastDistance(distance);
      } else {
        // Panning
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
      }
    },
    onPanResponderRelease: () => {
      setLastScale(scale);
      setLastDistance(0);
      pan.flattenOffset();
    },
  });

  // Log the source prop to check if it's correctly passed
  console.log('Image source:', source);

  return (
    <View style={[style, { overflow: 'hidden' }]}>
      <Animated.View 
        {...panResponder.panHandlers}
        style={[
          style,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale }
            ]
          }
        ]}
      >
        <Image
          source={source}
          style={[style, { width: '100%', height: '100%' }]}
          resizeMode="contain"
          onError={(e) => {
            console.error('Image loading error:', e.nativeEvent.error);
            setImageError(true);
          }}
          onLoad={(event) => {
            const { width, height } = event.nativeEvent.source;
            console.log('Image loaded. Dimensions:', width, height);
            setImageDimensions({ width, height });
          }}
        />
      </Animated.View>
      {imageError && <Text style={{ color: 'red', position: 'absolute', top: 10, left: 10 }}>Error loading image</Text>}
      <Text style={{ position: 'absolute', bottom: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        Image dimensions: {imageDimensions.width}x{imageDimensions.height}
      </Text>
    </View>
  );
};

export default ZoomableImage;