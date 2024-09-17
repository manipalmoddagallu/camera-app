import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, NativeEventEmitter, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showEditor, isValidFile, closeEditor } from 'react-native-video-trim';

const TrimScreen = ({ route }) => {
  const navigation = useNavigation();
  const [videoUri, setVideoUri] = useState(route.params.video.uri);
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState([]);

  const addLog = (message) => {
    setLog(prevLog => [...prevLog, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener('VideoTrim', (event) => {
      addLog(`Received event: ${JSON.stringify(event)}`);
      switch (event.name) {
        case 'onLoad':
          addLog('Media loaded successfully');
          break;
        case 'onShow':
          addLog('Editor shown');
          break;
        case 'onHide':
          addLog('Editor hidden');
          break;
        case 'onStartTrimming':
          addLog('Trimming started');
          setIsProcessing(true);
          break;
        case 'onFinishTrimming':
          addLog('Trimming finished');
          setIsProcessing(false);
          closeEditor(); // Close the editor
          addLog('Editor closed');
          navigation.navigate('EditingScreen', { trimmedVideo: { uri: event.outputPath, type: 'video' } });
          break;
        case 'onCancelTrimming':
          addLog('Trimming cancelled');
          setIsProcessing(false);
          break;
        case 'onCancel':
          addLog('Operation cancelled');
          setIsProcessing(false);
          break;
        case 'onError':
          addLog(`Error: ${event.error}`);
          setIsProcessing(false);
          alert(`Failed to trim video: ${event.error}`);
          break;
        case 'onLog':
          addLog(`Log: ${event.message}`);
          break;
        case 'onStatistics':
          addLog(`Statistics: ${JSON.stringify(event.statistics)}`);
          break;
      }
    });

    // Call trimVideo function when the component mounts
    trimVideo();

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const trimVideo = async () => {
    addLog('Starting trim process');
    try {
      const isValid = await isValidFile(videoUri);
      if (!isValid) {
        throw new Error('Invalid video file');
      }

      addLog(`Video URI: ${videoUri}`);
      addLog('Calling showEditor');
      await showEditor(videoUri, {
        maxDuration: 15,
        quality: 'low',
        outputFormat: 'mp4',
        bitrate: 2000000, // 1 Mbps
        fps: 24,
        useHardwareAcceleration: true,
      });
      addLog('showEditor call completed');
    } catch (error) {
      addLog(`Error in trimVideo: ${error.message}`);
      console.error('Error showing trim editor:', error);
      alert(`Failed to show trim editor: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Trimming in Progress</Text>
      {isProcessing && <Text style={styles.processingText}>Processing...</Text>}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Debug Log:</Text>
        {log.map((entry, index) => (
          <Text key={index} style={styles.logEntry}>{entry}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  processingText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  logContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
    maxHeight: 200,
  },
  logTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logEntry: {
    fontSize: 12,
  },
});

export default TrimScreen;