import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { images } from '../../assets/images/image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import SystemSetting from 'react-native-system-setting';
import MuteOn from '../../assets/images/MuteOn.png';
import MuteOff from '../../assets/images/MuteOff.png';

const TopMenu = (props) => {
  const [isSaveVisible, setIsSaveVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // State for mute control

  const toggleMute = () => {
    if (!isMuted) {
      SystemSetting.setVolume(0); // Mute the volume
    } else {
      SystemSetting.setVolume(1); // Unmute the volume (set to max or preferred level)
    }
    setIsMuted(!isMuted);
  };

  return (
    <View style={styles.topIconContainer}>
      <TouchableOpacity onPress={() => props.onPressBack()}>
        <Image source={images.Back} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setMusicModalVisiable(true)}>
        <Image source={images.Musical} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSaveVisible(!isSaveVisible)}>
        <Image source={images.Downloading} style={styles.icon} />
      </TouchableOpacity>
      {/* Mute Button */}
      <TouchableOpacity onPress={toggleMute}>
        <ImageBackground source={isMuted ? MuteOn : MuteOff} style={styles.muteIcon}>
          <View style={styles.overlay} />
        </ImageBackground>
      </TouchableOpacity>

      <Modal
        isVisible={isSaveVisible}
        onBackButtonPress={() => setIsSaveVisible(false)}
        onBackdropPress={() => setIsSaveVisible(false)}
        backdropOpacity={0}
        style={{ margin: 0 }}
        animationIn={'slideInDown'}
        animationOut={'slideOutUp'}
      >
        <View style={styles.downloadModalView}>
          <ImageBackground source={images.BG} style={styles.downloadModalImage}>
            <TouchableOpacity
              onPress={() => {
                setIsSaveVisible(false);
                props.onPressSave(); // Call onPressSave function here
              }}
              style={{ borderBottomColor: '#000', borderBottomWidth: hp(0.2) }}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsSaveVisible(false);
                if (props.saveDraft && typeof props.saveDraft === 'function') {
                  props.saveDraft();
                } else {
                  console.error('saveDraft is not a function');
                }
              }}
            >
  <Text style={styles.saveText}>Draft</Text>
</TouchableOpacity>
          </ImageBackground>
        </View>
      </Modal>
    </View>
  );
};

export default TopMenu;
const styles = StyleSheet.create({
  topIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  downloadModalView: {
    flex: 1,
    alignItems: 'flex-end',
    top: hp(5),
    paddingRight: hp(1),
  },
  downloadModalImage: {
    width: wp('33%'),
    borderRadius: hp(1.5),
    overflow: 'hidden',
  },
  saveText: {
    color: '#000',
    fontSize: hp(2.5),
    padding: hp(0.5),
    marginLeft: hp(1),
  },
  icon: {
    width: 30, // Adjust as per your icon size
    height: 30, // Adjust as per your icon size
    resizeMode: 'contain',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteIcon: {
    width: 30, // Adjust as per your icon size
    height: 30, // Adjust as per your icon size
    resizeMode: 'contain',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center', // Adding white background color
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust color and opacity as needed
  },
});