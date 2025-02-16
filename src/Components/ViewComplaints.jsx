import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BsClockHistory, BsPersonFill } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import { AiOutlineFieldTime } from "react-icons/ai";
import { HiOutlineClipboardList } from "react-icons/hi";
import { ArrowLeft } from "lucide-react"; // Back Button Icon

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Authenticated User UID:", user.uid);
        setUserUID(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userUID) return;

    const fetchComplaints = async () => {
      try {
        const q = query(
          collection(db, "Complaints"),
          where("assignedTo", "==", userUID),
          where("status", "==", "Pending")
        );
        const querySnapshot = await getDocs(q);

        console.log("Fetched Complaints:", querySnapshot.docs.length);

        const complaintsList = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

            let complaintDate = null;
            let timeLeft = "Unknown";
            let expired = false;

            if (data.timestamp?.seconds) {
              complaintDate = new Date(data.timestamp.seconds * 1000);
              const dueDate = new Date(complaintDate);
              dueDate.setHours(dueDate.getHours() + 24); // 24-hour limit

              const now = new Date();
              const timeDiff = dueDate - now;

              if (timeDiff <= 0) {
                expired = true;
                timeLeft = "Expired - Forwarding...";
              } else {
                timeLeft = `${Math.floor(timeDiff / (1000 * 60 * 60))} hours left`;
              }
            }

            // Fetch sender details
            let senderDetails = { name: "Unknown", dept: "Unknown" };
            if (data.userId) {
              const userDocRef = doc(db, "Users", data.userId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                senderDetails = userDocSnap.data();
              }
            }

            if (expired) {
              console.log(`Forwarding Complaint: ${docSnapshot.id}`);
              await forwardComplaint(docSnapshot.id, data.assignedTo);
            }

            return {
              id: docSnapshot.id,
              ...data,
              timestamp: complaintDate ? complaintDate.toLocaleString() : "Unknown",
              timeLeft,
              sender: senderDetails,
            };
          })
        );

        setComplaints(complaintsList);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userUID]);

  const forwardComplaint = async (complaintId, currentAssignee) => {
    try {
      const userRef = doc(db, "Users", currentAssignee);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn(`User ${currentAssignee} not found.`);
        return;
      }

      const userData = userSnap.data();
      let newAssignee = userData.higherAuthority;

      // If no higher authority exists, assign to Principal
      if (!newAssignee) {
        console.log(`No higher authority for ${currentAssignee}. Assigning to Principal.`);
        newAssignee = "PrincipalUID"; // Replace with actual UID of the Principal
      } else {
        console.log(`Forwarding complaint ${complaintId} from ${currentAssignee} to ${newAssignee}`);
      }

      await updateDoc(doc(db, "Complaints", complaintId), {
        assignedTo: newAssignee,
      });

      console.log(`✅ Complaint ${complaintId} forwarded successfully to ${newAssignee}`);
    } catch (error) {
      console.error("Error forwarding complaint:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🔙 Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-700 hover:text-black mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="text-lg font-semibold">Back</span>
      </button>

      <div className="bg-white shadow-md p-6 rounded-lg flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BsClockHistory className="text-blue-600" size={32} />
          Assigned Pending Complaints
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center text-lg font-semibold text-gray-600">Loading complaints...</p>
        ) : complaints.length > 0 ? (
          complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white shadow-lg p-6 rounded-lg cursor-pointer hover:shadow-xl transition"
              onClick={() => navigate(`/viewDetail/${complaint.id}`)}
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <HiOutlineClipboardList className="text-blue-500" size={22} />
                {complaint.issue}
              </h2>

              <div className="mt-4 text-gray-700 space-y-2">
                <p className="flex items-center gap-2">
                  <BsPersonFill className="text-gray-500" size={18} />
                  <span className="font-medium">{complaint.sender?.name || "Unknown"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MdDateRange className="text-gray-500" size={18} />
                  <span>{complaint.timestamp}</span>
                </p>
                <p className="flex items-center gap-2">
                  <AiOutlineFieldTime className="text-gray-500" size={18} />
                  <span>{complaint.timeLeft}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-gray-500 font-semibold">Department:</span>
                  {complaint.sender?.department || "Unknown"}
                </p>
              </div>

              <div className="mt-4">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {complaint.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-lg text-gray-600 mt-6">No pending complaints.</p>
        )}
      </div>
    </div>
  );
};

export default ViewComplaints;
