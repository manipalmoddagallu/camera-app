import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { images } from '../../../assets/images/image';
import Video from 'react-native-video';

const PreviewModal = props => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleClose = () => {
    props.setIsPreview(false);
    props.setSnapShotImg('');
  };

  return (
    <Modal
      isVisible={props.isPreview}
      backdropOpacity={0}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}>
      <View style={styles.container}>
        <ImageBackground
          source={images.BG}
          imageStyle={styles.BgImage}
          style={styles.bgView}>
          <Text style={styles.headingText}>
            {props.editedVideo ? 'Preview Video' : 'Preview Image'}
          </Text>
          <View style={styles.contentView}>
            {props.editedVideo ? (
              <Video
                source={{ uri: props.editedVideo }}
                style={styles.videoStyle}
                resizeMode="cover"
                repeat={false}
                paused={isVideoPlaying}
                onEnd={() => setIsVideoPlaying(true)}
              />
            ) : (
              <Image
                source={{ uri: props.imageUrl }}
                style={styles.imageStyle}
              />
            )}
          </View>
          <View style={styles.controlsContainer}>
            {props.editedVideo && (
              <TouchableOpacity
                onPress={() => setIsVideoPlaying(!isVideoPlaying)}
                style={styles.playPauseButton}>
                <Image
                  source={isVideoPlaying ? images.playButton : images.pause}
                  style={styles.playPauseIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  BgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: hp(1.5),
  },
  bgView: {
    width: '100%',
    borderRadius: hp(1.5),
    overflow: 'hidden',
    padding: hp(2),
  },
  headingText: {
    color: '#000',
    fontSize: hp(3),
    textAlign: 'center',
    marginBottom: hp(2),
  },
  contentView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  videoStyle: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  imageStyle: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  playPauseButton: {
    padding: hp(1),
  },
  playPauseIcon: {
    width: wp(13),
    height: hp(8),
    resizeMode: 'contain',
  },
});

export default PreviewModal;