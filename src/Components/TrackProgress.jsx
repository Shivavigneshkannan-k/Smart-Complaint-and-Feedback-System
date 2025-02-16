import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ComplaintMessage from "./ComplaintMessage";
import ResolvedComplaint from "./ResolvedComplaint";

const TrackProgress = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
    console.log("Fetching complaints for user:", userId);
  
    try {
      const q = query(collection(db, "Complaints"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.warn("No complaints found for user:", userId);
      }
  
      const complaintList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Complaint Data:", data); // Debugging log
        return {
          id: doc.id,
          ...data,
          userName: data.userName || "Anonymous", // Ensure userName exists
          dept: data.dept || "Unknown", // Ensure dept exists
          complaintType: data.complaintType || "Not Specified", // Ensure type exists
          submittedTo: data.submittedTo || "Unknown", // Ensure submittedTo exists
          currentlyHandledBy: data.currentlyHandledBy || "Not Assigned", // Ensure handledBy exists
        };
      });
  
      setComplaints(complaintList);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };
  

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
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center border-b pb-4">
          Track Complaints
        </h1>

        {complaints.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            No complaints found.
          </p>
        ) : (
          <div className="space-y-4 mt-4">
            {complaints.map((complaint) =>
              complaint.status === "resolved" ? (
                <ResolvedComplaint
                  key={complaint.id}
                  complaint={complaint}
                  className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow-md"
                />
              ) : (
                <ComplaintMessage
                  key={complaint.id}
                  complaint={complaint}
                  className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md"
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackProgress;
