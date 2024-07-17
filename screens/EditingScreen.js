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
  Platform,TextInput,ScrollView,ActivityIndicator,TouchableWithoutFeedback
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
import { FILTERS } from './utils/Filters';
import StickerScreen from './StickerScreen';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import axios from 'axios';
import ViewShot from "react-native-view-shot";
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Entypo';
import MusicMenu from './MusicMenu';
import RecordingMenu from './RecordingMenu';
import ColorPicker from 'react-native-wheel-color-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


const EditingScreen = ({ route, navigation }) => {
  const { media = null, filterIndex = -1, draftedMedia = null,originalImageUri= null } = route?.params || {};
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
  const [pipBackgroundSize, setPipBackgroundSize] = useState(wp('32%')); // Initial background size

  const [pipSize, setPipSize] = useState(wp('45%'));
  const [pipBackgroundColor, setPipBackgroundColor] = useState('rgba(0, 0, 0, 0.5)');
  const [pipOpacity, setPipOpacity] = useState(1);
  const [pipRotation, setPipRotation] = useState(0);
  const videoRef = useRef(null);
  const [textElements, setTextElements] = useState([]);
  const [isStickersVisible, setIsStickersVisible] = useState(false);
  const handleSave = () => saveMedia(false);
  const [contrast, setContrast] = useState(1);
  const [brightness, setBrightness] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [softness, setSoftness] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [movingItem, setMovingItem] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [viewShotRef, setViewShotRef] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isTextDropdownVisible, setIsTextDropdownVisible] = useState(false);
  const [isRecordingMenuVisible, setIsRecordingMenuVisible] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const toggleMute = () => setIsMuted(!isMuted);
  const [stickers, setStickers] = useState([]);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [isStickerBarVisible, setIsStickerBarVisible] = useState(false);
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);
  const [isMusicMenuVisible, setIsMusicMenuVisible] = useState(false);
  const handleFriendsPress = () => setIsFriendsListVisible(true);
  const handleHashtagPress = () => setIsHashtagMenuVisible(true);
  const handleLocationPress = () => setIsLocationMenuVisible(true);
  const handleCloseFriendsList = () => setIsFriendsListVisible(false);
  const handleCloseHashtagMenu = () => setIsHashtagMenuVisible(false);
  const handleCloseLocationMenu = () => setIsLocationMenuVisible(false);
  const handlePipMenuPress = () => setIsPipMenuVisible(true);
  const handleClosePipMenu = () => setIsPipMenuVisible(false);
  const handleSelectFilter = (filter) => setSelectedFilter(filter);
  const [isPipSelected, setIsPipSelected] = useState(false);
  const SelectedFilterComponent = selectedFilter ? selectedFilter.filterComponent : null;
  const [previewImage, setPreviewImage] = useState(null);
  const toggleTextDropdown = () => {
    setIsTextDropdownVisible(!isTextDropdownVisible);
  };
const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  const handleMusicPress = () => {
    setIsMusicMenuVisible(true);
  };
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');

  const handleCloseMusicMenu = () => {
    setIsMusicMenuVisible(false);
  };
  useEffect(() => {
    if (originalImageUri) {
      setCurrentMedia({ uri: originalImageUri, type: 'photo' });
    }
  }, [originalImageUri]);

  const handleSelectMusic = (music) => {
    // Handle the selected music (e.g., set it as background music for the video)
    console.log('Selected music:', music);
  };
useEffect(() => {
  if (draftedMedia) {
    setCurrentMedia({ uri: draftedMedia.editedImageUri || draftedMedia.uri, type: draftedMedia.type });
    setIsVideo(draftedMedia.type === 'video');
    setSelectedFilter(FILTERS[draftedMedia.filterIndex] || null);
    setSelectedHashtags(draftedMedia.hashtags || []);
    setSelectedLocation(draftedMedia.location);
    setSelectedFriends(draftedMedia.friends || []);
    setPipImage(draftedMedia.pipImage);
    setTextElements(draftedMedia.textElements || []);
    setSelectedStickers(draftedMedia.stickers || []);
    setContrast(draftedMedia.contrast || 1);
    setBrightness(draftedMedia.brightness || 0);
    setTemperature(draftedMedia.temperature || 0);
    setSoftness(draftedMedia.softness || 0);
    setSharpness(draftedMedia.sharpness || 0);
    setPipSize(draftedMedia.pipSize || wp('25%'));
    setPipBackgroundColor(draftedMedia.pipBackgroundColor || 'rgba(0, 0, 0, 0.5)');
    setPipOpacity(draftedMedia.pipOpacity || 1);
    setPipRotation(draftedMedia.pipRotation || 0);
    setIsMuted(draftedMedia.isMuted || false);
    setPlaybackSpeed(draftedMedia.playbackSpeed || 1);
  }
}, [draftedMedia]);


 const handleBrushPress = () => {
    navigation.navigate('DrawingScreen', { image: currentMedia.uri });
  };
  

  const toggleRecordingMenu = () => {
    setIsRecordingMenuVisible(!isRecordingMenuVisible);
  };
const Priview = async () => {
  try {
    const uri = await viewShotRef.capture();
    setIsPreviewVisible(true);
    // Pass the captured URI to the PreviewModal
    setPreviewImage(uri);
  } catch (error) {
    console.error('Error capturing preview:', error);
    Alert.alert('Error', 'Failed to generate preview. Please try again.');
  }
};

  useEffect(() => {
    fetchStickers();
  }, []);

  
 useEffect(() => {
  if (currentMedia) {
    RNFS.exists(currentMedia.uri.replace('file://', ''))
      .then((exists) => {
        console.log('File exists:', exists);
      })
      .catch((error) => {
        console.error('Error checking file existence:', error);
      });
  }
}, [currentMedia]);

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
    const editedImage = route.params?.editedImage;
    const croppedVideo = route.params?.croppedVideo;
    const originalImageUri = route.params?.originalImageUri; // Add this line

    if (trimmedVideo) {
      console.log('Received trimmed video:', trimmedVideo);
      setCurrentMedia(trimmedVideo);
      setIsVideo(true);
    } else if (croppedVideo) {
      setCurrentMedia(croppedVideo);
      setIsVideo(true);
    } else if (editedImage) {
      setCurrentMedia({ uri: editedImage, type: 'photo' });
      setIsVideo(false);
    } else if (croppedImage) {
      console.log('Received cropped image:', croppedImage);
      setCurrentMedia(croppedImage);
      setOriginalImage(originalImage || currentMedia);
      setIsVideo(false);
    } else if (newMedia) {
      setCurrentMedia(newMedia);
      setIsVideo(newMedia.type === 'video');
    } else if (originalImageUri) { // Add this condition
      setCurrentMedia({ uri: originalImageUri, type: 'photo' });
      setIsVideo(false);
    } else if (!currentMedia) {
      console.log('No media received');
      Alert.alert('Error', 'No media provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      console.log('Using existing media:', currentMedia);
    }
  });

  return unsubscribe;
}, [navigation, route.params, currentMedia]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSelectSticker = (sticker) => {
    const newSticker = {
      ...sticker,
      id: Date.now(),
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
    };
    setSelectedStickers([...selectedStickers, newSticker]);
    setIsStickerBarVisible(false);
  };
  const fetchStickers = async () => {
    setIsLoadingStickers(true);
    try {
      const response = await axios.get('https://socialmedia.digiatto.info/public/api/sticker');
      if (response.data && response.data.data) {
        setStickers(response.data.data);
      } else {
        console.error('Invalid sticker data received:', response.data);
        setStickers([]);
      }
    } catch (error) {
      console.error('Error fetching stickers:', error);
      setStickers([]);
    } finally {
      setIsLoadingStickers(false);
    }
  };
const TextDropdown = ({ onTextStyle, onColorSelect }) => {
  const textOptions = [
    { icon: 'add', text: 'Add Text', iconSet: 'Ionicons', onPress: () => onTextStyle('add') },
    { icon: 'underline', text: 'Underline', iconSet: 'FontAwesome', onPress: () => onTextStyle('underline') },
    { icon: 'bold', text: 'Bold', iconSet: 'FontAwesome', onPress: () => onTextStyle('bold') },
    { icon: 'arrow-up', text: 'Uppercase', iconSet: 'FontAwesome', onPress: () => onTextStyle('uppercase') },
    { icon: 'arrow-down', text: 'Lowercase', iconSet: 'FontAwesome', onPress: () => onTextStyle('lowercase') },
    { icon: 'color-palette', text: 'Color', iconSet: 'Ionicons', onPress: onColorSelect },
  ];

  return (
    <View style={styles.textDropdown}>
      {textOptions.map((option, index) => (
        <TouchableOpacity key={index} style={styles.textDropdownItem} onPress={option.onPress}>
          {option.iconSet === 'Ionicons' ? (
            <Icon name={option.icon} size={16} color="#fff" />
          ) : (
            <Icon1 name={option.icon} size={16} color="#fff" />
          )}
          <Text style={styles.textDropdownItemText}>{option.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
    const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
  };

const saveMedia = async (isDraft = false) => {
  try {
    if (!currentMedia) {
      throw new Error('No media to save');
    }

    // Capture the entire view
    const uri = await viewShotRef.capture();

    const album = isDraft ? 'Drafts' : 'Camera';
    const saveResult = await CameraRoll.save(uri, { 
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

  const handleStickerPress = () => {
    setIsStickerBarVisible(!isStickerBarVisible);
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
  const handleDraft = async () => {
  const draftData = {
    uri: currentMedia.uri,
    type: isVideo ? 'video' : 'photo',
    filterIndex: FILTERS.findIndex(filter => filter === selectedFilter),
    hashtags: selectedHashtags,
    location: selectedLocation,
    friends: selectedFriends,
    pipImage: pipImage,
    textElements: textElements,
    stickers: selectedStickers,
    contrast: contrast,
    brightness: brightness,
    temperature: temperature,
    softness: softness,
    sharpness: sharpness,
    pipSize: pipSize,
    pipBackgroundColor: pipBackgroundColor,
    pipOpacity: pipOpacity,
    pipRotation: pipRotation,
    isMuted: isMuted,
    playbackSpeed: playbackSpeed
  };

  try {
    // Capture the entire view as an image
    const editedImageUri = await viewShotRef.capture();
    draftData.editedImageUri = editedImageUri;

    const existingDrafts = await AsyncStorage.getItem('draftedMedia');
    let drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
    drafts.push(draftData);
    await AsyncStorage.setItem('draftedMedia', JSON.stringify(drafts));
    Alert.alert('Success', 'Media drafted successfully');
  } catch (error) {
    console.error('Error saving draft:', error);
    Alert.alert('Error', 'Failed to save draft. Please try again.');
  }
};

const handleTextStyle = (style, value) => {
  if (style === 'add') {
    const newText = {
      id: Date.now(),
      content: 'New Text',
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
      style: {
        textDecorationLine: 'none',
        fontWeight: 'normal',
        color: 'white',
      },
    };
    setTextElements(prevElements => [...prevElements, newText]);
    setSelectedTextId(newText.id);
  } else {
    setTextElements(prevElements => prevElements.map(text => {
      if (text.id === selectedTextId) {
        switch (style) {
          case 'underline':
            return {
              ...text,
              style: {
                ...text.style,
                textDecorationLine: text.style.textDecorationLine === 'underline' ? 'none' : 'underline'
              }
            };
          case 'bold':
            return {
              ...text,
              style: {
                ...text.style,
                fontWeight: text.style.fontWeight === 'bold' ? 'normal' : 'bold'
              }
            };
          case 'uppercase':
            return { ...text, content: text.content.toUpperCase() };
          case 'lowercase':
            return { ...text, content: text.content.toLowerCase() };
          case 'color':
            return {
              ...text,
              style: {
                ...text.style,
                color: value
              }
            };
          default:
            return text;
        }
      }
      return text;
    }));
  }
   if (style === 'color') {
    setSelectedColor(value);
  }
  setIsTextDropdownVisible(false);
};

const handleBackgroundPress = () => {
  setIsPipSelected(false);
};

const createPanResponder = (item, itemType) => {
  let lastScale = 1;
  let lastRotation = 0;
  let lastDistance = 0;
  let initialAngle = 0;

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      setIsMoving(true);
      setMovingItem({ ...item, type: itemType });

      item.pan.setOffset({
        x: item.pan.x._value,
        y: item.pan.y._value
      });
      item.pan.setValue({ x: 0, y: 0 });

      // Store initial angle for rotation
      initialAngle = Math.atan2(gestureState.dy, gestureState.dx);
    },
    onPanResponderMove: (e, gestureState) => {
      const { moveX, moveY, dx, dy } = gestureState;

      if (itemType === 'pip' && e.nativeEvent.locationX > item.size - 30 && e.nativeEvent.locationY > item.size - 30) {
        // Resizing and rotating
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - initialAngle;
        
        const scale = 1 + distance / 200; // Adjust this value to control resize sensitivity
        item.scale.setValue(lastScale * scale);
        
        item.rotate.setValue(lastRotation + angle * (180 / Math.PI));
      } else {
        // Moving
        Animated.event(
          [null, { dx: item.pan.x, dy: item.pan.y }],
          { useNativeDriver: false }
        )(e, gestureState);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      setIsMoving(false);
      setMovingItem(null);

      item.pan.flattenOffset();
      lastScale = item.scale._value;
      lastRotation = item.rotate._value;

      const shouldDelete = item.pan.x._value > wp('75%') && item.pan.y._value < hp('20%');
      if (shouldDelete) {
        handleDelete(itemType, item.id);
      }
    },
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
  rotate: new Animated.Value(0),
  size: pipSize,
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
  const handleContrastChange = (value) => {
    setContrast(value);
  };
   const handleBrightnessChange = (value) => {
    setBrightness(value);
  };
  const handleTemperatureChange = (value) => {
    setTemperature(value);
  };
  const handleSoftnessChange = (value) => {
  setSoftness(value);
  };

  const handleSharpnessChange = (value) => {
    setSharpness(value);
  };
const PreviewModal = ({ isVisible, onClose, imageUri }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.previewModalContainer}>
        <View style={styles.previewImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
  const getBrightnessOverlay = (brightness) => {
  const alpha = brightness > 0 ? brightness : -brightness;
  const color = brightness > 0 ? 255 : 0;
  return `rgba(${color}, ${color}, ${color}, ${alpha})`;
  };
const getTemperatureOverlay = (temperature) => {
  const warmth = temperature > 0 ? temperature : 0;
  const coolness = temperature < 0 ? -temperature : 0;
  return `linear-gradient(
    rgba(255, ${255 - warmth * 50}, ${255 - warmth * 100}, ${Math.abs(temperature) * 0.3}),
    rgba(${255 - coolness * 100}, ${255 - coolness * 50}, 255, ${Math.abs(temperature) * 0.3})
  )`;
};
  const getSoftnessOverlay = (softness) => {
    return { filter: `blur(${softness * 5}px)` };
  };
  const getSharpnessOverlay = (sharpness) => {
    return { filter: `contrast(${1 + sharpness}) brightness(${1 + sharpness * 0.5})` };
  };
 const handleDelete = (type, id) => {
  console.log(`Attempting to delete ${type} with id ${id}`);
  switch(type) {
    case 'friend':
      setSelectedFriends(prev => prev.filter(friend => friend.id !== id));
      break;
    case 'hashtag':
      setSelectedHashtags(prev => prev.filter(hashtag => hashtag.id !== id));
      break;
    case 'location':
      setSelectedLocation(null);
      break;
    case 'text':
      setTextElements(prev => prev.filter(text => text.id !== id));
      break;
    case 'sticker':
      setSelectedStickers(prev => prev.filter(sticker => sticker.id !== id));
      break;
    case 'pip':
      setPipImage(null);
      break;
    default:
      console.warn(`Unknown item type: ${type}`);
  }
};
const handleEditText = (id, newContent) => {
  setTextElements(prevElements =>
    prevElements.map(element =>
      element.id === id ? { ...element, content: newContent } : element
    )
  );
};
const getContrastFilter = (contrast) => {
  return `rgba(128, 128, 128, ${Math.abs(contrast - 1)})`;
};
const handleColorSelect = () => {
  setIsColorPickerVisible(true);
  setIsTextDropdownVisible(false);
};

const handleColorChange = (color) => {
  if (selectedTextId) {
    setTextElements(prevElements =>
      prevElements.map(text =>
        text.id === selectedTextId
          ? { ...text, style: { ...text.style, color } }
          : text
      )
    );
  }
};
return (
  <SafeAreaView style={styles.container}>
   
    <TopBar
    
      currentMedia={currentMedia}
      onPIPPress={handlePIPPress}
      onSelectFilter={handleSelectFilter}
      selectedFilter={selectedFilter}
      isVideo={isVideo}
      onImageCropped={handleImageCropped}
      onStickerPress={handleStickerPress}
      contrastValue={contrast}
      onContrastChange={handleContrastChange}
      brightnessValue={brightness}
      onBrightnessChange={handleBrightnessChange}
      temperatureValue={temperature}
      onTemperatureChange={handleTemperatureChange}
      softnessValue={softness}
      onSoftnessChange={handleSoftnessChange}
      sharpnessValue={sharpness}
      onSharpnessChange={handleSharpnessChange}
     
  onTextStyle={handleTextStyle}
    />
    <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMusicPress}>
          <Icon name="musical-notes-sharp" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleDropdown}>
          <Icon name="download" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMute}>
          <Icon
            name={isMuted ? "volume-mute" : "volume-high"}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>
        <View style={styles.leftIconsContainer}>
  <TouchableOpacity style={styles.icon} onPress={handleFriendsPress}>
    <Icon4 name="email" size={18} color="#000" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.icon} onPress={handleLocationPress}>
    <Icon name="location" size={18} color="#000" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.icon} onPress={Priview}>
    <Icon name="eye" size={18} color="#000" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.icon} onPress={handleHashtagPress}>
    <Icon1 name="hashtag" size={18} color="#000" />
  </TouchableOpacity>
        </View>
       <View style={styles.rightIconsContainer}>
  <TouchableOpacity style={styles.icon} onPress={handleBrushPress}>
    <Icon name="brush" size={18} color="#000" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.icon} onPress={toggleRecordingMenu}>
    <Icon name="mic" size={18} color="#000" />
  </TouchableOpacity>
 <TouchableOpacity style={styles.icon} onPress={toggleTextDropdown}>
  <Icon name="text" size={18} color="#000" />
</TouchableOpacity>
  {isVideo && (
    <TouchableOpacity onPress={handleSpeedChange} style={styles.icon}>
      <Text style={styles.speedText}>{playbackSpeed}x</Text>
    </TouchableOpacity>
  )}
        </View>
     
<ViewShot 
  ref={ref => setViewShotRef(ref)} 
  options={{ format: "jpg", quality: 1 }}
  style={styles.viewShot}
>
<TouchableWithoutFeedback onPress={handleBackgroundPress}>
    <View style={styles.mediaContainer} pointerEvents="box-none">
      
 {currentMedia && (
  <View style={styles.mediaWrapper}>
    {isVideo ? (
            <View style={[styles.videoContainer, getSoftnessOverlay(softness), getSharpnessOverlay(sharpness)]}>

      <Video
        ref={videoRef}
        source={{ uri: currentMedia.uri }}
        style={[styles.media, { opacity: contrast }]}
        resizeMode="contain"
        repeat={currentMedia.type === 'boomerang'}
        controls={currentMedia.type !== 'boomerang'}
        rate={playbackSpeed} // Add this line to control playback speed

      />
      </View>
    ) : (
            <View style={[styles.imageContainer, getSoftnessOverlay(softness), getSharpnessOverlay(sharpness)]}>
        {SelectedFilterComponent ? (
          <SelectedFilterComponent
            image={
              <Image
                source={{ uri: currentMedia.uri }}
                style={[styles.media, { opacity: contrast }]}
                resizeMode="contain"
              />
            }
          />
        ) : (
          <Image
            source={{ uri: currentMedia.uri }}
            style={[styles.media, { opacity: contrast }]}
            resizeMode="contain"
          />
        )}
      </View>
    )}
    
    <View style={[
  styles.temperatureOverlay,
  { backgroundColor: getTemperatureOverlay(temperature) }
]} />

    <View style={[
      styles.brightnessOverlay,
      { backgroundColor: getBrightnessOverlay(brightness) }
    ]} />
    
  </View>
  
)}
      <View style={[styles.contrastOverlay, { opacity: contrast - 1, brightness: brightness + 1 }]} />
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
                  { rotate: friend.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  })},
                ],
                  zIndex: 10, 
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
                  { rotate: hashtag.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  })},
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
                { rotate: selectedLocation.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })},
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
                { rotate: pipImage.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })},
              ],
              backgroundColor: pipBackgroundColor,
              width: pipBackgroundSize * (pipBackgroundSize / 100), // Adjust container size
              height: pipBackgroundSize * (pipBackgroundSize / 100), // Adjust container size
              opacity: pipOpacity,
              borderWidth: isPipSelected ? 2 : 0,
              borderColor: isPipSelected ? 'white' : 'transparent',
            }
          ]}
          {...createPanResponder(pipImage, 'pip').panHandlers}
        >
          <TouchableWithoutFeedback onPress={() => setIsPipSelected(true)}>
            <Animated.Image
              source={{ uri: pipImage.uri }}
              style={[
                styles.pipImage,
                { opacity: pipOpacity,width: pipSize,
          height: pipSize, },
                pipFlipped && { transform: [{ scaleX: -1 }] }
              ]}
            />
          </TouchableWithoutFeedback>
          {isPipSelected && (
            <>
              <TouchableOpacity style={[styles.pipIcon, styles.pipDeleteIcon]} onPress={() => setPipImage(null)}>
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pipIcon, styles.pipMenuIcon]} onPress={handlePipMenuPress}>
                <Icon name="pencil" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pipIcon, styles.pipFlipIcon]} onPress={() => setPipFlipped(!pipFlipped)}>
                <Icon3 name="flip" size={20} color="white" />
              </TouchableOpacity>
              
              <View style={[styles.pipIcon, styles.pipResizeRotateIcon]}>
                <Icon name="resize" size={20} color="white" />
              </View>
            </>
          )}
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
              style={[styles.overlayText, text.style]}
              value={text.content}
              onChangeText={(newContent) => handleEditText(text.id, newContent)}
              onFocus={() => setSelectedTextId(text.id)}
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
            <FastImage
              source={{ uri: sticker.stickerURI }}
              style={styles.sticker}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Animated.View>
        );
      })}
    </View>
    </TouchableWithoutFeedback>
  </ViewShot>
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
          pipBackgroundColor={pipBackgroundColor}
          setPipBackgroundColor={setPipBackgroundColor}
          pipOpacity={pipOpacity}
          setPipOpacity={setPipOpacity}
          pipRotation={pipRotation}
          setPipRotation={setPipRotation}
          pipBackgroundSize={pipBackgroundSize}
          setPipBackgroundSize={setPipBackgroundSize}
          onClose={handleClosePipMenu}
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
<Modal
  visible={isMusicMenuVisible}
  transparent={true}
  animationType="slide"
>
  <View style={styles.musicMenuModalContainer}>
    <MusicMenu
      isVisible={isMusicMenuVisible}
      onClose={handleCloseMusicMenu}
      onSelectMusic={handleSelectMusic}
    />
  </View>
</Modal>
    
    {isStickerBarVisible && (
      <View style={styles.stickerBar}>
        {isLoadingStickers ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : stickers.length === 0 ? (
          <View>
            <Text>No stickers available</Text>
            <TouchableOpacity onPress={fetchStickers}>
              <Text>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stickers.map((sticker) => (
              <TouchableOpacity
                key={sticker.id}
                style={styles.stickerItem}
                onPress={() => handleSelectSticker(sticker)}
              >
                <FastImage
                  source={{ uri: sticker.stickerURI }}
                  style={styles.stickerImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )}
    {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleSave}>
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleDraft}>
            <Text>Draft</Text>
          </TouchableOpacity>
        </View>
      )}
    <Modal visible={isColorPickerVisible} transparent={true}>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          onColorChange={handleColorChange}
          style={{flex: 1}}
          color={selectedColor}
        />
        <TouchableOpacity 
          style={styles.colorPickerDoneButton} 
          onPress={() => setIsColorPickerVisible(false)}
        >
          <Text style={styles.colorPickerDoneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
      {isTextDropdownVisible && (
      <TextDropdown 
        onTextStyle={handleTextStyle}
        onColorSelect={handleColorSelect}
      />
    )}
      {isRecordingMenuVisible && (
        <RecordingMenu onClose={toggleRecordingMenu} />
      )}
    
<PreviewModal
  isVisible={isPreviewVisible}
  onClose={() => setIsPreviewVisible(false)}
  imageUri={previewImage}
/>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  mediaWrapper: {
    width: wp('100%'),
    height: hp('93%'),
    overflow: 'hidden', // This ensures effects don't spill outside
  },
  mediaContainer: {
    width: wp('100%'),
    height: hp('93%'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex:2,
    top:hp('-2%')
  },
  media: {
    width: wp('100%'),    
    height: hp('93%'),
    zIndex:2
  },
   overlay: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    minWidth: 100,
    zIndex:2
  },
  musicMenuModalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // semi-transparent background
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
    justifyContent: 'center',
  alignItems: 'center',
   
    zIndex: 2,
  },
   viewShot: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pipImage: {
 
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
    bottom: -15,
    left: -15,
  },
  pipMenuIcon: {
 top : -15,
    right: -15,
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
  contrastOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  temperatureOverlay: {
  ...StyleSheet.absoluteFillObject,
  mixBlendMode: 'color',
  zIndex:4
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
  stickerContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  sticker: {
    width: wp('20%'),
    height: wp('20%'),
    resizeMode: 'contain',
  },

  stickerBar: {
    position: 'absolute',
    bottom: hp('15%'),
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
      zIndex: 2,

  },
  colorPickerContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
},
  stickerItem: {
    marginHorizontal: wp('2%'),
  },
  stickerImage: {
    width: wp('15%'),
    height: wp('15%'),
  },
  brightnessOverlay: {
    ...StyleSheet.absoluteFillObject,
      zIndex:4

  },
  deleteZone: {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: wp('25%'),
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
},
deleteText: {
  color: 'white',
  marginTop: 10,
},
 topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('100%'),
    paddingTop: hp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: 'white',
    zIndex: 10,
  },
  dropdown: {
    position: 'absolute',
    top: hp('6%'),
    right: wp('30%'),
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 11,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  leftIconsContainer: {
    position: 'absolute',
    left: wp('4%'),
    top: '32%',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },
  rightIconsContainer: {
    position: 'absolute',
    right: wp('4%'),
    top: '32%',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    marginVertical: hp('1%'),
    padding: 10,
    backgroundColor: '#4CBB17',
    borderRadius: 30,
  },
  speedText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textDropdown: {
  position: 'absolute',
  top: hp('50%'), // Adjust this value as needed
  right: wp('15%'), // Adjust this value as needed
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 15,
  padding: 10,
  width: wp('50%'),
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  zIndex: 1, // Ensure it's above other elements
},
  textDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  textDropdownItemText: {
    marginLeft: wp('4%'),
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  previewModalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
},
previewImageContainer: {
  width: wp('80%'),
  height: wp('80%'),
  backgroundColor: '#fff',
  borderRadius: 10,
  overflow: 'hidden',
},
previewImage: {
  width: '100%',
  height: '100%',
},
closeButton: {
  position: 'absolute',
  top: hp('5%'),
  right: wp('5%'),
  padding: 10,
},
doneButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  colorPickerDoneButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  colorPickerDoneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pipResizeRotateIcon: {
  bottom: -15,
  right: -15,
},
});

export default EditingScreen;