// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDL7qhG1vxiQQ-KU2e3_jx431Zw_Efq-k",
  authDomain: "jansetu-75ded.firebaseapp.com",
  projectId: "jansetu-75ded",
  storageBucket: "jansetu-75ded.firebasestorage.app",
  messagingSenderId: "346673089609", // Use this one (correct)
  appId: "1:346673089609:web:6dc980efd874c07732c398"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export default app;