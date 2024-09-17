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
  const { selectedImage, rotation, width: imageWidth, height: imageHeight } = route.params || {};
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
      setImageUri(selectedImage);
      extractedUri.current = selectedImage;
    }
  }, [isFocused, selectedImage]);

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
      filterIndex: selectedIndex,
      originalImageUri: imageUri,
    });
  };

  const renderFilterComponent = ({ item, index }) => {
    const FilterComponent = item.filterComponent;
    const image = (
      <Image
        style={styles.filterSelector}
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
  const aspectRatio = imageWidth / imageHeight;
  let displayWidth, displayHeight;
  if (rotation === 90 || rotation === 270) {
    displayHeight = screenWidth * 0.9; // 90% of screen width
    displayWidth = displayHeight * aspectRatio;
  } else {
    displayWidth = screenWidth * 0.9; // 90% of screen width
    displayHeight = displayWidth / aspectRatio;
  }

  const renderImage = () => (
    <View style={styles.imageContainer}>
      <Image
        style={[
          styles.image,
          {
            width: displayWidth,
            height: displayHeight,
            transform: [{ rotate: `${rotation}deg` }],
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
  imageContainer: {
    width: wp('90%'),
    height: hp('50%'),
    marginVertical: hp('2%'),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    // width and height are now set dynamically
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
    width: '100%',
    height: '45%',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: hp(2.5),
  },
  backgroundImage: {
    width: wp('99%'),
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
    width: wp('99%'),
    borderBottomWidth: hp('0.3%'),
    padding: hp('1%'),
  },
  headerText: {
    color: '#000000',
    fontFamily: FONT.BOLD,
    fontSize: FONT_SIZE.F_23,
  },
  nextButton: {
    backgroundColor: COLOR.GREEN,
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
    columnGap: hp('1%'),
  },
  flatListContainer: {
    paddingBottom: hp('2%'),
  },
  listFooter: {
    marginBottom: hp(20),
  },
});

export default Layout_Screen;