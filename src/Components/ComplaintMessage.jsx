import { useState } from "react";
import moment from "moment";

const ComplaintMessage = ({ complaint }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatus = () => {
    if (complaint.status === "pending") return "Pending";
    if (complaint.status === "resolved") return "Resolved";
    return "In Progress"; // Default to "In Progress" for all other cases
  };

  return (
    <div
      className="p-4 shadow-md bg-white rounded-lg my-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{complaint.complaintTitle}</h1>
        <p className="text-sm text-gray-600">
          {complaint.timestamp ? moment(complaint.timestamp.toDate()).fromNow() : "Unknown Date"}
        </p>
      </div>

      {/* Short Description */}
      <p className="text-gray-700 mt-2">
        {expanded ? complaint.issue : `${complaint.issue?.substring(0, 50) || "No details"}...`}
      </p>

      {/* Status Indicator */}
      <div
        className={`mt-2 text-sm font-semibold px-2 py-1 rounded-md w-max ${
          getStatus() === "Pending"
            ? "bg-yellow-200 text-yellow-800"
            : getStatus() === "In Progress"
            ? "bg-blue-200 text-blue-800"
            : "bg-green-200 text-green-800"
        }`}
      >
        {getStatus()}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold">Complaint Details</h2>
          <p className="text-gray-700 mt-2">{complaint.issue || "No details provided"}</p>

          {/* Additional Details */}
          <div className="mt-2 space-y-2">
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Filed By:</span> {complaint.userName || "Anonymous"}
            </p>
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Department:</span> {complaint.dept || "Unknown"}
            </p>
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Complaint Type:</span> {complaint.complaintType || "Not Specified"}
            </p>
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Submitted To:</span> {complaint.submittedTo || "Unknown"}
            </p>
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Currently Handled By:</span> {complaint.currentlyHandledBy || "Not Assigned"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintMessage;
