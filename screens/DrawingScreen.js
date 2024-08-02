import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, PanResponder, ScrollView, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Video from 'react-native-video';
import Svg, { Path, Circle } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import LayoutView from './Layouts/LayoutView'; // Assuming you have a LayoutView component

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DrawingScreen = ({ route, navigation }) => {
  const { image, mediaType, originalMedia, layoutData, selectedLayoutId } = route.params;
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [mode, setMode] = useState('draw');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [eraserPosition, setEraserPosition] = useState(null);
  const videoRef = useRef();
  const viewShotRef = useRef(null);


  const ERASER_SIZE = 20;

  const generateColors = () => {
    const colors = [];
    for (let h = 0; h < 360; h += 5) {
      for (let s = 100; s >= 50; s -= 50) {
        for (let l = 50; l >= 25; l -= 25) {
          colors.push(`hsl(${h}, ${s}%, ${l}%)`);
        }
      }
    }
    return colors;
  };

  const colors = useMemo(() => generateColors(), []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      if (mode === 'draw') {
        const newPath = { id: Date.now(), points: [`M${locationX},${locationY}`], color: currentColor };
        setCurrentPath(newPath);
        setPaths(prevPaths => [...prevPaths, newPath]);
      } else if (mode === 'erase') {
        setEraserPosition({ x: locationX, y: locationY });
        erasePaths(locationX, locationY);
      }
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      if (mode === 'draw' && currentPath) {
        setCurrentPath(prevPath => {
          const newPath = { 
            ...prevPath, 
            points: [...prevPath.points, `L${locationX},${locationY}`] 
          };
          setPaths(prevPaths => prevPaths.map(p => p.id === prevPath.id ? newPath : p));
          return newPath;
        });
      } else if (mode === 'erase') {
        setEraserPosition({ x: locationX, y: locationY });
        erasePaths(locationX, locationY);
      }
    },
    onPanResponderRelease: () => {
      setCurrentPath(null);
      setEraserPosition(null);
    },
  });

  const erasePaths = (x, y) => {
    setPaths(prevPaths => {
      return prevPaths.map(path => {
        const newPoints = splitPathAtIntersections(path.points, x, y);
        return newPoints.length > 0 ? { ...path, points: newPoints } : null;
      }).filter(Boolean);
    });
  };

  const splitPathAtIntersections = (points, x, y) => {
    let newPaths = [];
    let currentPath = [];
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const [cmd, coords] = [point[0], point.slice(1)];
      const [px, py] = coords.split(',').map(Number);
      
      if (Math.hypot(x - px, y - py) > ERASER_SIZE) {
        currentPath.push(point);
      } else {
        if (currentPath.length > 0) {
          newPaths.push(currentPath);
          currentPath = [];
        }
      }
    }
    
    if (currentPath.length > 0) {
      newPaths.push(currentPath);
    }
    
    return newPaths.filter(path => path.length > 1).flat();
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setEraserPosition(null);
  };

  const handleClear = () => {
    setPaths([]);
  };
  const captureVideoFrame = async () => {
    if (videoRef.current && viewShotRef.current) {
      try {
        const capturedFrame = await viewShotRef.current.capture();
        setCurrentFrame(capturedFrame);
      } catch (error) {
        console.error('Error capturing video frame:', error);
        Alert.alert('Error', 'Failed to capture video frame. Please try again.');
      }
    }
  };
  const handleDone = async () => {
    try {
      if (mediaType === 'video') {
        await captureVideoFrame();
      }

     const uri = await viewShotRef.current.capture({
  format: "png",
  quality: 1,
  result: "tmpfile",
  transparent: true
});
      console.log('Captured edited image URI:', uri);
      navigation.navigate('EditingScreen', { 
        editedImage: uri,
        media: { uri: uri, type: mediaType }
      });
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to save the edited image.');
      navigation.goBack();
    }
  };
  const renderMedia = () => {
    switch (mediaType) {
      case 'video':
        return (
          <Video
            ref={videoRef}
            source={{ uri: image }}
            style={styles.media}
            resizeMode="contain"
            repeat
            paused={false}
          />
        );
      case 'layout':
        return (
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
        );
      default:
        return (
          <Image source={{ uri: image }} style={styles.media} resizeMode="contain" />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topToolbar}>
        <TouchableOpacity onPress={() => toggleMode('draw')} style={[styles.toolbarButton, mode === 'draw' && styles.activeButton]}>
          <Icon name="brush" size={24} color={mode === 'draw' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleMode('erase')} style={[styles.toolbarButton, mode === 'erase' && styles.activeButton]}>
          <Icon2 name="eraser" size={24} color={mode === 'erase' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.toolbarButton}>
          <Icon name="trash" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDone} style={styles.toolbarButton}>
          <Icon name="checkmark" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ViewShot ref={viewShotRef} style={styles.mediaContainer} options={{ format: "png", quality: 1 }}>
        <View {...panResponder.panHandlers} style={StyleSheet.absoluteFill}>
          {renderMedia()}
          <Svg style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
            {paths.map(path => (
              <Path
                key={path.id}
                d={path.points.join(' ')}
                stroke={path.color}
                strokeWidth={2}
                fill="none"
              />
            ))}
            {eraserPosition && mode === 'erase' && (
              <Circle
                cx={eraserPosition.x}
                cy={eraserPosition.y}
                r={ERASER_SIZE}
                fill="rgba(200, 200, 200, 0.5)"
              />
            )}
          </Svg>
        </View>
      </ViewShot>
      <ScrollView horizontal style={styles.colorBar}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorButton, { backgroundColor: color }, color === currentColor && styles.selectedColor]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: hp('8%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mediaContainer: {
    width: screenWidth,
    height: screenHeight - hp('18%'), // Adjust this value to fit your layout
    backgroundColor: 'transparent',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  toolbarButton: {
    padding: 10,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#000',
  },
  colorBar: {
    height: hp('10%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default DrawingScreen;