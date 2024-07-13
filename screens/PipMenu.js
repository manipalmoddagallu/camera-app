// PipMenu.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ColorPicker } from 'react-native-color-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PipMenu = ({
  pipSize,
  setPipSize,
  pipBackgroundColor,
  setPipBackgroundColor,
  pipOpacity,
  setPipOpacity,
  pipRotation,
  setPipRotation,
  onClose,
}) => {
  const rotateAndResize = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Update size
      setPipSize((prevSize) => Math.max(50, prevSize + distance / 2));

      // Update rotation
      setPipRotation((prevRotation) => prevRotation + angle / 2);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text>Container Size and Color</Text>
        <ColorPicker
          onColorSelected={setPipBackgroundColor}
          style={styles.colorPicker}
        />
      </View>
      <View style={styles.section}>
        <Text>Image Opacity</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={pipOpacity}
          onValueChange={setPipOpacity}
        />
      </View>
      <TouchableOpacity
        style={styles.resizeRotateButton}
        {...rotateAndResize.panHandlers}
      >
        <Icon name="open-with" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
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
  resizeRotateButton: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default PipMenu;