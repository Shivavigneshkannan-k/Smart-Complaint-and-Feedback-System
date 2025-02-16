import { useNavigate } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { Badge } from "@/components/ui/badge"; // ShadCN UI badge for better styling

const ViewComplaintMessage = ({ complaint }) => {
  const navigate = useNavigate();
  const isOverdue = complaint.timeLeft.includes("Overdue");

  return (
    <div
      className="p-6 bg-white shadow-lg rounded-2xl flex flex-col my-4 cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl border border-gray-200"
      onClick={() => navigate(`/viewDetail/${complaint.id}`)}
    >
      {/* Complaint Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
          <FaUserCircle className="text-gray-600" size={40} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">{complaint.sender?.name || "Anonymous"}</p>
          <p className="text-sm text-gray-600">{complaint.sender?.dept || "Unknown Department"}</p>
        </div>
      </div>

      {/* Complaint Content */}
      <div className="ml-20 mt-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <MdErrorOutline className="text-red-500" size={24} />
          {complaint.issue}
        </h1>
        <p className="text-sm text-gray-500">{complaint.timestamp || "Just now"}</p>
      </div>

      {/* Status & Time Left */}
      <div className="ml-20 mt-3 flex items-center justify-between">
        <Badge className={`px-3 py-1 text-sm rounded-full ${isOverdue ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
          {complaint.timeLeft}
        </Badge>
      </div>
    </div>
  );
};

export default ViewComplaintMessage;
