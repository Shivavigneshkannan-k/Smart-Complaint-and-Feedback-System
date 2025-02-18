import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import MenuButton from "./MenuButton";
import {
  FilePlus,
  SearchCheck,
  HelpCircle,
  Users,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  const handleButtonClick = (path) => {
    navigate(path);
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center 
        ${
          role === "faculty"
            ? "bg-gradient-to-br from-[#1E3A8A] to-[#5AA99] text-white"
            : "bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-gray-900"
        }`}
    >
      {/* 🔹 Top Buttons (Edit Profile + Logout) */}
      <div className="absolute top-4 right-4 flex gap-3">
        {/* Edit Profile Button */}
        <button
          onClick={() => handleButtonClick("/editProfile")}
          className="bg-white text-gray-900 p-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-200 transition-all duration-300"
        >
          <User className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="hidden sm:inline text-lg font-semibold">
            Edit Profile
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-600 transition-all duration-300"
        >
          <LogOut className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="hidden sm:inline text-lg font-semibold">
            Logout
          </span>
        </button>
      </div>

      <div className="w-full max-w-5xl text-center px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
            {role === "faculty" ? "Faculty Dashboard" : "Student Dashboard"}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mt-2">
            Efficiently manage and track your complaints with our streamlined system.
          </p>
        </header>

        {/* 🔹 Menu Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          <MenuButton
            icon={FilePlus}
            text="File Complaint"
            onClick={() => handleButtonClick("/complaints")}
          />
          <MenuButton
            icon={SearchCheck}
            text="Track Progress"
            onClick={() => handleButtonClick("/trackProgress")}
          />
          <MenuButton
            icon={HelpCircle}
            text="Common Issues"
            onClick={() => handleButtonClick("/commonIssues")}
          />
          <MenuButton
            icon={Users}
            text="Complaint On Individual"
            onClick={() => handleButtonClick("/complainOnIndividual")}
          />
          {role === "faculty" && (
            <MenuButton
              icon={ClipboardList}
              text="View Complaints"
              onClick={() => handleButtonClick("/viewComplaints")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
