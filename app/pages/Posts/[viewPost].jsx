
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';

const ViewPost = () => {
  const { viewPost } = useLocalSearchParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('likes'); // Toggle between 'likes' and 'comments'
  const router = useRouter();
  const video = useRef(null);

  const isVideo = (url) => /\.(mp4|mov|webm|avi|mkv)$/i.test(url);

  useEffect(() => {
    const fetchPostAndUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('UserId');
        setUserId(storedUserId);

        const response = await fetch(
          `https://your-backend-api.com/api/post/${viewPost}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          console.error('Error fetching post data', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching post or user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndUser();
  }, [viewPost]);


  const handleDelete = async () => {
    if (!post) return;
    try {
      const response = await fetch(
        `https://your-backend-api.com/api/post/${post._id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        Alert.alert('Success', 'Post deleted successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to delete the post.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const renderUserList = () => {
    const listData = activeTab === 'likes' ? post.likes : post.comments;

    return (
      <FlatList
        data={listData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userListItem}  onPress={async () => {
            const email = await AsyncStorage.getItem("Email");
            if (email === item.user.email) {
              router.push("/(tabs)/profile");
            } else {
              router.push(
                `/pages/Profile/otherProfile/${item.user.email}`
              );
            }
          }}>
            <Image
              source={{ uri: activeTab === 'likes' ? item.user.profilePicture : item.user.profilePicture }}
              style={styles.profilePicture}
            />
            <View>
              <Text style={styles.userName}>{item.user.name}</Text>
              {activeTab === 'comments' && <Text style={styles.commentText}>{item.text}</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'likes' ? 'No likes yet' : 'No comments yet'}
          </Text>
        }
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Error: Post not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const isPostOwner = post.User._id === userId;
  return (
    <View style={styles.container}>
       <View style={styles.actions}>
        {isPostOwner && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.postContainer}>
        {isVideo(post.content) ? (
          <Video
            ref={video}
            style={styles.postMedia}
            source={{
              uri: post.content,
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        ) : (
          <Image source={{ uri: post.content }} style={styles.postMedia} />
        )}
        <Text style={styles.caption}>{post.caption}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'likes' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('likes')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'likes' && styles.activeTabText,
            ]}
          >
            Likes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'comments' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('comments')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'comments' && styles.activeTabText,
            ]}
          >
            Comments
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>{renderUserList()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  postContainer: {
    marginBottom: 20,
  },
  postMedia: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  caption: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#E53935',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ViewPost;
