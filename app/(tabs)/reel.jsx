import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
} from "react-native";
import { Video , Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { height, width } = Dimensions.get("window");

const HorizontalSlider = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [CurrentUserId, setCurrentUserId] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [likeSound, setLikeSound] = useState(null);

  
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/music/like.mp3")
      );
      setLikeSound(sound);
    };

    loadSound();

    return () => {
      if (likeSound) {
        likeSound.unloadAsync(); 
      }
    };
  }, []);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userID = await AsyncStorage.getItem("UserId");
        setCurrentUserId(userID);
        const email = await AsyncStorage.getItem("Email");
        setUserEmail(email);

        const response = await fetch(
          "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/post"
        );
        const data = await response.json();

        const videoPosts = data.filter((post) => post.content.endsWith(".mp4"));

        // const shuffleArray = (array) => {
        //   for (let i = array.length - 1; i > 0; i--) {
        //     const j = Math.floor(Math.random() * (i + 1));
        //     [array[i], array[j]] = [array[j], array[i]];
        //   }
        //   return array;
        // };

        // const shuffledVideos = shuffleArray(videoPosts);

        setVideos(videoPosts);
        setRefreshing(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    const checkGuide = async () => {
      const hasSeenGuide = await AsyncStorage.getItem("HasSeenGuide");
      if (!hasSeenGuide) {
        setShowGuide(true);
        Animated.loop(
          Animated.sequence([
            Animated.timing(arrowAnim, {
              toValue: 10,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(arrowAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();

        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(async() => {
            setShowGuide(false);
           await AsyncStorage.setItem("HasSeenGuide", "true");
          });
        }, 6000);
      }
    };

    fetchPosts();
    checkGuide();
  }, [refresh]);

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
         if(resp.User != User)
          {
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
              post:resp._id
            }),
          }
        );
       

        if (notification.ok) {
          console.log("notification sent successfully");
        } else {
          console.log("notification sent falied");
        }
      }
        if (likeSound) {
          await likeSound.replayAsync();
        }

        handleRefresh();
      } else {
        console.error("Failed to like", response);
      }
    } catch (error) {
      console.error("Error submitting like ", error);
    }
  };
  const handleUnLike = async(id) => {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefresh(!refresh);
  };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      videoRefs.current.forEach((video, index) => {
        if (video && index !== newIndex) {
          video.pauseAsync();
        }
      });
      videoRefs.current[newIndex]?.playAsync();
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        videoRefs.current.forEach((video) => {
          if (video) video.pauseAsync();
        });
      };
    }, [])
  );

  const dismissGuide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowGuide(false);
      AsyncStorage.setItem("HasSeenGuide", "true");
    });
  };

  return (
    <View style={styles.container}>
      {showGuide && (
        <TouchableWithoutFeedback onPress={dismissGuide}>
          <Animated.View style={[styles.guideOverlay, { opacity: fadeAnim }]}>
            <Text style={styles.guideText}>Swipe left to see more reels</Text>
            <Animated.Image
              source={require("../../assets/images/swipe-arrow.png")}
              style={[
                styles.guideArrow,
                { transform: [{ translateX: arrowAnim }] },
              ]}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item, index }) => (
          <View style={styles.videoContainer}>
            <Video
              ref={(ref) => (videoRefs.current[index] = ref)}
              source={{ uri: item.content }}
              resizeMode="cover"
              isLooping
              style={styles.video}
            />
            <View style={styles.captionContainer}>
              <View style={{ display: "flex" }}>
                <TouchableOpacity
                  style={styles.userContainer}
                  onPress={() => {
                    if (userEmail === item.User.email) {
                      router.push("/(tabs)/profile");
                    } else {
                      router.push(
                        `/pages/Profile/otherProfile/${item.User.email}`
                      );
                    }
                  }}
                >
                  <Image
                    source={{ uri: item.User.profilePicture }}
                    style={styles.avatar}
                  />
                  <Text style={styles.user}>{item.User.name}</Text>
                </TouchableOpacity>
                <Text style={styles.caption}>{item.caption}</Text>
              </View>
              <TouchableOpacity
                style={
                  item?.likes?.some((like) => like?.user?._id === CurrentUserId)
                    ? styles.actionAlreadyLikedButton
                    : styles.likeButton
                }
                onPress={() => {
                  if (
                    item?.likes?.some(
                      (like) => like?.user?._id === CurrentUserId
                    )
                  ) {
                    handleUnLike(item._id);
                  } else {
                    handleLike(item._id);
                  }
                }}
              >
                <Text style={styles.likeText}>❤️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  guideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  guideText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
  },
  guideArrow: {
    width: 140,
    height: 140,
  },
  videoContainer: {
    width: width,
    height: height - 50,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: height - 55,
  },
  captionContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userContainer: {
    flexDirection: "row",
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
    fontSize: 20,
    color: "#fff",
    marginTop: 6,
  },
  caption: {
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
  },
  likeButton: {
    backgroundColor: "#FFCFEF",
    borderRadius: 50,
    padding: 10,
  },
  actionAlreadyLikedButton: {
    backgroundColor: "#8FD14F",
    borderRadius: 50,
    padding: 10,
  },
  likeText: {
    fontSize: 24,
    color: "#fff",
  },
});

export default HorizontalSlider;
