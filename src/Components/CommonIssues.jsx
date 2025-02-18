import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import CommonIssueMessage from "./CommonIssueMessage";
import { ArrowLeft, Plus, X, Search } from "lucide-react";

const CommonIssues = () => {
  const navigate = useNavigate();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCommonIssues();
  }, []);

  const fetchCommonIssues = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "CommonIssues"));
      const issuesList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.seconds
            ? new Date(doc.data().timestamp.seconds * 1000)
            : null,
        }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort latest first

      setIssues(issuesList);
    } catch (error) {
      console.error("Error fetching common issues:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-gradient-to-br from-blue-100 to-purple-200">
      {/* 🌟 Header Section */}
      <div className="w-full max-w-3xl flex items-center justify-between bg-white/90 backdrop-blur-md shadow-lg px-6 py-4 rounded-xl sticky top-4 z-10">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-all"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg font-medium hidden sm:inline">Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
          Common Issues
        </h1>
        <div className="w-6"></div> {/* Placeholder for alignment */}
      </div>

      {/* 🔍 Search Bar with Floating Label */}
      <div className="relative w-full max-w-2xl mt-6 px-4">
        <div className="relative">
          <input
            type="text"
            id="search"
            className="w-full px-5 py-3 pl-12 bg-white border border-gray-300 rounded-full shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          {searchQuery && (
            <X
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>

      {/* 📝 Issues List */}
      <div className="w-full max-w-3xl mt-6 space-y-6 px-4">
        {issues.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No issues found.</p>
        ) : (
          issues
            .filter((issue) =>
              issue && issue.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((issue) =>
              issue ? <CommonIssueMessage key={issue.id} issue={issue} userId={userId} /> : null
            )
        )}
      </div>

      {/* ➕ Floating Action Button (FAB) */}
      <button
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center sm:p-5"
        onClick={() => navigate("/addCommonIssue")}
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
};

export default CommonIssues;
