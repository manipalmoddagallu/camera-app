import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import Modal from 'react-native-modal';
import { COLOR, FONT, FONT_SIZE } from '../../../utils/Config';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { images } from '../../../assets/images/image';
import Slider from '@react-native-community/slider';
import {
  contrast,
  brightness,
  ColorMatrix,
  temperature,
  concatColorMatrices,
  saturate,
} from 'react-native-color-matrix-image-filters';
import { captureRef } from 'react-native-view-shot';
import Video from 'react-native-video';
import { showEditor } from 'react-native-video-trim';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useNavigation } from '@react-navigation/native';
import { FILTERS } from '../../../utils/Filters';
import RNFS from 'react-native-fs';
import { FilterImage } from 'react-native-image-filter-kit';
import { InteractionManager } from 'react-native';

const CropModal = props => {
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  
  // Preview state
  const [previewBrightness, setPreviewBrightness] = useState(1);
  const [previewContrast, setPreviewContrast] = useState(1);
  const [previewTemp, setPreviewTemp] = useState(0);
  const [previewSharpness, setPreviewSharpness] = useState(1);
  const [previewSoftness, setPreviewSoftness] = useState(1);

  // Applied state
  const [appliedBrightness, setAppliedBrightness] = useState(1);
  const [appliedContrast, setAppliedContrast] = useState(1);
  const [appliedTemp, setAppliedTemp] = useState(0);
  const [appliedSharpness, setAppliedSharpness] = useState(1);
  const [appliedSoftness, setAppliedSoftness] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [tempFilterComponent, setTempFilterComponent] = useState(null);

  const FilterOptions = [
    {id: 1, key: 'crop', label: 'Crop', image: images.Crop},
    {id: 2, key: 'contrast', label: 'Contrast', image: images.Contrast},
    {id: 3, key: 'brightness', label: 'Brightness', image: images.Sun},
    {id: 4, key: 'temperature', label: 'Temp', image: images.Temp},
    {id: 5, key: 'sharpness', label: 'Sharpness', image: images.Sharpness},
    {id: 6, key: 'softness', label: 'Softness', image: images.Sharpness},
    {id: 7, key: 'filters', label: 'Filters', image: images.Star},
    {id: 8, key: 'stickers', label: 'Stickers', image: images.Happy},
    {id: 9, key: 'trim', label: 'Trim', image: images.Trim},
    {id: 10, key: 'pip', label: 'Pip', image: images.pip},
  ];

  useEffect(() => {
    if (props.cropModal) {
      getAllPhotos();
    }
  }, [props.cropModal]);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener('VideoTrim', event => {
      switch (event.name) {
        case 'onShow':
        case 'onHide':
        case 'onStartTrimming':
        case 'onFinishTrimming':
          saveTrimmedVideo(event.outputPath);
          break;
        case 'onCancelTrimming':
        case 'onError':
          console.log(event.name, event);
          break;
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getAllPhotos = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 100,
        assetType: 'All',
      });
      setPhotos(result.edges);
    } catch (err) {
      console.log('Error fetching gallery photos:', err);
    }
  };

  const handlePip = () => {
    setIsPipMode(true);
    getAllPhotos();
  };

  const renderGalleryItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handlePipSelection(item.node.image.uri)}>
        <View style={styles.galleryItem}>
          <Image
            source={{ uri: item.node.image.uri }}
            style={styles.galleryImage}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handlePipSelection = (imageUri) => {
    props.setPipMedia({ uri: imageUri, type: 'image' });
    console.log('Selected PIP media:', { uri: imageUri, type: 'image' });
    setIsPipMode(false);
  };

  const renderFilterItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        if (item.id === 10) {
          handlePip();
        } else if ([2, 3, 4, 5, 6, 7].includes(item.id)) {
          openFilterModal(item.id);
        } else {
          switch (item.id) {
            case 1:
              props.handleEditImage(3);
              break;
            case 8:
              props.editedVideo ? handleAddSticker() : props.handleEditImage(4);
              break;
            case 9:
              props.editedVideo ? handleTrimVideo() : Alert.alert('Info', 'Only works with video');
              break;
            default:
              console.log('Not showing modal');
          }
        }
      }}
      style={styles.filterItem}>
      <Image source={item.image} style={styles.filterIcon} />
      <Text style={styles.filterLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const openFilterModal = itemId => {
    setSelectedItemId(itemId);
    setFilterModalVisible(true);
    if (itemId === 7) {
      setSelectedFilterIndex(0);
    }
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
    // Reset preview values to applied values when closing modal
    setPreviewBrightness(appliedBrightness);
    setPreviewContrast(appliedContrast);
    setPreviewTemp(appliedTemp);
    setPreviewSharpness(appliedSharpness);
    setPreviewSoftness(appliedSoftness);
  };

  const haveChangesMade = () => {
    return (
      previewBrightness !== appliedBrightness ||
      previewContrast !== appliedContrast ||
      previewTemp !== appliedTemp ||
      previewSharpness !== appliedSharpness ||
      previewSoftness !== appliedSoftness
    );
  };

  const handleDone = () => {
  handleSave();
};

const handleSave = async () => {
  setIsLoading(true);
  try {
    // Apply preview values
    setAppliedBrightness(previewBrightness);
    setAppliedContrast(previewContrast);
    setAppliedTemp(previewTemp);
    setAppliedSharpness(previewSharpness);
    setAppliedSoftness(previewSoftness);

    // Create the color matrix
    const colorMatrix = concatColorMatrices(
      brightness(previewBrightness),
      contrast(previewContrast),
      temperature(previewTemp),
      saturate(previewSharpness),
      saturate(previewSoftness)
    );

    // Apply the color matrix to the image
    const sourceUri = props.editedImage || props.filteredImage || props.multipleImages[props.currentIndex];
    
    const ref = React.createRef();
    const element = (
      <View ref={ref} collapsable={false} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}>
        <ColorMatrix matrix={colorMatrix}>
          <Image
            source={{ uri: sourceUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </ColorMatrix>
      </View>
    );

    // Render the element and capture it as an image
    const processedUri = await new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        captureRef(ref, {
          format: 'png',
          quality: 1,
        }).then(uri => {
          resolve(uri);
        });
      });
    });

    if (processedUri) {
      if (props.multipleImages?.length > 0) {
        let updatedImageUrls = [...props.multipleImages];
        updatedImageUrls[props.currentIndex] = processedUri;
        props.setMultipleImages(updatedImageUrls);
      } else {
        props.setEditedImage(processedUri);
        props.filteredImage = processedUri;
      }

      // Call the onFilterApplied prop with the new filtered image URI
      if (props.onFilterApplied) {
        props.onFilterApplied(processedUri);
      }
    }

    setIsLoading(false);
    setFilterModalVisible(false);
  } catch (error) {
    setIsLoading(false);
    console.error('Error processing media:', error);
    Alert.alert('Error', 'Failed to process media. Please try again.');
  }
};

  const handleTrimVideo = () => {
    showEditor(props.editedVideo || '', {
      maxDuration: 90,
      saveToPhoto: false,
    });
  };

  const saveTrimmedVideo = async videoUri => {
    try {
      const cacheDirectory = RNFS.CachesDirectoryPath;
      const fileName = videoUri.substring(videoUri.lastIndexOf('/') + 1);
      const fileExists = await RNFS.exists(`${cacheDirectory}/${fileName}`);

      if (!fileExists) {
        await RNFS.copyFile(videoUri, `${cacheDirectory}/${fileName}`);
      }
      props.setEditedVideo(`file://${cacheDirectory}/${fileName}`);
    } catch (error) {
      console.error('Error saving trimmed video:', error);
    }
  };

  const handleAddSticker = () => {
    props.setCropModal(false);
    props.setStickerVisible(true);
  };

  const viewRef = useRef(null);

 const handleApplyFilter = async () => {
  setIsLoading(true);
  try {
    const selectedFilter = FILTERS[selectedFilterIndex];
    if (!selectedFilter || !selectedFilter.filterComponent) {
      throw new Error('Selected filter is undefined');
    }

    const SelectedFilterComponent = selectedFilter.filterComponent;
    
    const ref = React.createRef();
    const element = (
      <View ref={ref} collapsable={false} style={{ width: '100%', height: '100%' }}>
        <SelectedFilterComponent>
          <Image
            source={{
              uri: props.editedImage || props.filteredImage || props.multipleImages[props.currentIndex],
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </SelectedFilterComponent>
      </View>
    );

    // Render the element and capture it as an image
    const processedUri = await new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        captureRef(ref, {
          format: 'png',
          quality: 1,
        }).then(uri => {
          resolve(uri);
        });
      });
    });

    if (processedUri) {
      if (props.multipleImages?.length > 0) {
        let updatedImageUrls = [...props.multipleImages];
        updatedImageUrls[props.currentIndex] = processedUri;
        props.setMultipleImages(updatedImageUrls);
      } else {
        props.setEditedImage(processedUri);
        props.filteredImage = processedUri;
      }

      // Call the onFilterApplied prop with the new filtered image URI
      if (props.onFilterApplied) {
        props.onFilterApplied(processedUri);
      }
    }

    setIsLoading(false);
    setFilterModalVisible(false);
  } catch (error) {
    setIsLoading(false);
    console.error('Error processing media:', error);
    Alert.alert('Error', 'Failed to process media. Please try again.');
  }
};


  const renderFilterComponent = ({ item, index }) => {
    const FilterComponent = item.filterComponent;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFilterIndex(index)}
        style={styles.filterItemContainer}>
        <FilterComponent
          image={
            <Image
              style={styles.filterSelector}
              source={{ uri: props.editedImage || props.filteredImage || props.multipleImages[props.currentIndex] }}
              resizeMode={'contain'}
            />
          }
        />
        <Text style={styles.filterName}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={props.cropModal}
      style={{margin: 0}}
      animationIn="slideInRight"
      animationOut="slideOutLeft"
      onBackButtonPress={() => props.setCropModal(false)}
      onBackdropPress={() => props.setCropModal(false)}
      onSwipeComplete={() => props.setCropModal(false)}
      backdropColor="transparent"
      backdropOpacity={0}
    >
      {isPipMode ? (
        <View style={styles.pipGalleryContainer}>
          <TouchableOpacity onPress={() => setIsPipMode(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <FlatList
            data={photos}
            numColumns={3}
            keyExtractor={item => item.node.image.uri}
            renderItem={renderGalleryItem}
          />
        </View>
      ) : (
        <View style={styles.mainContainer}>
  <View style={styles.listView}>
    <View style={styles.searchView}>
      <FlatList
        data={FilterOptions}
        renderItem={renderFilterItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
              <Modal
                isVisible={isFilterModalVisible}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                onBackButtonPress={closeFilterModal}
                onBackdropPress={closeFilterModal}
                style={{margin: 0}}>
                <View ref={viewRef} style={styles.filteredImageContainer}>
                  {tempFilterComponent}
                </View>
                <View style={styles.viewModal}>
                  <View style={styles.filterContentContainer}>
                    {selectedItemId === 7 ? (
        <View style={styles.filtersContainer}>
          <FlatList
            data={FILTERS}
            renderItem={renderFilterComponent}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.filtersList}
          />
          <TouchableOpacity
            onPress={handleApplyFilter}
            style={styles.applyFilterButton}>
            <Text style={styles.applyFilterText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      )  : (
                      <ColorMatrix
                        ref={viewRef}
                        matrix={concatColorMatrices(
                          brightness(previewBrightness),
                          contrast(previewContrast),
                          temperature(previewTemp),
                          saturate(previewSharpness),
                          saturate(previewSoftness)
                        )}
                        style={styles.colorMatrix}>
                        {props.editedVideo ? (
                         <Video
                          ref={videoRef}
                          source={props.editedVideo ? { uri: props.editedVideo } : null}
                          style={styles.video}
                          resizeMode="cover"
                          repeat={true}
                          paused={!isVideoPlaying}
                          onEnd={() => setIsVideoPlaying(false)}
                        />
                        ) : (
                          <Image
                            source={{
                              uri: props.editedImage || props.filteredImage || props.multipleImages[props.currentIndex],
                            }}
                            style={styles.image}
                          />
                        )}
                        </ColorMatrix>
                    )}
                    {selectedItemId !== 7 && (
                      <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                          <Text style={styles.sliderTitle}>
                            {selectedItemId === 2 ? 'Contrast' :
                             selectedItemId === 3 ? 'Brightness' :
                             selectedItemId === 4 ? 'Temp' :
                             selectedItemId === 5 ? 'Sharpness' :
                             selectedItemId === 6 ? 'Softness' : ''}
                          </Text>
                          <TouchableOpacity
                            onPress={handleDone}
                            disabled={isLoading || !haveChangesMade()}
                            style={[styles.doneButton, !haveChangesMade() && styles.disabledButton]}>
                            <Text style={styles.doneButtonText}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        {isLoading ? (
                          <ActivityIndicator color={'#000'} size={'large'} />
                        ) : (
                         <Slider
                          value={
                            selectedItemId === 2 ? previewContrast :
                            selectedItemId === 3 ? previewBrightness :
                            selectedItemId === 4 ? previewTemp :
                            selectedItemId === 5 ? previewSharpness :
                            selectedItemId === 6 ? previewSoftness : 0
                          }
                          onValueChange={(value) => {
                            switch(selectedItemId) {
                              case 2:
                                setPreviewContrast(value);
                                break;
                              case 3:
                                setPreviewBrightness(value);
                                break;
                              case 4:
                                setPreviewTemp(value);
                                break;
                              case 5:
                                setPreviewSharpness(value);
                                break;
                              case 6:
                                setPreviewSoftness(value);
                                break;
                            }
                          }}
                          minimumValue={0.5}
                          maximumValue={2}
                          step={0.05}
                          style={styles.slider}
                        />
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginBottom: hp('12%'),
    justifyContent: 'flex-end',
  },
  listView: {
    padding: hp('0.5%'),
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: '#565656',
    borderRadius: 10,
  },
  searchView: {
    width: '100%',
    alignItems: 'center',
  },
  filterItem: {
    alignItems: 'center',
    margin: 1,
    justifyContent: 'center',
    width: wp('19%'),
  },
  filterIcon: {
    width: wp('8%'),
    height: wp('8%'),
    resizeMode: 'contain',
  },
  filterLabel: {
    color: '#fff',
  },
  viewModal: {
    flex: 1,
  },
  filterContentContainer: {
    padding: hp(1),
    height: '100%',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  video: {
    flex: 1,
  },
  playButton: {
    position: 'absolute',
    width: '100%',
    top: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonIcon: {
    width: wp('20%'),
    height: hp('10%'),
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  colorMatrix: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  sliderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    height: hp(15),
    borderRadius: hp(1.5),
    overflow: 'hidden',
    padding: hp(1),
    position: 'absolute',
    bottom: hp(5),
    width: '100%',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderTitle: {
    color: '#000',
    fontSize: hp(2.5),
  },
  doneButton: {
    backgroundColor: '#4CBB17',
    width: wp(15),
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: hp(1.5),
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  doneButtonText: {
    color: '#000',
    fontSize: hp(2),
  },
  slider: {
    marginTop: hp(2),
  },
  pipGalleryContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  galleryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width / 3 - 15,
    height: 90,
  },
  galleryImage: {
    width: '80%',
    height: '80%',
    borderRadius: hp('1.5%'),
  },
  filtersContainer: {
    flex: 1,
    padding: hp(2),
  },
  filtersList: {
    alignItems: 'center',
  },
  filterItemContainer: {
    alignItems: 'center',
    margin: hp(1),
  },
  filterSelector: {
    width: wp(25),
    height: hp(10),
  },
  filterPreview: {
    width: wp(25),
    height: hp(10),
    resizeMode: 'contain',
  },
  filterName: {
    color: '#000',
    fontSize: hp(1.8),
    marginTop: hp(0.5),
  },
  applyFilterButton: {
    backgroundColor: COLOR.GREEN,
    padding: hp(1.5),
    borderRadius: hp(1),
    alignSelf: 'center',
    marginTop: hp(2),
  },
  applyFilterText: {
    color: '#fff',
    fontSize: hp(2),
  },
  filteredImageContainer: {
    position: 'absolute',
    top: 0,
  left: 0,

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default CropModal;