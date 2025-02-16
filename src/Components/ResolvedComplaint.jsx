import { useState } from "react";
import Rating from "./Rating";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import moment from "moment";

const ResolvedComplaint = ({ complaint }) => {
  const [showRating, setShowRating] = useState(false);

  const handleSatisfaction = async (satisfied) => {
    try {
      const complaintRef = doc(db, "Complaints", complaint.id);
      await updateDoc(complaintRef, { satisfied });
      alert(`Complaint marked as ${satisfied ? "Satisfied" : "Unsatisfied"}`);
    } catch (error) {
      console.error("Error updating satisfaction:", error);
    }
  };

  return (
    <div className='p-4 shadow-md bg-white rounded-lg flex flex-col my-4'>
      <h1 className='ml-2 text-lg font-semibold'>{complaint.complaintTitle}</h1>
      <p className="ml-2 text-gray-700">{complaint.issue}</p>
      <p className="ml-2 text-gray-500 text-sm">Resolved {moment(complaint.timestamp.toDate()).fromNow()}</p>

      <div className="flex gap-4 justify-end mt-2">
        <button
          className="bg-green-400 py-1 px-2 rounded-md text-md cursor-pointer shadow-md"
          onClick={() => {
            setShowRating(true);
            handleSatisfaction(true);
          }}
        >
          Satisfied
        </button>
        <button
          className="bg-red-500 py-1 px-2 rounded-md text-md cursor-pointer shadow-md"
          onClick={() => handleSatisfaction(false)}
        >
          Unsatisfied
        </button>
      </div>

      {showRating && <Rating setShowRating={setShowRating} />}
    </div>
  );
};

export default ResolvedComplaint;
