import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image, Modal } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const GalleryMenu = ({ isVisible, onClose, onImageSelect }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryImages, setGalleryImages] = useState([]);
  const [draftedMedia, setDraftedMedia] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isVisible) {
      if (activeTab === 'gallery') {
        loadGalleryImages();
      } else if (activeTab === 'draft') {
        loadDraftedMedia();
      }
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

  const loadDraftedMedia = async () => {
    try {
      const drafts = await AsyncStorage.getItem('draftedMedia');
      if (drafts) {
        setDraftedMedia(JSON.parse(drafts));
      }
    } catch (error) {
      console.error('Error loading drafted media:', error);
    }
  };

    const handleImageSelect = (image, isDraft = false) => {
    let selectedImageUri;
    if (isDraft) {
      selectedImageUri = image.editedImageUri || image.uri;
    } else {
      selectedImageUri = image.node.image.uri;
    }
    setSelectedImage(selectedImageUri);
    console.log('Selected image:', selectedImageUri);
  };

  const handleDone = () => {
    if (selectedImage) {
      const selectedItem = activeTab === 'draft' 
        ? draftedMedia.find(item => (item.editedImageUri || item.uri) === selectedImage)
        : galleryImages.find(item => item.node.image.uri === selectedImage);
      onImageSelect(selectedImage, selectedItem);
      onClose();
    }
  };

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImageSelect(item)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.node.image.uri }}
          style={styles.image}
        />
        {selectedImage === item.node.image.uri && (
          <View style={styles.selectedMark}>
            <View style={styles.checkmark} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDraftItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImageSelect(item, true)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.editedImageUri || item.uri }}
          style={styles.image}
        />
        {selectedImage === (item.editedImageUri || item.uri) && (
          <View style={styles.selectedMark}>
            <View style={styles.checkmark} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    return activeTab === 'gallery' ? (
      <FlatList
        data={galleryImages}
        renderItem={renderGalleryItem}
        keyExtractor={(item) => item.node.image.uri}
        numColumns={3}
      />
    ) : (
      <FlatList
        data={draftedMedia}
        renderItem={renderDraftItem}
        keyExtractor={(item) => item.editedImageUri || item.uri}
        numColumns={3}
      />
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.doneButton, !selectedImage && styles.disabledButton]} onPress={handleDone} disabled={!selectedImage}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
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
    color: "#000"
  },
  activeTab: {
    borderBottomColor: 'blue',
  },
  imageContainer: {
    position: 'relative',
    width: wp('30%'),
    height: wp('30%'),
    margin: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedMark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'blue',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{ rotate: '-45deg' }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  doneButton: {
    padding: 10,
    backgroundColor: 'blue',
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  doneButtonText: {
    color: 'white',
  },
});

export default GalleryMenu;