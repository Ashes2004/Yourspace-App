import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import NetInfo from "@react-native-community/netinfo";
const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();


    const fetchNotifications = async () => {
      if (isOffline) return;
      try {
        const userId = await AsyncStorage.getItem('UserId');
        const response = await fetch(
          "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/notification"
        );
        const responseData = await response.json();
        if (responseData.success && Array.isArray(responseData.data)) {
        
          
          const filteredNotifications = responseData.data.filter((notification) => notification.receiveUser._id === userId);
          setNotifications(filteredNotifications);
          
          const unseenNotifications = responseData.data.filter(
            (notif) => !notif.isSeen
          );
          unseenNotifications.forEach((notif) => {
            markAsSeen(notif._id);
          });
        } else {
          console.error("Invalid API response format");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

  


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);

      if (state.isConnected) {
        fetchNotifications();
      }
    });

    return () => unsubscribe();
  }, [isOffline]);
  const markAsSeen = async (notificationId) => {
    try {
      const response = await fetch(
        `https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/notification/${notificationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isSeen: true }),
        }
      );

      if (response.ok) {
       
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif._id === notificationId ? { ...notif, isSeen: true } : notif
          )
        );
      } else {
        console.error(`Failed to mark notification ${notificationId} as seen`);
      }
    } catch (error) {
      console.error(`Error updating notification ${notificationId}:`, error);
    }
  };

  const handleNotificationPress = (item) => {
    if (item.post) {
      router.push(`/pages/Posts/${item.post._id}`);
    } else {
      router.push(`/pages/Profile/otherProfile/${item.sentUser?.email}`);
    }
  };

  const renderNotificationItem = ({ item }) => {
    const { sentUser, text, post } = item;

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationItem,
          { backgroundColor: "#f9f9f9"  },
        ]}
      > 
        <Image
          source={{ uri: sentUser?.profilePicture }}
          style={styles.profilePicture}
        />
        <View style={styles.textContainer}>
          <Text style={styles.senderName}>{sentUser?.name}</Text>
          <Text style={styles.notificationText}>{text}</Text>
      
        </View>
        {post && 
           post?.content?.includes(".mp4") ? (
            <Video
              source={{ uri: post?.content }}
              style={styles.post}
              resizeMode="cover"
              shouldPlay={false}
            />
          ) : (
            <Image
            source={{ uri: post?.content }}
            style={styles.post}
          />
          )}
          
          
      
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotificationItem}
        ListEmptyComponent={
          <Text style={styles.noNotifications}>No notifications</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between', 
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 8,
  },
  post: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginLeft: 12,
    alignSelf: 'flex-end', 
  },
  textContainer: {
    flex: 1,
    flexDirection: 'col', // Ensure text is stacked vertically
  },
  senderName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
   
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
  },
  noNotifications: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
});


export default Notification;
