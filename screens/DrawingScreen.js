import React, { useState, useRef, useMemo, useCallback } from 'react';
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
  const [currentColor, setCurrentColor] = useState('#020E27');
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

const eraseAtPoint = useCallback((x1, y1, x2, y2) => {
  setPaths(prevPaths => {
    try {
      return prevPaths.flatMap(path => {
        let newPaths = [];
        let currentPath = [];
        let isDrawing = false;

        for (let i = 0; i < path.points.length; i++) {
          const point = path.points[i];
          const [cmd, coordsString] = point.split(/([ML])/).filter(Boolean);
          const [px, py] = coordsString.split(',').map(Number);

          // Check if the point is close to the line segment between (x1, y1) and (x2, y2)
          const distance = distanceToLineSegment(px, py, x1, y1, x2, y2);

          if (distance > ERASER_SIZE / 2) {
            if (!isDrawing) {
              currentPath = [`M${px},${py}`];
              isDrawing = true;
            } else {
              currentPath.push(`L${px},${py}`);
            }
          } else {
            if (isDrawing) {
              if (currentPath.length > 1) {
                newPaths.push({ ...path, points: currentPath });
              }
              currentPath = [];
              isDrawing = false;
            }
          }
        }

        if (currentPath.length > 1) {
          newPaths.push({ ...path, points: currentPath });
        }

        return newPaths;
      });
    } catch (error) {
      console.error('Error in eraseAtPoint:', error);
      return prevPaths;
    }
  });
}, [ERASER_SIZE]);

// Helper function to calculate distance from a point to a line segment
const distanceToLineSegment = (x, y, x1, y1, x2, y2) => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

  const debouncedEraseAtPoint = useCallback(
    debounce((x, y) => eraseAtPoint(x, y), 16),
    [eraseAtPoint]
  );

const panResponder = useMemo(() => PanResponder.create({
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
      eraseAtPoint(locationX, locationY, locationX, locationY);
    }
  },
  onPanResponderMove: (event, gestureState) => {
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
      eraseAtPoint(eraserPosition.x, eraserPosition.y, locationX, locationY);
      setEraserPosition({ x: locationX, y: locationY });
    }
  },
  onPanResponderRelease: () => {
    setCurrentPath(null);
    setEraserPosition(null);
  },
}), [mode, currentPath, currentColor, eraseAtPoint, eraserPosition]);

  const toggleMode = useCallback((newMode) => {
    setMode(newMode);
    setEraserPosition(null);
  }, []);

  const handleClear = useCallback(() => {
    setPaths([]);
  }, []);

  const handleDone = useCallback(async () => {
    try {
      if (mediaType === 'video') {
        const svgString = await viewShotRef.current.capture({
          format: "svg",
          quality: 1,
          result: "base64",
        });
        
        navigation.navigate('EditingScreen', { 
          media: { 
            uri: image,
            type: 'video',
            overlay: `data:image/svg+xml;base64,${svgString}`
          },
          originalMedia: originalMedia
        });
      } else {
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
  }, [image, mediaType, originalMedia, navigation]);

  const renderMedia = useCallback(() => {
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
            onError={(error) => console.error('Video error:', error)}
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
  }, [image, mediaType, layoutData, selectedLayoutId]);

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
            {paths.map((path, index) => (
              <Path
                key={`${path.id}-${index}`}
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
                r={ERASER_SIZE / 2}
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
    height: screenHeight - hp('18%'),
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

// Simple debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default DrawingScreen;