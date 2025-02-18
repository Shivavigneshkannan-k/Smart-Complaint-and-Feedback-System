import { useState, useEffect } from "react";
import moment from "moment";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ComplaintMessage = ({ complaint, userId }) => {
  const [expanded, setExpanded] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const complaintRef = doc(db, "Complaints", complaint.id);
        const complaintSnap = await getDoc(complaintRef);

        if (complaintSnap.exists()) {
          const data = complaintSnap.data();
          setUpvotes(data.upvotes || 0);
          setDownvotes(data.downvotes || 0);
          setHasVoted(!!data.voters?.[userId]);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    if (complaint?.id) fetchVotes();
  }, [complaint, userId]);

  const handleVote = async (voteType) => {
    if (!userId) {
      alert("Please login to vote!");
      return;
    }
    if (hasVoted || loading) return;
    setLoading(true);

    const complaintRef = doc(db, "Complaints", complaint.id);

    try {
      // Get fresh data to prevent race conditions
      const complaintSnap = await getDoc(complaintRef);
      if (!complaintSnap.exists() || complaintSnap.data().voters?.[userId]) {
        setHasVoted(true);
        return;
      }

      await updateDoc(complaintRef, {
        [voteType]: (complaintSnap.data()[voteType] || 0) + 1,
        [`voters.${userId}`]: true
      });

      if (voteType === "upvotes") {
        setUpvotes(prev => prev + 1);
      } else {
        setDownvotes(prev => prev + 1);
      }
      setHasVoted(true);
    } catch (error) {
      console.error("Error updating vote:", error);
      alert("Error processing your vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    switch (complaint.status) {
      case "pending": return "Pending";
      case "resolved": return "Resolved";
      default: return "In Progress";
    }
  };

  return (
    <div
      className="p-4 shadow-md bg-white rounded-lg my-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">{complaint.complaintTitle}</h1>
        <p className="text-sm text-gray-600">
          {complaint.timestamp ? moment(complaint.timestamp.toDate()).fromNow() : "Unknown Date"}
        </p>
      </div>

      {/* Short Description */}
      <p className="text-gray-700 mb-4">
        {expanded ? complaint.issue : `${complaint.issue?.substring(0, 100) || "No details"}...`}
      </p>

      {/* Voting Section */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              hasVoted ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("upvotes");
            }}
            disabled={hasVoted || loading}
          >
            <span className="text-lg">👍</span>
            <span className="font-medium">{upvotes}</span>
          </button>

          <button
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              hasVoted ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("downvotes");
            }}
            disabled={hasVoted || loading}
          >
            <span className="text-lg">👎</span>
            <span className="font-medium">{downvotes}</span>
          </button>
        </div>

        {/* Status and Total Votes */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total votes: {upvotes + downvotes}
          </div>
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-md ${
              complaint.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : complaint.status === "resolved"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {getStatus()}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <p className="text-gray-700">{complaint.issue || "No details provided"}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Filed By:</span>
                <p className="text-gray-500">{complaint.userName || "Anonymous"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Department:</span>
                <p className="text-gray-500">{complaint.dept || "Not specified"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <p className="text-gray-500">{complaint.complaintType || "General"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Assigned To:</span>
                <p className="text-gray-500">{complaint.assignedTo || "Unassigned"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintMessage;