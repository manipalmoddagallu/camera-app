const { StyleSheet, Dimensions, } = require('react-native');
const { widthPercentageToDP: wp, heightPercentageToDP: hp } = require('react-native-responsive-screen');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const { COLOR } = require('../../utils/Config');

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
  },
  mainImageView: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: 'contain',
    // aspectRatio: 16 / 9, // aspect ratio resolutions: 1920x1080, 3840x2160 (Full HD, 4K UHD).
    // aspectRatio: 4 / 3, // Traditional aspect ratio used by older digital cameras and some smartphone
    // aspectRatio: 1 / 1, // Used for square photos, popularized by platforms like Instagram.
  },
  allMenuView: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    flex: 1,
  },
  modalOverlay2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDragView: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
  },
  // New styles for selected friends
  selectedFriendsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 1000, // Ensure it's on top of other elements
  },
    selectedFriendItemHighlight: {
    borderColor: 'yellow',
    borderWidth: 2,
  },
  selectedFriendItem: {
    backgroundColor: COLOR.GREEN,
    borderRadius: hp('1%'),
    padding: hp('0.5%'),
    margin: hp('0.5%'),
  },
  selectedFriendText: {
    color: '#fff',
    fontSize: hp('2%'),
  },
   selectedOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  selectedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
    margin: 2,
  },
  selectedItemText: {
    color: '#000',
    fontSize: 14,
  },
  addTextButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#fff',
  },
  deleteTextButton: {
  backgroundColor: 'red',
  padding: 10,
  borderRadius: 5,
  alignItems: 'center',
  justifyContent: 'center',
},
deleteTextButtonText: {
  color: 'white',
  fontWeight: 'bold',
},
playbackSpeedButton: {
    position: 'absolute',
    right: 10, // Adjust this value to position it above the middle menu
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor :'#4CBB17',
    justifyContent : "center"
  },
  playbackSpeedButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  musicSpeedButton: {
    backgroundColor: '#FF4081',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicSpeedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
pipOuterContainer: {
    padding: 20,
  },
  pipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipIcon: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pipIconTopLeft: {
    top: -15,
    left: -15,
  },
  pipIconTopRight: {
    top: -15,
    right: -15,
  },
  pipIconBottomLeft: {
    bottom: -15,
    left: -15,
  },
  pipIconBottomRight: {
    bottom: -15,
    right: -15,
  },



  pipOptionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pipOptionButton: {
    alignItems: 'center',
    flex: 1,
  },
  pipOptionText: {
    color: 'white',
    marginVertical: 5,
  },
  sliderContainer: {
    alignItems: 'center',
    flex: 1,
  },
  sliderLabel: {
    color: 'white',
    marginBottom: 5,
  },
selectionModeOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 10,
  alignItems: 'center',
},
selectionModeText: {
  color: 'white',
  fontSize: 16,
  marginBottom: 10,
},
selectionModeButton: {
  backgroundColor: 'white',
  padding: 10,
  borderRadius: 5,
},
selectionModeButtonText: {
  color: 'black',
  fontSize: 14,
},
selectedFriendItemHighlight: {
  borderColor: 'yellow',
  borderWidth: 2,
},


deleteButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 25,
  },
  deleteButtonIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
});
export default styles;