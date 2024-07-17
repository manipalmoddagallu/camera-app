// MusicMenu.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, ImageBackground } from 'react-native';
import Modal from 'react-native-modal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { getAll, SortSongFields, SortSongOrder } from 'react-native-get-music-files';
import Sound from 'react-native-sound';

const MusicMenu = ({ isVisible, onClose, onSelectMusic }) => {
  const [activeTab, setActiveTab] = useState('device');
  const [deviceMusic, setDeviceMusic] = useState([]);
  const [onlineMusic, setOnlineMusic] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);

  useEffect(() => {
    if (activeTab === 'device') {
      fetchDeviceMusic();
    } else {
      fetchOnlineMusic();
    }
  }, [activeTab]);

  useEffect(() => {
    filterMusic();
  }, [searchText, deviceMusic, onlineMusic]);

  const fetchDeviceMusic = async () => {
    try {
      const songs = await getAll({
        limit: 100,
        offset: 0,
        sortBy: SortSongFields.TITLE,
        sortOrder: SortSongOrder.ASC,
      });
      setDeviceMusic(songs);
    } catch (error) {
      console.error('Error fetching device music:', error);
    }
  };

  const fetchOnlineMusic = async () => {
    try {
      const response = await axios.get('https://socialmedia.digiatto.info/public/api/music');
      setOnlineMusic(response.data.data);
    } catch (error) {
      console.error('Error fetching online music:', error);
    }
  };

  const filterMusic = () => {
    const musicList = activeTab === 'device' ? deviceMusic : onlineMusic;
    const filtered = musicList.filter(music =>
      music.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredMusic(filtered);
  };

  const playMusic = (music) => {
    if (currentSound) {
      currentSound.stop();
      currentSound.release();
    }

    const file = activeTab === 'device' ? music.path : music.file;
    const sound = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        return;
      }
      setCurrentSound(sound);
      sound.play((success) => {
        if (success) {
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    });
  };

  const stopMusic = () => {
    if (currentSound) {
      currentSound.stop();
      setIsPlaying(false);
    }
  };

  const renderMusicItem = ({ item }) => (
    <TouchableOpacity
      style={styles.musicItem}
      onPress={() => {
        onSelectMusic(item);
        onClose();
      }}
    >
      <Text style={styles.musicTitle}>{item.title}</Text>
      <TouchableOpacity onPress={() => isPlaying ? stopMusic() : playMusic(item)}>
        <Text style={styles.playStopText}>{isPlaying ? 'Stop' : 'Play'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
     
        <View style={styles.overlay}>
         <ImageBackground 
        source={require('./assets/images/BG.png')} // Adjust the path as needed
        style={styles.backgroundImage}
      >
       
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'device' && styles.activeTab]}
                onPress={() => setActiveTab('device')}
              >
                <Text style={styles.tabText}>Music</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'online' && styles.activeTab]}
                onPress={() => setActiveTab('online')}
              >
                <Text style={styles.tabText}>Online Music</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search music..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={filteredMusic}
              renderItem={renderMusicItem}
              keyExtractor={(item) => item.id.toString()}
            />
        
                </ImageBackground>
        </View>

    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
      height: hp('50%'),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    height: hp('50%'),
  },
  container: {
    height: hp('50%'),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
  musicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  musicTitle: {
    fontSize: 16,
    color: '#000',
  },
  playStopText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
});

export default MusicMenu;