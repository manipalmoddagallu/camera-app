import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import DraggableText from '../DraggableText';
import DraggableLocation from '../DraggableLocation';
import {COLOR} from '../../../utils/Config';
import DraggableLocationDemo from '../DraggableLocationDemo';

const TextOverlayModal = props => {
  const handleClode = () => {
    props.handleClose()
  };
  return (
    <Modal
      isVisible={props.isDragg}
      // backdropOpacity={0}
      onBackButtonPress={() => handleClode()}
      onBackdropPress={() => handleClode()}
      style={{margin: 0}}>
      <View style={styles.container}>
        {props.type === 'location' ? (
          <DraggableLocation
            text={props.text}
            NewPosition={props.NewPosition}
            NewSetPosition={props.NewSetPosition}
            currentIndex={0}
            onPositionChange={props.onPositionChange}
          />
        ) : (
          // <View style={{flex: 1}}>
          //   <DraggableLocationDemo
          //     items={props.NewPosition}
          //     onPositionChange={props.onPositionChange}
          //     handleRemoveItem={props.handleRemoveItem}
          //   />
          // </View>
          <DraggableText
            text={props.position[props.currentIndex]?.text}
            NewPosition={props.position}
            NewSetPosition={props.setPosition}
            getTextStyles={props.getTextStyles}
            currentIndex={props.currentIndex}
            onPositionChange={props.handlePositionChange}
          />
        )}
        <TouchableOpacity style={styles.doneBtn} onPress={() => props.handleClose()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default TextOverlayModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  doneBtn: {
    width: wp(20),
    height: hp(6),
    backgroundColor: '#4CBB17',
    borderRadius: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: hp(1),
  },
  doneBtnText: {
    color: '#000',
    fontSize: hp(2.5),
  },
});
