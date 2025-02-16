import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ArrowLeft } from "lucide-react"; // Icon for Back Button

// Badge Component for status
const Badge = ({ children, status }) => {
  const statusStyles = {
    Pending: "bg-red-100 text-red-600",
    Resolved: "bg-green-100 text-green-600",
    InProgress: "bg-yellow-100 text-yellow-600",
  };

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {children}
    </span>
  );
};

const ViewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState(null);
  const [assignedPerson, setAssignedPerson] = useState(null);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        console.log("Fetching details for complaint ID:", id);
        const complaintRef = doc(db, "Complaints", id);
        const complaintSnap = await getDoc(complaintRef);

        if (!complaintSnap.exists()) {
          console.warn("❌ Complaint not found!");
          setLoading(false);
          return;
        }

        const data = complaintSnap.data();
        console.log("📌 Complaint Data:", data);

        // Handling Timestamp
        let complaintDate = null;
        let timeLeft = "Unknown";

        if (data.timestamp?.seconds) {
          complaintDate = new Date(data.timestamp.seconds * 1000);
          const dueDate = new Date(complaintDate);
          dueDate.setDate(dueDate.getDate() + 1); // 24-hour deadline

          const now = new Date();
          const timeDiff = dueDate - now;
          timeLeft = timeDiff > 0 ? `${Math.floor(timeDiff / (1000 * 60 * 60))} hours left` : "Overdue!";
        }

        setComplaint({
          id: complaintSnap.id,
          ...data,
          timestamp: complaintDate ? complaintDate.toLocaleString() : "Unknown",
          timeLeft,
        });

        // Fetch sender details if `userId` exists
        if (data.userId) {
          const senderRef = doc(db, "Users", data.userId);
          const senderSnap = await getDoc(senderRef);

          if (senderSnap.exists()) {
            setSender(senderSnap.data());
          } else {
            console.warn(`⚠️ Sender details not found for userId: ${data.userId}`);
          }
        }

        // Fetch assigned person's details if `assignedTo` exists
        if (data.assignedTo) {
          const assignedRef = doc(db, "Users", data.assignedTo);
          const assignedSnap = await getDoc(assignedRef);

          if (assignedSnap.exists()) {
            setAssignedPerson(assignedSnap.data());
          } else {
            console.warn(`⚠️ Assigned person's details not found for userId: ${data.assignedTo}`);
          }
        }
      } catch (error) {
        console.error("🚨 Error fetching complaint details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [id]);

  if (loading) return <p className="text-center text-lg font-semibold text-gray-600">Loading complaint details...</p>;
  if (!complaint) return <p className="text-center text-lg text-red-500">❌ Complaint not found.</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="bg-white shadow-xl p-8 rounded-xl max-w-3xl mx-auto">
        {/* 🔙 Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-700 hover:text-black mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-lg font-semibold">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{complaint.issue}</h1>
        <p className="text-lg text-gray-700 mb-4">{complaint.description}</p>

        {/* Status & Assigned To */}
        <div className="mt-4 flex items-center gap-4">
          <Badge status={complaint.status}>{complaint.status}</Badge>
          <p className="text-gray-700">
            <strong>Assigned To:</strong> {assignedPerson?.name || "Not Assigned"}
          </p>
        </div>

        {/* Category & Timestamp */}
        <div className="mt-4 border-t pt-4 space-y-2">
          <p className="text-gray-700"><strong>Category:</strong> {complaint.subCategory || "N/A"}</p>
          <p className="text-gray-700"><strong>Submitted On:</strong> {complaint.timestamp}</p>
          <p className={`font-semibold text-lg ${complaint.timeLeft.includes("Overdue") ? "text-red-500" : "text-blue-500"}`}>
            {complaint.timeLeft}
          </p>
        </div>

        {/* Submitted By */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Submitted By</h2>
          <p className="text-gray-700"><strong>Name:</strong> {sender?.name || "Unknown"}</p>
          <p className="text-gray-700"><strong>Department:</strong> {sender?.department || "N/A"}</p>
          <p className="text-gray-700"><strong>Contact:</strong> {sender?.phone || "Not Available"}</p>
        </div>

        {/* Attached File */}
        {complaint.fileURL && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Attached File</h2>
            <a href={complaint.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View Attachment
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => alert("✅ Complaint resolved!")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Resolve
          </button>
          <button
            onClick={() => alert("🔼 Complaint forwarded!")}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetail;
