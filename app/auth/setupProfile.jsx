import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileSetup = () => {
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const CLOUDINARY_URL = 'your assest url ';
  const CLOUDINARY_UPLOAD_PRESET = 'add your preset name here';
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to grant permission to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (uri) => {
    const data = new FormData();
    try {
      data.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Image URL:', result.secure_url);
        return result.secure_url;
      } else {
        throw new Error(result.error?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleContinue = async () => {
    if (!profileImage || !bio.trim()) {
      Alert.alert('Error', 'Please add a profile photo and write a bio.');
      return;
    }

    setLoading(true);

    const imageUrl = await uploadImageToCloudinary(profileImage);

    if (imageUrl) {
      try {
        const email = await AsyncStorage.getItem('Email');

        if (!email) {
          Alert.alert('Error', 'Email not found.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          'https://your-backend-api.com/api/user/update',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              name,
              bio,
              profilePicture: imageUrl,
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          Alert.alert('Success', 'Profile setup complete!');
          router.push('/(tabs)/Home');
        } else {
          throw new Error(result.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile.');
      }
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Your Profile</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Tap to Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.bioInput}
        placeholder="Write your name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.bioInput}
        placeholder="Write a short bio..."
        placeholderTextColor="#888"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 20,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6C757D',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#6C757D',
  },
  bioInput: {
    width: '90%',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#6C757D',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#343A40',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
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

export default ProfileSetup;
