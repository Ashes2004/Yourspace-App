import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const index = () => {
  const router = useRouter();

  useEffect(() => {
    const visitIntro = async () => {
      const visited = await AsyncStorage.getItem('Email');
      if (visited) {
        router.push("/(tabs)/Home")
      } 
    };
    visitIntro();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/splash.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* <Text style={styles.title}>
          Welcome to
          <Text style={styles.subtitle}> Yourspace </Text>
        </Text> */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
    textShadowColor: "#F5F5F7",
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 39,
    color: "#9DBDFF",
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: "#78B3CE",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop:250
  },
  buttonText: {
    color: "#EEEEEE",
    fontSize: 20,
    fontWeight: "600",
  },
});

export default index;
