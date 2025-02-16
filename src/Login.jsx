"use client"; // Ensures it's a client component

import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc"; // Google Icon

// Helper function for user details
// Helper function for user details
const parseUserDetails = (email) => {
  let role = "student";
  let department = "";
  let year = "";

  const emailParts = email.split("@")[0]; // Get the part before @

  if (emailParts.includes(".")) {
    // Student email format: shivak.cse2023@citchennai.net
    const [name, deptYear] = emailParts.split(".");
    department = deptYear.replace(/\d+/g, ""); // Extract department (cse)
    year = deptYear.match(/\d+/g) ? deptYear.match(/\d+/g)[0] : ""; // Extract year (2023)
  } else {
    // Faculty email format: shivak@citchennai.net
    role = "faculty";
    department = emailParts.match(/[a-zA-Z]+/g)[0]; // Extract department (cse)
  }

  return { role, department, year };
};

const GoogleLogin = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      if (!email.endsWith("@citchennai.net")) {
        alert("Only college emails are allowed!");
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
          year
        });
      }

      setUser(user); // Save user in state
      console.log("User logged in:", user.displayName);

      // Navigate to dashboard after login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed:", error.message);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6'>
      <div className='bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          Welcome to the Portal
        </h2>
        <p className='text-gray-600 mb-6'>
          Sign in with your{" "}
          <span className='font-semibold'>citchennai.net</span> email
        </p>

        {user ? (
          <div className='text-center'>
            <img
              src={user.photoURL}
              alt='User Avatar'
              className='w-16 h-16 rounded-full mx-auto mb-4'
            />
            <p className='text-lg font-semibold'>{user.displayName}</p>
            <p className='text-gray-600'>{user.email}</p>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300'>
            <FcGoogle className='text-2xl' />
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleLogin;
