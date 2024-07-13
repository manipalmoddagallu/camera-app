import React from 'react';
import { View, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GalleryPicker = ({ route, navigation }) => {
  const { photos, onSelectImage } = route.params;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => {
        onSelectImage(item);
        navigation.goBack();
      }}
    >
      <Image source={{ uri: item.node.image.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.node.image.uri}
        numColumns={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: wp('33%'),
    height: wp('33%'),
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default GalleryPicker;