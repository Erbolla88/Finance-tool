import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCZYBoRoyEvm9L_Ia186yNypiZBSPcCHI",
  authDomain: "finance-tool-e1ba0.firebaseapp.com",
  databaseURL: "https://finance-tool-e1ba0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "finance-tool-e1ba0",
  storageBucket: "finance-tool-e1ba0.firebasestorage.app",
  messagingSenderId: "25031559528",
  appId: "1:25031559528:web:aeba73f29c21119252eedd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
