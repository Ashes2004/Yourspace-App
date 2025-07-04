import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
const OtherProfile = () => {
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(null);
  const [followEmail, setFollowEmail] = useState(null);

  const [isDisabled, setDisabled] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();
  const { otherProfile } = useLocalSearchParams();
  const [menuVisible, setMenuVisible] = useState(false);
  useEffect(() => {
    const getEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("Email");
       if(storedEmail === otherProfile)
       {
        router.replace("/(tabs)/profile");
       }
     

      const UserId = await AsyncStorage.getItem("UserId");

      setEmail(storedEmail);
      setFollowEmail(otherProfile);
      setUserID(UserId);
    };

    getEmail();
  }, []);

  const fetchUserData = async () => {
    if (!followEmail) return;

    try {
      const response = await fetch(
        "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user/mail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: followEmail }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (
          data?.followers?.some(
            (follower) => follower._id.toString() === userID
          )
        ) {
          setDisabled(true);
        }
      } else {
        console.error("Error fetching user data", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!email || !user) return;

    try {
      const response = await fetch(
        "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user/follow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userEmail: email, followEmail: followEmail }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();

        const notification = await fetch(
          "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/notification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sentUser: updatedUser.user._id,
              receiveUser: user._id,
              text: " started following you",
            }),
          }
        );
       

        if (notification.ok) {
          console.log("notification sent successfully");
        } else {
          console.log("notification sent falied");
        }

        setRefresh((prev) => !prev);
      } else {
        console.error("Error following/unfollowing user", response.statusText);
      }
     
    } catch (error) {
      console.error("Error following/unfollowing user", error);
    }
  };
  const handleUnFollow = async () => {
    if (!email || !user) return;

    try {
      const response = await fetch(
        "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user/unfollow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: email,
            unfollowEmail: followEmail,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setRefresh((prev) => !prev);
        setMenuVisible(false);
        setDisabled(false);
      } else {
        console.error("Error following/unfollowing user", response.statusText);
      }
    } catch (error) {
      console.error("Error following/unfollowing user", error);
    }
  };

  useEffect(() => {
    if (email) {
      fetchUserData();
    }
  }, [email, refresh]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!user) {
    return <Text>Error: User not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.unfollowButton}
              onPress={handleUnFollow}
            >
              <Text style={styles.unfollowText}>Unfollow</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
          <TouchableOpacity
            style={styles.statsItem}
            onPress={() =>
              router.push(`/pages/Profile/follower/${otherProfile}`)
            }
          >
            <Text style={styles.statsNumber}>{user?.followers?.length}</Text>
            <Text style={styles.statsLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statsItem}
            onPress={() =>
              router.push(`/pages/Profile/follower/${otherProfile}`)
            }
          >
            <Text style={styles.statsNumber}>{user?.following?.length}</Text>
            <Text style={styles.statsLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.username}>{user.name}</Text>
        <Text style={styles.bioText}>{user.bio}</Text>

        {isDisabled ? (
          <TouchableOpacity
            style={styles.followDisableButton}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.followButtonText}>Following</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Posts</Text>

      <FlatList
        data={user.posts}
        keyExtractor={(item) => item._id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postContainer}
            onPress={async () => {
              await AsyncStorage.setItem("PostId", item._id);
              router.push(`/pages/Posts/${item._id}`);
            }}
          >
            {item?.content?.includes(".mp4") ? (
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
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  followButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  followDisableButton: {
    backgroundColor: "#1F509A",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
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
  unfollowButton: {
    padding: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
  },
  unfollowText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default OtherProfile;
