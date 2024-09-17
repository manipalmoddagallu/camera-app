import React, { useState, useEffect, useRef } from 'react';
import {View,Image,StyleSheet,SafeAreaView,Alert,Text,Modal,Animated,TouchableOpacity,PanResponder,TextInput,ScrollView,ActivityIndicator,Dimensions,PermissionsAndroid} from 'react-native';
import Video from 'react-native-video';
import { SvgXml } from 'react-native-svg';
import { ColorMatrix, concatColorMatrices } from 'react-native-color-matrix-image-filters';
import {widthPercentageToDP as wp,heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import TopBar from './TopBar';
import FriendsList from './FriendsList';
import HashtagMenu from './HashtagMenu';
import LocationMenu from './LocationMenu';
import PipMenu from './PipMenu';
import { FILTERS } from './utils/Filters';
import StickerScreen from './StickerScreen';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import ViewShot  from "react-native-view-shot";
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon4 from 'react-native-vector-icons/Entypo';
import MusicModal from './MusicMenu';
import RecordingMenu from './RecordingMenu';
import ColorPicker from 'react-native-wheel-color-picker';
import LayoutView from './Layouts/LayoutView';
import VideoProcessor from 'react-native-video-processing';
import { captureRef } from 'react-native-view-shot';
import Slider from '@react-native-community/slider';


const EditingScreen = ({ route, navigation }) => {
  const { media = null, filterIndex = -1,  draftedMedia = null, originalImageUri = null, selectedLayoutImages = [], selectedLayoutId = null,layoutData = []} = route?.params || {};
  const [currentMedia, setCurrentMedia] = useState(route.params?.media || null);
  const [isFromLayout, setIsFromLayout] = useState(false);
  const [isVideo, setIsVideo] = useState(media?.type === 'video' || media?.type === 'boomerang' || media?.type === 'slowMotionVideo');  const [selectedFilter, setSelectedFilter] = useState(FILTERS[filterIndex] || null);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isFriendsListVisible, setIsFriendsListVisible] = useState(false);
  const [isHashtagMenuVisible, setIsHashtagMenuVisible] = useState(false);
  const [isLocationMenuVisible, setIsLocationMenuVisible] = useState(false);
  const [pipImage, setPipImage] = useState(null);
  const [pipFlipped, setPipFlipped] = useState(false);
  const [isPipMenuVisible, setIsPipMenuVisible] = useState(false);
  const [pipSize, setPipSize] = useState(wp('40%'));
  const [pipBackgroundColor, setPipBackgroundColor] = useState(null);
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
  const [isMuted, setIsMuted] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMusicMenuVisible, setIsMusicMenuVisible] = useState(false);
  const [isTextDropdownVisible, setIsTextDropdownVisible] = useState(false);
  const [isRecordingMenuVisible, setIsRecordingMenuVisible] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [stickers, setStickers] = useState([]);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [isStickerBarVisible, setIsStickerBarVisible] = useState(false);
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);
  const handleFriendsPress = () => setIsFriendsListVisible(true);
  const handleHashtagPress = () => setIsHashtagMenuVisible(true);
  const handleLocationPress = () => setIsLocationMenuVisible(true);
  const handleCloseFriendsList = () => setIsFriendsListVisible(false);
  const handleCloseHashtagMenu = () => setIsHashtagMenuVisible(false);
  const handleCloseLocationMenu = () => setIsLocationMenuVisible(false);
  const handlePipMenuPress = () => setIsPipMenuVisible(true);
  const handleClosePipMenu = () => setIsPipMenuVisible(false);
  const handleSelectFilter = (filter) => setSelectedFilter(filter);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);
  const [pipZoomMode, setPipZoomMode] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const SelectedFilterComponent = selectedFilter ? selectedFilter.filterComponent : React.Fragment;
  const [isPipTouched, setIsPipTouched] = useState(false);
  const [saturation, setSaturation] = useState(1);
  const [adjustmentsChanged, setAdjustmentsChanged] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [mediaContainerLayout, setMediaContainerLayout] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const viewShotRef = useRef(null);
  const [isMusicModalVisible, setIsMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [textSize, setTextSize] = useState(16);
  const [showSizeSlider, setShowSizeSlider] = useState(false);
  const [currentTextSize, setCurrentTextSize] = useState(16);
  const [previewOverlayElements, setPreviewOverlayElements] = useState(null);
  const toggleTextDropdown = () => {setIsTextDropdownVisible(!isTextDropdownVisible);};
  const handleMusicPress = () => {setIsMusicMenuVisible(true);};
  const handleCloseMusicMenu = () => {setIsMusicMenuVisible(false);};
  const handleBackPress = () => {navigation.goBack();};
  const handleImageCropped = (newImage) => {setCroppedImage(newImage); setCurrentMedia(newImage);};
  const toggleRecordingMenu = () => {setIsRecordingMenuVisible(!isRecordingMenuVisible);};
  useEffect(() => {
    fetchStickers();
  }, []);
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
      const croppedVideo = route.params?.croppedVideo;
      const newMedia = route.params?.media;
      if (croppedVideo) {
        console.log('Received cropped video:', croppedVideo);
        setCurrentMedia(croppedVideo);
        setIsVideo(true);
      } else if (newMedia) {
        console.log('Received new media:', newMedia);
        setCurrentMedia(newMedia);
        setIsVideo(newMedia.type === 'video' || newMedia.type === 'boomerang' || newMedia.type === 'slowMotionVideo');
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
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const trimmedVideo = route.params?.trimmedVideo;
      if (trimmedVideo) {
        setCurrentMedia(trimmedVideo);
        setIsVideo(true);
        // Clear the trimmedVideo param to avoid reapplying on future focuses
        navigation.setParams({ trimmedVideo: null });
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);
  useEffect(() => {
  if (currentMedia && currentMedia.type === 'slowMotionVideo' && videoRef.current) {
    videoRef.current.setNativeProps({ rate: 0.25 });
  }
  }, [currentMedia]);
  useEffect(() => {
  if (media && media.type === 'slowMotionVideo') {
    // Set up slow-motion playback
    if (videoRef.current) {
      videoRef.current.setNativeProps({ rate: 0.25 }); // Play at 1/4 speed
    }
  }
}, [media]);
  const handleBrushPress = async () => {
      if (!viewShotRef.current) {
        console.error('ViewShot ref is not available');
        Alert.alert('Error', 'The drawing tool is not ready yet. Please try again.');
        return;
      }

      try {
        let imageUri = currentMedia.uri;
        let videoUri = isVideo ? currentMedia.uri : null;

        const overlayData = {
          friends: selectedFriends.map(friend => ({
            id: friend.id,
            name: friend.name,
            color: friend.color,
            position: { x: friend.pan.x._value, y: friend.pan.y._value },
            scale: friend.scale._value
          })),
          hashtags: selectedHashtags.map(hashtag => ({
            id: hashtag.id,
            title: hashtag.title,
            color: hashtag.color,
            position: { x: hashtag.pan.x._value, y: hashtag.pan.y._value },
            scale: hashtag.scale._value
          })),
          location: selectedLocation ? {
            id: selectedLocation.id,
            placeName: selectedLocation.placeName,
            color: selectedLocation.color,
            position: { x: selectedLocation.pan.x._value, y: selectedLocation.pan.y._value },
            scale: selectedLocation.scale._value
          } : null,
          textElements: textElements.map(text => ({
            id: text.id,
            content: text.content,
            style: text.style,
            position: { x: text.pan.x._value, y: text.pan.y._value },
            scale: text.scale._value
          })),
          stickers: selectedStickers.map(sticker => ({
            id: sticker.id,
            stickerURI: sticker.stickerURI,
            position: { x: sticker.pan.x._value, y: sticker.pan.y._value },
            scale: sticker.scale._value
          })),
          pipImage: pipImage ? {
            uri: pipImage.uri,
            position: { x: pipImage.pan.x._value, y: pipImage.pan.y._value },
            scale: pipImage.scale._value,
            rotation: pipRotation,
            size: pipSize,
            backgroundColor: pipBackgroundColor,
            opacity: pipOpacity
          } : null
        };

        navigation.navigate('DrawingScreen', {
          image: imageUri,
          video: videoUri,
          mediaType: isVideo ? 'video' : 'image',
          originalMedia: currentMedia,
          overlayData: overlayData,
          adjustments: {
            contrast,
            brightness,
            temperature,
            softness,
            sharpness,
            saturation,
          },
          filterIndex: FILTERS.findIndex(filter => filter === selectedFilter),
          playbackSpeed,
          isMuted,
        });
      } catch (error) {
        console.error('Error in handleBrushPress:', error);
        Alert.alert(
          'Error',
          'Unable to process this media type for drawing. Please try again.',
          [{ text: 'OK', onPress: () => console.log('Alert closed') }]
        );
      }
  };
  const handleMusicSelect = (music) => {
  setSelectedMusic(music);
  // You can add logic here to incorporate the selected music into your video/image editing
  };
  const ColorPanel = ({ onColorChange }) => {
    const colors = [ '#FF0000', '#00FF00', '#0000FF', '#FFFF00', ,'#FF00FF', '#00FFFF', '#FFA500','#800080', '#008000','#4B0082', '#FF4500',  '#1E90FF', '#FFD700','#00CED1', '#FF1493', '#32CD32','#8A2BE2',
    ];
    return (
      <View style={styles.colorPanel}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={() => onColorChange(color)}
          />
        ))}
      </View>
    );
  };
  const DeleteZone = ({ visible }) => {
    if (!visible) return null;
    return (
      <View style={styles.deleteZone}>
        <Icon name="trash" size={20} color="#020E27" />
      </View>
    );
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
  const toggleMuteAll = () => {
    const newMutedState = !isAllMuted;
    setIsAllMuted(newMutedState);
    if (videoRef.current) {
      videoRef.current.setNativeProps({ muted: newMutedState });
    }
    if (currentSound) {
      currentSound.setVolume(newMutedState ? 0 : 1);
    }
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
      { icon: 'text-height', text: 'Size', iconSet: 'FontAwesome', onPress: () => onTextStyle('size') },
    ];

    return (
      <View style={styles.textDropdownContainer}>
        <View style={styles.textDropdown}>
          {textOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.textDropdownItem} onPress={option.onPress}>
              {option.iconSet === 'Ionicons' ? (
                <Icon name={option.icon} size={12} color="#fff" />
              ) : (
                <Icon1 name={option.icon} size={12} color="#fff" />
              )}
              <Text style={styles.textDropdownItemText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {showSizeSlider && (
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={8}
              maximumValue={32}
              step={1}
              value={currentTextSize}
              onValueChange={(value) => handleTextStyle('sizeChange', value)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
            <Text style={styles.sizeText}>{Math.round(currentTextSize)}</Text>
          </View>
        )}
      </View>
    );
  };
  const handleTextSizeChange = () => {
  setTextSize(prevSize => {
    switch (prevSize) {
      case 'small':
        return 'medium';
      case 'medium':
        return 'large';
      case 'large':
        return 'small';
      default:
        return 'medium';
    }
  });
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

      let saveResult;
      const album = isDraft ? 'Drafts' : 'Camera';

      if (isVideo) {
        // Capture the current state of the viewShotRef as an image
        const overlayUri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 1,
        });

        // Process the video with the overlay
        const processedVideo = await VideoProcessor.process(currentMedia.uri, {
          overlay: {
            path: overlayUri,
            size: {
              width: mediaContainerLayout.width,
              height: mediaContainerLayout.height,
            },
            position: {
              x: 0,
              y: 0,
            },
          },
          // Add other video processing options if needed
        });

        // Save the processed video
        saveResult = await CameraRoll.save(processedVideo.path, { 
          type: 'video', 
          album: album 
        });

        console.log('Processed video saved successfully:', saveResult);
      } else {
        // For images, we can use the existing code
        const uri = await viewShotRef.capture();
        saveResult = await CameraRoll.save(uri, { 
          type: 'photo', 
          album: album 
        });
        console.log('Image saved successfully:', saveResult);
      }

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
  const calculateNewPosition = (existingItems) => {
    const padding = 10;
    const startX = padding;
    const startY = padding;
    const maxHeight = hp('80%'); // Adjust as needed
    let newX = startX;
    let newY = startY;
    existingItems.forEach((item) => {
      const itemHeight = 30; // Estimate or use a fixed height
      if (newY + itemHeight > maxHeight) {
        newY = startY;
        newX += 100 + padding; // Move to next column
      }
      newY += itemHeight + padding;
    });
    return { x: newX, y: newY };
  };
  const handleStickerPress = () => {
    setIsStickerBarVisible(!isStickerBarVisible);
  };
  const handleSelectLocation = (location) => {
    setSelectedLocation({
      ...location,
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
      color: '#020E27' // Add a default color
    });
    setIsLocationMenuVisible(false);
  };
  const handleAddFriend = (friends) => {
    setSelectedFriends(prevFriends => {
      const updatedFriends = [...prevFriends];
      friends.forEach(friend => {
        const newPosition = calculateNewPosition(updatedFriends);
        updatedFriends.push({
          ...friend,
          pan: new Animated.ValueXY(newPosition),
          scale: new Animated.Value(1),
          rotate: new Animated.Value(0),
          style: { color: selectedColor } // Add the current color

        });
      });
      return updatedFriends;
    });
    setIsFriendsListVisible(false);
  };
  const handleAddHashtag = (hashtags) => {
    setSelectedHashtags(prevHashtags => {
      const updatedHashtags = [...prevHashtags];
      hashtags.forEach(hashtag => {
        const newPosition = calculateNewPosition(updatedHashtags);
        updatedHashtags.push({
          ...hashtag,
          pan: new Animated.ValueXY(newPosition),
          scale: new Animated.Value(1),
          rotate: new Animated.Value(0),
          color: '#000000', // Set the initial color to dark black
          style: { color: '#000000' } // Also set the style color to dark black
        });
      });
      return updatedHashtags;
    });
    setIsHashtagMenuVisible(false);
  };
  const handleTextStyle = (style, value) => {
    if (style === 'add') {
      const newText = {
        id: Date.now(),
        content: '',
        placeholder: 'Enter text',
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1),
        style: { color: selectedColor, fontSize: 16 },
        ref: React.createRef(),
      };
      setTextElements([...textElements, newText]);
    } else if (style === 'size') {
      setShowSizeSlider(!showSizeSlider);
    } else if (style === 'sizeChange') {
      if (selectedTextId) {
        setTextElements(prevElements =>
          prevElements.map(el =>
            el.id === selectedTextId
              ? {
                  ...el,
                  style: {
                    ...el.style,
                    fontSize: value,
                  },
                }
              : el
          )
        );
        setCurrentTextSize(value);
      }
    } else if (selectedTextId) {
      setTextElements(prevElements =>
        prevElements.map(el =>
          el.id === selectedTextId
            ? {
                ...el,
                style: {
                  ...el.style,
                  [style]: el.style[style] ? undefined : true,
                },
              }
            : el
        )
      );
    }
  };
  const createPanResponder = (item, itemType) => {
    let lastScale = 1;
    let lastRotation = 0;
    let lastDistance = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
      setIsDragging(true);
      setDraggedItem({ ...item, type: itemType });
      setIsMoving(true);
      setMovingItem({ ...item, type: itemType });
        if (itemType === 'pip') {
          setIsPipTouched(true);
        }
        item.pan.setOffset({
          x: item.pan.x._value,
          y: item.pan.y._value
        });
        item.pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (event, gestureState) => {
        const { touches } = event.nativeEvent;
    const { moveX, moveY } = gestureState;
 const deleteZoneX = wp('60%'); // Start of delete zone from right
    const deleteZoneY = hp('85%'); 
        if (moveX > deleteZoneX && moveY < deleteZoneY + 50) {
        }
        if (touches.length === 1) {
          if (itemType === 'pip' && pipZoomMode) {
            const dx = gestureState.dx;
            const dy = gestureState.dy;
            const dragDistance = Math.sqrt(dx * dx + dy * dy);
            const zoomFactor = 1 + dragDistance / 200; // Adjust this value to control zoom sensitivity
            const newScale = Math.min(Math.max(lastScale * zoomFactor, 0.5), 3); // Limit scale between 0.5 and 3
            item.scale.setValue(newScale);
          } else {
            Animated.event(
              [null, { dx: item.pan.x, dy: item.pan.y }],
              { useNativeDriver: false }
            )(event, gestureState);
          }
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
          const newScale = Math.min(Math.max(lastScale * scale, 0.5), 3); 
          item.scale.setValue(newScale);
          lastScale = newScale;
          const angle = Math.atan2(touch2.pageY - touch1.pageY, touch2.pageX - touch1.pageX);
          const rotation = angle - lastRotation;
          item.rotate.setValue(item.rotate._value + rotation);
          lastRotation = angle;
          lastDistance = distance;
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        const { moveX, moveY } = gestureState;
 const deleteZoneX = wp('60%'); // Start of delete zone from right
    const deleteZoneY = hp('5%'); 
        if (moveX > deleteZoneX && moveY < deleteZoneY + 50) {
          deleteItem(item, itemType);
        } else {
          setIsMoving(false);
          setMovingItem(null);
          if (itemType === 'pip') {
            setIsPipTouched(true);
          }
          lastDistance = 0;
          lastRotation = 0;
          lastScale = item.scale._value;
          item.pan.flattenOffset();
        }
        setIsDragging(false);
        setDraggedItem(null);
      },
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
      hitSlop: { top: 20, bottom: 20, left: 20, right: 20 },
    });
  };
  const handlePipZoomPress = () => {
  setPipZoomMode(!pipZoomMode);
  };
  const handlePIPPress = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 35,
        assetType: 'Photos',
        include: ['filename', 'fileSize', 'location'],
      });

      navigation.navigate('GalleryPicker', {
        photos: result.edges,
        onSelectImage: (selectedImage) => {
          Image.getSize(selectedImage.node.image.uri, (width, height) => {
            const aspectRatio = width / height;
            const newWidth = wp('40%');
            const newHeight = newWidth / aspectRatio;
            setPipSize({ width: newWidth, height: newHeight });
            setPipImage({
              uri: selectedImage.node.image.uri,
              pan: new Animated.ValueXY(),
              scale: new Animated.Value(1),
              rotate: new Animated.Value(0)
            });
          });
        }
      });
    } catch (error) {
      console.error('Error accessing gallery:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again.');
    }
  };
  const handleEditText = (id, newContent) => {
    setTextElements(prevElements =>
      prevElements.map(element =>
        element.id === id 
          ? { 
              ...element, 
              content: newContent,
              placeholder: newContent ? null : element.placeholder // Keep placeholder if content is empty
            } 
          : element
      )
    );
    setEditingTextId(id);
  };
  const handleColorSelect = () => {
    setIsColorPickerVisible(true);
    setIsTextDropdownVisible(false);
  };
  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (selectedTextId) {
      setTextElements(prevElements =>
        prevElements.map(text =>
          text.id === selectedTextId
            ? { ...text, style: { ...text.style, color } }
            : text
        )
      );
    }
    if (selectedItem) {
      if (selectedItem.type === 'friend') {
        setSelectedFriends(prev => prev.map(friend => 
          friend.id === selectedItem.id ? { ...friend, style: { ...friend.style, color } } : friend
        ));
      } else if (selectedItem.type === 'hashtag') {
        setSelectedHashtags(prev => prev.map(hashtag => 
          hashtag.id === selectedItem.id ? { ...hashtag, style: { ...hashtag.style, color } } : hashtag
        ));
      } else if (selectedItem.type === 'location') {
        setSelectedLocation(prev => ({ ...prev, style: { ...prev.style, color } }));
      }
    }
  };
  const adjustSaturation = (s) => {
    const adjustedS = 1 + (s - 1) * 0.5;
    return [
      0.299 + 0.701 * adjustedS, 0.587 - 0.587 * adjustedS, 0.114 - 0.114 * adjustedS, 0, 0,
      0.299 - 0.299 * adjustedS, 0.587 + 0.413 * adjustedS, 0.114 - 0.114 * adjustedS, 0, 0,
      0.299 - 0.299 * adjustedS, 0.587 - 0.587 * adjustedS, 0.114 + 0.886 * adjustedS, 0, 0,
      0, 0, 0, 1, 0,
    ];
  };
  const adjustContrast = (c) => {
    const adjustedC = 1 + (c - 1) * 0.5;
    return [
      adjustedC, 0, 0, 0, 128 * (1 - adjustedC),
      0, adjustedC, 0, 0, 128 * (1 - adjustedC),
      0, 0, adjustedC, 0, 128 * (1 - adjustedC),
      0, 0, 0, 1, 0,
    ];
  };
  const adjustBrightness = (b) => {
    const adjustedB = 1 + (b - 1) * 0.2;
    return [
      adjustedB, 0, 0, 0, 0,
      0, adjustedB, 0, 0, 0,
      0, 0, adjustedB, 0, 0,
      0, 0, 0, 1, 0,
    ];
  };
  const adjustTemperature = (t) => {
    const adjustedT = t * 0.5;
    return [
      1 + adjustedT, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1 - adjustedT, 0, 0,
      0, 0, 0, 1, 0,
    ];
  };
  const adjustSoftness = (s) => {
    const softnessFactor = s * 0.25;
    return [
      1 - softnessFactor, softnessFactor, 0, 0, 0,
      softnessFactor, 1 - softnessFactor, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
    ];
  };
  const adjustSharpness = (s) => {
    const sharpnessFactor = s * 0.125;
    return [
      1 + sharpnessFactor, -sharpnessFactor, -sharpnessFactor, 0, 0,
      -sharpnessFactor, 1 + sharpnessFactor, -sharpnessFactor, 0, 0,
      -sharpnessFactor, -sharpnessFactor, 1 + sharpnessFactor, 0, 0,
      0, 0, 0, 1, 0,
    ];
  };
  const deleteItem = (item, itemType) => {
  switch (itemType) {
    case 'friend':
      setSelectedFriends(prevFriends => prevFriends.filter(friend => friend.id !== item.id));
      break;
    case 'hashtag':
      setSelectedHashtags(prevHashtags => prevHashtags.filter(hashtag => hashtag.id !== item.id));
      break;
    case 'location':
      setSelectedLocation(null);
      break;
    case 'text':
      setTextElements(prevElements => prevElements.filter(element => element.id !== item.id));
      break;
    case 'sticker':
      setSelectedStickers(prevStickers => prevStickers.filter(sticker => sticker.id !== item.id));
      break;
    case 'pip':
      setPipImage(null);
      break;
  }
  };
  const Priview = async () => {
    try {
      const overlayElements = (
        <>
          {selectedFriends.map((friend) => (
            <Animated.View key={friend.id} style={[styles.overlay, getOverlayStyle(friend)]}>
              <Text style={[styles.overlayText, { color: friend.color || '#FFFFFF' }]}>@{friend.name}</Text>
            </Animated.View>
          ))}
          {selectedHashtags.map((hashtag) => (
            <Animated.View key={hashtag.id} style={[styles.overlay, getOverlayStyle(hashtag)]}>
              <Text style={[styles.overlayText, { color: hashtag.color || '#FFFFFF' }]}>#{hashtag.title}</Text>
            </Animated.View>
          ))}
          {selectedLocation && (
            <Animated.View style={[styles.overlay, getOverlayStyle(selectedLocation)]}>
              <Text style={[styles.overlayText, { color: selectedLocation.color || '#020E27' }]}>
                {selectedLocation.placeName}
              </Text>
            </Animated.View>
          )}
          {textElements.map((text) => (
            <Animated.View key={text.id} style={[styles.overlay, getOverlayStyle(text)]}>
              <Text style={[styles.overlayText, text.style]}>{text.content}</Text>
            </Animated.View>
          ))}
          {selectedStickers.map((sticker) => (
            <Animated.View key={sticker.id} style={[styles.stickerContainer, getOverlayStyle(sticker)]}>
              <FastImage
                source={{ uri: sticker.stickerURI }}
                style={styles.sticker}
                resizeMode={FastImage.resizeMode.contain}
              />
            </Animated.View>
          ))}
          {pipImage && (
            <Animated.View style={[styles.pipContainer, getPipStyle()]}>
              <Animated.Image
                source={{ uri: pipImage.uri }}
                style={[styles.pipImage, { opacity: pipOpacity }, pipFlipped && { transform: [{ scaleX: -1 }] }]}
              />
            </Animated.View>
          )}
        </>
      );
      setIsPreviewVisible(true);
      setPreviewImage(currentMedia.uri);
      setPreviewOverlayElements(overlayElements);
    } catch (error) {
      console.error('Error capturing preview:', error);
      Alert.alert('Error', 'Failed to generate preview. Please try again.');
    }
  };
  const getOverlayStyle = (item) => ({
    transform: [
      { translateX: item.pan.x },
      { translateY: item.pan.y },
      { scale: item.scale },
      {
        rotate: item.rotate ? item.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg']
        }) : '0deg'
      },
    ],
    ...(item.style || {}),
  });
  const MediaPreviewContent = ({ mediaUri, isVideo, overlayElements }) => {
    const videoRef = useRef(null);

    useEffect(() => {
      if (isVideo && videoRef.current) {
        videoRef.current.seek(0);
      }
    }, [isVideo]);

    const handleVideoEnd = () => {
      if (videoRef.current && media.type === 'boomerang') {
        videoRef.current.seek(0);
      }
    };
    return (
      <View style={styles.mediaPreviewContainer}>
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: mediaUri }}
            style={styles.previewVideo}
            resizeMode="contain"
            repeat={media.type === 'boomerang'}
            controls={media.type !== 'boomerang'}
            onEnd={handleVideoEnd}
            paused={false}
          />
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="contain" />
        )}
        {overlayElements}
      </View>
    );
  };
  const PreviewModal = ({ isVisible, onClose, mediaUri, isVideo, overlayElements }) => {
    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.previewModalContainer}>
          <MediaPreviewContent
            mediaUri={mediaUri}
            isVideo={isVideo}
            overlayElements={overlayElements}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
  const renderImage = () => {
  if (!selectedFilter || selectedFilter === FILTERS[0]) {
      return (
        <Image
          source={{ uri: currentMedia.uri }}
          style={styles.media}
          resizeMode="contain"
        />
      );
    } else {
      const FilterComponent = selectedFilter.filterComponent;
      return (
        <SelectedFilterComponent
          image={
            <Image
              source={{ uri: croppedImage ? croppedImage.uri : currentMedia.uri, cache: 'force-cache' }}
              style={[styles.media]}
              resizeMode="contain"
            />
          }
        />
      );
    }
  };
  return (
  <SafeAreaView style={styles.container} >
    {(selectedItem && (selectedItem.type === 'friend' || selectedItem.type === 'hashtag' || selectedItem.type === 'location')) && (
      <ColorPanel onColorChange={(color) => {
        if (selectedItem.type === 'friend') {
          setSelectedFriends(prevFriends => prevFriends.map(friend => 
            friend.id === selectedItem.id ? { ...friend, color: color } : friend
          ));
        } else if (selectedItem.type === 'hashtag') {
          setSelectedHashtags(prevHashtags => prevHashtags.map(hashtag => 
            hashtag.id === selectedItem.id ? { ...hashtag, color: color } : hashtag
          ));
        } else if (selectedItem.type === 'location') {
          setSelectedLocation(prevLocation => ({ ...prevLocation, color: color }));
        }
      }} />
    )}
    <DeleteZone visible={isDragging}  />
    <TopBar
          currentMedia={croppedImage || currentMedia}
          onPIPPress={handlePIPPress}
          onSelectFilter={handleSelectFilter}
          selectedFilter={selectedFilter}
          isVideo={isVideo}
          onStickerPress={handleStickerPress}
          saturationValue={saturation}
          onSaturationChange={(value) => { setSaturation(value); setAdjustmentsChanged(true); }}
          contrastValue={contrast}
          onContrastChange={(value) => { setContrast(value); setAdjustmentsChanged(true);}}
          brightnessValue={brightness}
          onBrightnessChange={(value) => {setBrightness(value); setAdjustmentsChanged(true);}}
          temperatureValue={temperature}
          onTemperatureChange={(value) => {setTemperature(value); setAdjustmentsChanged(true);}}
          softnessValue={softness}
          onSoftnessChange={(value) => {setSoftness(value); setAdjustmentsChanged(true);}}
          sharpnessValue={sharpness}
          onSharpnessChange={(value) => {setSharpness(value); setAdjustmentsChanged(true);}}
          onImageCropped={handleImageCropped}
          onTextStyle={handleTextStyle}
     />
    <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#020E27" />
        </TouchableOpacity>
<TouchableOpacity onPress={() => setIsMusicModalVisible(true)}>
          <Icon name="musical-notes-sharp" size={24} color="#020E27" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleDropdown}>
          <Icon name="download" size={24} color="#020E27" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMuteAll}>
          <Icon
            name={isAllMuted ? "volume-mute" : "volume-high"}
            size={24}
            color="#020E27"
          />
        </TouchableOpacity>
    </View>
    <View style={styles.leftIconsContainer}>
          <TouchableOpacity style={styles.icon} onPress={handleFriendsPress}>
            <Icon4 name="email" size={18} color="#020E27" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={handleLocationPress}>
            <Icon name="location" size={18} color="#020E27" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={Priview}>
            <Icon name="eye" size={18} color="#020E27" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={handleHashtagPress}>
            <Icon1 name="hashtag" size={18} color="#020E27" />
          </TouchableOpacity>
    </View>
    <View style={styles.rightIconsContainer}>
        <TouchableOpacity style={styles.icon} onPress={handleBrushPress}>
          <Icon name="brush" size={18} color="#020E27" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={toggleRecordingMenu}>
          <Icon name="mic" size={18} color="#020E27" />
        </TouchableOpacity>
      <TouchableOpacity style={styles.icon} onPress={toggleTextDropdown}>
        <Icon name="text" size={18} color="#020E27" />
      </TouchableOpacity>
        {isVideo && (
          <TouchableOpacity onPress={handleSpeedChange} style={styles.icon}>
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
        )}
    </View>
    <ViewShot 
     ref={viewShotRef}
      options={{ format: "jpg", quality: 1 }}
      style={styles.viewShot}
    >
    <View style={styles.mediaContainer} pointerEvents="box-none"   
    onTouchStart={(event) => { 
      if (pipImage && isPipTouched) {
      const { locationX, locationY } = event.nativeEvent;
      const pipBounds = {
        left: pipImage.pan.x._value,
        top: pipImage.pan.y._value,
        right: pipImage.pan.x._value + pipSize.width,
        bottom: pipImage.pan.y._value + pipSize.height
      };
      if (
        locationX < pipBounds.left ||
        locationX > pipBounds.right ||
        locationY < pipBounds.top ||
        locationY > pipBounds.bottom
      ) {
        setIsPipTouched(false);
      }}
       setSelectedItem(null);
        setEditingTextId(null); // Clear editing state when tapping outside
            textElements.forEach(text => {
      if (text.ref && text.ref.current) {
        text.ref.current.blur();
      }
    });
      }}
     onLayout={(event) => setMediaContainerLayout(event.nativeEvent.layout)}
      >
        {currentMedia && (
          <View style={styles.mediaWrapper}>
            {isFromLayout ? (
              <SelectedFilterComponent>
                <LayoutView
                  layoutData={layoutData}
                  selectedLayoutId={selectedLayoutId}
                  getSelectedImage={(layoutId, tabId) => {
                    const layout = layoutData.find(item => item.id === layoutId);
                    if (layout) {
                      const image = layout.images.find(img => img.id === tabId);
                      return image ? image.image : null;
                    }
                    return null;
                  }}
                />
              </SelectedFilterComponent>
            ) : isVideo ? (
              <View style={[styles.videoContainer]}>
                   <Video
                      ref={videoRef}
                      source={{ uri: currentMedia.uri }}
                      style={[styles.media, { opacity: contrast }]}
                      resizeMode="contain"
                      repeat={currentMedia.type === 'boomerang'}
                      controls={currentMedia.type !== 'boomerang'}
                      rate={media.type === 'slowMotionVideo' ? 0.25 : 1}
                      muted={isAllMuted || isMuted}
                      onLoad={(data) => {
                        setVideoDuration(data.duration);
                        if (currentMedia.type === 'slowMotionVideo') {
                          videoRef.current.setNativeProps({ rate: 0.25 });
                        }
                      }}
                    />
              </View>
            ) : (
              <View style={[styles.imageContainer]}>
                {adjustmentsChanged ? (
                  <ColorMatrix
                    matrix={concatColorMatrices(
                      adjustSaturation(saturation),
                      adjustContrast(contrast),
                      adjustBrightness(brightness),
                      adjustTemperature(temperature),
                      adjustSoftness(softness),
                      adjustSharpness(sharpness)
                    )}
                  >
                    {renderImage()}
                  </ColorMatrix>
                ) : (
                  renderImage()
                )}
              </View>
            )}
          </View>
        )}
      {selectedFriends.map((friend, index) => {
        const panResponder = createPanResponder(friend, 'friend');
        const isSelected = selectedItem && selectedItem.id === friend.id && selectedItem.type === 'friend';
        return (
          <Animated.View
            key={friend.id}
            style={[
              styles.overlay,
              isSelected && { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
              {
                transform: [
                  { translateX: friend.pan.x },
                  { translateY: friend.pan.y },
                  { scale: friend.scale },
                ],
                zIndex: 10 + index, // Increasing z-index
              }
            ]}
            {...panResponder.panHandlers}
            onTouchStart={(event) => {
              event.stopPropagation();
              setSelectedItem({ id: friend.id, type: 'friend' });
            }}
          >
            <Text style={[styles.overlayText, { color: friend.color }]}>@{friend.name}</Text>
          </Animated.View>
        );
      })}
      {selectedHashtags.map((hashtag, index) => {
        const panResponder = createPanResponder(hashtag, 'hashtag');
        const isSelected = selectedItem && selectedItem.id === hashtag.id && selectedItem.type === 'hashtag';
        return (
          <Animated.View
            key={hashtag.id}
            style={[
              styles.overlay,
              isSelected && { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
              {
                transform: [
                  { translateX: hashtag.pan.x },
                  { translateY: hashtag.pan.y },
                  { scale: hashtag.scale },
                ],
                zIndex: 20 + index, // Increasing z-index, higher than friends
              }
            ]}
            {...panResponder.panHandlers}
            onTouchStart={(event) => {
              event.stopPropagation();
              setSelectedItem({ id: hashtag.id, type: 'hashtag' });
            }}
          >
            <Text style={[styles.overlayText, { color: hashtag.color }]}>#{hashtag.title}</Text>
          </Animated.View>
        );
      })}
      {selectedLocation && (
        <Animated.View
          style={[
            styles.overlay,
            styles.locationOverlay, // New style for permanent background
            selectedItem && selectedItem.type === 'location' && { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
            {
              transform: [
                { translateX: selectedLocation.pan.x },
                { translateY: selectedLocation.pan.y },
                { scale: selectedLocation.scale },
              ]
            }
          ]}
          {...createPanResponder(selectedLocation, 'location').panHandlers}
          onTouchStart={(event) => {
            event.stopPropagation();
            setSelectedItem({ id: selectedLocation.id, type: 'location' });
          }}
        >
          <View style={styles.locationContent}>
            <Icon name="location" size={16} color={selectedLocation.color || '#020E27'} />
            <Text style={[styles.overlayText, { color: selectedLocation.color || '#020E27' }]}>
              {selectedLocation.placeName}
            </Text>
          </View>
        </Animated.View>
      )}
      {pipImage && (
        <Animated.View
          style={[
            styles.pipContainerOuter,
            {
              transform: [
                { translateX: pipImage.pan.x },
                { translateY: pipImage.pan.y },
                { scale: pipImage.scale },
                { rotate: `${pipRotation}deg` },
              ],
              width: pipSize.width + 50,  // Larger container
              height: pipSize.height + 40,
              borderWidth: isPipTouched ? 2 : 0,
              borderColor: isPipTouched ? 'white' : 'transparent',
            }
          ]}
          {...createPanResponder(pipImage, 'pip').panHandlers}
          onTouchStart={(event) => {
            event.stopPropagation();
            setIsPipTouched(true);
          }}
        >
          <Animated.View
            style={[
              styles.pipBackgroundContainer,
              {
                backgroundColor: pipBackgroundColor,
                width: pipSize.width,  // Smaller background
                height: pipSize.height,
              }
            ]}
          >
            <Animated.Image
              source={{ uri: pipImage.uri }}
              style={[
                styles.pipImage,
                { opacity: pipOpacity },
                pipFlipped && { transform: [{ scaleX: -1 }] }
              ]}
            />
          </Animated.View>
          
          {isPipTouched && (
            <>
              <TouchableOpacity 
                style={[styles.pipIcon, styles.pipDeleteIcon]} 
                onPress={(event) => {
                  event.stopPropagation();
                  setPipImage(null);
                  setIsPipTouched(false);
                }}
              >
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pipIcon, styles.pipFlipIcon]} 
                onPress={(event) => {
                  event.stopPropagation();
                  setPipFlipped(!pipFlipped);
                }}
              >
                <Icon2 name="flip-horizontal" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pipIcon, styles.pipMenuIcon]} 
                onPress={(event) => {
                  event.stopPropagation();
                  handlePipMenuPress();
                }}
              >
                <Icon name="pencil" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pipIcon, styles.pipZoomIcon]} 
                onPress={(event) => {
                  event.stopPropagation();
                  handlePipZoomPress();
                }}
              >
                <Icon2 name="arrow-expand" size={20} color="white" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}
      {textElements.map((text) => {
            const panResponder = createPanResponder(text, 'text');
            const isEditing = editingTextId === text.id;
            return (
              <Animated.View
                key={text.id}
                style={[
                  styles.overlay,
                  isEditing && styles.editingOverlay,
                  {
                    transform: [
                      { translateX: text.pan.x },
                      { translateY: text.pan.y },
                      { scale: text.scale },
                    ]
                  }
                ]}
                {...panResponder.panHandlers}
              >
                <TextInput
                  ref={(ref) => { text.ref = ref; }}
                  style={[
                    styles.overlayText, 
                    text.style,
                    isEditing && styles.editingText
                  ]}
                  value={text.content}
                  placeholder={text.placeholder}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  onChangeText={(newContent) => {
                    handleEditText(text.id, newContent);
                    if (newContent && text.placeholder) {
                      setTextElements(prevElements =>
                        prevElements.map(el =>
                          el.id === text.id ? { ...el, placeholder: null } : el
                        )
                      );
                    }
                  }}
                  onFocus={() => {
                    setSelectedTextId(text.id);
                    setEditingTextId(text.id);
                  }}
                  onBlur={() => setEditingTextId(null)}
                  cursorColor="black"
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
    <PreviewModal
      isVisible={isPreviewVisible}
      onClose={() => setIsPreviewVisible(false)}
      mediaUri={previewImage}
      isVideo={isVideo}
      overlayElements={previewOverlayElements}
    />
<MusicModal
  isVisible={isMusicModalVisible}
  onClose={() => setIsMusicModalVisible(false)}
  onSelectMusic={handleMusicSelect}
/>
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
      <Text style= {styles.savetext}>Save</Text>
      </TouchableOpacity>
      <View style={styles.dropdownSeparator} />
      <TouchableOpacity style={styles.dropdownItem}>
      <Text style= {styles.savetext}>Draft</Text>
      </TouchableOpacity>
      </View>
      )}
      {isTextDropdownVisible && (
        <TextDropdown 
          onTextStyle={handleTextStyle}
          onColorSelect={handleColorSelect}
        />
      )}
      {isRecordingMenuVisible && (
        <RecordingMenu onClose={toggleRecordingMenu} />
      )}
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
    height: hp('92%'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex:2,
    top:hp('-2%')
  },
  locationOverlay: {
    backgroundColor: 'white', // Semi-transparent black background
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  savetext: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#020E27',
  },
  media: {
    width: wp('100%'),    
    height: hp('80%'),
    zIndex:2
  },
    pipContainerOuter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  colorPanel: {
    position: 'absolute',
    bottom: hp('10%'),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    zIndex: 1000,
  },
 deleteZone: {
    position: 'absolute',
    top: hp("5%"),
    right: 0,
    width: wp('20%'),
    height: hp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderBottomLeftRadius: 20,
    zIndex: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
 overlay: {
    position: 'absolute',
    zIndex: 10,
    padding: 5,
    borderRadius: 5,
  },
  editingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
   pipBackgroundContainer: {
    width: ("100%"),
    height: ("100%"),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipImage: {
    width: ("100%"),
    height: 160,
    resizeMode: 'contain',
  },
   viewShot: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  pipZoomIcon: {
  bottom: -15,
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
   overlayText: {
    color: 'white',
    fontSize: 24,
    minWidth: 100,
    zIndex:10,
    fontWeight: 'bold'
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
    shadowColor: '#020E27',
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
   dropdownSeparator: {  // Add this style
    height: 1,
    backgroundColor: '#020E27',  // Light grey color, adjust as needed
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
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
  right: wp('10%'), // Adjust this value as needed
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 15,
  padding: 10,
  width: wp('50%'),
  elevation: 5,
  shadowColor: '#020E27',
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
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
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
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreviewContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  textDropdownContainer: {
    position: 'absolute',
    top: hp('50%'),
    right: wp('10%'),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  textDropdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 10,
    width: wp('50%'),
    elevation: 5,
    shadowColor: '#020E27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 10,
    marginLeft: 10,
    width: wp('30%'),
  },
  slider: {
    width: '100%',
  },
  sizeText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
});
export default EditingScreen;