import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FollowersFollowingPage = () => {
  const [userData, setUserData] = useState(null);
  const [currentTab, setCurrentTab] = useState('followers'); 
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { email } = useLocalSearchParams(); 
 
  
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchUserData();
    }
  }, [email]);

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userCard}  onPress={async () => {
      const email = await AsyncStorage.getItem("Email");
     
      
      if (email === item.email) {
        router.push("/(tabs)/profile");
      } else {
        router.push(
          `/pages/Profile/otherProfile/${item.email}`
        );
      }
    }}>
      <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userBio}>{item.bio}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  const dataToDisplay = currentTab === 'followers' ? userData.followers : userData.following;

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, currentTab === 'followers' && styles.activeButton]}
          onPress={() => setCurrentTab('followers')}
        >
          <Text style={[styles.toggleButtonText, currentTab === 'followers' && styles.activeText]}>
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, currentTab === 'following' && styles.activeButton]}
          onPress={() => setCurrentTab('following')}
        >
          <Text style={[styles.toggleButtonText, currentTab === 'following' && styles.activeText]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataToDisplay}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  activeButton: {
    borderBottomColor: '#2196F3',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#555',
  },
  activeText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userBio: {
    fontSize: 14,
    color: '#555',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#f00',
  },
});

export default FollowersFollowingPage;
