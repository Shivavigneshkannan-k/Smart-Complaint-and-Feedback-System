import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
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
      const issuesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(issuesList);
    } catch (error) {
      console.error("Error fetching common issues:", error);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col pb-20"> {/* Added padding at the bottom */}
      <h1 className="text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white">
        Common Issues
      </h1>

      {/* Search Bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex justify-center mt-8 mb-4 mx-4"
      >
        <input
          type="text"
          className="w-full rounded-md px-2 py-2 bg-white"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="bg-blue-300 px-2 py-1 rounded-md mx-2">Search</button>
      </form>

      {/* Display Filtered Issues */}
      <div className="m-4">
        {issues
          .filter((issue) =>
            issue.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((issue) => (
            <CommonIssueMessage key={issue.id} issue={issue} />
          ))}
      </div>

      {/* Add Common Issue Button */}
      <button
        className="p-8 py-9 bg-blue-300 rounded-full fixed bottom-8 right-8 text-xl shadow-md"
        onClick={() => navigate("/addCommonIssue")}
      >
        ADD
      </button>
    </div>
  );
};

export default CommonIssues;
