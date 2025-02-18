// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
// import { db } from "../firebaseConfig";
// import { ArrowLeft } from "lucide-react"; // Back Button Icon
// import { FaUserCircle } from "react-icons/fa"; // Icon for Anonymous Complaints

// // Badge Component for complaint status
// const Badge = ({ children, status }) => {
//   const statusStyles = {
//     Pending: "bg-red-100 text-red-600",
//     Resolved: "bg-green-100 text-green-600",
//     InProgress: "bg-yellow-100 text-yellow-600"
//   };

//   return (
//     <span
//       className={`px-3 py-1 text-sm font-semibold rounded-full ${
//         statusStyles[status] || "bg-gray-100 text-gray-600"
//       }`}>
//       {children}
//     </span>
//   );
// };

// const ViewDetail = () => {
//   const { id } = useParams(); // Get complaint ID from URL
//   const navigate = useNavigate();
//   const [complaint, setComplaint] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [sender, setSender] = useState(null);
//   const [assignedPerson, setAssignedPerson] = useState(null);
//   const [complainedUser, setComplainedUser] = useState(null); // The accused person
//   const [proofDescription, setProofDescription] = useState(""); // Proof description
//   const [proofImage, setProofImage] = useState(null); // Proof image file
//   const [errorMessage, setErrorMessage] = useState(""); // Error message

//   useEffect(() => {
//         const fetchComplaintDetails = async () => {
//         try {
//             const complaintRef = doc(db, "Complaints", id);
//             const complaintSnap = await getDoc(complaintRef);

//             if (!complaintSnap.exists()) {
//             setLoading(false);
//             return;
//             }

//             const data = complaintSnap.data();

//             let complaintDate = null;
//             let timeLeft = "Unknown";

//             if (data.timestamp?.seconds) {
//             complaintDate = new Date(data.timestamp.seconds * 1000);
//             const dueDate = new Date(complaintDate);
//             dueDate.setHours(dueDate.getHours() + 24); // 24-hour deadline

//             const now = new Date();
//             const timeDiff = dueDate - now;

//             timeLeft = timeDiff <= 0 ? "Overdue - Forwarded to Superior" : ${Math.floor(timeDiff / (1000 * 60 * 60))} hours left;
//             }

//             setComplaint({
//             id: complaintSnap.id,
//             ...data,
//             timestamp: complaintDate
//                 ? complaintDate.toLocaleString("en-GB", { hour12: true }).replace(/:\d{2}\s/, " ")
//                 : "Unknown",
//             timeLeft
//             });

//             // Fetch sender details if not anonymous
//             if (data.userId && !data.anonymous) {
//             const senderRef = doc(db, "Users", data.userId);
//             const senderSnap = await getDoc(senderRef);

//             if (senderSnap.exists()) {
//                 setSender(senderSnap.data());
//             }
//             }

//             // Fetch assigned person's details
//             if (data.assignedTo) {
//             const assignedRef = doc(db, "Users", data.assignedTo);
//             const assignedSnap = await getDoc(assignedRef);

//             if (assignedSnap.exists()) {
//                 setAssignedPerson(assignedSnap.data());
//             }
//             }

//             // Fetch the accused person's details
//             if (data.complainedUser) {
//             const complainedUserRef = doc(db, "Users", data.complainedUser);
//             const complainedUserSnap = await getDoc(complainedUserRef);

//             if (complainedUserSnap.exists()) {
//                 setComplainedUser(complainedUserSnap.data());
//             }
//             }
//         } catch (error) {
//             console.error("🚨 Error fetching complaint details:", error);
//         } finally {
//             setLoading(false);
//         }
//         };

//         fetchComplaintDetails();
//     }, [id]);

//     // Forward complaint to the higher authority and extend the due time by 24 hours
//     const forwardComplaint = async () => {
//         if (!assignedPerson?.higherAuthority) {
//         alert("No higher authority assigned to forward this complaint!");
//         return;
//         }

//         try {
//         const newDueTime = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Extend by 24 hours
//         const complaintRef = doc(db, "Complaints", complaint.id);

//         await updateDoc(complaintRef, {
//             assignedTo: assignedPerson.higherAuthority,
//             timestamp: newDueTime, // Update the timestamp
//         });

//         alert("✅ Complaint forwarded to superior successfully!");
        
//         // Navigate back after forwarding
//         navigate(-1);
//         } catch (error) {
//         console.error("🚨 Error forwarding complaint:", error);
//         alert("❌ Failed to forward complaint. Please try again.");
//         }
//     };

//     // Resolve complaint with proof
//     const handleResolve = async () => {
//         if (!proofDescription || !proofImage) {
//         setErrorMessage("Both proof description and file upload are mandatory!");
//         return;
//         }

//         try {
//         const complaintRef = doc(db, "Complaints", complaint.id);

//         await updateDoc(complaintRef, {
//             status: "Resolved",
//             resolvedDescription: proofDescription,  // Adding resolution notes
//             resolvedProof: proofImage.name,  // Ideally, upload this to storage first
//         });

//         alert("✅ Complaint resolved successfully!");
        
//         // Navigate back after resolving
//         navigate(-1);
//         } catch (error) {
//         console.error("🚨 Error resolving complaint:", error);
//         alert("❌ Failed to resolve complaint. Please try again.");
//         }
//     };

//   if (loading)
//     return <p className='text-center text-lg font-semibold text-gray-600'>Loading complaint details...</p>;
//   if (!complaint)
//     return <p className='text-center text-lg text-red-500'>❌ Complaint not found.</p>;

//   return (
//     <div className='bg-gray-100 min-h-screen p-8'>
//       <div className='bg-white shadow-xl p-8 rounded-xl max-w-3xl mx-auto'>

//         {/* 🔙 Back Button */}
//         <button onClick={() => navigate(-1)} className='flex items-center text-gray-700 hover:text-black mb-6'>
//           <ArrowLeft className='w-5 h-5 mr-2' />
//           <span className='text-lg font-semibold'>Back</span>
//         </button>

//         <h1 className='text-3xl font-bold text-gray-900 mb-4'>{complaint.issue}</h1>
//         <p className='text-lg text-gray-700 mb-6'>{complaint.description}</p>

//         <Badge status={complaint.status}>{complaint.status}</Badge>

//         <div className='mt-6 border-t pt-4'>
//           <h2 className='text-xl font-semibold mb-2'>Proof (Mandatory)</h2>
//           <textarea className='w-full p-2 border rounded-lg' placeholder='Describe resolution...' value={proofDescription} onChange={(e) => setProofDescription(e.target.value)} />
//           <input type='file' className='mt-2' onChange={(e) => setProofImage(e.target.files[0])} />
//           {errorMessage && <p className='text-red-500 mt-2'>{errorMessage}</p>}
//         </div>

//         {/* Action Buttons */}
//         <div className='mt-6 flex gap-6'>
//           <button onClick={handleResolve} className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'>Resolve</button>
//           <button onClick={forwardComplaint} className='bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors'>Forward</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewDetail;

// -- unwanted