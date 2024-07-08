import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, Text, View, FlatList, ImageBackground, Image, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { images } from '../assets/images/image';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GalleryModal = ({ isSecondModalVisible, toggleSecondModal, getAllPhotos, photos, handleGalleryImageSelect, navigation, route }) => {
  const [selectedGalary, setSelectedGalary] = useState(1);
  const [drafts, setDrafts] = useState([]);

  const galaryData = [
    { id: 1, name: 'Gallery', image: images.PhotoGalary },
    { id: 2, name: 'Draft', image: images.Draft },
  ];

  const onSelectMedia = route.params?.onSelectMedia;

  useEffect(() => {
    if (selectedGalary === 2) {
      loadDrafts();
    }
  }, [selectedGalary]);

  const loadDrafts = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter(key => key.startsWith('draft_'));
      const draftItems = await AsyncStorage.multiGet(draftKeys);
      const parsedDrafts = draftItems.map(([key, value]) => {
        const parsedValue = JSON.parse(value);
        return {
          key,
          uri: parsedValue.uri,
          type: parsedValue.type,
          date: new Date(parseInt(key.split('_')[1])).toLocaleDateString(),
        };
      });
      console.log('Loaded drafts:', parsedDrafts);
      setDrafts(parsedDrafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const handleMediaSelect = (uri, type) => {
    if (onSelectMedia) {
      onSelectMedia(uri, type);
      navigation.goBack();
    } else {
      handleGalleryImageSelect(uri);
    }
    toggleSecondModal();
  };

  const renderDraftItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleMediaSelect(item.uri, item.type)}>
      <View style={styles.galleryItem}>
        {item.type === 'video' ? (
          <Image source={images.VideoIcon} style={styles.videoIcon} />
        ) : (
          <FastImage
            source={{ uri: item.uri }}
            style={styles.galleryImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <Text style={styles.draftDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleMediaSelect(item.node.image.uri, item.node.type)}>
      <View style={styles.galleryItem}>
        <FastImage
          source={{ uri: item.node.image.uri }}
          style={styles.galleryImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item.node.type === 'video' && (
          <Image source={images.VideoIcon} style={styles.videoOverlay} />
        )}
      </View>
    </TouchableOpacity>
  );

  console.log('Selected Gallery:', selectedGalary);
  console.log('Drafts:', drafts);

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isSecondModalVisible}
      onRequestClose={toggleSecondModal}
    >
      <TouchableWithoutFeedback onPress={toggleSecondModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <ImageBackground style={styles.modalBackground} source={images.BG}>
                <View style={styles.header}>
                  <TouchableOpacity onPress={toggleSecondModal}>
                    <Image source={images.Close} style={styles.closeIcon} />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Select Media</Text>
                  <View style={styles.placeholder} />
                </View>

                <View style={styles.tabContainer}>
                  {galaryData.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.tabButton,
                        selectedGalary === item.id && styles.selectedTabButton,
                      ]}
                      onPress={() => setSelectedGalary(item.id)}
                    >
                      <Image source={item.image} style={styles.tabIcon} />
                      <Text style={styles.tabText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedGalary === 2 ? (
                  <FlatList
                    data={drafts}
                    numColumns={3}
                    renderItem={renderDraftItem}
                    keyExtractor={(item) => item.key}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyDraftContainer}>
                        <Text style={styles.emptyDraftText}>No drafts available</Text>
                      </View>
                    )}
                  />
                ) : (
                  <FlatList
                    data={photos}
                    numColumns={3}
                    renderItem={renderGalleryItem}
                    keyExtractor={(item, index) => index.toString()}
                  />
                )}
              </ImageBackground>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  closeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  tabButton: {
    alignItems: 'center',
    padding: 10,
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  tabText: {
    marginTop: 5,
  },
  galleryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('30%') - 10,
    height: wp('30%') - 10,
    margin: 5,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  videoIcon: {
    width: '50%',
    height: '50%',
    resizeMode: 'contain',
  },
  videoOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  draftDate: {
    fontSize: 10,
    color: '#000000',
    marginTop: 2,
  },
  emptyDraftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDraftText: {
    fontSize: 16,
    color: '#000000',
  },
};

export default GalleryModal;