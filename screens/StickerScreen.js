// StickerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const StickerScreen = ({ navigation, route }) => {
  const [allStickers, setAllStickers] = useState([]);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { image } = route.params;

  useEffect(() => {
    fetchStickers();
  }, []);

  const fetchStickers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://socialmedia.digiatto.info/public/api/sticker');
      setAllStickers(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load stickers');
      setLoading(false);
    }
  };

  const addSticker = (sticker) => {
    const translateX = useSharedValue(width / 2 - 50);
    const translateY = useSharedValue(height / 2 - 50);
    const scale = useSharedValue(1);

    const newSticker = {
      id: Date.now(),
      uri: sticker.stickerURI,
      translateX,
      translateY,
      scale,
    };
    setSelectedStickers(prevStickers => [...prevStickers, newSticker]);
  };

  const removeSticker = (id) => {
    setSelectedStickers(prevStickers => prevStickers.filter(sticker => sticker.id !== id));
  };

  const handleDone = () => {
    navigation.navigate('EditingScreen', { 
      editedImage: image, 
      returnedStickers: selectedStickers.map(sticker => ({
        uri: sticker.uri,
        x: sticker.translateX.value,
        y: sticker.translateY.value,
        scale: sticker.scale.value,
      }))
    });
  };

  const createPanResponder = (sticker) => ({
    onGestureEvent: Animated.event(
      [
        {
          nativeEvent: {
            translationX: sticker.translateX,
            translationY: sticker.translateY,
          },
        },
      ],
      { useNativeDriver: true }
    ),
    onHandlerStateChange: (event) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        sticker.translateX.value += event.nativeEvent.translationX;
        sticker.translateY.value += event.nativeEvent.translationY;
      }
    },
  });

  const renderSticker = (sticker) => {
    const panResponder = createPanResponder(sticker);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: sticker.translateX.value },
        { translateY: sticker.translateY.value },
        { scale: sticker.scale.value },
      ],
    }));

    return (
      <PanGestureHandler {...panResponder} key={sticker.id}>
        <Animated.View style={[styles.stickerContainer, animatedStyle]}>
          <Image 
            source={{ uri: sticker.uri }} 
            style={styles.sticker} 
            resizeMode="contain"
            onError={(e) => console.error('Error loading sticker:', e.nativeEvent.error)}
          />
          <TouchableOpacity style={styles.removeButton} onPress={() => removeSticker(sticker.id)}>
            <Text style={styles.removeButtonText}>X</Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: image }} 
          style={styles.image} 
          resizeMode="contain"
          onError={(e) => console.error('Error loading main image:', e.nativeEvent.error)}
        />
        {selectedStickers.map(renderSticker)}
      </View>
      <ScrollView horizontal style={styles.stickerBar}>
        {allStickers.map((sticker) => (
          <TouchableOpacity key={sticker.id} onPress={() => addSticker(sticker)}>
            <Image 
              source={{ uri: sticker.stickerURI }} 
              style={styles.stickerPreview} 
              resizeMode="contain"
              onError={(e) => console.error('Error loading sticker preview:', e.nativeEvent.error)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  stickerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  stickerPreview: {
    width: 80,
    height: 80,
    margin: 10,
  },
  stickerContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  sticker: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  doneButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StickerScreen;
