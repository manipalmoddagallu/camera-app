import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ImageBackground, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const RecordingMenu = ({ isVisible, onClose, onRecordingComplete, isMuted,onSelectRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [playbackTimer, setPlaybackTimer] = useState(0);
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [currentSection, setCurrentSection] = useState('record');
  const [currentRecording, setCurrentRecording] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState(null);
  const intervalRef = useRef(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;


  useEffect(() => {
    loadSavedRecordings();
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    audioRecorderPlayer.setVolume(isMuted ? 0 : 1);
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (audioRecorderPlayer) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
    };
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
      Alert.alert('Error', 'Failed to load saved recordings');
    }
  };

  const saveSavedRecordings = async (recordings) => {
    try {
      await AsyncStorage.setItem('savedRecordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Error saving recordings:', error);
      Alert.alert('Error', 'Failed to save recordings');
    }
  };

  const getFilePath = (filename) => `${RNFS.DocumentDirectoryPath}/${filename}`;

  const startRecording = async () => {
    const filename = `recording_${Date.now()}.m4a`;
    const filePath = getFilePath(filename);
    try {
      Alert.alert(
        "Recording Started",
        "You can't record more than 100 seconds.",
        [{ text: "OK" }]
      );
      const result = await audioRecorderPlayer.startRecorder(filePath);
      console.log('Recording started', result);
      setIsRecording(true);
      setTimer(0);
      setCurrentRecording(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('Recording stopped', result);
      setIsRecording(false);
      setCurrentRecording(result);
      onRecordingComplete(result);
      return result;
    } catch (error) {
      console.error('Error in stop recording process:', error);
    }
  };
  const deleteRecording = async (id) => {
    const recordingToDelete = savedRecordings.find(r => r.id === id);
    if (recordingToDelete) {
      Alert.alert(
        "Delete Recording",
        `Are you sure you want to delete ${recordingToDelete.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              try {
                // Stop playback if the recording is currently playing
                if (playingId === id) {
                  await stopPlayback();
                }

                // Delete the file
                const filePath = getFilePath(recordingToDelete.filename);
                await RNFS.unlink(filePath);

                // Remove from state and storage
                const updatedRecordings = savedRecordings.filter(r => r.id !== id);
                setSavedRecordings(updatedRecordings);
                await saveSavedRecordings(updatedRecordings);

                Alert.alert("Success", "Recording deleted successfully");
              } catch (error) {
                console.error('Error deleting recording:', error);
                Alert.alert("Error", "Failed to delete recording");
              }
            },
            style: "destructive"
          }
        ]
      );
    }
  };
  const saveRecording = async () => {
    if (currentRecording) {
      const filename = currentRecording.split('/').pop();
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
      setCurrentRecording(null);
      Alert.alert('Success', 'Recording saved successfully');
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
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } else if (currentRecording) {
      try {
        const result = await audioRecorderPlayer.startPlayer(currentRecording);
        console.log('Playing current recording', result);
        setIsPlaying(true);

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
        Alert.alert('Error', 'Failed to play recording');
      }
    }
  };
  const selectRecording = (id) => {
    setSelectedRecordingId(id);
    const recording = savedRecordings.find(r => r.id === id);
    if (recording) {
      Alert.alert('Recording Attached', `${recording.name} is being attached.`);
      onSelectRecording(recording); // Pass the selected recording back to EditingScreen
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
          Alert.alert('Error', 'Audio file not found');
          return;
        }

        if (playingId === id) {
          // If the same recording is clicked, pause/resume playback
          if (await audioRecorderPlayer.getCurrentPosition() > 0) {
            await audioRecorderPlayer.pausePlayer();
            setPlayingId(null);
            setIsLooping(false);
            Alert.alert('Paused', `${recording.name} has been paused.`);
          } else {
            await audioRecorderPlayer.resumePlayer();
            setPlayingId(id);
            setIsLooping(true);
            Alert.alert('Playing', 'Recording is being played.');
          }
        } else {
          // If a different recording is clicked or no recording is playing
          if (playingId !== null) {
            await audioRecorderPlayer.stopPlayer();
          }
          const result = await audioRecorderPlayer.startPlayer(filePath);
          console.log('previewing saved recording', result);
          setPlayingId(id);
          setIsLooping(true);
          Alert.alert('Now Playing', 'Recording is being previewed.');
          onSelectRecording(recording); // Pass the playing recording back to EditingScreen

          audioRecorderPlayer.addPlayBackListener((e) => {
            if (e.currentPosition === e.duration) {
              // When the playback finishes, start it again
              audioRecorderPlayer.startPlayer(filePath);
            }
          });
        }

        // Set volume based on mute state
        audioRecorderPlayer.setVolume(isMuted ? 0 : 1);
      } catch (error) {
        console.error('Error playing saved recording:', error);
        Alert.alert('Error', 'Failed to play saved recording');
      }
    }
  };
  const stopPlayback = async () => {
    if (playingId !== null) {
      await audioRecorderPlayer.stopPlayer();
      setPlayingId(null);
      setIsLooping(false);
      const recording = savedRecordings.find(r => r.id === playingId);
      if (recording) {
        Alert.alert('Stopped', `${recording.name} has stopped playing.`);
      }
    }
  };
  const stopAllAudio = async () => {
    try {
      if (isRecording) {
        await audioRecorderPlayer.stopRecorder();
      }
      if (isPlaying || playingId !== null) {
        await audioRecorderPlayer.stopPlayer();
      }
      setIsRecording(false);
      setIsPlaying(false);
      setPlayingId(null);
      setIsLooping(false);
      setTimer(0);
      setPlaybackTimer(0);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

 const renderSavedItem = ({ item }) => {
    const isPlaying = playingId === item.id;
    return (
      <View style={styles.savedItem}>
        <TouchableOpacity 
          style={styles.savedItemContent}
          onPress={() => selectRecording(item.id)}
        >
          <View>
            <Text style={[styles.savedItemName, isPlaying && styles.playingText]}>{item.name}</Text>
            <Text style={[styles.savedItemDate, isPlaying && styles.playingText]}>{item.date}</Text>
            <Text style={[styles.savedItemDuration, isPlaying && styles.playingText]}>{formatTime(item.duration)}</Text>
          </View>


        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteRecording(item.id)} 
          style={styles.deleteButton}
        >
          <Icon name="trash-outline" size={28}  />
        </TouchableOpacity>
          <TouchableOpacity onPress={() => playSavedRecording(item.id)}>
              <Icon
                name={isPlaying ? "pause" : "play"}
                size={24}
                color={isPlaying ? "#00ff00" : "#fff"}
              />
            </TouchableOpacity>
            {isPlaying && (
              <TouchableOpacity onPress={stopPlayback} style={styles.stopButton}>
                <Icon name="stop" size={24} color="#00ff00" />
              </TouchableOpacity>
            )}
 
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('./assets/images/BG.png')}
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
            renderItem={renderSavedItem}
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
  playingItem: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
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
  playingText: {
    color: '#00ff00',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButton: {
    marginLeft: wp('2%'),
  },
  disabledButton: {
    opacity: 0.5,
  },
 deleteButton: {
  color: '#000',
  left: 50
  },
});

export default RecordingMenu;


