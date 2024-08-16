import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordingMenu = ({ onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [playbackTimer, setPlaybackTimer] = useState(0);
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [currentSection, setCurrentSection] = useState('record');
  const [currentRecording, setCurrentRecording] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadSavedRecordings();
  }, []);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setPlaybackTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPlaying]);

  const loadSavedRecordings = async () => {
    try {
      const savedRecordingsJSON = await AsyncStorage.getItem('savedRecordings');
      if (savedRecordingsJSON !== null) {
        setSavedRecordings(JSON.parse(savedRecordingsJSON));
      }
    } catch (error) {
      console.error('Error loading saved recordings:', error);
    }
  };

  const saveSavedRecordings = async (recordings) => {
    try {
      await AsyncStorage.setItem('savedRecordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Error saving recordings:', error);
    }
  };

  const getFilePath = (filename) => `${RNFS.DocumentDirectoryPath}/${filename}`;

  const startRecording = async () => {
    const filename = `recording_${Date.now()}.m4a`;
    const filePath = getFilePath(filename);
    try {
      const result = await audioRecorderPlayer.startRecorder(filePath);
      console.log('Recording started', result);
      setIsRecording(true);
      setTimer(0);
      setCurrentRecording(null); // Reset current recording when starting a new one
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('Recording stopped', result);
      setIsRecording(false);
      setCurrentRecording(result); // Set the current recording
      return result; // This should be the file path
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const saveRecording = async () => {
    if (currentRecording) {
      const filename = currentRecording.split('/').pop(); // Extract filename from path
      const newRecording = {
        id: Date.now(),
        name: `Recording ${savedRecordings.length + 1}`,
        date: new Date().toLocaleDateString(),
        duration: timer,
        filename: filename,
      };
      const updatedRecordings = [...savedRecordings, newRecording];
      setSavedRecordings(updatedRecordings);
      await saveSavedRecordings(updatedRecordings);
      setTimer(0);
      setPlaybackTimer(0);
      setCurrentRecording(null); // Reset current recording after saving
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playRecording = async () => {
    if (isPlaying) {
      // Stop playback
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
      setPlaybackTimer(0);
    } else if (currentRecording) {
      // Start playback of current recording
      try {
        const result = await audioRecorderPlayer.startPlayer(currentRecording);
        console.log('Playing current recording', result);
        setIsPlaying(true);
        setPlaybackTimer(0);
        
        audioRecorderPlayer.addPlayBackListener((e) => {
          if (e.currentPosition === e.duration) {
            audioRecorderPlayer.stopPlayer();
            setIsPlaying(false);
            setPlaybackTimer(0);
          } else {
            setPlaybackTimer(Math.floor(e.currentPosition / 1000));
          }
        });
      } catch (error) {
        console.error('Error playing current recording:', error);
      }
    }
  };

  const playSavedRecording = async (id) => {
    const recording = savedRecordings.find(r => r.id === id);
    if (recording) {
      try {
        const filePath = getFilePath(recording.filename);
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
          console.error('Audio file does not exist:', filePath);
          // Inform the user that the file is missing
          return;
        }
        const result = await audioRecorderPlayer.startPlayer(filePath);
        console.log('Playing saved recording', result);
      } catch (error) {
        console.error('Error playing saved recording:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <ImageBackground 
      source={require('./assets/images/BG.png')} // Replace with your image path
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, currentSection === 'record' && styles.activeTab]}
              onPress={() => setCurrentSection('record')}
            >
              <Text style={styles.tabText}>Record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, currentSection === 'saved' && styles.activeTab]}
              onPress={() => setCurrentSection('saved')}
            >
              <Text style={styles.tabText}>Saved</Text>
            </TouchableOpacity>
          </View>
        </View>
        {currentSection === 'record' ? (
          <View style={styles.recordSection}>
            <TouchableOpacity style={styles.recordButton} onPress={toggleRecording}>
              <Icon name={isRecording ? 'stop' : 'mic'} size={40} color={isRecording ? 'red' : 'white'} />
            </TouchableOpacity>
            <Text style={styles.timer}>{formatTime(isPlaying ? playbackTimer : timer)}</Text>
            <TouchableOpacity 
              style={[styles.playButton, !currentRecording && styles.disabledButton]} 
              onPress={playRecording}
              disabled={!currentRecording}
            >
              <Icon name={isPlaying ? 'pause' : 'play'} size={30} color={currentRecording ? '#fff' : '#888'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, !currentRecording && styles.disabledButton]}
              onPress={saveRecording}
              disabled={!currentRecording}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={savedRecordings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.savedItem}>
                <View>
                  <Text style={styles.savedItemName}>{item.name}</Text>
                  <Text style={styles.savedItemDate}>{item.date}</Text>
                  <Text style={styles.savedItemDuration}>{formatTime(item.duration)}</Text>
                </View>
                <TouchableOpacity onPress={() => playSavedRecording(item.id)}>
                  <Icon name="play" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp('50%'),
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    overflow: 'hidden',
    zIndex: 4
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: wp('5%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: wp('4%'),
  },
  recordSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  recordButton: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: wp('6%'),
    marginTop: hp('2.5%'),
    color: 'white',
  },
  playButton: {
    marginTop: hp('2.5%'),
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: hp('2.5%'),
    padding: wp('2.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: wp('1%'),
  },
  saveButtonText: {
    color: 'white',
    fontSize: wp('4%'),
  },
  savedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('2.5%'),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  savedItemName: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  savedItemDate: {
    color: 'white',
    fontSize: wp('3.5%'),
  },
  savedItemDuration: {
    color: 'white',
    fontSize: wp('3.5%'),
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default RecordingMenu;