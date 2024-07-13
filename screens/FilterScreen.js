import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { FILTERS } from './utils/Filters'; // Make sure this path is correct

const FilterScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    (async () => {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    })();
  }, []);

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        selectedFilter === item.id && styles.selectedFilterItem,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSelectedFilter = () => {
    if (!selectedFilter) return null;
    const filter = FILTERS.find(f => f.id === selectedFilter);
    if (!filter) return null;
    const FilterComponent = filter.filterComponent;
    return <FilterComponent style={StyleSheet.absoluteFill} />;
  };

  const takePicture = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });
      console.log(photo.path);
      // Handle the captured image here
    }
  };

  if (device == null) {
    return <Text>Camera not available</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      {renderSelectedFilter()}
      <View style={styles.filterList}>
        <FlatList
          data={FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <TouchableOpacity onPress={takePicture} style={styles.capture}>
        <Text style={{ fontSize: 14 }}> SNAP </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  filterList: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterItem: {
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  selectedFilterItem: {
    backgroundColor: '#ddd',
  },
  capture: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
  },
});

export default FilterScreen;