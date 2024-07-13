import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, SafeAreaView, TouchableOpacity, Text, PanResponder, Dimensions, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import ImageCropPicker from 'react-native-image-crop-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CropScreen = ({ route, navigation }) => {
  const { image } = route.params;
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState({ width: wp('100%'), height: hp('70%') });
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotationMode, setIsRotationMode] = useState(false);
  const [isCropMode, setIsCropMode] = useState(true);
  const [croppedImage, setCroppedImage] = useState(image);
  const imageRef = useRef(null);

  const aspectRatios = [
    { label: 'Original', value: null },
    { label: 'Square', value: 1 },
    { label: '3:4', value: 3/4 },
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 },
    { label: '9:16', value: 9/16 },
  ];

  const [selectedRatio, setSelectedRatio] = useState(null);

  const applyCrop = async (imageUri) => {
    try {
      const croppedImage = await ImageCropPicker.openCropper({
        path: imageUri,
        width: gridSize.width,
        height: gridSize.height,
        cropperCircleOverlay: false,
        freeStyleCropEnabled: true,
        showCropFrame: false,
        showCropGuidelines: false,
        hideBottomControls: true,
        cropperActiveWidgetColor: '#000',
        cropperStatusBarColor: '#000',
        cropperToolbarColor: '#000',
        cropperToolbarTitle: '',
      });
      setCroppedImage(croppedImage.path);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      setGridPosition(prev => {
        const newPosition = {
          x: Math.max(0, Math.min(prev.x + dx, SCREEN_WIDTH - gridSize.width)),
          y: Math.max(0, Math.min(prev.y + dy, SCREEN_HEIGHT - gridSize.height)),
        };
        return newPosition;
      });
    },
  });

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDone = () => {
    applyCrop(croppedImage).then(() => {
      navigation.navigate('EditingScreen', { editedImage: croppedImage });
    });
  };

  const handleRatioChange = (ratio) => {
    setSelectedRatio(ratio);
    if (ratio) {
      const newHeight = gridSize.width / ratio;
      setGridSize({ ...gridSize, height: newHeight });
    }
  };

  const handleRotationChange = async (value) => {
    setRotationAngle(value);
    try {
      const rotatedImage = await ImageCropPicker.openCropper({
        path: croppedImage,
        rotate: value,
      });
      setCroppedImage(rotatedImage.path);
    } catch (error) {
      console.error('Error rotating image:', error);
    }
  };

  const toggleRotationMode = () => {
    setIsRotationMode(true);
    setIsCropMode(false);
  };

  const toggleCropMode = () => {
    setIsCropMode(true);
    setIsRotationMode(false);
  };

  const renderGridLines = () => {
    const lines = [];
    for (let i = 1; i < 3; i++) {
      lines.push(
        <View key={`v${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${33.33 * i}%` }]} />
      );
      lines.push(
        <View key={`h${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${33.33 * i}%` }]} />
      );
    }
    return lines;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Icon name="close-outline" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDone} style={styles.headerButton}>
          <Icon name="checkmark-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        <Image
          ref={imageRef}
          source={{ uri: croppedImage }}
          style={[
            styles.image,
            { transform: [{ rotate: `${rotationAngle}deg` }] }
          ]}
          resizeMode="contain"
        />
        <View
          {...panResponder.panHandlers}
          style={[
            styles.cropGrid,
            {
              left: gridPosition.x,
              top: gridPosition.y,
              width: gridSize.width,
              height: gridSize.height,
            }
          ]}
        >
          {renderGridLines()}
        </View>
      </View>
      {isCropMode ? (
        <View style={styles.ratioContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {aspectRatios.map((ratio) => (
              <TouchableOpacity
                key={ratio.label}
                style={[styles.ratioButton, selectedRatio === ratio.value && styles.selectedRatio]}
                onPress={() => handleRatioChange(ratio.value)}
              >
                <Text style={[styles.ratioText, selectedRatio === ratio.value && styles.selectedRatioText]}>
                  {ratio.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : isRotationMode ? (
        <View style={styles.rotationContainer}>
          <Slider
            style={{width: '80%', height: 40}}
            minimumValue={-180}
            maximumValue={180}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={handleRotationChange}
            value={rotationAngle}
            step={1}
          />
          <Text style={styles.rotationText}>{Math.round(rotationAngle)}°</Text>
        </View>
      ) : null}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton} onPress={toggleCropMode}>
          <Icon name="crop" size={24} color="#FFF" />
          <Text style={styles.bottomBarText}>Crop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={toggleRotationMode}>
          <Icon1 name="rotate-right" size={24} color="#FFF" />
          <Text style={styles.bottomBarText}>Rotate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="resize" size={24} color="#FFF" />
          <Text style={styles.bottomBarText}>Resize</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: wp('100%'),
    height: hp('70%'),
  },
  cropGrid: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  },
  ratioContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratioButton: {
    padding: 8,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  selectedRatio: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  ratioText: {
    color: '#FFF',
  },
  selectedRatioText: {
    color: '#000',
  },
  rotationContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotationText: {
    color: '#FFF',
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#000',
  },
  bottomBarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarText: {
    color: '#FFF',
    marginTop: 4,
  },
});

export default CropScreen;