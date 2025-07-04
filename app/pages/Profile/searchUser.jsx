import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const UserSearch = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const router = useRouter();
  useEffect(() => {

    const fetchUsers = async () => {
      try {
        const response = await fetch("https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user"); 
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on the search query
  useEffect(() => {
    if (query.trim()) {
      const results = users.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(results);
    } else {
      setFilteredUsers([]);
    }
  }, [query, users]);

  // Render individual user item
  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={async()=>{
         const userId = await AsyncStorage.getItem('UserId'); 
         console.log(userId);
         
        if(item._id === userId)
        {
            router.replace('/(tabs)/profile');
            
        }else{
            router.replace(`/pages/Profile/otherProfile/${item.email}`)
        }
    }}>
      <Image source={{ uri: item.profilePicture }} style={styles.profilePic} />
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users by name..."
        value={query}
        onChangeText={setQuery}
      />
      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
        />
      ) : (
        query.trim() && <Text style={styles.noResults}>No users found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    color: "#333",
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
});

export default UserSearch;
