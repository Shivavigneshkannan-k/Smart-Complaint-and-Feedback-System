import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useState, useEffect } from "react";

const CommonIssueMessage = ({ issue, userId }) => {
  if (!issue) {
    return <p className="text-red-500 text-center">Error: Issue data is missing.</p>;
  }

  const [votes, setVotes] = useState(issue.upvotes - issue.downvotes);
  const [upvotes, setUpvotes] = useState(issue.upvotes);
  const [downvotes, setDownvotes] = useState(issue.downvotes);
  const [userVote, setUserVote] = useState(null); // Track user vote status

  useEffect(() => {
    const checkUserVote = async () => {
      try {
        const issueSnap = await getDoc(doc(db, "CommonIssues", issue.id));
        if (issueSnap.exists()) {
          const currentData = issueSnap.data();
          const votedBy = currentData.votedBy || {}; // Object to store user votes

          if (votedBy[userId]) {
            setUserVote(votedBy[userId]); // Set the user vote state (up or down)
          }
        }
      } catch (error) {
        console.error("Error checking user vote:", error);
      }
    };

    checkUserVote();
  }, [issue.id, userId]);

  const handleVote = async (type) => {
    const issueRef = doc(db, "CommonIssues", issue.id);

    try {
      // Fetch latest data
      const issueSnap = await getDoc(issueRef);
      if (!issueSnap.exists()) return;

      const currentData = issueSnap.data();
      let newUpvotes = currentData.upvotes;
      let newDownvotes = currentData.downvotes;

      // Handle vote logic:
      if (type === "up") {
        if (userVote === "down") newDownvotes -= 1; // Undo downvote
        newUpvotes += 1; // Upvote
      } else if (type === "down") {
        if (userVote === "up") newUpvotes -= 1; // Undo upvote
        newDownvotes += 1; // Downvote
      }

      // Update votes in Firestore
      await updateDoc(issueRef, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        votedBy: { ...currentData.votedBy, [userId]: type }, // Store user vote
      });

      // Update UI state
      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
      setVotes(newUpvotes - newDownvotes);
      setUserVote(type);
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  return (
    <div className="p-4 shadow-md bg-white rounded-lg my-4 border-l-4 border-blue-500">
      {/* Issue Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="ml-2 text-lg sm:text-xl font-semibold">{issue.title || "Unknown Issue"}</h1>
        <div className="flex gap-4 text-lg sm:text-xl pt-2 sm:pt-0">
          <p className="text-green-600 font-bold">⬆️ {upvotes}</p>
          <p className="text-red-600 font-bold">⬇️ {downvotes}</p>
        </div>
      </div>

      {/* Issue Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="ml-2">
          <p className="text-gray-600">Total votes: {votes}</p>
          <p className="text-gray-500 text-sm sm:text-md">
            Submitted On: {issue.timestamp ? issue.timestamp.toLocaleString() : "Unknown"}
          </p>
        </div>

        {/* Voting Buttons */}
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            className={`py-2 px-4 rounded-md text-md cursor-pointer shadow-lg transition-all ${
              userVote === "up" ? "bg-green-500 text-white" : "bg-green-300 hover:bg-green-400"
            }`}
            onClick={() => handleVote("up")}
            disabled={userVote === "up"}
          >
            👍 Upvote
          </button>
          <button
            className={`py-2 px-4 rounded-md text-md cursor-pointer shadow-lg transition-all ${
              userVote === "down" ? "bg-red-500 text-white" : "bg-red-300 hover:bg-red-400"
            }`}
            onClick={() => handleVote("down")}
            disabled={userVote === "down"}
          >
            👎 Downvote
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonIssueMessage;
