import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ViewDetail = () => {
  const { id } = useParams(); // Get complaint ID from URL
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        console.log("Fetching details for complaint ID:", id);
        const complaintRef = doc(db, "Complaints", id);
        const complaintSnap = await getDoc(complaintRef);

        if (complaintSnap.exists()) {
          const data = complaintSnap.data();

          // Convert Firestore timestamp to readable format
          let complaintDate = null;
          let timeLeft = "Unknown";

          if (data.timestamp?.seconds) {
            complaintDate = new Date(data.timestamp.seconds * 1000);
            const dueDate = new Date(complaintDate);
            dueDate.setDate(dueDate.getDate() + 3); // 3-day resolution period

            const now = new Date();
            const timeDiff = dueDate - now;
            timeLeft =
              timeDiff > 0
                ? `${Math.floor(timeDiff / (1000 * 60 * 60 * 24))} days left`
                : "Overdue!";
          }

          setComplaint({
            id: complaintSnap.id,
            ...data,
            timestamp: complaintDate ? complaintDate.toLocaleString() : "Unknown",
            timeLeft,
          });
        } else {
          console.log("Complaint not found");
        }
      } catch (error) {
        console.error("Error fetching complaint details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [id]);

  if (loading) return <p className="text-center text-lg">Loading complaint details...</p>;
  if (!complaint) return <p className="text-center text-lg text-red-500">Complaint not found.</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">{complaint.issue}</h1>
        <p className="text-lg text-gray-600 mb-2">{complaint.description}</p>
        
        <div className="mt-4">
          <p><strong>Status:</strong> <span className={`text-${complaint.status === "Pending" ? "red" : "green"}-500`}>{complaint.status}</span></p>
          <p><strong>Category:</strong> {complaint.subCategory || "N/A"}</p>
          <p><strong>Assigned To:</strong> {complaint.assignedTo || "Not Assigned"}</p>
        </div>

        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Submitted By</h2>
          <p><strong>Name:</strong> {complaint.sender?.name || "Unknown"}</p>
          <p><strong>Department:</strong> {complaint.sender?.dept || "N/A"}</p>
          <p><strong>Contact:</strong> {complaint.sender?.phone || "Not Available"}</p>
          <p><strong>Submitted On:</strong> {complaint.timestamp}</p>
          <p className="text-red-500 font-semibold">{complaint.timeLeft}</p>
        </div>

        {complaint.fileURL && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Attached File</h2>
            <a
              href={complaint.fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Attachment
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDetail;
