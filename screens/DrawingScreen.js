import React, { useState, useRef, useMemo, useCallback , useEffect} from 'react';
import { View, Image, StyleSheet, TouchableOpacity, PanResponder, ScrollView, Dimensions, Alert, Text } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Video from 'react-native-video';
import Svg, { Path, Circle } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DrawingScreen = ({ route, navigation }) => {
  const { image, video, mediaType, originalMedia, overlayData, adjustments, filterIndex, playbackSpeed, isMuted } = route.params;
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [mode, setMode] = useState('draw');
  const [currentColor, setCurrentColor] = useState('#020E27');
  const [eraserPosition, setEraserPosition] = useState(null);
  const [penSize, setPenSize] = useState(2);
    const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 });
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
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      if (mode === 'draw') {
        const newPath = { id: Date.now(), points: [`M${locationX},${locationY}`], color: currentColor, strokeWidth: penSize };
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
  }), [mode, currentPath, currentColor, eraseAtPoint, eraserPosition, penSize]);

  const toggleMode = useCallback((newMode) => {
    setMode(newMode);
    setEraserPosition(null);
  }, []);
  const handleClear = useCallback(() => {
    setPaths([]);
  }, []);

  const handleDone = useCallback(async () => {
    try {
      const uri = await viewShotRef.current.capture({
        format: "png",
        quality: 1,
        result: "tmpfile",
        transparent: true,
      });

      navigation.navigate('EditingScreen', { 
        editedImage: uri,
        media: { uri: uri, type: mediaType },
        originalMedia: originalMedia,
        overlayData: overlayData,
        adjustments: adjustments,
        filterIndex: filterIndex,
        playbackSpeed: playbackSpeed,
        isMuted: isMuted
      });
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to save the edited image.');
      navigation.goBack();
    }
  }, [image, video, mediaType, originalMedia, overlayData, adjustments, filterIndex, playbackSpeed, isMuted, navigation]);

  const onMediaLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setMediaSize({ width, height });
  };
 const calculateOverlayPosition = (position, scale) => {
    const { width, height } = mediaSize;
    // Convert the position from percentage to actual pixels
    const left = (position.x / 100) * width;
    const top = (position.y / 100) * height;
    return {
      left,
      top,
      transform: [{ scale }]
    };
  };

  const renderOverlays = () => {
    return (
      <>
        {overlayData.friends.map((friend) => (
          <View
            key={friend.id}
            style={[
              styles.overlay,
              calculateOverlayPosition(friend.position, friend.scale)
            ]}
          >
            <Text style={[styles.overlayText, { color: friend.color, fontWeight: 'bold' }]}>
              @{friend.name}
            </Text>
          </View>
        ))}
        {overlayData.hashtags.map((hashtag) => (
          <View
            key={hashtag.id}
            style={[
              styles.overlay,
              calculateOverlayPosition(hashtag.position, hashtag.scale)
            ]}
          >
            <Text style={[styles.overlayText, { color: hashtag.color, fontWeight: 'bold' }]}>
              #{hashtag.title}
            </Text>
          </View>
        ))}
        {overlayData.location && (
          <View
            style={[
              styles.overlay,
              styles.locationOverlay,
              calculateOverlayPosition(overlayData.location.position, overlayData.location.scale)
            ]}
          >
            <View style={styles.locationContent}>
              <Icon name="location" size={16} color={overlayData.location.color || '#020E27'} />
              <Text style={[styles.overlayText, { color: overlayData.location.color || '#020E27', fontWeight: 'bold' }]}>
                {overlayData.location.placeName}
              </Text>
            </View>
          </View>
        )}
        {overlayData.textElements.map((text) => (
          <View
            key={text.id}
            style={[
              styles.overlay,
              calculateOverlayPosition(text.position, text.scale)
            ]}
          >
            <Text style={[styles.overlayText, text.style, { fontWeight: 'bold' }]}>
              {text.content}
            </Text>
          </View>
        ))}
        {overlayData.stickers.map((sticker) => (
          <View
            key={sticker.id}
            style={[
              styles.stickerContainer,
              calculateOverlayPosition(sticker.position, sticker.scale)
            ]}
          >
            <Image
              source={{ uri: sticker.stickerURI }}
              style={styles.sticker}
              resizeMode="contain"
            />
          </View>
        ))}
        {overlayData.pipImage && (
          <View
            style={[
              styles.pipContainerOuter,
              calculateOverlayPosition(overlayData.pipImage.position, overlayData.pipImage.scale),
              {
                width: overlayData.pipImage.size.width,
                height: overlayData.pipImage.size.height,
                transform: [
                  { scale: overlayData.pipImage.scale },
                  { rotate: `${overlayData.pipImage.rotation}deg` },
                ],
              }
            ]}
          >
            <View
              style={[
                styles.pipBackgroundContainer,
                {
                  backgroundColor: overlayData.pipImage.backgroundColor,
                  width: '100%',
                  height: '100%',
                }
              ]}
            >
              <Image
                source={{ uri: overlayData.pipImage.uri }}
                style={[
                  styles.pipImage,
                  { opacity: overlayData.pipImage.opacity },
                ]}
              />
            </View>
          </View>
        )}
      </>
    );
  };

 const renderMedia = () => {
    if (mediaType === 'video') {
      return (
        <Video
          ref={videoRef}
          source={{ uri: video }}
          style={styles.media}
          resizeMode="contain"
          repeat
          rate={playbackSpeed}
          muted={isMuted}
          paused={false}
          onError={(error) => console.error('Video error:', error)}
          onLayout={onMediaLayout}
        />
      );
    } else {
      return (
        <Image
          source={{ uri: image }}
          style={styles.media}
          resizeMode="contain"
          onLayout={onMediaLayout}
        />
      );
    }
  };
  useEffect(() => {
    console.log('DrawingScreen mounted');
    console.log('Initial overlayData:', overlayData);
    return () => console.log('DrawingScreen unmounted');
  }, []);
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
        <View style={StyleSheet.absoluteFill}>
          {renderMedia()}
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {mediaSize.width > 0 && mediaSize.height > 0 && renderOverlays()}
          </View>
          <Svg style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
            {paths.map((path, index) => (
              <Path
                key={`${path.id}-${index}`}
                d={path.points.join(' ')}
                stroke={path.color}
                strokeWidth={path.strokeWidth || penSize}
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
      <View style={styles.bottomToolbar}>
        <ScrollView horizontal style={styles.colorBar}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }, color === currentColor && styles.selectedColor]}
              onPress={() => setCurrentColor(color)}
            />
          ))}
        </ScrollView>
        <View style={styles.penSizeContainer}>
          <Icon name="pencil" size={16} color="#020E27" />
          <Slider
            style={styles.penSizeSlider}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={penSize}
            onValueChange={setPenSize}
            minimumTrackTintColor="#020E27"
            maximumTrackTintColor="#9B9B9B"
            thumbTintColor="#020E27"
          />
          <Icon name="pencil" size={24} color="#020E27" />
        </View>
      </View>
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
    flex: 1,
    backgroundColor: 'transparent',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  toolbarButton: {
    padding: 10,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#020E27',
  },
  bottomToolbar: {
    height: hp('10%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  colorBar: {
    height: hp('10%'),
    backgroundColor: '#fff',
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
  penSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: hp('5%'),
  },
  penSizeSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
 overlay: {
    position: 'absolute',
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Add background for visibility
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 100,

  },
  locationOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickerContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  sticker: {
    width: '100%',
    height: '100%',
  },
  pipContainerOuter: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 10,
  },
  pipBackgroundContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pipImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default DrawingScreen;