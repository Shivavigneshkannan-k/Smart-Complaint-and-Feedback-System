import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import CommonIssueMessage from "./CommonIssueMessage";

const CommonIssues = () => {
  const navigate = useNavigate();
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
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section with Back Button */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <span className="text-lg">←</span> Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Common Issues</h1>
        <div className="w-12"></div> {/* Empty div for alignment */}
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mt-6 mx-4">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            className="w-full px-4 py-3 pl-10 bg-white rounded-full shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="🔍 Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Issues List */}
      <div className="mt-6 mx-4 space-y-4">
        {issues.length === 0 ? (
          <p className="text-center text-gray-500">No issues found.</p>
        ) : (
          issues
            .filter((issue) =>
              issue && issue.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((issue) =>
              issue ? <CommonIssueMessage key={issue.id} issue={issue} /> : null
            )
        )}
      </div>

      {/* Add Common Issue Button */}
      <button
        className="p-5 bg-blue-500 text-white rounded-full fixed bottom-6 right-6 text-xl shadow-lg hover:bg-blue-600 transition-all"
        onClick={() => navigate("/addCommonIssue")}
      >
        ➕ Add Issue
      </button>
    </div>
  );
};

export default CommonIssues;
