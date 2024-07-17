import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import Layout from './screens/LayoutScreen';
import Layout_Screen from './screens/Layout_Screen'; // Import the new Layout_Screen
import EditingScreen from './screens/EditingScreen';
import DrawingScreen from './screens/DrawingScreen';
import StickerScreen from './screens/StickerScreen';
import FilterScreen from './screens/FilterScreen';
import GalleryPicker from './screens/GalleryPicker';
import TrimScreen from './screens/TrimScreen';
import MusicMenu from './screens/MusicMenu';
import UploadScreen from './screens/UploadScreen';
import VideoCropScreen from './screens/VideoCropScreen';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Layout" 
          component={Layout} 
        />
        <Stack.Screen 
          name="Layout_Screen" 
          component={Layout_Screen}
          options={{ title: 'Photo Filters' }} // You can customize this title
        />
        <Stack.Screen name="EditingScreen" component={EditingScreen}   options={{ headerShown: false }}  />
        <Stack.Screen name="DrawingScreen" component={DrawingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StickerScreen" component={StickerScreen}options={{ headerShown: false }} />
        <Stack.Screen name="FilterScreen" component={FilterScreen}options={{ headerShown: false }} />
        <Stack.Screen name="GalleryPicker" component={GalleryPicker}options={{ headerShown: false }} />
        <Stack.Screen name="TrimScreen" component={TrimScreen} />
        <Stack.Screen name="UploadScreen" component={UploadScreen}options={{ headerShown: false }} />
        <Stack.Screen name="VideoCropScreen" component={VideoCropScreen}options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;