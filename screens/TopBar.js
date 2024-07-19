// TopBar.js
import React, { useState, useRef , useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, TouchableWithoutFeedback ,Alert ,Modal} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/Octicons';
import Icon4 from 'react-native-vector-icons/Entypo';

import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import RecordingMenu from './RecordingMenu';
import { FILTERS } from './utils/Filters';
import MusicMenu from './MusicMenu';
import ImagePicker from 'react-native-image-crop-picker';
import Menu, { MenuItem } from 'react-native-material-menu';
import ColorPicker from 'react-native-wheel-color-picker';


const TopBar = ({ 
  onBackPress, 
  onSave, 
  onDraft, 
  onAddText, 

  onStickerPress, 
  onPIPPress,
  onSelectFilter,
  selectedFilter,
  isVideo,
  currentMedia,
  onImageCropped,
  contrastValue,
  onContrastChange,
  brightnessValue,
  onBrightnessChange,
  temperatureValue,
  onTemperatureChange,
  softnessValue,
  onSoftnessChange,
  sharpnessValue,
  onSharpnessChange,
    onTextStyle,

 // Add this line
}) => {
  const navigation = useNavigation();
  const [isMuted, setIsMuted] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isScrollBarVisible, setIsScrollBarVisible] = useState(false);
  const [isTextDropdownVisible, setIsTextDropdownVisible] = useState(false);
  const [isRecordingMenuVisible, setIsRecordingMenuVisible] = useState(false);
  const [currentAdjustment, setCurrentAdjustment] = useState(null);
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(false);
  const downloadIconRef = useRef(null);
  const [isMusicMenuVisible, setIsMusicMenuVisible] = useState(false);
  const handleBrushPress = () => navigation.navigate('DrawingScreen', { image: currentMedia.uri });
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);
  const [isStickerBarVisible, setIsStickerBarVisible] = useState(false);
  const [stickers, setStickers] = useState([]);
  const toggleRecordingMenu = () => setIsRecordingMenuVisible(!isRecordingMenuVisible);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSpeedMenuVisible, setIsSpeedMenuVisible] = useState(false);
  const speedMenuRef = useRef(null);
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
const [currentColor, setCurrentColor] = useState('#ffffff');


  const toggleScrollBar = () => {
    setIsScrollBarVisible(!isScrollBarVisible);
    setCurrentAdjustment(null);
    setIsFilterBarVisible(false);
  };

  const handleCloseMusicMenu = () => {
    setIsMusicMenuVisible(false);
  };
  const handleSelectMusic = (music) => {
    // Handle the selected music (e.g., set it as background music for the video)
    console.log('Selected music:', music);
  };
 const handleIconPress = (icon) => {
  if (icon.name === 'scissors') {
    if (isVideo) {
      navigation.navigate('TrimScreen', { video: currentMedia });
    } else {
      Alert.alert('Trim not available', 'Trimming is only available for videos.');
    }
  } else if (icon.name === 'crop') {
    if (isVideo) {
      navigation.navigate('VideoCropScreen', { video: currentMedia });
    } else {
      ImagePicker.openCropper({
  path: currentMedia.uri,
  width: 300,
  height: 400,
  cropperToolbarTitle: 'Crop Image',
  cropperActiveWidgetColor: '#3498db',
  cropperStatusBarColor: '#3498db',
  cropperToolbarColor: '#3498db',
  cropperToolbarWidgetColor: '#ffffff',
  showCropGuidelines: true,
  showCropFrame: true,
  enableRotationGesture: true,
  enableZoom: true,
  freeStyleCropEnabled: true,
}).then(image => {
  console.log('Cropped image:', image);
  if (onImageCropped) {
    onImageCropped({ uri: image.path });
  } else {
    console.warn('onImageCropped is not defined');
  }
}).catch(error => {
  console.log('Cropping error:', error);
  Alert.alert('Error', 'Failed to crop image. Please try again.');
});
    }
  } else if (icon.adjustment) {
    setCurrentAdjustment(icon.adjustment);
    setIsScrollBarVisible(false);
    setIsFilterBarVisible(false);
  } else if (icon.onPress) {
    icon.onPress();
  } else if (icon.name === 'color-filter') {
    setIsScrollBarVisible(false);
    setIsFilterBarVisible(!isFilterBarVisible);
  }
  if (icon.name === 'smile-o') {
    setIsScrollBarVisible(false);
    setIsFilterBarVisible(false);
    setIsStickerBarVisible(!isStickerBarVisible);
  } else {
    setIsStickerBarVisible(false);
  }

  // Handle other icons as needed
  switch (icon.name) {
    case 'image-size-select-large':
      onPIPPress();
      break;
    case 'smile-o':
      onStickerPress();
      break;
    case 'brush':
      navigation.navigate('DrawingScreen', { image: currentMedia.uri });
      break;
    case 'music':
      setIsMusicMenuVisible(true);
      break;
    // Add more cases for other icons if needed
  }

  };
  const toggleTextDropdown = (event) => {
    event.stopPropagation();
    setIsTextDropdownVisible(!isTextDropdownVisible);
  };
  const closeAllDropdowns = () => {
    setIsDropdownVisible(false);
    setIsTextDropdownVisible(false);
    setIsRecordingMenuVisible(false);
    setCurrentAdjustment(null);
    setIsFilterBarVisible(false);
  };
  
  const scrollBarIcons = [
    { name: 'crop', text: 'Crop', iconSet: 'Ionicons' },
    { name: 'adjust', text: 'Contrast', iconSet: 'FontAwesome', adjustment: 'contrast' },
    { name: 'sun-o', text: 'Brightness', iconSet: 'FontAwesome', adjustment: 'brightness' },
    { name: 'thermometer-outline', text: 'Temperature', iconSet: 'Ionicons', adjustment: 'temperature' },
    { name: 'blur', text: 'Softness', iconSet: 'MaterialCommunityIcons', adjustment: 'softness' },
    { name: 'image-filter-center-focus', text: 'Sharpness', iconSet: 'MaterialCommunityIcons', adjustment: 'sharpness' },
    { name: 'color-filter', text: 'Filters', iconSet: 'Ionicons' },
    { name: 'image-size-select-large', text: 'PIP', iconSet: 'MaterialCommunityIcons', onPress: onPIPPress },
    ...(isVideo ? [{ name: 'scissors', text: 'Trim', iconSet: 'FontAwesome', onPress: () => handleIconPress({ name: 'scissors' }) }] : []),
    { name: 'smile-o', text: 'Stickers', iconSet: 'FontAwesome'},
  ];  

   const AdjustmentSlider = ({ label, value, onValueChange, min = 0, max = 2 }) => (
    <View style={styles.adjustmentSlider}>
      <Text style={styles.adjustText}>{label}: {value.toFixed(2)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="#000000"
        maximumTrackTintColor="#000000"
      />
    </View>
  );

   const renderAdjustmentBar = () => {
    switch (currentAdjustment) {
      case 'contrast':
        return (
          <View style={styles.adjustmentSlider}>
            <Text style={styles.adjustText}>Contrast: {contrastValue.toFixed(2)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={1.3}
              value={contrastValue}
              onValueChange={onContrastChange}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
            />
          </View>
        );
      case 'brightness':
        return (
          <View style={styles.adjustmentSlider}>
            <Text style={styles.adjustText}>Brightness: {brightnessValue.toFixed(2)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={-1}
              maximumValue={1}
              value={brightnessValue}
              onValueChange={onBrightnessChange}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
            />
          </View>
        );
      case 'temperature':
        return (
          <View style={styles.adjustmentSlider}>
            <Text style={styles.adjustText}>Temperature: {temperatureValue.toFixed(2)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={-0.5}
              maximumValue={0.5}
              value={temperatureValue}
              onValueChange={onTemperatureChange}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
            />
          </View>
        );
      case 'softness':
        return (
          <View style={styles.adjustmentSlider}>
            <Text style={styles.adjustText}>Softness: {softnessValue.toFixed(2)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={20}
              value={softnessValue}
              onValueChange={onSoftnessChange}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
            />
          </View>
        );
      case 'sharpness':
        return (
          <View style={styles.adjustmentSlider}>
            <Text style={styles.adjustText}>Sharpness: {sharpnessValue.toFixed(2)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={-10}
              maximumValue={10}
              value={sharpnessValue}
              onValueChange={onSharpnessChange}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
            />
          </View>
        );
      default:
        return null;
    }
  };
const FilterBar = () => (
  <ScrollView 
    horizontal 
    style={styles.filterBar} 
    contentContainerStyle={styles.filterBarContent}
    showsHorizontalScrollIndicator={false}
  >
    {FILTERS.map((filter, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.filterBarItem,
          selectedFilter === filter && styles.selectedFilterItem
        ]}
        onPress={() => onSelectFilter(filter)}
      >
        <Text style={styles.filterBarText}>{filter.title}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);
  return (
    <TouchableWithoutFeedback onPress={closeAllDropdowns}>
      <View style={styles.container}>
    

        {isScrollBarVisible && !currentAdjustment && !isFilterBarVisible && (
          <ScrollView horizontal style={styles.scrollBar} showsHorizontalScrollIndicator={false}>
            {scrollBarIcons.map((icon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.scrollBarItem}
                onPress={() => handleIconPress(icon)}
              >
                {icon.iconSet === 'Ionicons' ? (
                  <Icon name={icon.name} size={24} color="#000" />
                ) : icon.iconSet === 'FontAwesome' ? (
                  <Icon1 name={icon.name} size={24} color="#000" />
                ) : (
                  <Icon2 name={icon.name} size={24} color="#000" />
                )}
                <Text style={styles.scrollBarText}>{icon.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
       {isColorPickerVisible && (
        <Modal visible={isColorPickerVisible} transparent={true}>
          <TouchableWithoutFeedback onPress={() => setIsColorPickerVisible(false)}>
            <View style={styles.colorPickerContainer}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View>
                  <ColorPicker
                    onColorSelected={(color) => {
                      onTextStyle('color', color);
                      setIsColorPickerVisible(false);
                    }}
                    style={{width: 300, height: 300}}
                  />
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setIsColorPickerVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
        {currentAdjustment && (
  <View style={styles.adjustBar}>
    {renderAdjustmentBar()}
  </View>
)}

        {isFilterBarVisible && <FilterBar />}

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={toggleScrollBar}>
            <Icon1 name="edit" size={24} color="#000" />
            <Text style={styles.bottomBarText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem}
          onPress={() => navigation.navigate('UploadScreen')}>
            <Icon3 name="paper-airplane" size={24} color="#000" />
            <Text style={styles.bottomBarText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        {isRecordingMenuVisible && (
          <RecordingMenu onClose={toggleRecordingMenu} />
        )}
        <MusicMenu
          isVisible={isMusicMenuVisible}
          onClose={handleCloseMusicMenu}
          onSelectMusic={handleSelectMusic}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: hp('83%'),
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    marginLeft: wp('2%'),
    fontSize: wp('4%'),
  },
  scrollBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollBar: {
    position: 'absolute',
    bottom: hp('10%'),
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  scrollBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('20%'),
    marginHorizontal: wp('2%'),
  },
  scrollBarText: {
    fontSize: wp('3%'),
    marginTop: hp('0.5%'),
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bottomBarItem: {
    alignItems: 'center',
  },
  bottomBarText: {
    fontSize: wp('3%'),
    marginTop: hp('0.5%'),
  },
  adjustBar: {
    position: 'absolute',
    bottom: hp('10%'),
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  adjustmentSlider: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: hp('2%'),
  },
  adjustText: {
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  slider: {
    width: wp('90%'),
    height: hp('5%'),
    alignSelf: 'center',
  },
  selectedFilterItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: wp('1%'),
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#fff'
  },
  speedText: {
    marginLeft: wp('-0.5%'),
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
  },
  colorPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: wp('5%'),
  },
  colorPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp('2.5%'),
  },
  colorPickerButton: {
    padding: wp('2.5%'),
    backgroundColor: '#fff',
    borderRadius: wp('1%'),
  },
  colorPickerButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: wp('3.5%'),
  },
  filterBar: {
    position: 'absolute',
    bottom: hp('10%'),
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('20%'),
    marginHorizontal: wp('2%'),
    paddingVertical: hp('1%'),
  },
  filterBarText: {
    fontSize: wp('3%'),
    marginTop: hp('0.5%'),
    textAlign: 'center',
    color: '#000'
  },
  selectedFilterItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: wp('1%'),
  },

});

export default TopBar;