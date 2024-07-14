import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
</View>
 );
};
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: 'white',
padding: 10,
 },
searchBar: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 10,
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
});
export default LocationMenu;