import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUDINARY_URL = 'your cloudinary url'; 
const CLOUDINARY_UPLOAD_PRESET = 'add preset name'; 

const AddPost = () => {
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  
  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission Denied: You need to grant permission to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const { uri, type } = result.assets[0];
      setSelectedMedia(uri);
      setMediaType(type?.includes('video') ? 'video' : 'image');
    }
  };

  const uploadMediaToCloudinary = async (uri) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
      name: mediaType === 'video' ? 'video.mp4' : 'image.jpg',
    });

    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (response.ok) {
        return result.secure_url;
      } else {
        throw new Error(result.error?.message || 'Failed to upload media');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media.');
      return null;
    }
  };

  // Function to handle post submission
  const handlePost = async () => {
    if (!caption || !selectedMedia) {
      alert('Error: Please add media and a caption.');
      return;
    }

    setLoading(true);

    const mediaUrl = await uploadMediaToCloudinary(selectedMedia);
    
    if (mediaUrl) {
      try {
        const email = await AsyncStorage.getItem('Email');
        if (!email) {
          alert('Error: Email not found.');
          setLoading(false);
          return;
        }

        const response = await fetch('https://your-backend-api.com/api/Post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            caption,
            content: mediaUrl,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          alert('Success: Your post has been added!');
          setCaption('');
          setSelectedMedia(null);
          setMediaType(null);
          router.replace('/(tabs)/Home');
        } else {
          throw new Error(result.message || 'Failed to add post');
        }
      } catch (error) {
        console.error('Error adding post:', error);
        Alert.alert('Error', 'Failed to add post.' + error);
      }
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a New Post</Text>

      {/* Media Preview or Placeholder */}
      <TouchableOpacity onPress={pickMedia} style={styles.mediaContainer}>
        {selectedMedia ? (
          mediaType === 'video' ? (
            <Video
              source={{ uri: selectedMedia }}
              style={styles.mediaPreview}
              resizeMode='cover'
              shouldPlay={false}
            />
          ) : (
            <Image source={{ uri: selectedMedia }} style={styles.mediaPreview} />
          )
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Text style={styles.mediaPlaceholderText}>Tap to Select an Image or Video</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption Input */}
      <TextInput
        style={styles.captionInput}
        placeholder="Write a caption..."
        placeholderTextColor="#888"
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      {/* Add Post Button */}
      <TouchableOpacity style={styles.button} onPress={handlePost}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0056A8',
    marginBottom: 20,
  },
  mediaContainer: {
    width: '90%',
    height: 250,
    borderRadius: 15,
    backgroundColor: '#D6EAF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#87CEFA',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  mediaPlaceholderText: {
    fontSize: 16,
    color: '#0056A8',
  },
  captionInput: {
    width: '90%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#0056A8',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0056A8',
    width: '60%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPost;
