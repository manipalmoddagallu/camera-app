// TrimScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';

const TrimScreen = ({ route }) => {
  const { video } = route.params;
  const navigation = useNavigation();
  const [trimmedVideo, setTrimmedVideo] = useState(null);

  const handleTrim = () => {
    // Implement video trimming logic here
    // For now, we'll just simulate trimming by setting the same video
    setTrimmedVideo(video);
  };

  const handleDone = () => {
    navigation.navigate('EditingScreen', { media: trimmedVideo || video });
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: video.uri }}
        style={styles.video}
        resizeMode="contain"
        controls={true}
      />
      <TouchableOpacity style={styles.button} onPress={handleTrim}>
        <Text>Trim Video</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDone}>
        <Text>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 300,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default TrimScreen;