// Layout_Screen.js

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
} from 'react-native';
import { FILTERS } from './utils/Filters';

import { images } from './assets/images/image';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Config, { FONT, COLOR, FONT_SIZE } from './utils/Config';
import { useNavigation } from '@react-navigation/native';

const Layout_Screen = ({ route }) => {
  const { selectedImage } = route.params;
  const navigation = useNavigation();

  const [imageUri, setImageUri] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const extractedUri = useRef(null);

  useEffect(() => {
    if (selectedImage) {
      // Ensure the image path is correctly formatted for both iOS and Android
      const formattedUri = Platform.OS === 'ios' ? selectedImage : `file://${selectedImage}`;
      setImageUri(formattedUri);
      extractedUri.current = formattedUri;
    }
  }, [selectedImage]);

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
    image: imageToPass,
    filterIndex: selectedIndex,
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

  return (
    <SafeAreaView style={styles.container}>
      {selectedIndex === 0 ? (
        imageUri ? (
          <Image
            style={styles.image}
            source={{ uri: imageUri }}
            resizeMode={'contain'}
          />
        ) : (
          <Text style={styles.noImageText}>
            No image found. Please capture an image.
          </Text>
        )
      ) : (
        <SelectedFilterComponent
          onExtractImage={onExtractImage}
          extractImageEnabled={true}
          image={
            imageUri ? (
              <Image
                style={styles.image}
                source={{ uri: imageUri }}
                resizeMode={'contain'}
              />
            ) : (
              <Text style={styles.noImageText}>No image found</Text>
            )
          }
        />
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
  image: {
    width: wp('90%'),
    height: hp('50%'),
    marginVertical: hp('2%'),
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