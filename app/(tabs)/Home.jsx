import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Button,
  Alert,
} from "react-native";
import Navbar from "../components/Navbar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, ResizeMode } from "expo-av";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
const Home = () => {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [CurrentUserId, setCurrentUserId] = useState("");
  const router = useRouter();
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);

  const isVideo = (url) => /\.(mp4|mov|webm|avi|mkv)$/i.test(url);

  const videoRefs = useRef({});
  const fetchUserData = async () => {
    if (isOffline) return;
    const email = await AsyncStorage.getItem("Email");
    try {
      const response = await fetch(
        "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user/mail",
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
        await AsyncStorage.setItem("UserId", data._id);
        await AsyncStorage.setItem("Email", data.email);
        setCurrentUserId(data._id);
      } else {
        router.replace("/auth/login");
      }
    } catch (error) {
      router.replace("/auth/login");
      console.error("Error fetching user data:", error);
    }
  };

  const fetchPosts = async () => {
    if (isOffline) return;
    try {
      const response = await fetch(
        "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post"
      );
      const data = await response.json();
      const formattedPosts = data.map((post) => ({
        id: post._id,
        user: {
          id: post.User._id,
          name: post.User.name,
          email: post.User.email,
          profilePicture: post.User.profilePicture,
        },
        content: post.content,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        liked: false,
      }));
      setPosts(formattedPosts);
    } catch (error) {
      alert("Unable to fetch posts");
      setLoading(false);
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlay = (videoId) => {
    if (activeVideo && videoId !== activeVideo) {
      videoRefs.current[activeVideo]?.pauseAsync();
    }
    setActiveVideo(videoId);
  };
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
      if (state.isConnected) {
        fetchPosts();
        fetchUserData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      
      return () => {
       
        if (activeVideo) {
          videoRefs.current[activeVideo]?.pauseAsync();
          setActiveVideo(null);
        }
      };
    }, [activeVideo])
  );

  if (isOffline) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "#ff4d4f",
            textAlign: "center",
            fontWeight: "600",
            marginBottom: 10,
          }}
        >
          Oops! You're Offline
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#555555",
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          Please check your internet connection to continue using the app.
        </Text>
      </View>
    );
  }

  const handleRefresh = async () => {
    if (!isOffline) {
      setRefreshing(true);
      await fetchPosts();
      setRefreshing(false);
    }
  };

  const handleLike = async (id) => {
    const User = await AsyncStorage.getItem("UserId");

    try {
      const response = await fetch(
        `https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post/${id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: User,
          }),
        }
      );

      if (response.ok) {
        const resp = await response.json();
        console.log(resp);
        console.log(User);

        if (resp.User != User) {
          const notification = await fetch(
            "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/notification",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sentUser: User,
                receiveUser: resp.User,
                text: " liked  your post ❤️      ",
                post: resp._id,
              }),
            }
          );

          if (notification.ok) {
            console.log("notification sent successfully");
          } else {
            console.log("notification sent falied");
          }
        }

        handleRefresh();
      } else {
        console.error("Failed to like", response);
      }
    } catch (error) {
      console.error("Error submitting like ", error);
    }
  };
  const handleUnLike = async (id) => {
    const User = await AsyncStorage.getItem("UserId");

    try {
      const response = await fetch(
        `https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post/${id}/unlike`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: User,
          }),
        }
      );

      if (response.ok) {
        handleRefresh();
      } else {
        console.error("Failed to unlike", response);
      }
    } catch (error) {
      console.error("Error submitting unlike ", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const User = await AsyncStorage.getItem("UserId");
    console.log(User + selectedPost._id);

    try {
      const response = await fetch(
        `https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post/${selectedPost._id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: User,
            text: newComment.trim(),
          }),
        }
      );

      if (response.ok) {
        console.log("add comment fetch data id:", selectedPost._id);
        const resp = await response.json();
        console.log(resp);
        console.log(User);
        if (resp.User != User) {
          const notification = await fetch(
            "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/notification",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sentUser: User,
                receiveUser: resp.User,
                text: " commented on your post  ",
                post: resp._id,
              }),
            }
          );
        }
        fetchPostData(selectedPost);
        setNewComment("");
      } else {
        console.error("Failed to add comment", response);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleDeleteComment = async (id) => {
    console.log("comment id : ", id);
    console.log(selectedPost._id);

    try {
      const response = await fetch(
        `https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post/${selectedPost._id}/comments/${id}`,
        { method: "DELETE" }
      );
      fetchPostData(selectedPost);
      if (response.ok) {
      } else {
        Alert.alert("Error", "Failed to delete the comment.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const fetchPostData = async (post) => {
    try {
      const postID = post._id ? post._id : post.id;

      const response = await fetch(
        `https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post/${postID}`
      );

      if (response.ok) {
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
      } else {
        console.error("Failed to fetch post data");
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  };
  const openModal = async (post) => {
    fetchPostData(post);

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPost(null);
    handleRefresh();
  };

  return (
    <View style={styles.container}>
      <Navbar />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          style={{ marginTop: 6 }}
          data={posts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <TouchableOpacity
                style={styles.header}
                onPress={async () => {
                  const email = await AsyncStorage.getItem("Email");
                  if (email === item.user.email) {
                    router.push("/(tabs)/profile");
                  } else {
                    router.push(
                      `/pages/Profile/otherProfile/${item.user.email}`
                    );
                  }
                }}
              >
                <Image
                  source={{ uri: item.user.profilePicture }}
                  style={styles.avatar}
                />
                <Text style={styles.user}>{item.user.name}</Text>
              </TouchableOpacity>

              {isVideo(item.content) ? (
                <Video
                  ref={(ref) => {
                    videoRefs.current[item.content] = ref;
                  }}
                  style={styles.postImage}
                  source={{ uri: item.content }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isPlaying) {
                      handleVideoPlay(item.content);
                    }
                  }}
                />
              ) : (
                <Image
                  source={{ uri: item.content }}
                  style={styles.postImage}
                />
              )}

              <Text style={styles.content}>{item.caption}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => {
                    if (
                      item?.likes?.some(
                        (like) => like?.user?._id === CurrentUserId
                      )
                    ) {
                      handleUnLike(item.id);
                    } else {
                      handleLike(item.id);
                    }
                  }}
                  style={
                    item?.likes?.some(
                      (like) => like?.user?._id === CurrentUserId
                    )
                      ? styles.actionAlreadyLikedButton
                      : styles.actionButton
                  }
                >
                  <Text style={styles.actionText}>
                    {item?.likes?.some(
                      (like) => like?.user?._id === CurrentUserId
                    )
                      ? "❤️ You Liked"
                      : "👍 Like"}{" "}
                    ({item.likes.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openModal(item)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>
                    💬 Comments ({item.comments.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Button title="Close" onPress={closeModal} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "medium",
              textAlign: "center",
              margin: 15,
            }}
          >
            Comments
          </Text>
          <View style={{ marginBottom: 10 }} />
          {selectedPost && (
            <>
              {selectedPost?.comments?.length != 0 ? (
                <FlatList
                  data={selectedPost.comments}
                  keyExtractor={(comment, index) =>
                    `${selectedPost.id}-comment-${index}`
                  }
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginVertical: 8,
                      }}
                    >
                      <Image
                        source={{ uri: item?.user?.profilePicture }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          marginRight: 10,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 14,
                            color: "#333",
                          }}
                        >
                          {item?.user?.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#555",
                            marginTop: 2,
                          }}
                        >
                          {item.text}
                        </Text>
                      </View>
                      {item?.user?._id === CurrentUserId && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(item._id)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            backgroundColor: "#ff5252",
                            borderRadius: 5,
                            alignSelf: "center",
                            marginLeft: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              ) : (
                <Text style={{ textAlign: "center" }}>
                  No comments available
                </Text>
              )}

              <TextInput
                placeholder="Write a comment..."
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleCommentSubmit}
              />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  user: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  postImage: {
    width: "100%",
    height: 270,
    borderRadius: 10,
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#e7f3ff",
  },
  actionAlreadyLikedButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#FFCCEA",
  },
  actionText: {
    fontSize: 14,
    color: "#007BFF",
  },
  commentSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  comment: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 14,
    marginTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  comment: {
    fontSize: 14,
    marginBottom: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 14,
    marginTop: 10,
  },
});

export default Home;
