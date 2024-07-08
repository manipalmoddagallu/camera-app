import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import {COLOR, FONT, FONT_SIZE} from '../../../utils/Config';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {images} from '../../../assets/images/image';
import {hashtags} from '../../../utils/DemoData';

const HashtagModal = props => {
  const [searchText, setSearchText] = useState('');
  const [filteredHashtags, setFilteredHashtags] = useState(hashtags);
  const {selectedHashtagNames, setSelectedHashtagNames} = props;

  useEffect(() => {
    searchHashtags();
  }, [searchText]);

  const toggleHashtagSelection = (id, title) => {
  const isSelected = props.selectedHashtags.includes(id);

  if (isSelected) {
    props.setSelectedHashtags(prevSelected =>
      prevSelected.filter(selectedId => selectedId !== id),
    );
    props.setSelectedHashtagNames(prevNames =>
      prevNames.filter(hashtag => hashtag.id !== id),
    );
  } else {
    props.setSelectedHashtags(prevSelected => [...prevSelected, id]);
    props.addHashtag(id, title);
  }
};

  const searchHashtags = () => {
    if (searchText !== '') {
      const filtered = hashtags.filter(hashtag =>
        hashtag.title.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredHashtags(filtered);
    } else {
      setFilteredHashtags(hashtags);
    }
  };

  return (
    <Modal
      isVisible={props.hashtagModal}
      style={{margin: 0}}
      animationIn={'slideInUp'}
      swipeDirection={'down'}
      onBackButtonPress={() => props.setHashtagModal(false)}
      onBackdropPress={() => props.setHashtagModal(false)}
      onSwipeComplete={() => props.setHashtagModal(false)}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ImageBackground
          source={images.BG}
          imageStyle={styles.backGroundImage}
          style={styles.mainView}>
          <View style={{padding: hp('1.5%')}}>
            {/* Done Button for close the model */}
            {props.selectedHashtags?.length > 0 && (
              <TouchableOpacity
                onPress={() => props.setHashtagModal(false)}
                style={{
                  backgroundColor: '#4CBB17',
                  width: wp(15),
                  height: hp(5),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: hp(1.5),
                  alignSelf: 'flex-end',
                }}>
                <Text
                  style={{
                    color: '#000',
                    fontSize: hp(2),
                  }}>
                  Done
                </Text>
              </TouchableOpacity>
            )}
            {/* Heading */}
            <Text style={styles.heading}>Hash-Tags</Text>
            {/* Search Input */}
            <View style={styles.searchView}>
              <Image
                source={images.searchIcon}
                style={{
                  width: wp('6%'),
                  height: wp('6%'),
                  resizeMode: 'contain',
                  tintColor: '#000',
                }}
              />
              <TextInput
                placeholder="Search hashtag....."
                placeholderTextColor={'#000'}
                style={styles.input}
                value={searchText}
                onChangeText={val => {
                  setSearchText(val);
                }}
              />
            </View>
            {/* Content View */}
            <ScrollView
              style={{flexGrow: 1, marginTop: hp('3%'), maxHeight: hp('40%')}}>
              <FlatList
                data={filteredHashtags}
                numColumns={2}
                renderItem={({item}) => {
                  const isSelected = props.selectedHashtags.includes(item.id);

                  return (
                    <TouchableOpacity
                      onPress={() => toggleHashtagSelection(item.id, item.title)}
                      style={{
                        borderColor: isSelected ? '#fff' : '#000',
                        borderWidth: hp('0.1%'),
                        borderRadius: hp('1.5%'),
                        padding: hp('1.5%'),
                        marginRight: hp('1%'),
                        marginBottom: hp('1%'),
                        backgroundColor: isSelected
                          ? COLOR.GREEN
                          : 'transparent',
                      }}>
                      <Text
                        style={{
                          color: isSelected ? '#fff' : '#000',
                          fontSize: hp('2%'),
                        }}>
                        #{item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </ScrollView>
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

export default HashtagModal;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#fff',
    width: '100%',
    overflow: 'hidden',
    borderTopRightRadius: hp('2%'),
    borderTopLeftRadius: hp('2%'),
  },
  backGroundImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  heading: {
    color: '#000',
    fontSize: FONT_SIZE.F_22,
    fontWeight: 'bold',
    fontFamily: FONT.EXTRA_BOLD,
    textAlign: 'center',
    marginVertical: hp('2%'),
  },
  searchView: {
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: hp('1%'),
    borderRadius: hp('1.5%'),
    borderColor: '#000',
    borderWidth: hp('0.1%'),
  },
  input: {
    color: '#000',
    fontSize: hp('2.3%'),
    width: '90%',
  },
});