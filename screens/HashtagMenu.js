// HashtagMenu.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { hashtags } from './utils/DemoData'; // Import the hashtags from your data file

const HashtagMenu = ({ onSelectHashtag, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState([]);

  const filteredHashtags = hashtags.filter(hashtag =>
    hashtag.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleHashtag = (hashtag) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(selectedHashtags.filter(h => h !== hashtag));
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  const renderHashtag = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.hashtagItem,
        selectedHashtags.includes(item) && styles.selectedHashtag
      ]}
      onPress={() => toggleHashtag(item)}
    >
      <Text style={styles.hashtagText}>#{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Hashtags</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search hashtags"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredHashtags}
        renderItem={renderHashtag}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
      />
      <TouchableOpacity style={styles.doneButton} onPress={() => {
        onSelectHashtag(selectedHashtags);
        onClose();
      }}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('50%'),
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  hashtagItem: {
    margin: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedHashtag: {
    backgroundColor: '#007AFF',
  },
  hashtagText: {
    color: '#000',
  },
  doneButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HashtagMenu;