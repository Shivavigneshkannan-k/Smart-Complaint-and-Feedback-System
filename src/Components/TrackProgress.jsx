import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const TrackProgress = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      const q = query(collection(db, "Complaints"), where("userId", "==", userId));
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
            timestamp: data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : null,
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

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.assignedFaculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
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
          <div className="space-y-4 mt-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`p-4 rounded-lg shadow-md border-l-4 ${
                  complaint.status === "Resolved"
                    ? "bg-green-100 border-green-500"
                    : "bg-blue-100 border-blue-500"
                }`}
              >
                <h2 className="text-lg font-bold text-gray-800">{complaint.issue}</h2>
                <p className="text-sm text-gray-600">
                  Assigned To:{" "}
                  <span
                    className={`font-semibold ${
                      complaint.status === "Resolved" ? "text-green-700" : "text-blue-700"
                    }`}
                  >
                    {complaint.assignedFaculty}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      complaint.status === "Resolved" ? "text-green-700" : "text-blue-700"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Submitted On: {complaint.timestamp ? complaint.timestamp.toLocaleString() : "Unknown"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackProgress;
