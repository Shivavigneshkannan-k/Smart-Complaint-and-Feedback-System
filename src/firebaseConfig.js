import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Import storage

const firebaseConfig = {
  apiKey: "AIzaSyDVa1PoK4H811jbLSCYdTWMsUg5Kx8I9Tk",
  authDomain: "smart-complaints-system.firebaseapp.com",
  projectId: "smart-complaints-system",
  storageBucket: "smart-complaints-system.firebasestorage.app",
  messagingSenderId: "899252764226",
  appId: "1:899252764226:web:5e0ad8cc4295f543caf7db"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Create storage instance

// Export everything correctly
export { auth, db, storage }; // ✅ Ensure storage is exported
