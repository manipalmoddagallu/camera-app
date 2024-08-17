import React, { useState, useRef, useMemo } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, PanResponder, ScrollView, Dimensions, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Video from 'react-native-video';
import Svg, { Path, Circle } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import LayoutView from './Layouts/LayoutView';

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

const eraseAtPoint = (x, y) => {
  setPaths(prevPaths => {
    return prevPaths.map(path => {
      const newPoints = [];
      let isDrawing = false;

      for (let i = 0; i < path.points.length; i++) {
        const point = path.points[i];
        const [cmd, coordsString] = point.split(/([ML])/).filter(Boolean);
        const [px, py] = coordsString.split(',').map(Number);

        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

        if (distance > ERASER_SIZE / 2) {
          if (!isDrawing) {
            newPoints.push(`M${px},${py}`);
            isDrawing = true;
          } else if (cmd === 'L') {
            newPoints.push(`L${px},${py}`);
          }
        } else {
          isDrawing = false;
        }
      }

      return { ...path, points: newPoints };
    }).filter(path => path.points.length > 1);
  });
};


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
        eraseAtPoint(locationX, locationY);
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
        eraseAtPoint(locationX, locationY);
      }
    },
    onPanResponderRelease: () => {
      setCurrentPath(null);
      setEraserPosition(null);
    },
  });

  const toggleMode = (newMode) => {
    setMode(newMode);
    setEraserPosition(null);
  };

  const handleClear = () => {
    setPaths([]);
  };

  const handleDone = async () => {
    try {
      if (mediaType === 'video') {
        const overlayUri = await viewShotRef.current.capture({
          format: "png",
          quality: 1,
          result: "tmpfile",
          transparent: true,
        });
        
        navigation.navigate('EditingScreen', { 
          media: { 
            uri: image, // Original video URI
            type: 'video',
            overlay: overlayUri // URI of the captured drawing overlay
          },
          originalMedia: originalMedia
        });
      } else {
        // Existing code for images and layouts
        const uri = await viewShotRef.current.capture({
          format: "png",
          quality: 1,
          result: "tmpfile",
          transparent: true,
          width: screenWidth,
          height: screenHeight - hp('18%')
        });
        
        navigation.navigate('EditingScreen', { 
          editedImage: uri,
          media: { uri: uri, type: mediaType },
          originalMedia: originalMedia
        });
      }
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
          <Icon name="brush" size={24} color={mode === 'draw' ? '#fff' : '#020E27'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleMode('erase')} style={[styles.toolbarButton, mode === 'erase' && styles.activeButton]}>
          <Icon2 name="eraser" size={24} color={mode === 'erase' ? '#fff' : '#020E27'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.toolbarButton}>
          <Icon name="trash" size={24} color="#020E27" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDone} style={styles.toolbarButton}>
          <Icon name="checkmark" size={24} color="#020E27" />
        </TouchableOpacity>
      </View>
      <ViewShot ref={viewShotRef} style={styles.mediaContainer} options={{ format: "png", quality: 1 }}>
        <View {...panResponder.panHandlers} style={[StyleSheet.absoluteFill, styles.transparentBackground]}>
          {renderMedia()}
          <Svg style={[StyleSheet.absoluteFill, styles.transparentBackground]}>
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
    backgroundColor: '#020E27',
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
    borderColor: '#020E27',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
});

export default DrawingScreen;