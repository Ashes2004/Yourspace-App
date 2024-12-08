
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "",

    authDomain: "",
  
    projectId: "",
  
    storageBucket: "",
  
    messagingSenderId: "",
  
    appId: "",
  
    measurementId: ""
  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL  ,  auth};

