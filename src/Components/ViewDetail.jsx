import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ArrowLeft } from "lucide-react"; // Icon for Back Button
import { FaUserCircle } from "react-icons/fa"; // Icon for Anonymous Complaints

// Badge Component for complaint status
const Badge = ({ children, status }) => {
  const statusStyles = {
    Pending: "bg-red-100 text-red-600",
    Resolved: "bg-green-100 text-green-600",
    InProgress: "bg-yellow-100 text-yellow-600",
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-semibold rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </span>
  );
};

const ViewDetail = () => {
  const { id } = useParams(); // Get the ID from URL params
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState(null);
  const [assignedPerson, setAssignedPerson] = useState(null);
  const [complainedUser, setComplainedUser] = useState(null); // Person being blamed
  const [proofDescription, setProofDescription] = useState(""); // Description for the proof
  const [proofImage, setProofImage] = useState(null); // Image for the proof
  const [errorMessage, setErrorMessage] = useState(""); // To display error if proof is not provided

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        const complaintRef = doc(db, "Complaints", id);
        const complaintSnap = await getDoc(complaintRef);

        if (!complaintSnap.exists()) {
          setLoading(false);
          return;
        }

        const data = complaintSnap.data();

        let complaintDate = null;
        let timeLeft = "Unknown";
        let expired = false;

        if (data.timestamp?.seconds) {
          complaintDate = new Date(data.timestamp.seconds * 1000);
          const dueDate = new Date(complaintDate);
          dueDate.setDate(dueDate.getDate() + 1); // 24-hour deadline

          const now = new Date();
          const timeDiff = dueDate - now;

          if (timeDiff <= 0) {
            expired = true;
            timeLeft = "Overdue - Forwarded to Superior";
          } else {
            const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
            timeLeft = hoursLeft
              ? `${hoursLeft} hours left`
              : "Overdue - Forwarded to Superior";
          }
        }

        setComplaint({
          id: complaintSnap.id,
          ...data,
          timestamp: complaintDate
            ? complaintDate.toLocaleString("en-GB", { hour12: true }).replace(/:\d{2}\s/, " ")
            : "Unknown",
          timeLeft,
        });

        // Fetch sender details if `userId` exists, only for non-anonymous complaints
        if (data.userId && !data.anonymous) {
          const senderRef = doc(db, "Users", data.userId);
          const senderSnap = await getDoc(senderRef);

          if (senderSnap.exists()) {
            setSender(senderSnap.data());
          }
        }

        // Fetch assigned person's details if `assignedTo` exists
        if (data.assignedTo) {
          const assignedRef = doc(db, "Users", data.assignedTo);
          const assignedSnap = await getDoc(assignedRef);

          if (assignedSnap.exists()) {
            setAssignedPerson(assignedSnap.data());
          }
        }

        // Fetch the person being complained about (`complainedUser`), using the UID
        if (data.complainedUser) {
          const complainedUserRef = doc(db, "Users", data.complainedUser);
          const complainedUserSnap = await getDoc(complainedUserRef);

          if (complainedUserSnap.exists()) {
            setComplainedUser(complainedUserSnap.data());
          }
        }

        if (expired) {
          await forwardComplaint(complaintSnap.id, data.assignedTo);
        }
      } catch (error) {
        console.error("🚨 Error fetching complaint details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [id]);

  // Forward complaint to the higher authority and set the due time to the current time
  const forwardComplaint = async () => {
    if (!assignedPerson?.higherAuthority) {
      alert("No higher authority assigned to forward this complaint!");
      return;
    }

    try {
      // Get the assigned person's higher authority (or Principal if not available)
      let newAssignee = assignedPerson.higherAuthority;

      // If no higher authority is found, assign it to the Principal
      if (!newAssignee) {
        newAssignee = "PrincipalUID"; // Replace with actual UID of the Principal
      }

      // Set the due time to the current time (no extra 24 hours added)
      const newDueTime = Timestamp.fromDate(new Date());

      // Get reference to the complaint document
      const complaintRef = doc(db, "Complaints", complaint.id);

      // Update the complaint document
      await updateDoc(complaintRef, {
        assignedTo: newAssignee,
        timestamp: newDueTime,  // Set due time to current time
      });

      alert("✅ Complaint forwarded to superior successfully!");
      navigate(-1);  // Navigate back after forwarding the complaint
    } catch (error) {
      console.error("🚨 Error forwarding complaint:", error);
      alert("❌ Failed to forward complaint. Please try again.");
    }
  };

  // Resolve complaint with proof
  const handleResolve = async () => {
    if (!proofDescription || !proofImage) {
      setErrorMessage("Both proof description and file upload are mandatory!");
      return;
    }

    try {
      const complaintRef = doc(db, "Complaints", complaint.id);

      await updateDoc(complaintRef, {
        status: "Resolved",
        resolvedDescription: proofDescription,  // Adding resolution notes
        resolvedProof: proofImage.name,  // Ideally, upload this to storage first
      });

      alert("✅ Complaint resolved successfully!");
      navigate(-1);  // Navigate back after resolving
    } catch (error) {
      console.error("🚨 Error resolving complaint:", error);
      alert("❌ Failed to resolve complaint. Please try again.");
    }
  };

  if (loading)
    return <p className="text-center text-lg font-semibold text-gray-600">Loading complaint details...</p>;
  if (!complaint)
    return <p className="text-center text-lg text-red-500">❌ Complaint not found.</p>;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 min-h-screen p-8">
      <div className="bg-white shadow-xl p-8 rounded-xl max-w-3xl mx-auto">
        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-lg font-semibold">Back</span>
        </button>

        {/* Submitted By or Anonymous */}
        <div className="mt-6 border-t pt-4">
          {complaint.anonymous ? (
            <div className="flex items-center gap-2 mb-4">
              <FaUserCircle className="text-red-600" size={50} />
              <span className="font-semibold text-red-600 text-lg">Anonymous Complaint</span>
            </div>
          ) : (
            <div className="p-4 my-4 bg-blue-200 rounded-md">
              <h2 className="text-xl font-semibold mb-2">Submitted By</h2>
              <p className="text-gray-700">
                <strong>Name:</strong> {sender?.name || "Unknown"}
              </p>
              <p className="text-gray-700">
                <strong>Department:</strong> {sender?.department || "N/A"}
              </p>
              <p className="text-gray-700">
                <strong>Contact:</strong> {sender?.phone || "Not Available"}
              </p>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{complaint.issue}</h1>
        <p className="text-lg text-gray-700 mb-6">{complaint.description}</p>

        {/* Status & Assigned To */}
        <div className="mt-4 flex items-center gap-6 mb-6">
          <Badge status={complaint.status}>{complaint.status}</Badge>
          <p className="text-gray-700 font-semibold">
            <strong>Assigned To:</strong> {assignedPerson?.name || "Not Assigned"}
          </p>
        </div>

        {/* Category & Timestamp */}
        <div className="mt-4 border-t pt-4 space-y-4">
          <p className="text-gray-700">
            <strong>Category:</strong> {complaint.subCategory || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong>Submitted On:</strong> {complaint.timestamp}
          </p>
          <p
            className={`font-semibold text-lg ${
              complaint.timeLeft.includes("Overdue") ? "text-red-500" : "text-blue-500"
            }`}
          >
            {complaint.timeLeft}
          </p>
        </div>

        {/* Person Being Complained About (complainedUser) */}
        {complainedUser && (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Person Being Complained About</h2>
            <p className="text-gray-700">
              <strong>Name:</strong> {complainedUser.name || "Unknown"}
            </p>
            <p className="text-gray-700">
              <strong>Department:</strong> {complainedUser.department || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Contact:</strong> {complainedUser.phone || "Not Available"}
            </p>
          </div>
        )}

        {/* Proof Submission */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Proof (Mandatory)</h2>
          <textarea
            className="w-full p-2 border rounded-lg"
            placeholder="Describe how you resolved the issue..."
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
          />
          <input
            type="file"
            className="mt-2"
            onChange={(e) => setProofImage(e.target.files[0])}
          />
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-6">
          <button
            onClick={handleResolve}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Resolve
          </button>
          <button
            onClick={async () => {
              await forwardComplaint(complaint.id, assignedPerson?.higherAuthority);
              alert("Complaint forwarded to superior!");
            }}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetail;
