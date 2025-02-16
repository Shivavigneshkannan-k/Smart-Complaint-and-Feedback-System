import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // ✅ Add doc & getDoc
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyDVa1PoK4H811jbLSCYdTWMsUg5Kx8I9Tk",
  authDomain: "smart-complaints-system.firebaseapp.com",
  projectId: "smart-complaints-system",
  storageBucket: "smart-complaints-system.appspot.com", // ✅ Fix typo (remove extra "storage")
  messagingSenderId: "899252764226",
  appId: "1:899252764226:web:5e0ad8cc4295f543caf7db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export missing functions
export { auth, db, storage, doc, getDoc }; 
