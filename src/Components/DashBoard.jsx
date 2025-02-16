import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import MenuButton from "./MenuButton";
import { FileText, Search, HelpCircle, List, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileComplaint from "./Complaints";

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

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  const handleButtonClick = (path) => {
    navigate(path);
  };

  return (
    <div className="relative">
      {/* Top-right Edit Profile Button */}
      <button
        onClick={() => handleButtonClick("/editProfile")}
        className="absolute top-0 right-0 m-4 bg-white text-gray-900 p-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-200 transition-all duration-300"
      >
        <User className="w-10 h-10" />
        <span className="text-lg font-semibold">Edit Profile</span>
      </button>

      <center>
        <div
          className={`min-h-screen bg-gradient-to-br ${
            role === "faculty"
              ? "from-[#5A2A99] to-[#1E3A8A] text-white"
              : "from-[#3B82F6] to-[#06B6D4] text-gray-900"
          }`}
        >
          <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {role === "faculty" ? "Faculty Dashboard" : "Student Dashboard"}
              </h1>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                Efficiently Manage and Track your Complaints with our Streamlined System
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
              {/* Students see only 3 features, Faculty see all 4 */}
              <MenuButton
                icon={FileText}
                text="File Complaint"
                onClick={() => handleButtonClick("/complaints")}
              />
              <MenuButton
                icon={Search}
                text="Track Progress"
                onClick={() => handleButtonClick("/trackProgress")}
              />
              <MenuButton
                icon={HelpCircle}
                text="Common Issues"
                onClick={() => handleButtonClick("/commonIssues")}
              />
              
              {role === "faculty" && (
                <MenuButton
                  icon={List}
                  text="View Complaints"
                  onClick={() => handleButtonClick("/viewComplaints")}
                />
              )}
            </div>
          </div>
        </div>
      </center>
    </div>
  );
};

export default DashBoard;
