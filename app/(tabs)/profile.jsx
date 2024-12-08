import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Video } from "expo-av";
import NetInfo from "@react-native-community/netinfo";

const Profile = () => {
  const [user, setUser] = useState(null);
  
  const [newBio, setNewBio] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();

  const fetchUserData = async () => {
    const email = await AsyncStorage.getItem("Email");
    console.log("email: ", email);

    try {
      const response = await fetch(
        "https://your-backend-api.com/api/user/mail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setNewBio(data.bio);
      } else {
        router.replace('/auth/login');
        console.error("Error fetching user data", response.statusText);
      }
    } catch (error) {
      router.replace('/auth/login');
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    fetchUserData();

    return () => unsubscribe();
  }, []);

  if (isOffline) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#ffffff", 
        padding: 20 
      }}>
        <Text style={{ 
          fontSize: 20, 
          color: "#ff4d4f", 
          textAlign: "center", 
          fontWeight: "600", 
          marginBottom: 10 
        }}>
          Oops! You're Offline
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: "#555555", 
          textAlign: "center", 
          lineHeight: 24 
        }}>
          Please check your internet connection to continue using the app.
        </Text>
      </View>
      
    );
  }


  const handleLogout = async () => {
    await AsyncStorage.removeItem("Email");
    await AsyncStorage.removeItem("otherProfileEmail");
    router.replace("/auth/login");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Content */}
      <View style={styles.header}>
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profilePicture}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{user.totalPosts}</Text>
            <Text style={styles.statsLabel}>Posts</Text>
          </View>
          <TouchableOpacity style={styles.statsItem} onPress={()=>router.push(`/pages/Profile/follower/${user.email}`)}>
            <Text style={styles.statsNumber}>{user.followers?.length}</Text>
            <Text style={styles.statsLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsItem} onPress={()=>router.push(`/pages/Profile/follower/${user.email}`)}>
            <Text style={styles.statsNumber}>{user.following?.length}</Text>
            <Text style={styles.statsLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.username}>{user.name}</Text>
       
            <Text style={styles.bioText}>{user.bio}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/pages/Profile/EditProfile")}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
         
        
      </View>

      <Text style={styles.sectionTitle}>Posts</Text>
      <FlatList
        data={user.posts}
        keyExtractor={(item) => item._id}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postContainer}
            onPress={async () => {
              await AsyncStorage.setItem("PostId", item._id);
              router.push(`/pages/Posts/${item._id}`);
            }}
          >
            {item.content.includes(".mp4") ? (
              <Video
                source={{ uri: item.content }}
                style={styles.postImage}
                resizeMode="cover"
                shouldPlay={false}
              />
            ) : (
              <Image source={{ uri: item.content }} style={styles.postImage} />
            )}
            <Text style={styles.postCaption}>{item.caption}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 10,
  },
  menuButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    marginTop: 10,
  },
  menuLine: {
    width: 25,
    height: 3,
    backgroundColor: "#000",
    marginVertical: 2,
  },
  modalBackground: {
    flex: 1,
    height: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2196F3",
    marginRight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  statsItem: {
    alignItems: "center",
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statsLabel: {
    fontSize: 14,
    color: "#333",
  },
  bioSection: {
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  bioText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  bioEditContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bioInput: {
    flex: 1,
    borderColor: "#2196F3",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 10,
  },
  editButtonText: {
    color: "#2196F3",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  postContainer: {
    width: "30%",
    margin: "1.5%",
    alignItems: "center",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  postCaption: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
});

export default Profile;
