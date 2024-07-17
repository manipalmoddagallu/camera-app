import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
} from 'react-native';
import Slider from '@react-native-community/slider';
import ColorPicker from 'react-native-wheel-color-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PipMenu = ({
  pipBackgroundColor,
  setPipBackgroundColor,
  pipOpacity,
  setPipOpacity,
  pipRotation,
  setPipRotation,
  pipBackgroundSize,
  setPipBackgroundSize,
  onClose,
}) => {
  const rotateHandler = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setPipRotation((prevRotation) => prevRotation + angle / 2);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background</Text>
        <ColorPicker
          color={pipBackgroundColor}
          onColorChange={setPipBackgroundColor}
          thumbSize={40}
          sliderSize={40}
          noSnap={true}
          row={false}
          swatches={false}
        />
        <Text style={styles.sliderLabel}>Background Size</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={200}
          value={pipBackgroundSize}
          onValueChange={setPipBackgroundSize}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Image Opacity</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={pipOpacity}
          onValueChange={setPipOpacity}
        />
      </View>
      <TouchableOpacity
        style={styles.rotateButton}
        {...rotateHandler.panHandlers}
      >
        <Icon name="rotate-right" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rotateButton: {
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
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PipMenu;