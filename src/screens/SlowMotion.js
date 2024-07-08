import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import { Camera, frameRateIncluded } from 'react-native-vision-camera';
import { COLOR } from '../utils/Config';

const SlowMotion = ({ route }) => {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [isSlowMotionSupported, setIsSlowMotionSupported] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    checkSlowMotionSupport();
  }, []);

  const checkSlowMotionSupport = async () => {
    const devices = await Camera.getAvailableCameraDevices();
    const backCamera = devices.find(d => d.position === 'back');
    
    if (backCamera && frameRateIncluded(backCamera, 120)) {
      console.log('This device supports 120 FPS slow-motion');
      setIsSlowMotionSupported(true);
    } else {
      console.log('This device does not support 120 FPS slow-motion');
      setIsSlowMotionSupported(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setCapturedPhoto(data.uri);
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
    console.log('flash mode:', flashMode);
  };

  const recordVideo = async (isSlowMotion = false, isBoomerang = false) => {
    if (cameraRef.current) {
      const frameRate = isSlowMotion && isSlowMotionSupported ? 120 : 30;
      const quality = isSlowMotion ? 'high' : 'medium';
      const maxDuration = isBoomerang ? 3 : 10;

      const options = {
        quality,
        maxDuration,
        codec: 'h264',
        frameRate,
        videoBitRate: isSlowMotion ? 20000000 : 5000000,
      };

      try {
        const recording = await cameraRef.current.recordAsync(options);
        console.log('Recording URI:', recording.uri);
        // Here you would typically save the recording or process it further
      } catch (error) {
        console.error('Error recording video:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
      ) : (
        <Camera
          style={styles.preview}
          device={device}
          isActive={true}
          ref={cameraRef}
          onStatusChange={({ cameraStatus }) => {
            if (cameraStatus === 'READY') {
              // Start or configure the camera when it is ready
            }
          }}
          flash={flashMode}
          video={true}
          audio={true}
          frameRate={30}
        >
          <View style={styles.captureContainer}>
            <TouchableOpacity onPress={takePicture} style={styles.capture}>
              <Text>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => recordVideo()} style={styles.recordButton}>
              <Text>Record</Text>
            </TouchableOpacity>
            {isSlowMotionSupported && (
              <TouchableOpacity onPress={() => recordVideo(true)} style={styles.slowMotionButton}>
                <Text>Slow-Mo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => recordVideo(false, true)} style={styles.boomerangButton}>
              <Text>Boomerang</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
              <Text>{flashMode === 'on' ? 'Flash On' : 'Flash Off'}</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  captureContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  recordButton: {
    backgroundColor: 'red',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slowMotionButton: {
    backgroundColor: 'blue',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boomerangButton: {
    backgroundColor: COLOR.GREEN,
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    backgroundColor: 'yellow',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
});

export default SlowMotion;