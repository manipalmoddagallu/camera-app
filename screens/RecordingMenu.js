import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList ,ImageBackground} from 'react-native';
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
            <TouchableOpacity style={styles.playButton} onPress={playRecording}>
              <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveRecording}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={savedRecordings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.savedItem}>
                <Text style={styles.savedItemText}>{formatTime(item.duration)}</Text>
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
  savedItemText: {
    color: 'white',
    fontSize: wp('4%'),
  },
});

export default RecordingMenu;