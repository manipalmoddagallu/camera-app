import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import MapplsGL from 'mappls-map-react-native';

MapplsGL.setMapSDKKey('YOUR_MAPPLS_SDK_KEY');
MapplsGL.setRestAPIKey('YOUR_MAPPLS_REST_API_KEY');
MapplsGL.setAtlasClientId('YOUR_MAPPLS_ATLAS_CLIENT_ID');
MapplsGL.setAtlasClientSecret('YOUR_MAPPLS_ATLAS_CLIENT_SECRET');

const LocationMenu = ({ onSelectLocation, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (text) => {
    try {
      const response = await MapplsGL.RestApi.autoSuggest({
        query: text,
      });
      setSuggestions(response?.suggestedLocations || []);
    } catch (error) {
      console.log('error in autosuggest', error);
    }
  };

  useEffect(() => {
    if (searchText.length > 2) {
      fetchSuggestions(searchText);
    } else {
      setSuggestions([]);
    }
  }, [searchText]);

  const handleLocationSelect = (location) => {
    onSelectLocation(location);
    onClose();
  };

  const showQuickAccess = searchText.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Location</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {showQuickAccess && (
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity style={styles.quickAccessItem} onPress={() => handleLocationSelect({ placeName: 'Home' })}>
            <Icon name="home" size={24} color="#000" />
            <Text>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAccessItem} onPress={() => handleLocationSelect({ placeName: 'Work' })}>
            <Icon name="briefcase" size={24} color="#000" />
            <Text>Work</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.eLoc}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestionItem} onPress={() => handleLocationSelect(item)}>
            <Text>{item.placeName}</Text>
            <Text style={styles.placeAddress}>{item.placeAddress}</Text>
          </TouchableOpacity>
        )}
      />
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
  searchBar: {
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  quickAccessItem: {
    alignItems: 'center',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  placeAddress: {
    fontSize: 12,
    color: 'gray',
  },
});

export default LocationMenu;