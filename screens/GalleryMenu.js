import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RadioButton } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';


const GalleryMenu = ({ isVisible, onClose, onImageSelect }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
    const navigation = useNavigation();


  useEffect(() => {
    if (isVisible) {
      if (activeTab === 'gallery') {
        loadGalleryMedia();
      } else if (activeTab === 'draft') {
        loadDraftedMedia();
      }
    }
  }, [isVisible, activeTab]);

  const loadGalleryMedia = () => {
    const options = {
      mediaType: 'mixed',
      selectionLimit: 0,
    };

    launchImageLibrary(options, response => {
      if (!response.didCancel && !response.errorCode) {
        setMedia(response.assets);
      }
    });
  };

  const loadDraftedMedia = async () => {
    try {
      const drafts = await AsyncStorage.getItem('draftedMedia');
      if (drafts) {
        setMedia(JSON.parse(drafts));
      }
    } catch (error) {
      console.error('Error loading drafted media:', error);
    }
  };

  const toggleMediaSelection = (uri) => {
    setSelectedMedia(prevSelected => 
      prevSelected.includes(uri)
        ? prevSelected.filter(item => item !== uri)
        : [...prevSelected, uri]
    );
  };

const handleDone = () => {
    if (selectedMedia.length > 0) {
      const selectedItems = media.filter(item => selectedMedia.includes(item.uri));
      const selectedItem = selectedItems[0]; // We'll use the first selected item

      if (selectedItem.type.startsWith('video/')) {
        // For video, navigate to EditingScreen
        navigation.navigate('EditingScreen', { 
          media: { uri: selectedItem.uri, type: 'video' }
        });
      } else {
        // For image, navigate to Layout_Screen
        navigation.navigate('Layout_Screen', { selectedImage: selectedItem.uri });
      }
      onClose();
    }
  };

  const renderMediaItem = ({ item }) => {
    const isSelected = selectedMedia.includes(item.uri);
    const isVideo = item.type.startsWith('video/');
    
    return (
      <TouchableOpacity onPress={() => toggleMediaSelection(item.uri)}>
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <Video
              source={{ uri: item.uri }}
              style={styles.media}
              resizeMode="cover"
              paused={true}
            />
          ) : (
            <Image
              source={{ uri: item.uri }}
              style={styles.media}
            />
          )}
          <View style={styles.radioButtonContainer}>
            <RadioButton
              value={isSelected}
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => toggleMediaSelection(item.uri)}
              uncheckedColor="#dddddd"
              color="#4CBB17"
            />
          </View>
          {isVideo && (
            <View style={styles.playButtonContainer}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
          <FlatList
            data={media}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.uri}
            numColumns={3}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.doneButton, selectedMedia.length === 0 && styles.disabledButton]} 
              onPress={handleDone} 
              disabled={selectedMedia.length === 0}
            >
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
    height: '80%',
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
  mediaContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width / 3 - 15,
    height: 120,
    margin: 2,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: hp('1.5%'),
  },
  radioButtonContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  playButtonContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  playButtonText: {
    color: 'white',
    fontSize: 20,
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
    backgroundColor: '#4CBB17',
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  doneButtonText: {
    color: 'white',
  },
});

export default GalleryMenu;