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

  const sections = ["A", "B", "C", "D"]; // Example sections
  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL"]; // Example departments

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          setUpdatedData(userSnap.data());
          fetchAuthorities(userSnap.data().department, userSnap.data().role);
        } else {
          setError("User data not found.");
        }
      } catch (err) {
        setError("Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchAuthorities = async (department, role) => {
      try {
        let q;

        // Students → HODs of their department
        if (role === "student") {
          q = query(collection(db, "Users"), where("role", "==", "faculty"), where("department", "==", department));
        }
        // Hostel students → Hostel Wardens
        else if (role === "hostel_student") {
          q = query(collection(db, "Users"), where("role", "==", "warden"));
        }
        // Faculty → Principal/Dean (future feature)
        else {
          q = query(collection(db, "Users"), where("role", "==", "principal"));
        }

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

    // Listen for authentication state changes
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

      {/* Name */}
      <label className="block text-gray-700">Name:</label>
      <input
        type="text"
        value={updatedData.name || ""}
        onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      {/* Email (Read-only) */}
      <label className="block text-gray-700">Email:</label>
      <input
        type="email"
        value={updatedData.email || ""}
        disabled
        className="border p-2 w-full mb-2 bg-gray-100"
      />

      {/* Phone Number */}
      <label className="block text-gray-700">Phone Number:</label>
      <input
        type="tel"
        value={updatedData.phone || ""}
        onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
        className="border p-2 w-full mb-2"
        placeholder="Enter 10-digit phone number"
        maxLength="10"
      />

      {/* Department Selection */}
      <label className="block text-gray-700">Department:</label>
      <select
        value={updatedData.department || ""}
        onChange={(e) => setUpdatedData({ ...updatedData, department: e.target.value })}
        className="border p-2 w-full mb-2"
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>

      {/* Section Selection */}
      <label className="block text-gray-700">Section:</label>
      <select
        value={updatedData.section || ""}
        onChange={(e) => setUpdatedData({ ...updatedData, section: e.target.value })}
        className="border p-2 w-full mb-2"
      >
        <option value="">Select Section</option>
        {sections.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
      </select>

      {/* Higher Authority Selection */}
      <label className="block text-gray-700">Higher Authority:</label>
      <select
        value={updatedData.higherAuthority || ""}
        onChange={(e) => setUpdatedData({ ...updatedData, higherAuthority: e.target.value })}
        className="border p-2 w-full mb-2"
      >
        <option value="">Select Higher Authority</option>
        {higherAuthorities.map((user) => (
          <option key={user.uid} value={user.uid}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>

      <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 w-full">
        Update Profile
      </button>
    </div>
  );
};

export default EditProfile;
