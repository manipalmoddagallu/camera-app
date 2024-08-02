import React, { useState, useRef } from 'react';
import { Image, View, Text, Dimensions } from 'react-native';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ZoomableImage = ({ source, style }) => {
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
      scale.value = ctx.startScale * event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onEnd: () => {
      scale.value = withSpring(Math.max(1, Math.min(scale.value, 3)));
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <PinchGestureHandler onGestureEvent={pinchHandler}>
      <Animated.View style={[style, { overflow: 'hidden' }]}>
        <PanGestureHandler onGestureEvent={panHandler}>
          <Animated.View style={[style, animatedStyle]}>
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
        </PanGestureHandler>
        {imageError && <Text style={{ color: 'red', position: 'absolute', top: 10, left: 10 }}>Error loading image</Text>}
        <Text style={{ position: 'absolute', bottom: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          Image dimensions: {imageDimensions.width}x{imageDimensions.height}
        </Text>
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default ZoomableImage;