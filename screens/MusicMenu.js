import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
  ImageBackground,
  Dimensions
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialIcons';

Sound.setCategory('Playback');
const { height } = Dimensions.get('window');

const MusicModal = ({ isVisible, onClose, onSelectMusic, isMuted }) => {
  const [permissionStatus, setPermissionStatus] = useState('Checking permissions...');
  const [localMusicFiles, setLocalMusicFiles] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isVisible) {
      requestPermission();
    }
    return () => {
      stopPlayback();
    };
  }, [isVisible]);

  useEffect(() => {
    if (currentSound) {
      currentSound.setVolume(isMuted ? 0 : 1);
    }
  }, [isMuted]);

  const requestPermission = async () => {
    try {
      let result;
      if (Platform.Version >= 33) {
        result = await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
      } else {
        result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }
      if (result === RESULTS.GRANTED) {
        setPermissionStatus('Permission granted');
        scanForMusicFiles();
      } else {
        setPermissionStatus('Permission denied. Please grant storage permission to use this feature.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionStatus('Error requesting permission');
    }
  };

  const scanForMusicFiles = async () => {
    setIsScanning(true);
    try {
      const rootDirectory = RNFS.ExternalStorageDirectoryPath;
      const mp3Files = await scanDirectory(rootDirectory);
      setLocalMusicFiles(mp3Files);
      setPermissionStatus(`Found ${mp3Files.length} local MP3 files`);
    } catch (error) {
      console.error('Error scanning for music files:', error);
      setPermissionStatus('Failed to scan for music files');
    } finally {
      setIsScanning(false);
    }
  };

  const scanDirectory = async (directoryPath) => {
    let mp3Files = [];
    try {
      const files = await RNFS.readDir(directoryPath);
      for (const file of files) {
        if (file.isDirectory()) {
          const subDirFiles = await scanDirectory(file.path);
          mp3Files = [...mp3Files, ...subDirFiles];
        } else if (file.name.toLowerCase().endsWith('.mp3')) {
          mp3Files.push(file);
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${directoryPath}:`, error);
    }
    return mp3Files;
  };

  const playTrack = (track) => {
    stopPlayback();

    const sound = new Sound(track.path, '', (error) => {
      if (error) {
        console.error('Failed to load the sound', error);
        return;
      }

      setCurrentSound(sound);
      setCurrentTrack(track);
      setIsPlaying(true);
      
      sound.setVolume(isMuted ? 0 : 1);
      sound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
          stopPlayback();
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
      });
    });

    onSelectMusic(track);
  };

  const stopPlayback = () => {
    if (currentSound) {
      currentSound.stop(() => {
        console.log('Sound stopped');
        currentSound.release();
        setCurrentSound(null);
        setCurrentTrack(null);
        setIsPlaying(false);
      });
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  };

  const renderMusicItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => playTrack(item)} 
      style={styles.musicItem}
    >
      <Text style={styles.musicTitle}>{item.name}</Text>
      {currentTrack && currentTrack.path === item.path && (
        <Text style={styles.nowPlaying}>Now Playing</Text>
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isScanning) {
      return <ActivityIndicator size="large" color="#ffffff" />;
    }

    return (
      <>
        <FlatList
          style={styles.listContainer}
          data={localMusicFiles}
          renderItem={renderMusicItem}
          keyExtractor={(item) => item.path}
          ListEmptyComponent={<Text style={styles.emptyList}>No local music files found</Text>}
        />
        {currentTrack && (
          <View style={styles.playerControls}>
            <Text style={styles.nowPlaying}>Now Playing: {currentTrack.name}</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.iconButton}>
                <Icon 
                  name={isPlaying ? 'pause' : 'play-arrow'} 
                  size={30} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalWrapper}>
        <ImageBackground
          source={require('./assets/images/BG.png')}
          style={styles.backgroundImage}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Music Selection</Text>
            {renderContent()}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  listContainer: {
    flex: 1,
  },
  musicItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  musicTitle: {
    fontSize: 16,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  nowPlaying: {
    fontSize: 12,
    color: '#00ff00',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  playerControls: {
    marginTop: 10,
    alignItems: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  iconButton: {
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default MusicModal;