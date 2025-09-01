import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// --- ACCIÓN REQUERIDA ---
// Pega aquí la configuración de tu proyecto de Firebase.
// La encontrarás en la Consola de Firebase > Configuración del proyecto > General > Tus apps.
// Es crucial que restrinjas tu clave de API en la Consola de Google Cloud para proteger tu app.
const firebaseConfig = {
  apiKey: "AIzaSyASTKJVt3kDps-ieKqJ1sR5MFIlNfbTl1M", // Reemplaza con tu clave desde la consola de Firebase
  authDomain: "finance-tool-e1ba0.firebaseapp.com",
  databaseURL: "https://finance-tool-e1ba0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "finance-tool-e1ba0",
  storageBucket: "finance-tool-e1ba0.firebasestorage.app",
  messagingSenderId: "25031559528",
  appId: "1:25031559528:web:39342ba247690c3e52eedd"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);