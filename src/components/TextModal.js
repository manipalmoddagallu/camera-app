import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Modal, StyleSheet, FlatList, AsyncStorage } from 'react-native';
import { images } from '../assets/images/image';

const TextModal = ({ selectedImage }) => {
  const [inputText, setInputText] = useState('');
  const [selectedTextStyle, setSelectedTextStyle] = useState('normal');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [savedText, setSavedText] = useState('');

  useEffect(() => {
    loadSavedText();
  }, []);

  const loadSavedText = async () => {
    try {
      const savedText = await AsyncStorage.getItem('savedText');
      if (savedText !== null) {
        setSavedText(savedText);
      }
    } catch (error) {
      console.error('Error loading saved text:', error);
    }
  };

  const saveText = async () => {
    try {
      await AsyncStorage.setItem('savedText', inputText);
      setSavedText(inputText);
    } catch (error) {
      console.error('Error saving text:', error);
    }
  };

  const deleteText = async () => {
    try {
      await AsyncStorage.removeItem('savedText');
      setSavedText('');
    } catch (error) {
      console.error('Error deleting text:', error);
    }
  };

  const textStyles = {
    normal: { fontWeight: 'normal', fontStyle: 'normal', textDecorationLine: 'none', color: 'black' },
    bold: { fontWeight: 'bold', fontStyle: 'normal', textDecorationLine: 'none', color: 'black' },
    italic: { fontWeight: 'normal', fontStyle: 'italic', textDecorationLine: 'none', color: 'black' },
    underline: { fontWeight: 'normal', fontStyle: 'normal', textDecorationLine: 'underline', color: 'black' },
    uppercase: { textTransform: 'uppercase', color: 'black' },
    lowercase: { textTransform: 'lowercase', color: 'black' },
    colored: { color: 'red' },
  };

  const textStyleItems = [
    { label: 'Normal', value: 'normal', icon: images.TextBox },
    { label: 'Bold', value: 'bold', icon: images.Bold },
    { label: 'Italic', value: 'italic', icon: images.Italic },
    { label: 'Underlined', value: 'underline', icon: images.Underline },
    { label: 'Uppercase', value: 'uppercase', icon: images.Uppercase },
    { label: 'Lowercase', value: 'lowercase', icon: images.Lowercase },
    // Add more items with images as needed
  ];

  const applyTextStyle = (style) => {
    setSelectedTextStyle(style);
    setPickerVisible(false);
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity onPress={() => applyTextStyle(item.value)} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={item.icon} style={{ width: 20, height: 20, marginRight: 10 }} />
      <Text style={{ color: 'black' }}>{item.label}</Text>
    </TouchableOpacity>
  );

  const getTransformedText = () => {
    if (selectedTextStyle === 'uppercase') {
      return inputText.toUpperCase();
    } else if (selectedTextStyle === 'lowercase') {
      return inputText.toLowerCase();
    }
    return inputText;
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setPickerVisible(true)}>
        <Image source={images.TextBox} style={{ width: 20, height: 20, marginRight: 10 }} />
      </TouchableOpacity>

      <Modal transparent={true} visible={pickerVisible} onRequestClose={() => setPickerVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <FlatList
              data={textStyleItems}
              renderItem={renderDropdownItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </Modal>

      <Text style={[styles.textOverlay, textStyles[selectedTextStyle]]}>{savedText}</Text>

      <TextInput
        style={[styles.textInput, textStyles[selectedTextStyle]]}
        placeholder="Type your text here"
        placeholderTextColor="#666"
        onChangeText={(text) => setInputText(text)}
        onBlur={saveText}
        value={getTransformedText()}
      />

      {!!savedText && (
        <TouchableOpacity onPress={deleteText} style={{ marginTop: 10 }}>
          <Text>Delete Saved Text</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TextModal;

const styles = StyleSheet.create({
  textOverlay: {
    fontSize: 18,
    marginVertical: 10,
    color: 'black',
  },
  textInput: {
    height: 40,
    width: '100%',
    marginBottom: 20,
    padding: 10,
    fontSize: 18,
    borderColor: 'gray',
    borderWidth: 1,
  },
});
