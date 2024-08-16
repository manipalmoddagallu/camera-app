// StickerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const StickerScreen = ({ onSelectSticker, onClose, currentMedia }) => {
  const [stickers, setStickers] = useState([]);
  useEffect(() => {
    fetchStickers();
  }, []);
  const fetchStickers = async () => {
    try {
      const response = await axios.get('https://socialmedia.digiatto.info/public/api/sticker');
      setStickers(response.data);
    } catch (error) {
      console.error('Error fetching stickers:', error);
    }
  };
  const renderSticker = ({ item }) => (
    <TouchableOpacity onPress={() => onSelectSticker(item)}>
      <Image source={{ uri: item.image }} style={styles.stickerImage} />
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <Image source={{ uri: currentMedia.uri }} style={styles.backgroundImage} />
      <View style={styles.stickerContainer}>
        <FlatList
          data={stickers}
          renderItem={renderSticker}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  stickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingTop: 20,
  },
  stickerImage: {
    width: 80,
    height: 80,
    margin: 5,
  },
});

export default StickerScreen;