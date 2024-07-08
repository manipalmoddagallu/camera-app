import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  StatusBar,
  Text,
  TouchableOpacity,
  View, TouchableWithoutFeedback,Modal
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import styles from './Styles';
import {images} from '../../assets/images/image';
import TopMenu from '../../components/EditingScreen/TopMenu';
import BottomMenu from '../../components/EditingScreen/BottomMenu';
import MiddleMenu from '../../components/EditingScreen/MiddleMenu';
import HashtagModal from '../../components/EditingScreen/Modals/HashtagModal';
import CropModal from '../../components/EditingScreen/Modals/CropModal';
import LocationModal from '../../components/EditingScreen/Modals/LocationModal';
import FriendsModal from '../../components/EditingScreen/Modals/FriendsModal';
import MusicModal from '../../components/EditingScreen/Modals/MusicModal';
import Video from 'react-native-video';
import {FILTERS} from '../../utils/Filters';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhotoEditor from 'react-native-photo-editor';
import {modes, musicData, stickers, stickersData} from '../../utils/DemoData';
import LayoutView from '../../components/Layouts/LayoutView';
import {captureRef} from 'react-native-view-shot';
import PreviewModal from '../../components/EditingScreen/Modals/PreviewModal';
import StickersModal from '../../components/EditingScreen/Modals/StickersModal';
import FastImage from 'react-native-fast-image';
import {addOverlay} from '../../components/Video/VideoOverlay';
import {cropVideo} from '../../components/Video/CropVideo';
import {COLOR} from '../../utils/Config';
import ImagePicker from 'react-native-image-crop-picker';
import RecordingModal from '../../components/EditingScreen/Modals/RecordingModal';
import Slider from '@react-native-community/slider';
import { ColorPicker, fromHsv } from 'react-native-color-picker'

const EditingScreen = ({navigation, route}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const {selectedImage} = route.params || '';
  const {selectedImages = []} = route.params;
  const {selectedVideo} = route.params;
  const {
    selectedLayoutImages,
    selectedLayoutId,
    layoutData = [],
  } = route.params;
  const {filteredImage = editedImage, filterIndex} = route.params;

  useEffect(() => {
    setMultipleImages(selectedImages ?? []);
    // setEditedImage(route.params.filteredImage ?? '');
    if (selectedLayoutImages?.length > 0) {
      editedImage ? null : handleSave();
    }
  }, [route.params, selectedLayoutImages]);
  const extractedUri = useRef(
    'https://www.hyundai.com/content/hyundai/ww/data/news/data/2021/0000016609/image/newsroom-0112-photo-1-2021elantranline-1120x745.jpg',
  );
  const viewRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [locationOverlayPosition, setLocationOverlayPosition] = useState({ x: 0, y: 0 });
  const [selectedTextStyle, setSelectedTextStyle] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [textWithStyles, setTextWithStyles] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [hashtagModal, setHashtagModal] = useState(false);
  const [cropModal, setCropModal] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [locationModalVisiable, setLocationModalVisiable] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [FriendsModalVisiable, setFriendsModalVisiable] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [MusicModalVisiable, setMusicModalVisiable] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState([]);
  const [recordingIsiable, setRecordingIsiable] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedHashtagNames, setSelectedHashtagNames] = useState([]);
  const [editedImage, setEditedImage] = useState(
    route.params.selectedImage ? route.params.selectedImage : '',
  );
  const [friendAnimatedValues, setFriendAnimatedValues] = useState({});
  const [lastScale, setLastScale] = useState(1);
  const [editedVideo, setEditedVideo] = useState(route.params.selectedVideo);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [multipleImages, setMultipleImages] = useState([]);
  const [locationScale, setLocationScale] = useState(1);
  const [textScale, setTextScale] = useState(1);
  const [isTextDragging, setIsTextDragging] = useState(false);
  // Postion State
  const [isPreview, setIsPreview] = useState(false);
  const [stickersPosition, setStickersPosition] = useState([]);
  const [locationPosition, setLocationPosition] = useState([]);
  const [inputText, setInputText] = useState('');
  const [friendZIndexes, setFriendZIndexes] = useState({});

  // draggable
  const [isDragg, setIsDragg] = useState(false);
  const [stickerVisible, setStickerVisible] = useState(false);
  const [draggLocation, setDraggLocation] = useState(false);
  const [snapShotImg, setSnapShotImg] = useState('');
  console.log('selectedMusic', selectedMusic);
  const SelectedFilterComponent = FILTERS[filterIndex]?.filterComponent;
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [musicPlaybackSpeed, setMusicPlaybackSpeed] = useState(1);
  const [highestZIndex, setHighestZIndex] = useState(10);
  // movement and zooming functionlities:-
  const [position, setPosition] = useState([]);
  const [selectedFriendNames, setSelectedFriendNames] = useState([]);
  const [friendScales, setFriendScales] = useState({});
  const friendPositions = useRef({}).current;
  const friendPanResponders = useRef({}).current;
  const hashtagAnimatedValues = useRef({}).current;
//pip
  const [showPipOptions, setShowPipOptions] = useState(false);
  const [pipMedia, setPipMedia] = useState(null);
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const [pipScale, setPipScale] = useState(1);
  const [pipSize, setPipSize] = useState({ width: 150, height: 150 });
  const [isPipSelected, setIsPipSelected] = useState(false);
  const [pipOpacity, setPipOpacity] = useState(1);
  const [isPipReversed, setIsPipReversed] = useState(false);
  const [pipExtraSize, setPipExtraSize] = useState(0);

    const togglePipSelection = () => {
    setIsPipSelected(prevState => !prevState);
    };
    const findAvailablePosition = (existingPositions, itemWidth, itemHeight) => {
      const centerX = screenWidth / 2 - itemWidth / 2;
      const centerY = screenHeight / 2 - itemHeight / 2;
      const gridSize = 50; // Adjust this value to change the spacing
      const maxOffset = Math.max(screenWidth, screenHeight) / 2;

      for (let offset = 0; offset <= maxOffset; offset += gridSize) {
        for (let angle = 0; angle < 360; angle += 45) {
          const x = centerX + offset * Math.cos(angle * Math.PI / 180);
          const y = centerY + offset * Math.sin(angle * Math.PI / 180);

          const isOverlapping = existingPositions.some(pos => 
            x < pos.x + itemWidth &&
            x + itemWidth > pos.x &&
            y < pos.y + itemHeight &&
            y + itemHeight > pos.y
          );

          if (!isOverlapping) {
            return { x, y };
          }
        }
      }

      // If no space found, return the center position
      return { x: centerX, y: centerY };
    };
  
    useEffect(() => {
  // Clean up friendPositions for removed friends
  Object.keys(friendPositions).forEach(id => {
    if (!selectedFriendNames.some(friend => friend.id === id)) {
      delete friendPositions[id];
      delete friendPanResponders[id];
    }
    const newZIndexes = {};
  selectedFriendNames.forEach((friend, index) => {
    newZIndexes[friend.id] = friendZIndexes[friend.id] || index + 10;
  });
  setFriendZIndexes(newZIndexes);
  });
    }, [selectedFriendNames]);
    const addFriend = (id, name) => {
  const itemWidth = 100; // Estimate the width of the friend tag
  const itemHeight = 40; // Estimate the height of the friend tag
  
  let position;
  if (selectedFriendNames.length === 0) {
    // If it's the first friend, place it in the center
    position = {
      x: screenWidth / 2 - itemWidth / 2,
      y: screenHeight / 2 - itemHeight / 2
    };
  } else {
    const existingPositions = selectedFriendNames.map(friend => ({
      x: friendAnimatedValues[friend.id].position.x._value,
      y: friendAnimatedValues[friend.id].position.y._value
    }));
    position = findAvailablePosition(existingPositions, itemWidth, itemHeight);
  }

  setSelectedFriendNames(prev => [...prev, { id, name }]);
  setFriendAnimatedValues(prev => ({
    ...prev,
    [id]: {
      position: new Animated.ValueXY(position),
      scale: new Animated.Value(1)
    }
  }));
};
 const createFriendPanResponder = (friendId) => {
  let lastScale = 1;
  let lastDistance = 0;

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      friendAnimatedValues[friendId].position.setOffset({
        x: friendAnimatedValues[friendId].position.x._value,
        y: friendAnimatedValues[friendId].position.y._value
      });
      friendAnimatedValues[friendId].position.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: (event, gesture) => {
      if (gesture.numberActiveTouches === 2) {
        // Handle pinch zoom
        const touches = event.nativeEvent.touches;
        const dx = Math.abs(touches[0].pageX - touches[1].pageX);
        const dy = Math.abs(touches[0].pageY - touches[1].pageY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastDistance === 0) {
          lastDistance = distance;
        }

        const scale = distance / lastDistance * lastScale;
        friendAnimatedValues[friendId].scale.setValue(constrainScale(scale));
      } else {
        // Handle drag
        Animated.event(
          [null, { dx: friendAnimatedValues[friendId].position.x, dy: friendAnimatedValues[friendId].position.y }],
          { useNativeDriver: false }
        )(event, gesture);
      }
    },
    onPanResponderRelease: () => {
      friendAnimatedValues[friendId].position.flattenOffset();
      lastScale = friendAnimatedValues[friendId].scale._value;
      lastDistance = 0;
    },
  });
};
    const addHashtag = (id, name) => {
      const itemWidth = 100; // Estimate the width of the hashtag
      const itemHeight = 40; // Estimate the height of the hashtag
      
      let position;
      if (selectedHashtagNames.length === 0) {
        // If it's the first hashtag, place it in the center
        position = {
          x: screenWidth / 2 - itemWidth / 2,
          y: screenHeight / 2 - itemHeight / 2
        };
      } else {
        const existingPositions = selectedHashtagNames.map(hashtag => ({
          x: hashtagAnimatedValues[hashtag.id].position.x._value,
          y: hashtagAnimatedValues[hashtag.id].position.y._value
        }));
        position = findAvailablePosition(existingPositions, itemWidth, itemHeight);
      }

      setSelectedHashtagNames(prev => [...prev, { id, name }]);
      if (!hashtagAnimatedValues[id]) {
        hashtagAnimatedValues[id] = {
          position: new Animated.ValueXY(position),
          scale: new Animated.Value(1)
        };
      }
    };
    const createHashtagPanResponder = (hashtagId) => {
  let lastScale = 1;
  let lastDistance = 0;

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      hashtagAnimatedValues[hashtagId].position.setOffset({
        x: hashtagAnimatedValues[hashtagId].position.x._value,
        y: hashtagAnimatedValues[hashtagId].position.y._value
      });
      hashtagAnimatedValues[hashtagId].position.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: (event, gesture) => {
      if (gesture.numberActiveTouches === 2) {
        // Handle pinch zoom
        const touches = event.nativeEvent.touches;
        const dx = Math.abs(touches[0].pageX - touches[1].pageX);
        const dy = Math.abs(touches[0].pageY - touches[1].pageY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastDistance === 0) {
          lastDistance = distance;
        }

        const scale = distance / lastDistance * lastScale;
        hashtagAnimatedValues[hashtagId].scale.setValue(constrainScale(scale));
      } else {
        // Handle drag
        Animated.event(
          [null, { dx: hashtagAnimatedValues[hashtagId].position.x, dy: hashtagAnimatedValues[hashtagId].position.y }],
          { useNativeDriver: false }
        )(event, gesture);
      }
    },
    onPanResponderRelease: () => {
      hashtagAnimatedValues[hashtagId].position.flattenOffset();
      lastScale = hashtagAnimatedValues[hashtagId].scale._value;
      lastDistance = 0;
    },
  });
    };
// Helper function to constrain the sca
    const textPanResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsTextDragging(true);
      setPosition(prevPositions => {
        const newPositions = [...prevPositions];
        newPositions[currentIndex] = {
          ...newPositions[currentIndex],
          offsetX: newPositions[currentIndex].x,
          offsetY: newPositions[currentIndex].y,
        };
        return newPositions;
      });
    },
    onPanResponderMove: (event, gesture) => {
      if (gesture.numberActiveTouches === 2) {
        // Handle pinch zoom
        let dx = Math.abs(event.nativeEvent.touches[0].pageX - event.nativeEvent.touches[1].pageX);
        let dy = Math.abs(event.nativeEvent.touches[0].pageY - event.nativeEvent.touches[1].pageY);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        const newScale = constrainScale(distance / 100);
        setTextScale(newScale);
      } else {
        // Handle drag
        setPosition(prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[currentIndex] = {
            ...newPositions[currentIndex],
            x: newPositions[currentIndex].offsetX + gesture.dx,
            y: newPositions[currentIndex].offsetY + gesture.dy,
          };
          return newPositions;
        });
      }
    },
    onPanResponderRelease: (event, gesture) => {
      setIsTextDragging(false);
      
      // Check if the text is over the delete button
      const { pageY } = event.nativeEvent;
      const screenHeight = Dimensions.get('window').height;
      const deleteButtonTop = screenHeight - 70; // Adjust this value based on your layout

      if (pageY > deleteButtonTop) {
        handleDeleteText();
      } else {
        // Finalize the position
        setPosition(prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[currentIndex] = {
            ...newPositions[currentIndex],
            x: newPositions[currentIndex].offsetX + gesture.dx,
            y: newPositions[currentIndex].offsetY + gesture.dy,
          };
          return newPositions;
        });

        // If it's not a video, trigger snapshot after a short delay
        if (!isVideo) {
          setTimeout(() => {
            handleSnapShot('explicit');
          }, 250);
        }
      }
    },
  })
    ).current;
    const locationPanResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setLocationOverlayPosition(prevPosition => ({
            ...prevPosition,
            offsetX: prevPosition.x,
            offsetY: prevPosition.y,
          }));
        },
        onPanResponderMove: (event, gesture) => {
          if (gesture.numberActiveTouches === 2) {
            // Handle pinch zoom
            let dx = Math.abs(event.nativeEvent.touches[0].pageX - event.nativeEvent.touches[1].pageX);
            let dy = Math.abs(event.nativeEvent.touches[0].pageY - event.nativeEvent.touches[1].pageY);
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            const newScale = constrainScale(distance / 100);
            setLocationScale(newScale);
          } else {
            // Handle drag
            setLocationOverlayPosition(prevPosition => ({
              x: prevPosition.offsetX + gesture.dx,
              y: prevPosition.offsetY + gesture.dy,
              offsetX: prevPosition.offsetX,
              offsetY: prevPosition.offsetY,
            }));
          }
        },
      })
    ).current;
    const pipPanResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setPipPosition(prevPosition => ({
        ...prevPosition,
        offsetX: prevPosition.x,
        offsetY: prevPosition.y,
      }));
    },
    onPanResponderMove: (event, gesture) => {
      if (gesture.numberActiveTouches === 2) {
        // Handle pinch zoom
        let dx = Math.abs(event.nativeEvent.touches[0].pageX - event.nativeEvent.touches[1].pageX);
        let dy = Math.abs(event.nativeEvent.touches[0].pageY - event.nativeEvent.touches[1].pageY);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        const newScale = constrainScale(distance / lastScale);
        setPipScale(newScale);
        setLastScale(distance);
      } else {
        // Handle drag
        setPipPosition(prevPosition => ({
          x: prevPosition.offsetX + gesture.dx,
          y: prevPosition.offsetY + gesture.dy,
          offsetX: prevPosition.offsetX,
          offsetY: prevPosition.offsetY,
        }));
      }
    },
    onPanResponderRelease: () => {
      // Don't deselect on release
    },
  })
    ).current;
    const togglePlaybackSpeed = () => {
    const speeds = [0.5,0.75, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    };
    const toggleMusicPlaybackSpeed = () => {
      const speeds = [0.5, 0.75, 1, 1.25, 1.5];
      const currentIndex = speeds.indexOf(musicPlaybackSpeed);
      const nextIndex = (currentIndex + 1) % speeds.length;
      setMusicPlaybackSpeed(speeds[nextIndex]);
    };
    const resizePanResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setPipSize(currentSize => ({
        ...currentSize,
        initialWidth: currentSize.width,
        initialHeight: currentSize.height,
      }));
    },
    onPanResponderMove: (event, gesture) => {
      if (gesture.numberActiveTouches === 2) {
        // Handle pinch zoom
        let dx = Math.abs(event.nativeEvent.touches[0].pageX - event.nativeEvent.touches[1].pageX);
        let dy = Math.abs(event.nativeEvent.touches[0].pageY - event.nativeEvent.touches[1].pageY);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        const newScale = constrainScale(distance / lastScale);
        setPipSize(currentSize => ({
          width: Math.max(100, currentSize.initialWidth * newScale),
          height: Math.max(100, currentSize.initialHeight * newScale),
        }));
      } else {
        // Handle drag
        setPipSize(currentSize => ({
          width: Math.max(100, currentSize.initialWidth + gesture.dx),
          height: Math.max(100, currentSize.initialHeight + gesture.dy),
        }));
      }
    },
    onPanResponderRelease: () => {
      setLastScale(pipSize.width / pipSize.initialWidth);
    },
  })
    ).current;
// Helper function to constrain the scale
    const constrainScale = (scale) => {
      return Math.min(Math.max(scale, 0.5), 3); // Constrain scale between 0.5 and 3
    };
    const getSelectedImage = (layoutId, tabId) => {
      const selectedImage = selectedLayoutImages.find(
        image => image.layoutId === layoutId && image.tabId === tabId,
      );
      return selectedImage ? selectedImage.image : null;
    };
    const onExtractImage = ({nativeEvent}) => {
      // console.log('Extracted URI:', nativeEvent.uri);
      extractedUri.current = nativeEvent.uri;
    };
    const onPressSave = async (localFilePath, fileType, isEdited = false) => {
    console.log('onPressSave called with:', localFilePath, fileType, isEdited);
    try {
      // Ensure the file path starts with 'file://'
      const file = localFilePath.startsWith('file://')
        ? localFilePath
        : `file://${localFilePath}`;

      const downloadFolder = RNFS.DownloadDirectoryPath;
      const appName = 'cameraapp';
      const currentDate = new Date().toISOString().slice(0, 19).replace(/[-T]/g, '');
      const fileExtension = fileType === 'image' ? 'png' : 'mp4';
      const prefix = isEdited ? 'edited_' : '';
      const fileName = `${prefix}${appName}_${currentDate}.${fileExtension}`;
      const filePath = `${downloadFolder}/${fileName.replace(/:/g, '_')}`;

      console.log('Saving file to:', filePath);

      const fileExists = await RNFS.exists(filePath);

      if (fileExists) {
        Alert.alert('Error', 'File already exists');
      } else {
        await RNFS.copyFile(file, filePath);
        console.log('File saved successfully');
        Alert.alert('Success', 'File saved successfully');
        
        if (multipleImages?.length > 0) {
          let updatedImageUrls = [...multipleImages];
          updatedImageUrls[currentIndex] = `file://${filePath}`;
          setMultipleImages(updatedImageUrls);
        } else {
          setEditedImage(`file://${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
      Alert.alert('Error', 'Failed to save file');
    }
    };
   const saveDraft = async () => {
  try {
    const draftKey = `draft_${Date.now()}`;
    const draftData = {
      type: selectedVideo || editedVideo ? 'video' : 'image',
      uri: editedImage || editedVideo || selectedImage || selectedVideo,
      position,
      stickersPosition,
      selectedHashtags,
      selectedLocation,
      selectedFriends,
      selectedMusic,
      // Add any other relevant editing data
    };
    await AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
    Alert.alert('Success', 'Draft saved successfully');
  } catch (error) {
    console.error('Error saving draft:', error);
    Alert.alert('Error', 'Failed to save draft');
  }
    };
    const loadDraft = async (draftKey) => {
      try {
        const draftDataString = await AsyncStorage.getItem(draftKey);
        if (draftDataString) {
          const draftData = JSON.parse(draftDataString);
          setEditedImage(draftData.type === 'image' ? draftData.uri : '');
          setEditedVideo(draftData.type === 'video' ? draftData.uri : '');
          setPosition(draftData.position);
          setStickersPosition(draftData.stickersPosition);
          setSelectedHashtags(draftData.selectedHashtags);
          setSelectedLocation(draftData.selectedLocation);
          setSelectedFriends(draftData.selectedFriends);
          setSelectedMusic(draftData.selectedMusic);
          // Set any other relevant editing data
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        Alert.alert('Error', 'Failed to load draft');
      }
    };
    const handleEditImage = async id => {
      if (selectedVideo) {
        // onPressCropVideo();
        // Alert.alert('Info', 'This SDK only work with Image');
      } else {
        if (id === 3) {
          let imagePath = editedImage
            ? editedImage
            : filteredImage
            ? extractedUri.current
            : multipleImages[currentIndex];
          ImagePicker.openCropper({
            path: imagePath,
            freeStyleCropEnabled: true,
          }).then(image => {
            setEditedImage(image.path);
            console.log(image);
          });
        } else {
          const controls = modes.find(el => el.id === id);
          try {
            let imagePath = editedImage
              ? editedImage
              : filteredImage
              ? extractedUri.current
              : multipleImages[currentIndex];
            // Remove everything after the '?' character
            const index = imagePath.indexOf('?');
            if (index !== -1) {
              imagePath = imagePath.substring(0, index);
            } else {
              imagePath = imagePath;
            }
            console.log('imagePath', imagePath);
            await PhotoEditor.Edit({
              path: imagePath.startsWith('file://')
                ? imagePath.split('://')[1]
                : imagePath,
              // path: editedImage.split('://')[1],
              onDone: onDone,
              hiddenControls: controls ? controls.Controls : [],
              stickers: stickers,
            });
          } catch (error) {
            console.error('Error while editing image', error);
          }
        }
      }
    };
    const onDone = path => {
      if (multipleImages?.length > 0) {
        const uri = path.startsWith('content')
          ? `${path}?${new Date().getTime()}`
          : `file://${path}?${new Date().getTime()}`;

        let updatedImageUrls = [...multipleImages];
        updatedImageUrls[currentIndex] = uri;
        setMultipleImages(updatedImageUrls);
      } else {
        setEditedImage(
          path.startsWith('content')
            ? `${path}?${new Date().getTime()}`
            : `file://${path}?${new Date().getTime()}`,
        );
      }
    };
    // Snap-shot the image
    const handleSave = async type => {
    // Add a check to ensure this function is only called when explicitly requested
    if (type !== 'explicit') {
      console.log('Save attempted, but not explicitly requested');
      return;
    }

    try {
      const capturedUri = await captureRef(viewRef, {
        result: 'tmpfile',
        format: 'png',
        quality: 0.8,
      });
      console.log('capturedUri', capturedUri);
      if (capturedUri !== '') {
        type === 'textImg'
          ? onPressSave(capturedUri, 'image')
          : position?.length > 0
          ? setSnapShotImg(capturedUri)
          : selectedLayoutImages?.length > 0
          ? setEditedImage(capturedUri)
          : onPressSave(capturedUri, 'image');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
    };
  //send
    const onPressSend = () => {
      navigation.navigate('upload');
    };
  //textstyles
    const getTextStyles = () => {
      return selectedTextStyle.reduce((styles, style) => {
        console.log('style.value', style.value);
        switch (style.name) {
          case 'bold':
            return {...styles, fontWeight: 'bold'};
          case 'italic':
            return {...styles, fontStyle: 'italic'};
          case 'underline':
            return {...styles, textDecorationLine: 'underline'};
          case 'uppercase':
            return {...styles, textTransform: 'uppercase'};
          case 'lowercase':
            return {...styles, textTransform: 'lowercase'};
          case 'colored':
            return {...styles, color: `${style.value}`};
          default:
            return styles;
        }
      }, {});
    };
  //overlayvideo
    const handleOverlayVideo = () => {
      addOverlay(
        editedVideo,
        stickersPosition,
        inputText,
        `x=${position.x}:y=${position.y}`,
      )
        .then(outputVideoPath => {
          console.log('Success', 'Overlay added successfully!', outputVideoPath);
          onPressSave(outputVideoPath);
        })
        .catch(error => {
          console.error('Error adding overlay:', error);
          console.log('Error', 'Failed to add overlay');
        });
    };
  //add text
    const handleAddText = () => {
  const centerX = screenWidth / 2 - 50;
  const centerY = screenHeight / 2 - 20;

  const newItem = {
    id: Date.now(),
    x: centerX,
    y: centerY,
    text: '',
    isEditing: true,
  };

  setPosition(prevPositions => [...prevPositions, newItem]);
  setIsVisible(true);
    };
   const handleDeleteText = () => {
  setPosition(prevPositions => {
    const newPositions = [...prevPositions];
    newPositions.splice(currentIndex, 1);
    return newPositions;
  });
  setIsTextDragging(false);
    };
    const LinearColorPicker = ({ onColorSelected }) => {
    return (
      <View style={styles.linearColorPicker}>
        <ColorPicker
          style={{height: 30, width: '100%'}}
          onColorSelected={onColorSelected}
          onColorChange={() => {}}
          hideSliders
          hideControls
        />
      </View>
    );
    };
    useEffect(() => {
  if (route.params?.draftKey) {
    loadDraft(route.params.draftKey);
  }
    }, [route.params?.draftKey]);

  // Effect to log selectedFriendNames when it changes
    useEffect(() => {
      console.log("selectedFriendNames updated in EditingScreen:", selectedFriendNames);
    }, [selectedFriendNames]);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      {/* Main IMage View */}
    <View style={[styles.mainImageView, { position: 'relative' }]} ref={viewRef}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
      {selectedVideo || editedVideo ? (
        <Video
      source={{
        uri: editedVideo ? editedVideo : selectedVideo,
      }}
      style={{flex: 1}}
      resizeMode="contain"
      repeat={cropModal || isPreview ? false : true}
      paused={isVideoPlaying}
      rate={playbackSpeed}  // Add this line
      onEnd={() => setIsVideoPlaying(true)}
    />
      ) : editedImage ? (
        <Image source={{uri: `file://${editedImage}`}} style={styles.image} />
      ) : selectedImage ? (
        <Image source={{uri: selectedImage}} style={styles.image} />
      ) : filteredImage ? (
        <SelectedFilterComponent
          onExtractImage={onExtractImage}
          extractImageEnabled={true}
          image={<Image style={styles.image} source={{uri: filteredImage}} />}
        />
      ) : selectedLayoutImages ? (
        <View style={{backgroundColor: '#000', width: '100%', height: '100%'}}>
          <LayoutView
            layoutData={layoutData}
            selectedLayoutId={selectedLayoutId}
            getSelectedImage={getSelectedImage}
          />
        </View>
      ) : multipleImages?.length > 0 ? (
        <View style={{flex: 1}}>
          <FlatList
            data={multipleImages}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            numColumns={1}
            scrollEventThrottle={16}
            initialScrollIndex={currentIndex}
            onScroll={({nativeEvent}) => {
              const index = Math.floor(
                nativeEvent.contentOffset.x / screenWidth,
              );
              setCurrentIndex(index);
            }}
            renderItem={({item, index}) => {
              return (
                <Image
                  source={{
                    uri: item.startsWith('file://') ? item : `file://${item}`,
                  }}
                  style={{
                    width: screenWidth,
                    height: screenHeight,
                    resizeMode: 'contain',
                  }}
                />
              );
            }}
          />
        </View>
      ) : (
        <Text
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: 20,
          }}>
          No images selected.
        </Text>
      )}
      {/* Text Animated View */}
      {/* pip View */}
        {pipMedia && (
        <Animated.View
        {...pipPanResponder.panHandlers}
        style={[
          styles.pipOuterContainer,
          {
            position: 'absolute',
            left: pipPosition.x - 30 - pipExtraSize / 2,
            top: pipPosition.y - 30 - pipExtraSize / 2,
            transform: [{ scale: pipScale }],
            zIndex: 15,
            width: pipSize.width + 60 + pipExtraSize,
            height: pipSize.height + 60 + pipExtraSize,
            borderWidth: isPipSelected ? 1 : 0,
            borderColor: 'white',
            borderRadius: 20,
          }
        ]}
      >
        <View style={[
          styles.pipBackgroundContainer,
          {
            width: pipSize.width + 20 + pipExtraSize,
        height: pipSize.height + 20 + pipExtraSize,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
          }
        ]}>
          <TouchableWithoutFeedback onPress={() => setIsPipSelected(!isPipSelected)}>
            <View style={{ 
              opacity: pipOpacity,
          width: pipSize.width,
          height: pipSize.height,
          transform: [{ scaleX: isPipReversed ? -1 : 1 }],

            }}>
              {pipMedia.type === 'video' ? (
                <Video
                  source={{ uri: pipMedia.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  repeat={true}
                />
              ) : (
                <Image
                  source={{ uri: pipMedia.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>

          {isPipSelected && (
            <>
              <TouchableOpacity onPress={() => setPipMedia(null)} style={[styles.pipIcon, styles.pipIconTopLeft]}>
                <Image source={images.Done1} style={styles.pipIconImage} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowPipOptions(!showPipOptions)} 
                style={[styles.pipIcon, styles.pipIconTopRight]}
              >
                <Image source={images.Group57} style={styles.pipIconImage} />
              </TouchableOpacity>
              <TouchableOpacity 
      onPress={() => setIsPipReversed(!isPipReversed)} 
      style={[styles.pipIcon, styles.pipIconBottomLeft]}
    >
      <Image source={images.Bold} style={styles.pipIconImage} />
    </TouchableOpacity>
              <Animated.View 
          {...resizePanResponder.panHandlers} 
          style={[styles.pipIcon, styles.pipIconBottomRight]}
        >
          <Image source={images.Eye} style={styles.pipIconImage} />
        </Animated.View>
            </>
          )}
      
        </Animated.View>
        
      )}
      {/* Stickers Animated View */}
      {!stickerVisible && stickersPosition.map((item, index) => (
        <Animated.View
          key={item.id}
          style={{
            position: 'absolute',
            transform: [
              {translateX: item.x},
              {translateY: item.y},
              {scale: locationScale},
            ],
          }}>
          <FastImage
            style={{width: wp(25), height: hp(15), margin: hp(1)}}
            source={{
              uri: item.imageUrl,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Animated.View>
      ))}
      {/* Location Animated View */}
      {!draggLocation && locationPosition.map((item, index) => (
      <Animated.View
        key={item.id}
        {...locationPanResponder.panHandlers}
        style={{
          position: 'absolute',
          transform: [
            {translateX: locationOverlayPosition.x},
            {translateY: locationOverlayPosition.y},
            {scale: locationScale},
          ],
          zIndex: 13,
        }}>
        <View
          style={{
            backgroundColor: '#fff',
            padding: hp(1.4),
            borderRadius: hp(1.5),
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: wp(80), // Set a maximum width
          }}>
          <Image
            source={images.LocationPin}
            style={{
              width: 30,
              height: 30,
              resizeMode: 'contain',
              tintColor: COLOR.GREEN,
            }}
          />
          <Text 
            style={{
              fontSize: hp(2), 
              color: '#000', 
              flexShrink: 1, // Allow text to shrink
              marginLeft: 5, // Add some space between icon and text
            }}
            numberOfLines={2} // Limit to 2 lines
          >
            {item.text}
          </Text>
        </View>
      </Animated.View>
      ))}
      {/* Selected Hashtags Overlay */}
      {selectedHashtagNames.map((hashtag) => (
    <Animated.View
      key={hashtag.id}
      {...createHashtagPanResponder(hashtag.id).panHandlers}
      style={[
        styles.selectedOverlay,
        {
          position: 'absolute',
          transform: [
            ...hashtagAnimatedValues[hashtag.id].position.getTranslateTransform(),
            { scale: hashtagAnimatedValues[hashtag.id].scale },
          ],
          zIndex: 11,
        },
      ]}
    >
      <View style={styles.selectedItem}>
        <Text style={styles.selectedItemText}>#{hashtag.name}</Text>
      </View>
    </Animated.View>
      ))}
      {/* Selected Friends Overlay */}
     {selectedHashtagNames.map((hashtag) => (
  <Animated.View
    key={hashtag.id}
    {...createHashtagPanResponder(hashtag.id).panHandlers}
    style={[
      styles.selectedOverlay,
      {
        position: 'absolute',
        transform: [
          { translateX: hashtagAnimatedValues[hashtag.id].position.x },
          { translateY: hashtagAnimatedValues[hashtag.id].position.y },
          { scale: hashtagAnimatedValues[hashtag.id].scale },
        ],
        zIndex: 11,
      },
    ]}
  >
    <View style={styles.selectedItem}>
      <Text style={styles.selectedItemText}>#{hashtag.name}</Text>
    </View>
  </Animated.View>
      ))}
      {selectedFriendNames.map((friend) => {
  if (!friendAnimatedValues[friend.id]) {
    friendAnimatedValues[friend.id] = {
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      scale: new Animated.Value(1)
    };
  }
  const panResponder = createFriendPanResponder(friend.id);
  return (
    <Animated.View
      key={friend.id}
      {...panResponder.panHandlers}
      style={[
        styles.selectedFriendsOverlay,
        {
          position: 'absolute',
          transform: [
            { translateX: friendAnimatedValues[friend.id].position.x },
            { translateY: friendAnimatedValues[friend.id].position.y },
            { scale: friendAnimatedValues[friend.id].scale },
          ],
          zIndex: friendZIndexes[friend.id] || 10,
        },
      ]}
    >
      <View style={styles.selectedFriendItem}>
        <Text style={styles.selectedFriendText}>@{friend.name}</Text>
      </View>
    </Animated.View>
  );
})}
      {isTextDragging && (
    <TouchableOpacity 
      style={styles.deleteButton} 
      onPress={handleDeleteText}
    >
      <Image 
        source={images.Delete} 
        style={styles.deleteButtonIcon}
      />
    </TouchableOpacity>
      )}

    </View>
      
    </View>
      {/* Postion all Menu View */}
      <View style={styles.allMenuView}>
        {/* Top Menu */}
        <View style={{flex: 0.5}}>
          <TopMenu
              onPressBack={() => navigation.goBack()}
              onPressSave={() => {
                // Implement the save functionality here
                if (selectedLayoutImages && editedImage === '') {
                  handleSave();
                } else {
                  if (stickersPosition?.length > 0) {
                    handleOverlayVideo();
                  } else {
                    if (
                      position?.length > 0 &&
                      (editedVideo === '' || editedVideo === undefined)
                    ) {
                      handleSave('textImg');
                    } else {
                      onPressSave(
                        editedImage
                          ? editedImage
                          : selectedImage
                          ? selectedImage
                          : editedVideo
                          ? editedVideo
                          : selectedVideo
                          ? selectedVideo
                          : filteredImage
                          ? extractedUri.current
                          : multipleImages?.length > 0
                          ? multipleImages[currentIndex]
                          : '',
                        selectedImage || filteredImage || editedImage
                          ? 'image'
                          : 'video',
                      );
                    }
                  }
                }
              }}
                saveDraft={saveDraft}
              MusicModalVisiable={MusicModalVisiable}
              setMusicModalVisiable={setMusicModalVisiable}
            />
        </View>
        {/* Middle Menu */}
        
          <MiddleMenu
            isVisible={isVisible}
            handleAddText={handleAddText}
  handleDeleteText={handleDeleteText}
            setIsVisible={setIsVisible}
            selectedTextStyle={selectedTextStyle}
            setSelectedTextStyle={setSelectedTextStyle}
            filteredImage={extractedUri.current}
            pickerVisible={pickerVisible}
            setPickerVisible={setPickerVisible}
            textWithStyles={textWithStyles}
            setTextWithStyles={setTextWithStyles}
            setHashtagModal={setHashtagModal}
            setLocationModalVisiable={setLocationModalVisiable}
            setFriendsModalVisiable={setFriendsModalVisiable}
            handleEditImage={handleEditImage}
            setIsPreview={setIsPreview}
            inputText={inputText}
            setInputText={setInputText}
            position={position}
            setPosition={setPosition}
            getTextStyles={getTextStyles}
            isDragg={isDragg}
            setIsDragg={setIsDragg}
            stickerVisible={stickerVisible}
            setStickerVisible={setStickerVisible}
            stickersPosition={stickersPosition}
            setStickersPosition={setStickersPosition}
            currentIndex={multipleImages?.length > 0 ? currentIndex : 0}
            recordingIsiable={recordingIsiable}
            setRecordingIsiable={setRecordingIsiable}
            handleSnapShot={handleSave}
            isVideo={
              editedVideo === '' || editedVideo === undefined ? false : true
            }
          />
          {isVideoPlaying && (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                top: 150,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setIsVideoPlaying(!isVideoPlaying)}>
                <Image
                  source={images.playButton}
                  style={{
                    width: wp('20%'),
                    height: hp('10%'),
                    resizeMode: 'contain',
                    tintColor: '#fff',
                  }}
                />
              </TouchableOpacity>
            </View>
          )}

          {(selectedVideo || editedVideo) && (
            <TouchableOpacity 
              style={[styles.playbackSpeedButton, {width: 40, top:100}]} 
              onPress={togglePlaybackSpeed}
            >
              <Text style={styles.playbackSpeedButtonText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          )}
          {selectedMusic && Object.keys(selectedMusic).length > 0 && (
            <TouchableOpacity 
              style={[styles.musicSpeedButton, {width: 40, marginTop: 10}]} 
              onPress={toggleMusicPlaybackSpeed}
            >
              <Text style={styles.musicSpeedButtonText}>{musicPlaybackSpeed}x Music Speed</Text>
            </TouchableOpacity>
          )}
        {/* Bottom Menu */}
        <View
          style={{
            flex: 1.5,
            justifyContent: 'flex-end',
          }}>
          <BottomMenu
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            setCropModal={() => {
              setCropModal(true);
              // if (layoutData?.length > 0) {
              //   Alert.alert('Info', 'This only work with single photo & Video');
              // } else {
              //   setCropModal(true);
              // }
            }}
            onPressSend={onPressSend}
          />
        </View>
      </View>
      <View>
       {showPipOptions && (
      <View style={styles.pipOptionsBar}>
        <View style={styles.pipOptionButton}>
          <Text style={styles.pipOptionText}>Background Color</Text>
          <LinearColorPicker
                  onColorSelected={(color) => setPipBackgroundColor(color)}
                />
          <Text style={styles.pipOptionText}>Size</Text>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={100}
            value={pipExtraSize}
            onValueChange={(value) => setPipExtraSize(value)}
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Opacity</Text>
          <Slider
            style={{width: 150, height: 40}}
            minimumValue={0}
            maximumValue={1}
            value={pipOpacity}
            onValueChange={(value) => setPipOpacity(value)}
          />
        </View>
      </View>
      )}
      </View>
      {/* HashTag Modal */}
      <HashtagModal
        selectedHashtags={selectedHashtags}
        setSelectedHashtags={setSelectedHashtags}
        selectedHashtagNames={selectedHashtagNames}
        setSelectedHashtagNames={setSelectedHashtagNames}
        hashtagModal={hashtagModal}
        setHashtagModal={setHashtagModal}
        addHashtag={addHashtag}
        />
      {/* Location Modal */}
      <LocationModal
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        locationModalVisiable={locationModalVisiable}
        setLocationModalVisiable={setLocationModalVisiable}
        locationPosition={locationPosition}
        setLocationPosition={setLocationPosition}
        multipleImages={multipleImages}
        draggLocation={draggLocation}
        setDraggLocation={setDraggLocation}
      />
      {/* Friends Modal */}
    <FriendsModal
  selectedFriends={selectedFriends}
  setSelectedFriends={setSelectedFriends}
  selectedFriendNames={selectedFriendNames}
  setSelectedFriendNames={setSelectedFriendNames}
  FriendsModalVisiable={FriendsModalVisiable}
  setFriendsModalVisiable={setFriendsModalVisiable}
  setLastScale={setLastScale}
  addFriend={addFriend}  // Add this line
/>
      {/* {Music Modal} */}
     <MusicModal
        selectedMusic={selectedMusic}
        setSelectedMusic={setSelectedMusic}
        MusicModalVisiable={MusicModalVisiable}
        setMusicModalVisiable={setMusicModalVisiable}
        musicPlaybackSpeed={musicPlaybackSpeed}
      />
      {/* Crop Modal */}
      <CropModal
        filteredImage={extractedUri.current}
        selectedVideo={selectedVideo}
        selectedImage={selectedImage}
        selectedCrops={selectedCrops}
        multipleImages={multipleImages}
        setMultipleImages={setMultipleImages}
        currentIndex={currentIndex}
        setSelectedCrops={setSelectedCrops}
        cropModal={cropModal}
        setCropModal={setCropModal}
        handleEditImage={handleEditImage}
        editedImage={editedImage}
        setEditedImage={setEditedImage}
        editedVideo={editedVideo}
        setEditedVideo={setEditedVideo}
        stickerVisible={stickerVisible}
        setStickerVisible={setStickerVisible}
        setIsVisible={setIsVisible}
        navigation={navigation}
        setPipMedia={setPipMedia}
        onFilterApplied={(filteredImageUri) => {
    setFilteredImage(filteredImageUri);
  }}
      />
      {/* Preview Modal */}
      <PreviewModal
        editedVideo={editedVideo ? editedVideo : ''}
        setEditedVideo={setEditedVideo}
        isPreview={isPreview}
        setSnapShotImg={setSnapShotImg}
        setIsPreview={setIsPreview}
        imageUrl={
          snapShotImg === ''
            ? editedImage
              ? editedImage
              : filteredImage
              ? extractedUri.current
              : multipleImages[currentIndex]
            : snapShotImg
        }
      />
      {/* Sticker Modal */}
      <StickersModal
        stickerVisible={stickerVisible}
        setStickerVisible={setStickerVisible}
        stickersPosition={stickersPosition}
        setStickersPosition={setStickersPosition}
        NewPosition={locationPosition}
      />
      {/* Recording Modal */}
      <RecordingModal
        recordingIsiable={recordingIsiable}
        setRecordingIsiable={setRecordingIsiable}
        selectedMusic={selectedMusic}
        setSelectedMusic={setSelectedMusic}
      />
    </View>
  );
};
export default EditingScreen;