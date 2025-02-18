import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const CommonIssueMessage = ({ issue, userId }) => {
  const [upvotes, setUpvotes] = useState({});
  const [downvotes, setDownvotes] = useState({});
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const issueRef = doc(db, "CommonIssues", issue.id);
        const issueSnap = await getDoc(issueRef);

        if (issueSnap.exists()) {
          const data = issueSnap.data();
          setUpvotes(data.upvotes || {});
          setDownvotes(data.downvotes || {});

          if (data.upvotes?.[userId]) {
            setUserVote("upvote");
          } else if (data.downvotes?.[userId]) {
            setUserVote("downvote");
          }
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    if (issue?.id) fetchVotes();
  }, [issue, userId]);

  const handleVote = async (voteType) => {
    if (!userId) {
      alert("Please login to vote!");
      return;
    }
    if (loading) return;
    setLoading(true);

    const issueRef = doc(db, "CommonIssues", issue.id);

    try {
      const issueSnap = await getDoc(issueRef);
      if (!issueSnap.exists()) return;

      const currentData = issueSnap.data();
      let newUpvotes = { ...currentData.upvotes } || {};
      let newDownvotes = { ...currentData.downvotes } || {};

      if (voteType === "upvote") {
        if (newDownvotes[userId]) delete newDownvotes[userId]; // Remove from downvotes if exists
        newUpvotes[userId] = true; // Add to upvotes
        setUserVote("upvote");
      } else if (voteType === "downvote") {
        if (newUpvotes[userId]) delete newUpvotes[userId]; // Remove from upvotes if exists
        newDownvotes[userId] = true; // Add to downvotes
        setUserVote("downvote");
      }

      await updateDoc(issueRef, {
        upvotes: newUpvotes,
        downvotes: newDownvotes
      });

      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
    } catch (error) {
      console.error("Error updating vote:", error);
      alert("Error processing your vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 shadow-md bg-white rounded-lg my-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">{issue.title}</h1>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4">{issue.description}</p>

      {/* Interaction Bar */}
      <div className="flex justify-between items-center">
        {/* Voting Section */}
        <div className="flex gap-4">
          <button
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
              userVote === "upvote"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleVote("upvote")}
            disabled={loading}
          >
            <span className="text-lg">👍</span>
            <span className="font-medium">{Object.keys(upvotes).length}</span>
          </button>

          <button
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
              userVote === "downvote"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleVote("downvote")}
            disabled={loading}
          >
            <span className="text-lg">👎</span>
            <span className="font-medium">{Object.keys(downvotes).length}</span>
          </button>
        </div>

        {/* Total Votes */}
        <div className="text-sm text-gray-500">
          Total votes: {Object.keys(upvotes).length + Object.keys(downvotes).length}
        </div>
      </div>
    </div>
  );
};

export default CommonIssueMessage;
