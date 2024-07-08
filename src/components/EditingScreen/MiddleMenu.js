import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {images} from '../../assets/images/image';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import TextOverlayModal from './Modals/TextOverlayModal';
import {COLOR} from '../../utils/Config';
import ColorPicker from 'react-native-wheel-color-picker';

const textStyleItems = [
  {label: 'Add Text', value: 'addText', icon: images.TextBox},
  {label: 'Bold', value: 'bold', icon: images.Bold},
  {label: 'Italic', value: 'italic', icon: images.Italic},
  {label: 'Underline', value: 'underline', icon: images.Underline},
  {label: 'Uppercase', value: 'uppercase', icon: images.Uppercase},
  {label: 'Lowercase', value: 'lowercase', icon: images.Lowercase},
  {label: 'Color', value: 'colored', icon: images.Paint},
];

const MiddleMenu = props => {
  const [isColorVisible, setIsColorVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');

  const applyTextStyle = (style, val) => {
    if (style === 'addText') {
      props.handleAddText();
      return;
    }

    let updatedStyles;
    
    if (style === 'uppercase') {
      // Remove 'lowercase' style if it exists and add 'uppercase' style
      updatedStyles = [
        ...props.selectedTextStyle.filter(item => item.name !== 'lowercase'),
        { name: style, value: val }
      ];
    } else if (style === 'lowercase') {
      // Remove 'uppercase' style if it exists and add 'lowercase' style
      updatedStyles = [
        ...props.selectedTextStyle.filter(item => item.name !== 'uppercase'),
        { name: style, value: val }
      ];
    } else {
      // Toggle other styles
      updatedStyles = props.selectedTextStyle.some(
        item => item.name === style
      )
        ? props.selectedTextStyle.filter(item => item.name !== style)
        : [...props.selectedTextStyle, { name: style, value: val }];
    }

    props.setSelectedTextStyle(updatedStyles);

    const updatedTextWithStyles = [
      ...props.textWithStyles,
      { text: props.inputText, style },
    ];
    props.setTextWithStyles(updatedTextWithStyles);
    props.setPickerVisible(false);
    if (!props.isVideo) {
      setTimeout(() => {
        props.handleSnapShot();
      }, 250);
    }
  };

  const handleColorChange = color => {
    setSelectedColor(color);
  };

  const handleTextValueChange = val => {
    const newPosition = [...props.position];
    newPosition[props.currentIndex].text = val;
    props.setPosition(newPosition);
  };

  const handlePositionChange = (itemId, newPosition) => {
    props.setPosition(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {...item, x: newPosition.x, y: newPosition.y}
          : item,
      ),
    );
  };

  return (
    <View style={styles.mainView}>
      {/* Left Icons View */}
      <View style={styles.iconViewLeft}>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => props.setFriendsModalVisiable(true)}>
          <Image source={images.Atsign} style={styles.iconImg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => {
            if (!props.isVideo) {
              if (props.position?.length > 0) {
                setTimeout(() => {
                  props.handleSnapShot();
                }, 250);
              }
            }
            props.setIsPreview(true);
          }}>
          <Image source={images.Eye} style={styles.iconImg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => props.setLocationModalVisiable(true)}>
          <Image source={images.Worldwide} style={styles.iconImg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => props.setHashtagModal(true)}>
          <Image
            source={images.Hash}
            style={{
              width: wp('7%'),
              height: hp('3%'),
              resizeMode: 'contain',
              tintColor: '#000',
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Text input  */}
      <View style={{flex: 5, height: '100%', alignItems: 'center'}}>
      </View>

      {/* Right icons View */}
      <View style={styles.iconViewRight}>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => props.handleEditImage(1)}>
          <Image source={images.Group51} style={styles.iconImg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => props.setRecordingIsiable(true)}>
          <Image source={images.Microphone} style={styles.iconImg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconView}
          onPress={() => props.setPickerVisible(true)}>
          <Image source={images.TextBox} style={styles.iconImg} />
        </TouchableOpacity>
      </View>

      {/* Modal textInput */}
      <Modal
        visible={props.isVisible}
        transparent
        onRequestClose={() => props.setIsVisible(false)}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => props.setIsVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                props.setIsVisible(false);
                if (props.position[0]?.text !== '') {
                  props.setIsDragg(true);
                }
              }}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
            <TextInput
              placeholder="Enter text here"
              placeholderTextColor="rgba(255,255,255,0.7)"
              multiline
              value={props.position[props.currentIndex]?.text}
              style={styles.modalTextInput}
              onChangeText={val => handleTextValueChange(val)}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Draggable Text View */}
      <TextOverlayModal
        isDragg={props.isDragg}
        setIsDragg={props.setIsDragg}
        text={props.inputText}
        position={props.position}
        setPosition={props.setPosition}
        getTextStyles={props.getTextStyles}
        currentIndex={props.currentIndex}
        handlePositionChange={handlePositionChange}
        handleClose={() => {
          props.setIsDragg(false);
        }}
      />

      {/* Text decoration modal */}
      <Modal
        transparent={true}
        visible={props.pickerVisible}
        onRequestClose={() => props.setPickerVisible(false)}>
        <TouchableOpacity
          style={styles.textDecorationModalContainer}
          activeOpacity={1}
          onPress={() => props.setPickerVisible(false)}>
          <View style={styles.textDecorationModalContent}>
            <FlatList
              data={textStyleItems}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    if (item.value === 'colored') {
                      props.setPickerVisible(false);
                      setIsColorVisible(true);
                    } else {
                      applyTextStyle(item.value);
                    }
                  }}
                  style={styles.textDecorationItem}>
                  <Image
                    source={item.icon}
                    style={styles.textDecorationIcon}
                  />
                  <Text style={styles.textDecorationItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Color Modal */}
      <Modal
        visible={isColorVisible}
        transparent
        onRequestClose={() => {
          setIsColorVisible(false);
          props.setPickerVisible(true);
        }}>
        <View style={styles.colorModalContainer}>
          <View style={styles.colorModalContent}>
            <ColorPicker
              color={selectedColor}
              onColorChange={handleColorChange}
              thumbSize={40}
              sliderSize={40}
              noSnap={true}
              row={false}
            />
            <TouchableOpacity
              style={styles.applyColorBtn}
              onPress={() => {
                applyTextStyle('colored', selectedColor);
                setIsColorVisible(false);
                props.setPickerVisible(true);
              }}>
              <Text style={styles.applyColorBtnText}>Apply Color</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default MiddleMenu;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: hp('1%'),
    marginTop: hp('15%'),
  },
  iconViewLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 0.5,
  },
  iconViewRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 0.5,
    top:30
  },
  iconView: {
    backgroundColor: '#4CBB17',
    width: wp(10),
    height: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: hp(10),
    marginBottom: hp(2),
  },
  iconImg: {
    width: wp(8),
    height: wp(8),
    resizeMode: 'contain',
    tintColor: '#000',
  },
  doneBtn: {
    width: wp(20),
    height: hp(6),
    backgroundColor: '#4CBB17',
    borderRadius: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: hp(2),
  },
  doneBtnText: {
    color: '#fff',
    fontSize: hp(2.5),
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)', // Changed from 'rgba(25,25,25,0.8)'
  },
  modalTextInput: {
    height: '80%',
    width: '80%',
    fontSize: hp('2.5%'),
    color: '#fff',
    placeholderTextColor: 'rgba(255,255,255,0.7)', // Added this line
  },

  textDecorationModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: hp('12%'),
  },
  textDecorationModalContent: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: hp('2%'),
    borderRadius: hp('2%'),
    width: wp('40%'),
  },
  modalContent: {
  backgroundColor: 'rgba(25,25,25,0.7)',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  height: '80%',
},
  textDecorationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: hp('1%'),
  },
  textDecorationIcon: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
    tintColor: 'white',
    marginRight: wp('2%'),
  },
  textDecorationItemText: {
    color: 'white',
    fontSize: hp('1.8%'),
  },
  colorModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: hp('12%'),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  colorModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: hp('40%'),
  },
  applyColorBtn: {
    backgroundColor: '#4CBB17',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  applyColorBtnText: {
    color: 'white',
    fontSize: hp(2),
  },
});