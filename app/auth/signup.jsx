import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebaseConfig";
import { FirebaseError } from "firebase/app";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://shrill-leisha-ashesdas-ddfe2c0a.koyeb.app/api/user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const users = await response.json();
      const userExists = users.some((user) => user.email === email);

      if (userExists) {
        Alert.alert("Error", "User with this email already exists");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);
      Alert.alert(
        "Verification",
        "A verification email has been sent. Please verify your email to continue."
      );

      await AsyncStorage.setItem("Email", email);
      router.replace("/auth/confirmMail");
    } catch (error) {
      if (error instanceof FirebaseError) {
        let errorMessage = "An error occurred.";
        if (error.code === "auth/email-already-in-use") {
          errorMessage = "This email is already in use.";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters.";
        } else {
          errorMessage = error.message;
        }
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", error.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us today</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#a6a6a6"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace("/auth/login")}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
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
  loginText: {
    fontSize: 16,
    color: "#125B9A",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});

export default Signup;
