import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Navbar = () => {
  const [unseenCount, setUnseenCount] = useState(0); // State to store the count
  const router = useRouter();

  // Fetch notifications and count unseen notifications
  useEffect(() => {
    const fetchUnseenNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem('UserId');
        const response = await fetch(
          "https://your-backend-api.com/api/notification"
        );
        const responseData = await response.json();
        if (responseData.success && Array.isArray(responseData.data)) {
          const filteredNotifications = responseData.data.filter((notification) => notification.receiveUser._id === userId);
          const unseen = filteredNotifications.filter((notif) => !notif.isSeen);
          setUnseenCount(unseen.length); 
        } else {
          console.error("Invalid API response format");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchUnseenNotifications();
  }, []); // Only fetch on initial render

  return (
    <View style={styles.navbar}>
      <Text style={styles.title}>Yourspace</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => router.push("/pages/Profile/searchUser")}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/pages/Posts/addpost")}>
          <Ionicons name="add-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/pages/Notification/notification")}>
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {unseenCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unseenCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 120,
  },
  notificationIcon: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Navbar;
