import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import Slider from '@react-native-community/slider';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const TrimScreen = ({ route }) => {
  const { video } = route.params;
  const navigation = useNavigation();
  const [trimmedVideo, setTrimmedVideo] = useState(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (currentTime >= endTime) {
      setIsPlaying(false);
      videoRef.current.seek(startTime);
    }
  }, [currentTime, endTime, startTime]);

  useEffect(() => {
    console.log('isPlaying:', isPlaying);
    console.log('currentTime:', currentTime);
    console.log('trimmedVideo:', trimmedVideo);
  }, [isPlaying, currentTime, trimmedVideo]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleTrim = async () => {
    setIsTrimming(true);
    const outputPath = `${RNFS.CachesDirectoryPath}/trimmed_video_${Date.now()}.mp4`;
    try {
      await FFmpegKit.execute(`-i "${video.uri}" -ss ${startTime.toFixed(3)} -to ${endTime.toFixed(3)} -c:v libx264 -c:a aac -strict experimental -b:a 128k ${outputPath}`);
      
      const exists = await RNFS.exists(outputPath);
      if (exists) {
        console.log('Trimmed video file exists');
        setTrimmedVideo({ uri: outputPath, type: 'video' });
        // Reset player state
        setCurrentTime(0);
        setStartTime(0);
        setEndTime(endTime - startTime);
        setDuration(endTime - startTime);
        // Seek to the start and play
        videoRef.current.seek(0);
        setIsPlaying(true);
        Alert.alert('Success', 'Video trimmed successfully');
      } else {
        console.error('Trimmed video file does not exist');
        Alert.alert('Error', 'Failed to create trimmed video file');
      }
    } catch (error) {
      console.error('Error trimming video', error);
      Alert.alert('Error', 'Failed to trim video');
    } finally {
      setIsTrimming(false);
    }
  };

  const handleDone = () => {
    if (trimmedVideo) {
      navigation.navigate('EditingScreen', {
        trimmedVideo: trimmedVideo
      });
    } else {
      navigation.navigate('EditingScreen', {
        media: video
      });
    }
  };

  const handleLoad = (meta) => {
    console.log('Video loaded, duration:', meta.duration);
    setDuration(meta.duration);
    if (!trimmedVideo) {
      setEndTime(meta.duration);
    } else {
      setEndTime(meta.duration);
      // Ensure playback starts from the beginning for trimmed video
      videoRef.current.seek(0);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      videoRef.current.seek(startTime);
    }
  };

  const handleProgress = (progress) => {
    setCurrentTime(progress.currentTime);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: trimmedVideo ? trimmedVideo.uri : video.uri }}
        style={styles.video}
        resizeMode="contain"
        onLoad={handleLoad}
        paused={!isPlaying}
        onProgress={handleProgress}
      />
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePlayPause}>
          <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.timeText}>{formatTime(currentTime)} / {formatTime(duration)}</Text>
      </View>
      <View style={styles.trimmerContainer}>
        <Slider
          style={styles.trimmer}
          minimumValue={0}
          maximumValue={duration}
          value={startTime}
          onValueChange={setStartTime}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#9E9E9E"
          thumbTintColor="#4CAF50"
        />
        <Slider
          style={styles.trimmer}
          minimumValue={0}
          maximumValue={duration}
          value={endTime}
          onValueChange={setEndTime}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#9E9E9E"
          thumbTintColor="#4CAF50"
        />
      </View>
      <View style={styles.timeLabelsContainer}>
        <Text style={styles.timeLabel}>Start: {formatTime(startTime)}</Text>
        <Text style={styles.timeLabel}>End: {formatTime(endTime)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, isTrimming && styles.disabledButton]}
        onPress={handleTrim}
        disabled={isTrimming}
      >
        {isTrimming ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Trim Video</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDone}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height * 0.4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  timeText: {
    color: '#fff',
    marginLeft: 10,
  },
  trimmerContainer: {
    width: width - 40,
    height: 50,
    marginTop: 20,
  },
  trimmer: {
    width: '100%',
  },
  timeLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginTop: 10,
  },
  timeLabel: {
    color: '#fff',
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    width: width - 40,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrimScreen;