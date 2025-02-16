import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import MenuBox from "./MenuBox";

const DashBoard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center transition-all duration-500 px-6 ${
        role === "faculty"
          ? "bg-gradient-to-br from-purple-700 to-indigo-900 text-white"
          : "bg-gradient-to-br from-blue-500 to-cyan-400 text-gray-900"
      }`}
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
        {role === "faculty" ? "Faculty Dashboard" : "Student Dashboard"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {role === "student" ? (
          <>
            <MenuBox name="📌 File a Complaint" url="complaints" />
            <MenuBox name="📊 Track Progress" url="trackProgress" />
            <MenuBox name="💡 Common Issues" url="commonIssues" />
          </>
        ) : role === "faculty" ? (
          <MenuBox name="📂 View Complaints" url="viewComplaints" />
        ) : (
          <p className="text-red-500">Role not found</p>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
