// TopBar.js
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, TouchableWithoutFeedback ,Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome5';
import Icon4 from 'react-native-vector-icons/Entypo';

import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import RecordingMenu from './RecordingMenu';
import { FILTERS } from './utils/Filters';
import MusicMenu from './MusicMenu';
import ImagePicker from 'react-native-image-crop-picker';


const TopBar = ({ 
  onBackPress, 
  onSave, 
  onDraft, 
  currentImage, 
  onAddText, 
  onFriendsPress, 
  onHashtagPress, 
  onLocationPress, 
  onStickerPress, 
  onPIPPress,
  onSelectFilter,
  selectedFilter,
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
  isVideo,
  currentMedia,onMusicPress,
  onImageCropped,  // Add this line

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

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  const handleSave = () => {
    onSave();
    setIsDropdownVisible(false);
  };

  const handleDraft = () => {
    onDraft();
    setIsDropdownVisible(false);
  };

  const toggleScrollBar = () => {
    setIsScrollBarVisible(!isScrollBarVisible);
    setCurrentAdjustment(null);
    setIsFilterBarVisible(false);
  };
  const handleMusicPress = () => {
  setIsMusicMenuVisible(true);
};
const handleCloseMusicMenu = () => {
    setIsMusicMenuVisible(false);
  };
   const handleSelectMusic = (music) => {
    // Handle the selected music (e.g., set it as background music for the video)
    console.log('Selected music:', music);
  };


  const handleBrushPress = () => navigation.navigate('DrawingScreen', { image: currentMedia.uri });

 const handleIconPress = (icon) => {
  if (icon.name === 'scissors') {
    if (isVideo) {
      navigation.navigate('TrimScreen', { video: currentMedia });
    } else {
      Alert.alert('Trim not available', 'Trimming is only available for videos.');
    }
  } else if (icon.name === 'crop') {
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

  // Handle other icons as needed
  switch (icon.name) {
    case 'image-size-select-large':
      onPIPPress();
      break;
    case 'smile-o':
      onStickerPress();
      break;
    // Add more cases for other icons if needed
  }
};

  const toggleTextDropdown = (event) => {
    event.stopPropagation();
    setIsTextDropdownVisible(!isTextDropdownVisible);
  };

  const toggleRecordingMenu = () => setIsRecordingMenuVisible(!isRecordingMenuVisible);

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
    { name: 'scissors', text: 'Trim', iconSet: 'FontAwesome', onPress: () => handleIconPress({ name: 'scissors' }) },
    { name: 'smile-o', text: 'Stickers', iconSet: 'FontAwesome', onPress: onStickerPress },
  ];

  const TextDropdown = () => {
    const textOptions = [
      { icon: 'add', text: 'Add Text', iconSet: 'Ionicons', onPress: onAddText },
      { icon: 'underline', text: 'Underline', iconSet: 'FontAwesome' },
      { icon: 'bold', text: 'Bold', iconSet: 'FontAwesome' },
      { icon: 'arrow-up', text: 'Uppercase', iconSet: 'FontAwesome' },
      { icon: 'arrow-down', text: 'Lowercase', iconSet: 'FontAwesome' },
      { icon: 'color-palette', text: 'Color', iconSet: 'Ionicons' },
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

  const AdjustmentSlider = ({ label, value, onValueChange, min = 0, max = 2 }) => (
    <View style={styles.adjustmentSlider}>
      <Text style={styles.adjustText}>{label}</Text>
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
          <AdjustmentSlider
            label="Contrast"
            value={contrastValue}
            onValueChange={onContrastChange}
          />
        );
      case 'brightness':
        return (
          <AdjustmentSlider
            label="Brightness"
            value={brightnessValue}
            onValueChange={onBrightnessChange}
          />
        );
      case 'temperature':
        return (
          <AdjustmentSlider
            label="Temperature"
            value={temperatureValue}
            onValueChange={onTemperatureChange}
          />
        );
      case 'softness':
        return (
          <AdjustmentSlider
            label="Softness"
            value={softnessValue}
            onValueChange={onSoftnessChange}
            max={1}
          />
        );
      case 'sharpness':
        return (
          <AdjustmentSlider
            label="Sharpness"
            value={sharpnessValue}
            onValueChange={onSharpnessChange}
            max={10}
          />
        );
      default:
        return null;
    }
  };

  const FilterBar = () => (
    <ScrollView horizontal style={styles.scrollBar} showsHorizontalScrollIndicator={false}>
      {FILTERS.map((filter, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.scrollBarItem,
            selectedFilter === filter && styles.selectedFilterItem
          ]}
          onPress={() => onSelectFilter(filter)}
        >
          <Text style={styles.scrollBarText}>{filter.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <TouchableWithoutFeedback onPress={closeAllDropdowns}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMusicPress}>
          <Icon name="musical-notes-sharp" size={24} color="#000" />
        </TouchableOpacity>
          <TouchableOpacity onPress={toggleDropdown} ref={downloadIconRef}>
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

        <View style={styles.centerIconsContainer}>
          <View style={styles.leftIcons}>
            <TouchableOpacity style={styles.centerIcon} onPress={onFriendsPress}>
              <Icon4 name="user-friends" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.centerIcon} onPress={onLocationPress}>
              <Icon name="location" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.centerIcon} onPress={handleBrushPress}>
              <Icon name="brush" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.centerIcon} onPress={onHashtagPress}>
              <Icon1 name="hashtag" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.centerIcon} onPress={handleBrushPress}>
              <Icon name="brush" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.centerIcon} onPress={toggleRecordingMenu}>
              <Icon name="mic" size={18} color="#000" />
            </TouchableOpacity>
            <View>
              <TouchableOpacity style={styles.centerIcon} onPress={toggleTextDropdown}>
                <Icon name="text" size={18} color="#000" />
              </TouchableOpacity>
              {isTextDropdownVisible && <TextDropdown />}
            </View>
          </View>
        </View>

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
            <Icon name="arrow-redo" size={24} color="#000" />
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('100%'),
    paddingTop: hp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: 'white',
  },
  dropdown: {
    position: 'absolute',
    top: hp('6%'),
    right: wp('25%'),
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    marginLeft: wp('2%'),
    fontSize: 16,
  },
  centerIconsContainer: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
  },
  leftIcons: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  centerIcon: {
    marginVertical: hp('1%'),
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
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
    fontSize: 12,
    marginTop: 4,
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
    fontSize: 12,
    marginTop: 4,
  },
  textDropdown: {
    position: 'absolute',
    top: '110%',
    right: -wp('20%'),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 10,
    width: wp('50%'),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
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
  adjustBar: {
    position: 'absolute',
    bottom: hp('15%'),
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: hp('2%'),
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
    fontSize: 16,
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  slider: {
    width: wp('90%'),
    height: 40,
    alignSelf: 'center',
  },
  selectedFilterItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
  },
});

export default TopBar;