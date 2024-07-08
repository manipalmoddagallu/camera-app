import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {images} from '../../../assets/images/image';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVModeIOSOption,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import {SoundContext} from '../../../context/SoundContext';

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordingModal = props => {
  const {
    sound,
    setSound,
    isPlaying,
    setIsPlaying,
    stopSound,
    recordSound,
    setRecordSound,
    setAudioFile
  } = useContext(SoundContext);
  const [selected, setSelected] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [timmer, setTimmer] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [allRecording, setAllRecording] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    fetchAudioFiles();
    return () => {
      if (audioRecorderPlayer) {
        audioRecorderPlayer.removePlayBackListener();
      }
    };
  }, []);

  const startRecording = async () => {
    const timestamp = new Date().getTime();
    const defaultFileName = `Socialrecording${timestamp}`;
    const outputFileName = defaultFileName;

    let path = `${RNFS.DownloadDirectoryPath}/${outputFileName}.aac`;
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVModeIOS: AVModeIOSOption.measurement,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    const meteringEnabled = false;

    try {
      const uri = await audioRecorderPlayer.startRecorder(
        path,
        audioSet,
        meteringEnabled,
      );
      setIsRecording(true);
      setTimmer(0);
      setDuration(0);
      audioRecorderPlayer.addRecordBackListener(e => {
        setTimmer(e.currentPosition);
        return;
      });
      console.log('uri', uri);
    } catch (error) {
      setIsRecording(false);
      console.log('Uh-oh! Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const result = await audioRecorderPlayer.stopRecorder();
      setAudioUrl(result);
      console.log('result', result);
      audioRecorderPlayer.removeRecordBackListener();
      setTimmer(0);
      setDuration(0);
    } catch (error) {
      setIsRecording(false);
      console.log('Oops! Failed to stop recording:', error);
    }
  };

  const onStartPlay = async (file) => {
    try {
      const path = file || audioUrl;
      setCurrentAudio(path);
      setIsPlaying(true);
      const msg = await audioRecorderPlayer.startPlayer(path);
      console.log(msg);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          onStopPlay();
        } else {
          setTimmer(e.currentPosition);
          setDuration(e.duration);
        }
      });
    } catch (error) {
      setIsPlaying(false);
      console.log('error play', error);
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setTimmer(0);
      setCurrentAudio(null);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlayPause = (file) => {
    if (isPlaying && currentAudio === file) {
      onStopPlay();
    } else {
      onStartPlay(file);
    }
  };

  const fetchAudioFiles = async () => {
    try {
      const directory = RNFS.DownloadDirectoryPath;
      const files = await RNFS.readdir(directory);
      const audioFiles = files
        .filter(file => file.includes('Socialrecording'))
        .map(file => ({
          name: file,
          path: `file://${directory}/${file}`,
        }));
      setAllRecording(audioFiles);
    } catch (error) {
      console.error('Error reading audio files: ', error);
    }
  };

  const toggleMusicSelection = item => {
    const isSelected = props.selectedMusic?.title === item.name;
    if (isSelected) {
      props.setSelectedMusic([]);
      onStopPlay();
    } else {
      if (isPlaying) {
        onStopPlay();
        setRecordSound(null)
      } else {
        if (sound) {
          setSound(null);
          setRecordSound(null);
          stopSound();
        } else {
          onStartPlay(item.path);
          const data = {
            title: item.name,
            path: item.path,
          };
          props.setSelectedMusic(data);
          setRecordSound(data)
        }
      }
    }
  };

  const handleClose = () => {
    props.setRecordingIsiable(false);
    if(recordSound){
      setAudioFile(audioRecorderPlayer)
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isVisible={props.recordingIsiable}
      style={{margin: 0}}
      animationIn={'slideInUp'}
      swipeDirection={'down'}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ImageBackground
          source={images.BG}
          imageStyle={styles.backGroundImage}
          style={styles.mainView}>
          <View style={{padding: hp('1.5%'), minHeight: hp(60)}}>
            <View style={[styles.btnWrapper, styles.rowView]}>
              <TouchableOpacity
                onPress={() => setSelected(1)}
                style={[
                  styles.rowView,
                  styles.btnView,
                  {borderBottomWidth: selected === 1 ? hp(0.5) : 0},
                ]}>
                <Image source={images.Microphone1} style={styles.icon} />
                <Text style={styles.btnText}>Record</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                onPress={() => {
                  setSelected(2);
                  fetchAudioFiles();
                }}
                style={[
                  styles.rowView,
                  styles.btnView,
                  {borderBottomWidth: selected === 2 ? hp(0.5) : 0},
                ]}>
                <Image source={images.Microphone2} style={styles.icon} />
                <Text style={styles.btnText}>Recordings</Text>
              </TouchableOpacity>
            </View>

            {selected === 1 ? (
              <View style={styles.recordingContainer}>
                <TouchableOpacity onPress={isRecording ? stopRecording : startRecording}>
                  <Image
                    source={isRecording ? images.RecordingIcon : images.Mike}
                    style={styles.recordIcon}
                  />
                </TouchableOpacity>

                <View style={styles.audioControlsContainer}>
                  <Image
                    source={images.AudioProgress}
                    style={styles.recordTimeLine}
                  />
                  <Text style={styles.timmerText}>
                    {formatTime(timmer)} / {formatTime(duration)}
                  </Text>

                  <TouchableOpacity onPress={() => togglePlayPause(audioUrl)}>
                    <Image
                      source={isPlaying && currentAudio === audioUrl ? images.pause : images.playButton}
                      style={styles.playPuseIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveBtnView}>
                    <Text style={styles.saveBtnTExt}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={allRecording}
                renderItem={({item}) => {
                  const isSelected = props.selectedMusic?.title === item.name;
                  return (
                    <TouchableOpacity
                      onPress={() => toggleMusicSelection(item)}
                      style={[
                        styles.recordingItem,
                        {backgroundColor: isSelected ? 'green' : 'transparent'},
                      ]}>
                      <View style={[styles.rowView, styles.recordingItemContent]}>
                        <Image
                          source={images.Musical}
                          style={[styles.icon, {tintColor: isSelected ? '#fff' : '#000'}]}
                        />
                        <Text style={[styles.recordingItemText, {color: isSelected ? '#fff' : '#000'}]}>
                          {`${item?.name?.substring(0, 20)}...`}
                        </Text>
                        <TouchableOpacity onPress={() => togglePlayPause(item.path)}>
                          <Image
                            source={isPlaying && currentAudio === item.path ? images.pause : images.playButton}
                            style={[styles.icon, {tintColor: isSelected ? '#fff' : '#000'}]}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#fff',
    width: '100%',
    overflow: 'hidden',
    borderTopRightRadius: hp('2%'),
    borderTopLeftRadius: hp('2%'),
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backGroundImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  icon: {
    width: wp('10%'),
    height: wp('10%'),
    resizeMode: 'contain',
    tintColor: '#000',
  },
  btnWrapper: {
    width: '100%',
    borderColor: '#000',
    borderWidth: wp('0.2%'),
    marginTop: hp('1.5%'),
    padding: hp('0.5%'),
    borderRadius: hp('1.5%'),
    justifyContent: 'space-around',
  },
  btnView: {
    width: wp('40%'),
    height: hp('7%'),
    justifyContent: 'center',
    borderBottomColor: '#000',
  },
  btnText: {
    color: '#000',
    fontSize: hp('2.5%'),
    marginLeft: hp('1%'),
  },
  divider: {
    height: hp('7%'),
    borderRightColor: '#000',
    borderRightWidth: 2,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: hp(2),
  },
  recordIcon: {
    width: wp(30),
    height: wp(30),
    resizeMode: 'contain',
  },
  audioControlsContainer: {
    marginTop: hp(2),
    alignItems: 'center',
  },
  recordTimeLine: {
    width: wp(60),
    height: hp(10),
    resizeMode: 'contain',
  },
  timmerText: {
    color: '#000',
    fontSize: hp(3),
    fontWeight: 'bold',
    marginBottom: hp(2),
  },
  playPuseIcon: {
    width: wp(20),
    height: wp(20),
    resizeMode: 'contain',
  },
  saveBtnView: {
    borderColor: '#000',
    borderWidth: hp(0.2),
    width: wp(25),
    marginVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(1),
    borderRadius: hp(1),
  },
  saveBtnTExt: {
    color: '#000',
    fontSize: hp(2.5),
  },
  recordingItem: {
    borderRadius: hp('1.5%'),
    padding: hp('1%'),
    margin: hp('1%'),
    borderColor: '#000',
    borderWidth: wp('0.5%'),
  },
  recordingItemContent: {
    justifyContent: 'space-between',
  },
  recordingItemText: {
    fontSize: hp('2.5%'),
  },
});

export default RecordingModal;