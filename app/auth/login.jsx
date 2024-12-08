import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserEmail = async () => {
      try {
        // Get email from AsyncStorage
        const userEmail = await AsyncStorage.getItem("Email");
        if (userEmail) {
          router.replace("/(tabs)/Home"); // Redirect if email exists
        }
      } catch (error) {
        console.error("Error fetching email from AsyncStorage:", error);
      } finally {
        setLoading(false); // Stop loading when done
      }
    };

    checkUserEmail();
  }, [router]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async () => {
        Alert.alert("Logged in successfully!");
        // Save email to AsyncStorage
        await AsyncStorage.setItem("Email", email);
        router.push("/(tabs)/Home");
      })
      .catch((error) => {
        Alert.alert("Login Failed", error.message);
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please Login</Text>
      <Text style={styles.subtitle}>
        <Text style={styles.boldText}>To continue</Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#a6a6a6"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#a6a6a6"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={()=>router.push('/auth/forgotPassword')}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/auth/signup")}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#125B9A",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    color: "#125B9A",
    marginBottom: 30,
    textAlign: "center",
    textShadowColor: "#7EACB5",
    textShadowRadius: 1,
  },
  boldText: {
    fontSize: 35,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C9D6DF",
    fontSize: 16,
    color: "#333",
    elevation: 3,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#125B9A",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    marginTop: 15,
    marginBottom: 20,
  },
  link: {
    fontSize: 16,
    color: "#125B9A",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#C9D6DF",
    marginBottom: 20,
  },
});

export default Login;
