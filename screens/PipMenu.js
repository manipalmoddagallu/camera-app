import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  ScrollView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
  '#FF1493', '#00FFFF', '#FF69B4', '#1E90FF', '#008000', '#FFA500', '#8B4513',
  '#800080', '#808080', '#000000', '#FFFFFF'
];

const PipMenu = ({
  pipBackgroundColor,
  setPipBackgroundColor,
  pipOpacity,
  setPipOpacity,
  pipRotation,
  setPipRotation,
  pipSize,
  setPipSize,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState('size');

  const rotateHandler = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setPipRotation((prevRotation) => prevRotation + angle / 2);
    },
  });

  const handleSizeChange = (value) => {
    setPipSize({ width: value, height: value });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'size':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Size</Text>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={300}
              value={pipSize.width}
              onValueChange={handleSizeChange}
            />
          </View>
        );
      case 'opacity':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Opacity</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={pipOpacity}
              onValueChange={setPipOpacity}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'size' && styles.activeTab]}
          onPress={() => setActiveSection('size')}
        >
          <Text style={styles.tabText}>Size</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'opacity' && styles.activeTab]}
          onPress={() => setActiveSection('opacity')}
        >
          <Text style={styles.tabText}>Opacity</Text>
        </TouchableOpacity>
      </View>
      
      {renderSection()}
      
      <Text style={styles.sectionTitle}>Color</Text>
      <ScrollView horizontal style={styles.colorPickerContainer}>
        {COLORS.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              color === pipBackgroundColor && styles.selectedColor
            ]}
            onPress={() => setPipBackgroundColor(color)}
          />
        ))}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.rotateButton}
          {...rotateHandler.panHandlers}
        >
          <Icon name="rotate-right" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: '100%',
    maxHeight: 300,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginRight: 5,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionContent: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  colorPickerContainer: {
    height: 40,
    marginBottom: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PipMenu;