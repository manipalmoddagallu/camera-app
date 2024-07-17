import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet,ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { images } from './assets/images/image';
import MapplsGL from 'mappls-map-react-native';
MapplsGL.setMapSDKKey('619e2f284f7f6cb4d3fb4d234cc8363a');
MapplsGL.setRestAPIKey('619e2f284f7f6cb4d3fb4d234cc8363a');
MapplsGL.setAtlasClientId('96dHZVzsAuuSo8KYPoo9sDGXG52w2A1cHUiW7J-Bt_Qp1opkT9GU47OZqz2-0EdeAUuonKZJqlH5NDRnDloYIg==');
MapplsGL.setAtlasClientSecret('lrFxI-iSEg9T46TDXexuvQf3eLMwgcE_6H7sme31WqZXOyN7xEmlmPS7OZ_qfLc--nEP7fLlRNmQd4pNRkpTfYjLW5_KPtiD');
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
return (
<View style={styles.container}>
<ImageBackground
          source={images.BG}
          style={styles.backgroundImage}
        >
<View style={styles.searchBar}>
<TextInput
style={styles.searchInput}
placeholder="Search location"
value={searchText}
onChangeText={setSearchText}
/>
<TouchableOpacity onPress={onClose} style={styles.closeButton}>
<Icon name="close" size={24} color="#000" />
</TouchableOpacity>
</View>
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
</ImageBackground>
</View>
 );
};
const styles = StyleSheet.create({
container: {
    height: hp('50%'),
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
searchBar: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 10,
top:10,width:380,left:20
 },
searchInput: {
flex: 1,
height: 40,
borderColor: 'gray',
borderWidth: 1,
borderRadius: 5,
paddingHorizontal: 10,
 },
closeButton: {
marginLeft: 10,
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    resizeMode: 'cover',
  },
});
export default LocationMenu;