import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import Video from 'react-native-video';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoCropScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoLayout, setVideoLayout] = useState(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const [videoDimensions, setVideoDimensions] = useState(null);

  const cropVideo = async (videoUri, cropRect) => {
    const outputPath = `${RNFS.CachesDirectoryPath}/cropped_video_${Date.now()}.mp4`;
    const { x, y, width, height } = cropRect;

    // Calculate the actual crop coordinates based on the video's dimensions
    const actualX = Math.round((x / videoLayout.width) * videoDimensions.width);
    const actualY = Math.round((y / videoLayout.height) * videoDimensions.height);
    const actualWidth = Math.round((width / videoLayout.width) * videoDimensions.width);
    const actualHeight = Math.round((height / videoLayout.height) * videoDimensions.height);

    const command = `-i "${videoUri}" -filter:v "crop=${actualWidth}:${actualHeight}:${actualX}:${actualY}" -c:a copy "${outputPath}"`;

    console.log('FFmpeg command:', command);

    try {
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();

      if (ReturnCode.isSuccess(returnCode)) {
        console.log('Video cropped successfully');
        return outputPath;
      } else {
        console.error('FFmpeg process failed with return code:', returnCode);
        console.error('FFmpeg output:', output);
        throw new Error(`Video cropping failed with return code ${returnCode}`);
      }
    } catch (error) {
      console.error('Error during video cropping:', error);
      throw error;
    }
  };

const handleCrop = async () => {
  setIsLoading(true);
  try {
    const cropRect = {
      x: cropPosition.x,
      y: cropPosition.y,
      width: cropSize.width,
      height: cropSize.height,
    };
    const croppedVideoPath = await cropVideo(video.uri, cropRect);
    setIsLoading(false);
    navigation.navigate('EditingScreen', { 
      croppedVideo: { uri: croppedVideoPath },
      originalVideo: video,
      cropRect: cropRect,
    });
  } catch (error) {
    setIsLoading(false);
    console.error('Video cropping error:', error);
    Alert.alert('Error', `Failed to crop video: ${error.message}`);
  }
};
  const onVideoLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setVideoLayout({ width, height });
    initializeCropArea(width, height);
  };

  const initializeCropArea = (width, height) => {
    const aspectRatioParts = selectedAspectRatio.split(':').map(Number);
    const cropWidth = width * 0.8;
    const cropHeight = (cropWidth * aspectRatioParts[1]) / aspectRatioParts[0];
    setCropSize({ width: cropWidth, height: cropHeight });
    setCropPosition({
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
    });
  };

  const onVideoLoad = (data) => {
    setVideoDimensions({ width: data.naturalSize.width, height: data.naturalSize.height });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      setCropPosition(prevPosition => ({
        x: Math.max(0, Math.min(prevPosition.x + gestureState.dx, videoLayout.width - cropSize.width)),
        y: Math.max(0, Math.min(prevPosition.y + gestureState.dy, videoLayout.height - cropSize.height)),
      }));
    },
  });

  const resizePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      setCropSize(prevSize => {
        const newWidth = Math.max(100, Math.min(prevSize.width + gestureState.dx, videoLayout.width - cropPosition.x));
        const aspectRatioParts = selectedAspectRatio.split(':').map(Number);
        const newHeight = (newWidth * aspectRatioParts[1]) / aspectRatioParts[0];
        return {
          width: newWidth,
          height: Math.min(newHeight, videoLayout.height - cropPosition.y),
        };
      });
    },
  });

  const aspectRatios = ['1:1', '3:4', '3:2', '16:9'];

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer} onLayout={onVideoLayout}>
        <Video
          ref={videoRef}
          source={{ uri: video.uri }}
          style={styles.video}
          resizeMode="contain"
          repeat
          onLoad={onVideoLoad}
        />
        {videoLayout && (
          <View
            {...panResponder.panHandlers}
            style={[
              styles.cropOverlay,
              {
                width: cropSize.width,
                height: cropSize.height,
                left: cropPosition.x,
                top: cropPosition.y,
              },
            ]}
          >
            <View {...resizePanResponder.panHandlers} style={styles.resizeHandle} />
          </View>
        )}
      </View>
      <View style={styles.aspectRatioContainer}>
        {aspectRatios.map((ratio) => (
          <TouchableOpacity
            key={ratio}
            style={[
              styles.aspectRatioButton,
              selectedAspectRatio === ratio && styles.selectedAspectRatio,
            ]}
            onPress={() => {
              setSelectedAspectRatio(ratio);
              if (videoLayout) {
                initializeCropArea(videoLayout.width, videoLayout.height);
              }
            }}
          >
            <Text style={styles.aspectRatioText}>{ratio}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.cropButton} onPress={handleCrop} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#020E27" />
        ) : (
          <Text>Crop Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  cropOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'yellow',
  },
  resizeHandle: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 20,
    height: 20,
    backgroundColor: 'yellow',
    borderRadius: 10,
  },
  aspectRatioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  aspectRatioButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  selectedAspectRatio: {
    backgroundColor: '#555',
  },
  aspectRatioText: {
    color: '#fff',
  },
  cropButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default VideoCropScreen;