// EditingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  PanResponder,
  Modal,
  Animated,
  TouchableOpacity
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import TopBar from './TopBar';
import FriendsList from './FriendsList';
import HashtagMenu from './HashtagMenu';
import LocationMenu from './LocationMenu';
import PipMenu from './PipMenu';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FILTERS } from './utils/Filters';

const EditingScreen = ({ route, navigation }) => {
  const { image = null, filterIndex = -1 } = route?.params || {};
  const [currentImage, setCurrentImage] = useState(image);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[filterIndex] || null);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isFriendsListVisible, setIsFriendsListVisible] = useState(false);
  const [isHashtagMenuVisible, setIsHashtagMenuVisible] = useState(false);
  const [isLocationMenuVisible, setIsLocationMenuVisible] = useState(false);
  const [pipImage, setPipImage] = useState(null);
  const [pipFlipped, setPipFlipped] = useState(false);
  const [isPipMenuVisible, setIsPipMenuVisible] = useState(false);
  const [pipSize, setPipSize] = useState(wp('25%'));
  const [pipBackgroundColor, setPipBackgroundColor] = useState('rgba(0, 0, 0, 0.5)');
  const [pipOpacity, setPipOpacity] = useState(1);
  const [pipRotation, setPipRotation] = useState(0);

  useEffect(() => {
    if (!currentImage) {
      console.log('No image received');
      Alert.alert('Error', 'No image provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [currentImage, navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const saveImage = async (isDraft = false) => {
    try {
      if (!currentImage) {
        throw new Error('No image to save');
      }
      const album = isDraft ? 'Drafts' : 'Camera';
      await CameraRoll.save(currentImage, { type: 'photo', album: album });
      console.log('Image saved successfully');
      Alert.alert('Success', `Image ${isDraft ? 'drafted' : 'saved'} successfully`);
    } catch (error) {
      console.error('Error saving image:', error);
      if (error.message.includes('permission')) {
        Alert.alert('Permission Error', 'Storage permission is required to save images. Please grant permission in your device settings.');
      } else {
        Alert.alert('Error', `Failed to ${isDraft ? 'draft' : 'save'} image. Please try again.`);
      }
    }
  };

  const handleSave = () => saveImage(false);
  const handleDraft = () => saveImage(true);

  const handleFriendsPress = () => {
    setIsFriendsListVisible(true);
  };

  const handleHashtagPress = () => {
    setIsHashtagMenuVisible(true);
  };

  const handleLocationPress = () => {
    setIsLocationMenuVisible(true);
  };

  const handleCloseFriendsList = () => {
    setIsFriendsListVisible(false);
  };

  const handleCloseHashtagMenu = () => {
    setIsHashtagMenuVisible(false);
  };

  const handleCloseLocationMenu = () => {
    setIsLocationMenuVisible(false);
  };

  const handleAddHashtag = (hashtags) => {
    setSelectedHashtags(prevHashtags => [
      ...prevHashtags,
      ...hashtags.map(hashtag => ({ 
        ...hashtag, 
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1)
      }))
    ]);
    setIsHashtagMenuVisible(false);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation({
      ...location,
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1)
    });
    setIsLocationMenuVisible(false);
  };

  const handleAddFriend = (friend) => {
    setSelectedFriends(prevFriends => [
      ...prevFriends,
      { 
        ...friend, 
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1)
      }
    ]);
    setIsFriendsListVisible(false);
  };

  const createPanResponder = (item, itemType) => {
    let lastScale = 1;
    let lastDistance = 0;
    
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (item && item.pan) {
          item.pan.setOffset({
            x: item.pan.x._value,
            y: item.pan.y._value
          });
          item.pan.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (event, gestureState) => {
        const { touches } = event.nativeEvent;
        if (!item || !item.pan || !item.scale) return;

        if (touches.length === 1) {
          Animated.event(
            [null, { dx: item.pan.x, dy: item.pan.y }],
            { useNativeDriver: false }
          )(event, gestureState);
        } else if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          if (lastDistance === 0) {
            lastDistance = distance;
            return;
          }

          const scale = distance / lastDistance;
          const newScale = lastScale * scale;

          if (newScale > 0.5 && newScale < 3) {
            item.scale.setValue(newScale);
            lastScale = newScale;
          }

          lastDistance = distance;
        }
      },
      onPanResponderRelease: () => {
        if (item && item.pan) {
          item.pan.flattenOffset();
        }
        lastDistance = 0;
      }
    });
  };

  const handlePIPPress = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 1000,
        assetType: 'Photos',
        include: ['filename', 'fileSize', 'location'],
      });

      navigation.navigate('GalleryPicker', {
        photos: result.edges,
        onSelectImage: (selectedImage) => {
          setPipImage({
            uri: selectedImage.node.image.uri,
            pan: new Animated.ValueXY(),
            scale: new Animated.Value(1)
          });
        }
      });
    } catch (error) {
      console.error('Error accessing gallery:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again.');
    }
  };

  const handlePipMenuPress = () => {
    setIsPipMenuVisible(true);
  };

  const handleClosePipMenu = () => {
    setIsPipMenuVisible(false);
  };

  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
  };

  const SelectedFilterComponent = selectedFilter ? selectedFilter.filterComponent : null;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        onBackPress={handleBackPress}
        onSave={handleSave}
        onDraft={handleDraft}
        currentImage={currentImage}
        onFriendsPress={handleFriendsPress}
        onHashtagPress={handleHashtagPress}
        onLocationPress={handleLocationPress}
        onPIPPress={handlePIPPress}
        onSelectFilter={handleSelectFilter}
        selectedFilter={selectedFilter}
      />
      <View style={styles.imageContainer}>
        {currentImage && (
          SelectedFilterComponent ? (
            <SelectedFilterComponent
              image={
                <Image
                  source={{ uri: currentImage }}
                  style={styles.image}
                  resizeMode="contain"
                />
              }
            />
          ) : (
            <Image
              source={{ uri: currentImage }}
              style={styles.image}
              resizeMode="contain"
            />
          )
        )}
        {selectedFriends.map((friend) => {
          const panResponder = createPanResponder(friend, 'friend');
          return (
            <Animated.View
              key={friend.id}
              style={[
                styles.overlay,
                {
                  transform: [
                    { translateX: friend.pan.x },
                    { translateY: friend.pan.y },
                    { scale: friend.scale }
                  ]
                }
              ]}
              {...panResponder.panHandlers}
            >
              <Text style={styles.overlayText}>@{friend.name}</Text>
            </Animated.View>
          );
        })}
        {selectedHashtags.map((hashtag) => {
          const panResponder = createPanResponder(hashtag, 'hashtag');
          return (
            <Animated.View
              key={hashtag.id}
              style={[
                styles.overlay,
                {
                  transform: [
                    { translateX: hashtag.pan.x },
                    { translateY: hashtag.pan.y },
                    { scale: hashtag.scale }
                  ]
                }
              ]}
              {...panResponder.panHandlers}
            >
              <Text style={styles.overlayText}>#{hashtag.title}</Text>
            </Animated.View>
          );
        })}
        {selectedLocation && (
          <Animated.View
            style={[
              styles.overlay,
              {
                transform: [
                  { translateX: selectedLocation.pan.x },
                  { translateY: selectedLocation.pan.y },
                  { scale: selectedLocation.scale }
                ]
              }
            ]}
            {...createPanResponder(selectedLocation, 'location').panHandlers}
          >
            <Text style={styles.overlayText}>{selectedLocation.placeName}</Text>
          </Animated.View>
        )}
        {pipImage && (
          <Animated.View
            style={[
              styles.pipContainer,
              {
                transform: [
                  { translateX: pipImage.pan.x },
                  { translateY: pipImage.pan.y },
                  { scale: pipImage.scale },
                  { rotate: `${pipRotation}deg` },
                ],
                backgroundColor: pipBackgroundColor,
                width: pipSize,
                height: pipSize,
              }
            ]}
            {...createPanResponder(pipImage, 'pip').panHandlers}
          >
            <Animated.Image
              source={{ uri: pipImage.uri }}
              style={[
                styles.pipImage,
                { opacity: pipOpacity },
                pipFlipped && { transform: [{ scaleX: -1 }] }
              ]}
            />
            <TouchableOpacity style={[styles.pipIcon, styles.pipDeleteIcon]} onPress={() => setPipImage(null)}>
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pipIcon, styles.pipFlipIcon]} onPress={() => setPipFlipped(!pipFlipped)}>
              <Icon name="flip" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pipIcon, styles.pipMenuIcon]} onPress={handlePipMenuPress}>
              <Icon name="more-vert" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      <Modal
        visible={isFriendsListVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <FriendsList onAddFriend={handleAddFriend} onClose={handleCloseFriendsList} />
        </View>
      </Modal>
      <Modal
        visible={isHashtagMenuVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <HashtagMenu onSelectHashtag={handleAddHashtag} onClose={handleCloseHashtagMenu} />
        </View>
      </Modal>
      <Modal
        visible={isLocationMenuVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <LocationMenu onSelectLocation={handleSelectLocation} onClose={handleCloseLocationMenu} />
        </View>
      </Modal>
      <Modal
        visible={isPipMenuVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pipMenuContainer}>
          <PipMenu
            pipSize={pipSize}
            setPipSize={setPipSize}
            pipBackgroundColor={pipBackgroundColor}
            setPipBackgroundColor={setPipBackgroundColor}
            pipOpacity={pipOpacity}
            setPipOpacity={setPipOpacity}
            pipRotation={pipRotation}
            setPipRotation={setPipRotation}
            onClose={handleClosePipMenu}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  imageContainer: {
    width: wp('100%'),
    height: hp('93%'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: wp('100%'),
    height: hp('93%'),
  },
  overlay: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pipContainer: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    zIndex: 2,
  },
  pipImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  pipIcon: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
  },
  pipDeleteIcon: {
    top: -15,
    left: -15,
  },
  pipFlipIcon: {
    top: -15,
    right: -15,
  },
  pipMenuIcon: {
    bottom: -15,
    left: -15,
  },
  pipMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pipMenuSection: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  colorPicker: {
    width: '100%',
    height: 200,
  },
  closeButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default EditingScreen;