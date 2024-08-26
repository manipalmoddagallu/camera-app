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
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [draftedMedia, setDraftedMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (isVisible) {
      if (activeTab === 'gallery') {
        loadGalleryMedia();
      } else if (activeTab === 'draft') {
        loadDraftedMedia();
      }
    }
  }, [isVisible, activeTab]);

  const loadGalleryMedia = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 1000,
        assetType: 'All',
      });
      setGalleryMedia(result.edges);
    } catch (error) {
      console.error('Error loading gallery media:', error);
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

  const handleMediaSelect = (media, isDraft = false) => {
    let selectedMediaUri;
    if (isDraft) {
      selectedMediaUri = media.editedImageUri || media.uri;
    } else {
      selectedMediaUri = media.node.image.uri;
    }
    setSelectedMedia(selectedMediaUri);
    console.log('Selected media:', selectedMediaUri);
  };

const handleDone = () => {
  if (selectedMedia) {
    const selectedItem = activeTab === 'draft' 
      ? draftedMedia.find(item => (item.editedImageUri || item.uri) === selectedMedia)
      : galleryMedia.find(item => item.node.image.uri === selectedMedia);
    const mediaType = activeTab === 'draft' ? selectedItem.type : selectedItem.node.type;
    onImageSelect(selectedMedia, selectedItem, mediaType);
    onClose();
  }
};

  const renderGalleryItem = ({ item }) => {
    const isVideo = item.node.type.startsWith('video');
    return (
      <TouchableOpacity onPress={() => handleMediaSelect(item)}>
        <View style={styles.imageContainer}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              <Image
                source={{ uri: item.node.image.uri }}
                style={styles.image}
              />
              <View style={styles.videoIcon}>
                <Text style={styles.videoIconText}>▶️</Text>
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: item.node.image.uri }}
              style={styles.image}
            />
          )}
          {selectedMedia === item.node.image.uri && (
            <View style={styles.selectedMark}>
              <View style={styles.checkmark} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDraftItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleMediaSelect(item, true)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.editedImageUri || item.uri }}
          style={styles.image}
        />
        {selectedMedia === (item.editedImageUri || item.uri) && (
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
        data={galleryMedia}
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
            <TouchableOpacity style={[styles.doneButton, !selectedMedia && styles.disabledButton]} onPress={handleDone} disabled={!selectedMedia}>
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
    color: "#020E27"
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
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  videoIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIconText: {
    color: 'white',
    fontSize: 16,
  },
});

export default GalleryMenu;