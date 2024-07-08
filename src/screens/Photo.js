import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList, Image,ImageBackground,TouchableWithoutFeedback, TouchableOpacity, Text } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { RadioButton, Icon, TouchableRipple } from 'react-native-paper';
import { Modal } from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { images } from '../assets/images/image';
import { COLOR } from '../utils/Config';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const Photo = ({ route }) => {
  const [dataSource, setDataSource] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSelectedImage, setIsSelectedImage] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isSecondModalVisible, setIsSecondModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Load initial images
    loadImages();
    // Load draft image if available
    loadDraftImage();
  }, []);

  useEffect(() => {
    const getAllPhotos = async () => {
      await CameraRoll.getPhotos({
        first: 15,
        assetType: 'Photos',
      })
        .then(r => {
          setPhotos(r.edges);
        })
        .catch(err => {
          console.log('Error fetching photos from CameraRoll:', err);
        });
    };

    getAllPhotos();
  }, []);

  const loadImages = () => {
    // Dummy data or initial loading of images
    let items = Array.apply(null, Array(5)).map((v, i) => {
      const size = i % 3 === 0 ? 2 : 1; // Example: every 3rd item has a larger size
      return {
        id: i.toString(),
        size: size,
        src: `https://unsplash.it/400/${size === 2 ? 800 : 400}?image=${i + 1}`,
      };
    });
    setDataSource(items);
  };

  const loadDraftImage = async () => {
    try {
      const draftImagePath = await AsyncStorage.getItem('editedImageDraft'); // Adjust key based on your AsyncStorage key for drafts
      if (draftImagePath) {
        // Add draft image to dataSource
        setDataSource(prevData => [...prevData, { id: 'draft', size: 1, src: draftImagePath }]);
      }
    } catch (error) {
      console.error('Error loading draft image:', error);
    }
  };

  const toggleImageSelection = imageUri => {
    const isSelected = selectedImages.includes(imageUri);
    if (isSelected) {
      setSelectedImages(prevSelected =>
        prevSelected.filter(uri => uri !== imageUri),
      );
    } else {
      setSelectedImages(prevSelected => [...prevSelected, imageUri]);
    }
  };

  const renderGalleryItem = ({ item }) => {
    const isSelected = selectedImages.includes(item.src);

    return (
      <TouchableOpacity onPress={() => toggleImageSelection(item.src)}>
        <View style={{ alignItems: 'center', justifyContent: 'center', width: Dimensions.get('window').width / 3 - 15, height: 90 }}>
          <Image source={{ uri: item.src }} style={{ width: '80%', height: '80%', borderRadius: 10 }} />
          <View style={{ position: 'absolute', top: 6, right: 6 }}>
            <RadioButton value={isSelectedImage} status={isSelected ? 'checked' : 'unchecked'} onPress={() => toggleImageSelection(item.src)} />
          </View>
          {isSelected && (
            <View style={{ position: 'absolute', top: 6, right: 6 }}>
              <RadioButton value={isSelectedImage} status={isSelected ? 'checked' : 'unchecked'} onPress={() => toggleImageSelection(item.src)} color={COLOR.GREEN} />
              <View style={{ position: 'absolute', borderRadius: 30, width: 16, height: 16, backgroundColor: '#4CBB17', left: 10, top: 10, justifyContent: 'center', alignItems: 'center', elevation: 0 }}>
                <Image source={images.Done} style={{ resizeMode: 'center' }} />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const openImagePicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
      cropperTintColor: '#ff0000',
      cropperToolbarTitle: 'Custom Gallery Title',
      cropperToolbarColor: '#FF0000',
      cropperStatusBarColor: '#FF0000',
      cropperActiveWidgetColor: '#FF0000',
      cropperToolbarWidgetColor: '#FF0000',
    })
      .then(images => {
        // Update dataSource with selected images
        setDataSource(prevData => [...prevData, ...images.map((image, index) => ({ id: `new-${index}`, size: 1, src: image.path }))]);
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleDone = async () => {
    try {
      // Handle navigation or saving logic here based on selectedImages
      console.log('Selected Images:', selectedImages);

      if (selectedImages.length === 1) {
        // If only one image is selected, navigate to EditingScreen
        navigation.navigate('EditingScreen', { selectedImages: selectedImages });
      } else if (selectedImages.length > 1) {
        // If multiple images are selected, navigate to ImageFilter
        navigation.navigate('ImageFilter', { selectedImages: selectedImages });
      }

      // Convert the selectedImages array to a JSON string
      const selectedImagesJSON = JSON.stringify(selectedImages);

      // Save selectedImagesJSON to AsyncStorage
      await AsyncStorage.setItem('selectedImages', selectedImagesJSON);

      setIsSecondModalVisible(false);
    } catch (error) {
      console.error('Error saving selected images to AsyncStorage:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dataSource}
        renderItem={renderGalleryItem}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
      />
      <TouchableOpacity onPress={openImagePicker}>
        <View style={styles.button}>
          <Text>Select Images</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#DDDDDD',
    alignItems: 'center',
  },
});

export default Photo;
