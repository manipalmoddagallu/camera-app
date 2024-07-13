import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecordingMenu = ({ onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [playbackTimer, setPlaybackTimer] = useState(0);
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [currentSection, setCurrentSection] = useState('record');
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
        setPlaybackTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
        });
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // Stop recording logic here
    } else {
      // Start recording logic here
      setTimer(0);
      setPlaybackTimer(0);
    }
  };

  const saveRecording = async () => {
    const newRecording = {
      id: Date.now(),
      duration: timer,
      filename: `recording_${Date.now()}.m4a`, // Assume this is the filename of the saved audio file
    };
    const updatedRecordings = [...savedRecordings, newRecording];
    setSavedRecordings(updatedRecordings);
    await saveSavedRecordings(updatedRecordings);
    setIsRecording(false);
    setTimer(0);
    setPlaybackTimer(0);
  };

  const playRecording = () => {
    if (isPlaying) {
      // Stop playback
      setIsPlaying(false);
      setPlaybackTimer(timer);
    } else {
      // Start playback
      setIsPlaying(true);
      setPlaybackTimer(timer);
    }
  };

  const playSavedRecording = (id) => {
    // Play saved recording logic here
    console.log('Playing saved recording', id);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentSection === 'record' && styles.activeTab]}
            onPress={() => setCurrentSection('record')}
          >
            <Text>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentSection === 'saved' && styles.activeTab]}
            onPress={() => setCurrentSection('saved')}
          >
            <Text>Saved</Text>
          </TouchableOpacity>
        </View>
      </View>
      {currentSection === 'record' ? (
        <View style={styles.recordSection}>
          <TouchableOpacity style={styles.recordButton} onPress={toggleRecording}>
            <Icon name={isRecording ? 'stop' : 'mic'} size={40} color={isRecording ? 'red' : 'black'} />
          </TouchableOpacity>
          <Text style={styles.timer}>{formatTime(isPlaying ? playbackTimer : timer)}</Text>
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveRecording}>
            <Text>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedRecordings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.savedItem}>
              <Text>{formatTime(item.duration)}</Text>
              <TouchableOpacity onPress={() => playSavedRecording(item.id)}>
                <Icon name="play" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp('50%'),
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'black',
  },
  recordSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 24,
    marginTop: 20,
  },
  playButton: {
    marginTop: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  savedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default RecordingMenu;