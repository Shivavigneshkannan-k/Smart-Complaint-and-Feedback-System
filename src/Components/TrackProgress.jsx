import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Star, AlertCircle } from "lucide-react";

const TrackProgress = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchComplaints(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchComplaints = async (userId) => {
    try {
      const q = query(
        collection(db, "Complaints"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      const complaintList = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();

          let assignedFaculty = "Unknown";
          if (data.assignedTo) {
            const facultyDocRef = doc(db, "Users", data.assignedTo);
            const facultySnap = await getDoc(facultyDocRef);
            if (facultySnap.exists()) {
              assignedFaculty = facultySnap.data().name || "Unknown";
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            assignedFaculty,
            timestamp: data.timestamp?.seconds
              ? new Date(data.timestamp.seconds * 1000)
              : null,
          };
        })
      );

      // Sort complaints by time (latest first)
      complaintList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setComplaints(complaintList);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = async (complaintId) => {
    try {
      if (rating === 0) {
        alert("Please select a rating before submitting!");
        return;
      }

      const complaintRef = doc(db, "Complaints", complaintId);
      await updateDoc(complaintRef, {
        status: "Closed",
        userSatisfied: true,
        rating,
        closedAt: Timestamp.now(),
      });

      alert("Thank you for your feedback!");
      setSelectedComplaint(null);
      setRating(0);
      await fetchComplaints(user.uid); // Refresh complaints
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert(`Failed to submit rating: ${error.message}`);
    }
  };

  const handleDisagree = async (complaintId, assignedTo) => {
    try {
      if (!assignedTo) {
        alert("No assigned faculty found to escalate!");
        return;
      }

      const facultyDocRef = doc(db, "Users", assignedTo);
      const facultySnap = await getDoc(facultyDocRef);

      if (!facultySnap.exists()) {
        alert("Assigned faculty document not found!");
        return;
      }

      const higherAuthority = facultySnap.data()?.higherAuthority;
      if (!higherAuthority) {
        alert("No higher authority available for escalation!");
        return;
      }

      const complaintRef = doc(db, "Complaints", complaintId);
      await updateDoc(complaintRef, {
        status: "Escalated",
        assignedTo: higherAuthority,
        escalationHistory: arrayUnion({
          escalatedBy: user.uid,
          escalatedTo: higherAuthority,
          timestamp: Timestamp.now(),
          reason: "User disagreed with resolution",
        }),
        lastUpdated: Timestamp.now(),
      });

      alert("Complaint has been escalated successfully!");
      await fetchComplaints(user.uid); // Refresh complaints
    } catch (error) {
      console.error("Error escalating complaint:", error);
      alert(`Escalation failed: ${error.message}`);
    }
  };

  const filteredComplaints = complaints.filter(
    (complaint) =>
      (complaint.issue &&
        complaint.issue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (complaint.assignedFaculty &&
        complaint.assignedFaculty
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (complaint.status &&
        complaint.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (!selectedComplaint) {
      setRating(0);
    }
  }, [selectedComplaint]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );

  if (!user)
    return (
      <p className="text-red-500 text-center text-lg font-semibold mt-10">
        User not authenticated.
      </p>
    );

  return (
    <div className="bg-gradient-to-r from-blue-100 to-indigo-200 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center border-b pb-4">
          Track Complaints
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search complaints..."
          className="w-full px-4 py-2 mt-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredComplaints.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No complaints found.</p>
        ) : (
          <div className="space-y-6 mt-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`p-6 rounded-xl shadow-lg border-l-4 transition-transform transform hover:scale-105 ${
                  complaint.status === "Resolved"
                    ? "bg-green-50 border-green-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  {complaint.issue || "No issue specified"}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Description:</strong>{" "}
                  {complaint.description || "No description provided"}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Priority:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      complaint.priority === 3
                        ? "text-red-700"
                        : complaint.priority === 2
                        ? "text-yellow-700"
                        : "text-green-700"
                    }`}
                  >
                    {complaint.priority === 3
                      ? "High"
                      : complaint.priority === 2
                      ? "Medium"
                      : "Low"}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Assigned To:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      complaint.status === "Resolved"
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {complaint.assignedFaculty || "Unknown"}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      complaint.status === "Resolved"
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {complaint.status || "Unknown"}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Submitted On:</strong>{" "}
                  {complaint.timestamp
                    ? complaint.timestamp.toLocaleString()
                    : "Unknown"}
                </p>

                {/* Resolved Complaint Options */}
                {complaint.status === "Resolved" && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedComplaint(complaint.id)}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Agree & Rate
                      </button>
                      <button
                        onClick={() =>
                          handleDisagree(complaint.id, complaint.assignedTo)
                        }
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Disagree
                      </button>
                    </div>

                    {/* Rating Modal */}
                    {selectedComplaint === complaint.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          Rate the service (1-5 stars):
                        </p>
                        <div className="flex space-x-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                star <= rating
                                  ? "bg-yellow-400 scale-110"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating ? "text-white" : "text-gray-500"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleAgree(complaint.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
                          >
                            Submit Rating
                          </button>
                          <button
                            onClick={() => {
                              setSelectedComplaint(null);
                              setRating(0);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackProgress;