import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image, Modal } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const GalleryMenu = ({ isVisible, onClose, onImageSelect }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (isVisible && activeTab === 'gallery') {
      loadGalleryImages();
    }
  }, [isVisible, activeTab]);

  const loadGalleryImages = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 1000,
        assetType: 'Photos',
      });
      setGalleryImages(result.edges);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  };

  const handleImageSelect = (image) => {
    onImageSelect(image.node.image.uri);
    onClose();
  };

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImageSelect(item)}>
      <Image
        source={{ uri: item.node.image.uri }}
        style={{ width: wp('30%'), height: wp('30%'), margin: 2 }}
      />
    </TouchableOpacity>
  );

  const renderContent = () => {
    return activeTab === 'gallery' ? (
      <FlatList
        data={galleryImages}
        renderItem={renderGalleryItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
    ) : (
      <Text>Draft content goes here</Text>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
              onPress={() => setActiveTab('gallery')}
            >
              <Text>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'draft' && styles.activeTab]}
              onPress={() => setActiveTab('draft')}
            >
              <Text>Draft</Text>
            </TouchableOpacity>
          </View>
          {renderContent()}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'blue',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    borderRadius: 5,
  },
});

export default GalleryMenu;