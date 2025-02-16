import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useState, useEffect } from "react";

const CommonIssueMessage = ({ issue, userId }) => {
  const [votes, setVotes] = useState(issue.upvotes - issue.downvotes);
  const [upvotes, setUpvotes] = useState(issue.upvotes);
  const [downvotes, setDownvotes] = useState(issue.downvotes);
  const [userVote, setUserVote] = useState(null); // To track if the user has voted

  useEffect(() => {
    const checkUserVote = async () => {
      const issueRef = doc(db, "CommonIssues", issue.id);

      try {
        const issueSnap = await getDoc(issueRef);
        if (!issueSnap.exists()) {
          console.error("Issue not found!");
          return;
        }

        const currentData = issueSnap.data();
        const votedBy = currentData.votedBy || {}; // Object to store user votes

        if (votedBy[userId]) {
          setUserVote(votedBy[userId]); // Set the user vote state (up or down)
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
      // Fetch the latest data from Firestore
      const issueSnap = await getDoc(issueRef);
      if (!issueSnap.exists()) {
        console.error("Issue not found!");
        return;
      }

      const currentData = issueSnap.data();
      let newUpvotes = currentData.upvotes;
      let newDownvotes = currentData.downvotes;

      // Handle vote logic:
      if (type === "up") {
        if (userVote === "down") {
          // Undo the downvote before adding the upvote
          newDownvotes -= 1;
          setDownvotes(newDownvotes); // Update downvotes state
        }
        newUpvotes += 1; // Add the upvote
        setUpvotes(newUpvotes); // Update upvotes state
      } else if (type === "down") {
        if (userVote === "up") {
          // Undo the upvote before adding the downvote
          newUpvotes -= 1;
          setUpvotes(newUpvotes); // Update upvotes state
        }
        newDownvotes += 1; // Add the downvote
        setDownvotes(newDownvotes); // Update downvotes state
      }

      // **Always increase the total votes** without decreasing:
      const totalVotes = upvotes + downvotes + 1; // Always add 1 to the total votes

      // Update the votedBy field in Firestore to track the user's vote
      const newVotedBy = { ...currentData.votedBy, [userId]: type };

      // Update Firestore with the new votes and the user's vote
      await updateDoc(issueRef, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        votedBy: newVotedBy, // Store the vote of the user
      });

      // Update the local UI state after Firestore update
      setVotes(totalVotes); // Update total votes dynamically
      setUserVote(type); // Mark the user's vote as recorded
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  return (
    <div className="p-4 shadow-md bg-white rounded-lg flex flex-col my-4">
      <div className="flex justify-between mb-4">
        <h1 className="ml-2 text-lg font-semibold">{issue.title}</h1>
        <div className="flex gap-2 text-xl pb-2 px-2">
          <p>⬆️ {upvotes}</p>
          <p>⬇️ {downvotes}</p>
        </div>
      </div>
      <div className="flex gap-4 justify-between">
        <div className="ml-2">
          <p>Total votes: {votes}</p>
        </div>
        <div>
          <button
            className="bg-green-400 py-1 px-2 rounded-md text-md cursor-pointer shadow-lg mr-4"
            onClick={() => handleVote("up")}
            disabled={userVote === "up"} // Disable if the user has already upvoted
          >
            Upvote
          </button>
          <button
            className="bg-red-500 py-1 px-2 rounded-md text-md cursor-pointer shadow-lg"
            onClick={() => handleVote("down")}
            disabled={userVote === "down"} // Disable if the user has already downvoted
          >
            Downvote
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonIssueMessage;
