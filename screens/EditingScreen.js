import React, { useState, useEffect, useRef } from 'react';
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
  TouchableOpacity,
  Platform,TextInput
} from 'react-native';
import Video from 'react-native-video';
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
import StickerScreen from './StickerScreen';


const EditingScreen = ({ route, navigation }) => {
  const { media = null, filterIndex = -1 } = route?.params || {};
  const [currentMedia, setCurrentMedia] = useState(media);
  const [isVideo, setIsVideo] = useState(media?.type === 'video' || media?.type === 'boomerang');
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
  const videoRef = useRef(null);
  const [textElements, setTextElements] = useState([]);
  const [isStickersVisible, setIsStickersVisible] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const handleSave = () => saveMedia(false);
  const handleDraft = () => saveMedia(true);

  const handleFriendsPress = () => setIsFriendsListVisible(true);
  const handleHashtagPress = () => setIsHashtagMenuVisible(true);
  const handleLocationPress = () => setIsLocationMenuVisible(true);
  const handleCloseFriendsList = () => setIsFriendsListVisible(false);
  const handleCloseHashtagMenu = () => setIsHashtagMenuVisible(false);
  const handleCloseLocationMenu = () => setIsLocationMenuVisible(false);
  const handlePipMenuPress = () => setIsPipMenuVisible(true);
  const handleClosePipMenu = () => setIsPipMenuVisible(false);
  const handleSelectFilter = (filter) => setSelectedFilter(filter);
  const SelectedFilterComponent = selectedFilter ? selectedFilter.filterComponent : null;



  useEffect(() => {
    if (!currentMedia) {
      console.log('No media received');
      Alert.alert('Error', 'No media provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      console.log('Received media:', currentMedia);
    }
  }, [currentMedia, navigation]);
  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    const trimmedVideo = route.params?.trimmedVideo;
    const newMedia = route.params?.media;
    const croppedImage = route.params?.croppedImage;
    const originalImage = route.params?.originalImage;

    if (croppedImage) {
      console.log('Received cropped image:', croppedImage);
      setCurrentMedia(croppedImage);
      setOriginalImage(originalImage || currentMedia);
      setIsVideo(false);
    } else if (trimmedVideo) {
      setCurrentMedia(trimmedVideo);
      setIsVideo(true);
    } else if (newMedia) {
      setCurrentMedia(newMedia);
      setIsVideo(newMedia.type === 'video');
    } else if (!currentMedia) {
      console.log('No media received');
      Alert.alert('Error', 'No media provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      console.log('Received media:', currentMedia);
    }
  });

  return unsubscribe;
}, [navigation, route.params]);

  

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    const trimmedVideo = route.params?.trimmedVideo;
    const newMedia = route.params?.media;
    const croppedImage = route.params?.croppedImage;
    const originalImage = route.params?.originalImage;
    const editedImage = route.params?.editedImage; // Add this line

    if (editedImage) {
      setCurrentMedia({ uri: editedImage, type: 'photo' });
      setIsVideo(false);
    } else if (croppedImage) {
      console.log('Received cropped image:', croppedImage);
      setCurrentMedia(croppedImage);
      setOriginalImage(originalImage || currentMedia);
      setIsVideo(false);
    } else if (trimmedVideo) {
      setCurrentMedia(trimmedVideo);
      setIsVideo(true);
    } else if (newMedia) {
      setCurrentMedia(newMedia);
      setIsVideo(newMedia.type === 'video');
    } else if (!currentMedia) {
      console.log('No media received');
      Alert.alert('Error', 'No media provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      console.log('Received media:', currentMedia);
    }
  });

  return unsubscribe;
}, [navigation, route.params, currentMedia]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSelectSticker = (sticker) => {
    setSelectedStickers([
      ...selectedStickers,
      {
        ...sticker,
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1),
        rotate: new Animated.Value(0),
      },
    ]);
    setIsStickersVisible(false);
  };

  const saveMedia = async (isDraft = false) => {
    try {
      if (!currentMedia) {
        throw new Error('No media to save');
      }
      const album = isDraft ? 'Drafts' : 'Camera';
      const saveResult = await CameraRoll.save(currentMedia.uri, { 
        type: isVideo ? 'video' : 'photo', 
        album: album 
      });
      console.log('Media saved successfully:', saveResult);
      Alert.alert('Success', `Media ${isDraft ? 'drafted' : 'saved'} successfully`);
    } catch (error) {
      console.error('Error saving media:', error);
      if (error.message.includes('permission')) {
        Alert.alert('Permission Error', 'Storage permission is required to save media. Please grant permission in your device settings.');
      } else {
        Alert.alert('Error', `Failed to ${isDraft ? 'draft' : 'save'} media. Please try again.`);
      }
    }
  };

  const handleAddHashtag = (hashtags) => {
    setSelectedHashtags(prevHashtags => [
      ...prevHashtags,
      ...hashtags.map(hashtag => ({ 
        ...hashtag, 
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1),
        rotate: new Animated.Value(0)
      }))
    ]);
    setIsHashtagMenuVisible(false);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation({
      ...location,
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0)
    });
    setIsLocationMenuVisible(false);
  };

  const handleAddFriend = (friend) => {
    setSelectedFriends(prevFriends => [
      ...prevFriends,
      { 
        ...friend, 
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1),
        rotate: new Animated.Value(0)
      }
    ]);
    setIsFriendsListVisible(false);
  };

  const handleAddText = () => {
  const newText = {
    id: Date.now(),
    content: 'New Text',
    pan: new Animated.ValueXY(),
    scale: new Animated.Value(1),
    rotate: new Animated.Value(0),
  };
  setTextElements([...textElements, newText]);
  };

    const handleEditText = (id, newContent) => {
      setTextElements(textElements.map(text => 
        text.id === id ? {...text, content: newContent} : text
      ));
    };

  const createPanResponder = (item, itemType) => {
    let lastScale = 1;
    let lastRotation = 0;
    let lastDistance = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        item.pan.setOffset({
          x: item.pan.x._value,
          y: item.pan.y._value
        });
        item.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (event, gestureState) => {
        const { touches } = event.nativeEvent;

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

          const angle = Math.atan2(touch2.pageY - touch1.pageY, touch2.pageX - touch1.pageX);
          const rotation = angle - lastRotation;
          item.rotate.setValue(item.rotate._value + rotation);

          lastRotation = angle;
          lastDistance = distance;
        }
      },
      onPanResponderRelease: () => {
        item.pan.flattenOffset();
        lastDistance = 0;
        lastRotation = 0;
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
            scale: new Animated.Value(1),
            rotate: new Animated.Value(0)
          });
        }
      });
    } catch (error) {
      console.error('Error accessing gallery:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again.');
    }
  };
  
  const handleImageCropped = (croppedImage) => {
  setCurrentMedia(croppedImage);
  setOriginalImage(currentMedia);
};

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        onBackPress={handleBackPress}
        onSave={handleSave}
        onDraft={handleDraft}
        currentMedia={currentMedia}
        onFriendsPress={handleFriendsPress}
        onHashtagPress={handleHashtagPress}
        onLocationPress={handleLocationPress}
        onPIPPress={handlePIPPress}
        onSelectFilter={handleSelectFilter}
        selectedFilter={selectedFilter}
        isVideo={isVideo}
        onAddText={handleAddText}
        onImageCropped={handleImageCropped}
        
      />
      <View style={styles.mediaContainer}>
       {currentMedia && (
  isVideo ? (
    <Video
      ref={videoRef}
      source={{ uri: currentMedia.uri }}
      style={styles.media}
      resizeMode="contain"
      repeat={currentMedia.type === 'boomerang'}
      controls={currentMedia.type !== 'boomerang'}
      onError={(error) => console.error('Video playback error:', error)}
    />
  ) : (
    SelectedFilterComponent ? (
      <SelectedFilterComponent
        image={
          <Image
            source={{ uri: currentMedia.uri }}
            style={styles.media}
            resizeMode="contain"
          />
        }
      />
    ) : (
      <Image
        source={{ uri: currentMedia.uri }}
        style={styles.media}
        resizeMode="contain"
      />
    )
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
                    { scale: friend.scale },
                    
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
                    { scale: hashtag.scale },
                    
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
                  { scale: selectedLocation.scale },
                 
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
        {textElements.map((text) => {
          const panResponder = createPanResponder(text, 'text');
          return (
            <Animated.View
              key={text.id}
              style={[
                styles.overlay,
                {
                  transform: [
                    { translateX: text.pan.x },
                    { translateY: text.pan.y },
                    { scale: text.scale },
                    { rotate: text.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })},
                  ]
                }
              ]}
              {...panResponder.panHandlers}
            >
              <TextInput
                style={styles.overlayText}
                value={text.content}
                onChangeText={(newContent) => handleEditText(text.id, newContent)}
              />
            </Animated.View>
          );
        })}
        {selectedStickers.map((sticker) => {
        const panResponder = createPanResponder(sticker, 'sticker');
        return (
          <Animated.View
            key={sticker.id}
            style={[
              styles.stickerContainer,
              {
                transform: [
                  { translateX: sticker.pan.x },
                  { translateY: sticker.pan.y },
                  { scale: sticker.scale },
                  { rotate: sticker.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  })},
                ]
              }
            ]}
            {...panResponder.panHandlers}
          >
            <Image source={{ uri: sticker.image }} style={styles.sticker} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setSelectedStickers(selectedStickers.filter(s => s.id !== sticker.id))}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        );
        })}

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
            currentMedia={currentMedia}
          />
        </View>
      </Modal>

      <Modal
        visible={isStickersVisible}
        transparent={true}
        animationType="slide"
      >
      <View style={styles.modalContainer}>
        <StickerScreen
          onSelectSticker={handleSelectSticker}
          onClose={() => setIsStickersVisible(false)}
          currentMedia={currentMedia}
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
  mediaContainer: {
    width: wp('100%'),
    height: hp('93%'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  media: {
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
    fontSize: 18,
    minWidth: 100,
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
  stickerContainer: {
  position: 'absolute',
  zIndex: 2,
},
sticker: {
  width: 100,
  height: 100,
  resizeMode: 'contain',
},
deleteButton: {
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
});

export default EditingScreen;