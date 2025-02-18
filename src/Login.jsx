"use client"; // Ensures it's a client component

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react"; // Animated Loader Icon

// Helper function for user details
const parseUserDetails = (email) => {
  let role = "student";
  let department = "";
  let year = "";

  const emailParts = email.split("@")[0];

  if (emailParts.includes(".")) {
    const [name, deptYear] = emailParts.split(".");
    department = deptYear.replace(/\d+/g, "");
    year = deptYear.match(/\d+/g) ? deptYear.match(/\d+/g)[0] : "";
  } else {
    role = "faculty";
    department = emailParts.match(/[a-zA-Z]+/g)[0];
  }

  return { role, department, year };
};

const GoogleLogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      if (!email.endsWith("@citchennai.net")) {
        alert("Only college emails are allowed!");
        setLoading(false);
        return;
      }

      const { role, department, year } = parseUserDetails(email);

      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email,
          role,
          department,
          year,
        });
      }

      setUser(user);
      console.log("User logged in:", user.displayName);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      {/* Glassmorphism Card */}
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 drop-shadow-sm">
          Welcome to the Portal
        </h2>
        <p className="text-gray-700 mb-6">
          Sign in with your{" "}
          <span className="font-semibold">citchennai.net</span> email
        </p>

        {user ? (
          <div className="text-center">
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-blue-400"
            />
            <p className="text-lg font-semibold text-gray-800">{user.displayName}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-xl" />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle className="text-2xl" />
                Sign in with Google
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleLogin;
