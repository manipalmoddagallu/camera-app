import React, { useRef, useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  View,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { FILTERS } from './utils/Filters';
import { images } from './assets/images/image';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Config, { FONT, COLOR, FONT_SIZE } from './utils/Config';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const Layout_Screen = ({ route }) => {
  const { selectedImage, rotation = 0, width: imageWidth, height: imageHeight, isFrontCamera } = route.params || {};
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [imageUri, setImageUri] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const extractedUri = useRef(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (isFocused && selectedImage) {
      console.log('Received selectedImage in Layout_Screen:', selectedImage);
      console.log('Image dimensions:', { width: imageWidth, height: imageHeight });
      console.log('Is front camera:', isFrontCamera);
      console.log('Rotation:', rotation);
      setImageUri(selectedImage);
      extractedUri.current = selectedImage;
    }
  }, [isFocused, selectedImage, imageWidth, imageHeight, isFrontCamera, rotation]);

  const onExtractImage = ({ nativeEvent }) => {
    console.log('Extracted URI:', nativeEvent.uri);
    extractedUri.current = nativeEvent.uri;
  };

  const onSelectFilter = index => {
    setSelectedIndex(index);
  };

  const handleNext = () => {
    const imageToPass = selectedIndex === 0 ? imageUri : extractedUri.current;
    navigation.navigate('EditingScreen', {
      media: { uri: imageToPass, type: 'photo' },
      rotation: rotation, // Add this line
      filterIndex: selectedIndex,
      originalImageUri: imageUri,
    });
  };

  const renderFilterComponent = ({ item, index }) => {
    const FilterComponent = item.filterComponent;
    const image = (
      <Image
        style={[styles.filterSelector, { rotate: imageRotation }]}
        source={{ uri: imageUri }}
        resizeMode={'contain'}
      />
    );
    return (
      <TouchableOpacity
        onPress={() => onSelectFilter(index)}
        style={styles.filterItem}>
        <FilterComponent
          image={image}
          style={styles.filterImage}
          onExtractImage={onExtractImage}
        />
        <Text style={styles.filterName}>{item?.title}</Text>
      </TouchableOpacity>
    );
  };

  const SelectedFilterComponent = FILTERS[selectedIndex].filterComponent;

  // Calculate aspect ratio and image dimensions


  if (isFrontCamera) {
    // For front camera, always rotate 90 degrees clockwise
    displayHeight = screenWidth * 0.9; // 90% of screen width
    displayWidth = displayHeight / aspectRatio;
    imageRotation = '270deg';
    imageScale = -1; // Mirror the image horizontally
  } else {
    // For back camera, use the original rotation logic
    displayWidth = screenWidth * 0.9; // 90% of screen width
    imageRotation = `${rotation}deg`;
    imageScale = 1; // No mirroring
  }

  const renderImage = () => (
    <View style={styles.imageContainer}>
      <Image
        style={[
          styles.image,
          {            transform: [
              { rotate: imageRotation },
              { scaleX: imageScale },
            ],
          },
        ]}
        source={{ uri: imageUri }}
        resizeMode={'contain'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {imageUri ? (
        selectedIndex === 0 ? (
          renderImage()
        ) : (
          <SelectedFilterComponent
            onExtractImage={onExtractImage}
            extractImageEnabled={true}
            image={renderImage()}
          />
        )
      ) : (
        <Text style={styles.noImageText}>
          No image found. Please capture or select an image.
        </Text>
      )}

      <ImageBackground
        style={styles.backgroundImage}
        source={images.BG}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Filters</Text>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={FILTERS}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.flatListContainer}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderFilterComponent}
          ListFooterComponent={() => <View style={styles.listFooter} />}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  upperContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerContent: {
    flex: 1,
  },
  imageContainer: {
    width: wp('90%'),
    height: hp('50%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: wp('90%'),
    height: hp('50%'),
    alignSelf: 'center',
  },
  filterSelector: {
    width: wp('25%'),
    height: hp('10%'),
    padding: hp('1%'),
  },
  filterItem: {
    width: wp(25),
    margin: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterImage: {
    resizeMode: 'contain',
    width: wp(25),
    height: hp('10%'),
  },
  filterName: {
    color: '#000',
    fontSize: hp(2.3),
    marginTop: hp(0.4),
    fontWeight: '500'
  },
  noImageText: {
    alignSelf: 'center',
    textAlign: 'center',
    color: '#666',
    fontSize: hp(2.5),
  },
  backgroundImage: {
    flex: 1,
    width: wp('100%'),
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    resizeMode: 'contain',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp('100%'),
    borderBottomWidth: hp('0.3%'),
    padding: hp('1%'),
  },
  headerText: {
    color: '#000000',
    fontFamily: FONT.BOLD,
    fontSize: FONT_SIZE.F_23,
  },
  nextButton: {
    backgroundColor: '#000',
    width: wp('20%'),
    height: hp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: hp('1.5%'),
  },
  nextButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
  },
  columnWrapper: {
    justifyContent: 'space-around',
  },
  flatListContainer: {
    flexGrow: 1,
  },
  listFooter: {
    height: hp(2),
  },
});

export default Layout_Screen;