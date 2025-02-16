import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const EditProfile = () => {
  const [userData, setUserData] = useState(null);
  const [higherAuthorities, setHigherAuthorities] = useState([]);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sections = ["A", "B", "C", "D"];
  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          setUpdatedData(userSnap.data());
          fetchAuthorities(userSnap.data(), userSnap.data().role);
        } else {
          setError("User data not found.");
        }
      } catch (err) {
        setError("Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchAuthorities = async () => {
      try {
        // Fetch all faculty members as higher authorities
        const q = query(collection(db, "Users"), where("role", "==", "faculty"));
    
        const querySnapshot = await getDocs(q);
        setHigherAuthorities(
          querySnapshot.docs.map((doc) => ({
            uid: doc.id,
            name: doc.data().name,
            role: doc.data().role,
          }))
        );
      } catch (err) {
        setError("Error fetching higher authorities.");
      }
    };
    

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setError("User not authenticated.");
        setLoading(false);
      }
    });
  }, []);

  const handleUpdate = async () => {
    if (!updatedData.phone.match(/^\d{10}$/)) {
      alert("Invalid phone number! Enter a 10-digit number.");
      return;
    }

    try {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, updatedData);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Error updating profile.");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Edit Profile</h2>

        {/* Name */}
        <label className="block text-gray-700 font-medium mb-1">Name:</label>
        <input
          type="text"
          value={updatedData.name || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
          className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Email (Read-only) */}
        <label className="block text-gray-700 font-medium mb-1">Email:</label>
        <input
          type="email"
          value={updatedData.email || ""}
          disabled
          className="border p-2 w-full mb-3 bg-gray-100 rounded-lg"
        />

        {/* Phone Number */}
        <label className="block text-gray-700 font-medium mb-1">Phone Number:</label>
        <input
          type="tel"
          value={updatedData.phone || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
          className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter 10-digit phone number"
          maxLength="10"
        />

        {/* Department Selection */}
        <label className="block text-gray-700 font-medium mb-1">Department:</label>
        <select
          value={updatedData.department || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, department: e.target.value })}
          className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Section Selection */}
        <label className="block text-gray-700 font-medium mb-1">Section:</label>
        <select
          value={updatedData.section || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, section: e.target.value })}
          className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Section</option>
          {sections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        {/* Higher Authority Selection */}
        <label className="block text-gray-700 font-medium mb-1">Higher Authority:</label>
        <select
          value={updatedData.higherAuthority || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, higherAuthority: e.target.value })}
          className="border p-2 w-full mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Higher Authority</option>
          {higherAuthorities.map((user) => (
            <option key={user.uid} value={user.uid}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white p-3 w-full rounded-lg text-lg font-medium hover:bg-blue-700 transition duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
