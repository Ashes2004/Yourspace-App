import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Verification = () => {
  const [email, setEmail] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [verifying, setVerifying] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const loadEmail = async () => {
      try {
    
        const storedEmail = await AsyncStorage.getItem("Email");
        setEmail(storedEmail);
      } catch (error) {
        console.error("Failed to load email from AsyncStorage:", error);
      } finally {
        setLoading(false); 
      }
    };

    loadEmail(); 

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          
          router.push("/auth/setupProfile");
        }
      }
    });

    return unsubscribe;
  }, [router]);

  const handleCheckVerification = async () => {
    setVerifying(true); 
    try {
      await auth.currentUser?.reload(); 
      if (auth.currentUser?.emailVerified) {
        if (email) {
         
          const createUserResponse = await fetch("https://your-backend-api.com/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          if (!createUserResponse.ok) {
            throw new Error("Failed to update user status in the backend.");
          }
        }

        Alert.alert("Success", "Email verified successfully!");
        router.replace("/auth/setupProfile"); 
      } else {
        alert("Not Verified. Please verify your email to continue.");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      alert("Error. Something went wrong while verifying your email.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        {email
          ? `A verification email has been sent to ${email}. Please check your inbox and verify your email to continue.`
          : "Email not found."}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckVerification} disabled={verifying}>
        {verifying ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Check Verification</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F7",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#125B9A",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "80%",
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
});

export default Verification;
