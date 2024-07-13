// DrawingScreen.js
import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

const DrawingScreen = ({ route, navigation }) => {
  const { image } = route.params;
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [mode, setMode] = useState('draw');
  const viewShotRef = useRef();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      if (mode === 'draw') {
        const newPath = {
          id: Date.now().toString(),
          d: `M ${locationX} ${locationY}`,
          color: 'black',
        };
        setCurrentPath(newPath);
        setPaths(prevPaths => [...prevPaths, newPath]);
      } else if (mode === 'erase') {
        erasePath(locationX, locationY);
      }
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      if (mode === 'draw' && currentPath) {
        setCurrentPath(prevPath => {
          const newPath = {
            ...prevPath,
            d: `${prevPath.d} L ${locationX} ${locationY}`,
          };
          setPaths(prevPaths =>
            prevPaths.map(p => p.id === prevPath.id ? newPath : p)
          );
          return newPath;
        });
      } else if (mode === 'erase') {
        erasePath(locationX, locationY);
      }
    },
    onPanResponderRelease: () => {
      setCurrentPath(null);
    },
  });

  const erasePath = (x, y) => {
    setPaths(prevPaths => {
      const erasedPathIndex = prevPaths.findIndex(path => {
        const points = path.d.split(' ');
        for (let i = 1; i < points.length; i += 2) {
          const px = parseFloat(points[i]);
          const py = parseFloat(points[i + 1]);
          if (Math.abs(px - x) < 20 && Math.abs(py - y) < 20) {
            return true;
          }
        }
        return false;
      });

      if (erasedPathIndex !== -1) {
        return prevPaths.filter((_, index) => index !== erasedPathIndex);
      }
      return prevPaths;
    });
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
  };

  const handleClear = () => {
    setPaths([]);
  };

  const handleDone = async () => {
  try {
    const uri = await viewShotRef.current.capture({
      format: "png",
      quality: 1,
      result: "tmpfile",
      transparent: true
    });
    navigation.navigate('EditingScreen', { editedImage: uri });
  } catch (error) {
    console.error('Error capturing image:', error);
  }
};
  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.imageContainer} options={{ format: "png", quality: 1 }}>
        <View {...panResponder.panHandlers} style={StyleSheet.absoluteFill}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
          <Svg style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
            {paths.map((path) => (
              <Path
                key={path.id}
                d={path.d}
                stroke={path.color}
                strokeWidth={5}
                fill="none"
              />
            ))}
          </Svg>
        </View>
      </ViewShot>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => toggleMode('draw')} style={[styles.toolbarButton, mode === 'draw' && styles.activeButton]}>
          <Icon name="brush" size={24} color={mode === 'draw' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleMode('erase')} style={[styles.toolbarButton, mode === 'erase' && styles.activeButton]}>
          <Icon name="eraser" size={24} color={mode === 'erase' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.toolbarButton}>
          <Icon name="trash" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDone} style={styles.toolbarButton}>
          <Icon name="checkmark" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  imageContainer: {
    width: wp('100%'),
    height: hp('90%'),
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: hp('10%'),
    backgroundColor: '#fff',
  },
  toolbarButton: {
    padding: 10,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#000',
  },
});

export default DrawingScreen;