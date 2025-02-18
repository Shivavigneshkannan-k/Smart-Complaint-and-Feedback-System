import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AddCommonIssue = () => {
  const [issueTitle, setIssueTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueTitle.trim() || !description.trim()) {
      alert("Please enter both title and description.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "CommonIssues"), {
        title: issueTitle,
        description: description,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),
      });

      alert("Issue added successfully!");
      navigate("/commonIssues"); // Navigate back to issues page
    } catch (error) {
      console.error("Error adding issue:", error);
      alert("Error adding issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Header Section with Back Button */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-all"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Add Common Issue</h1>
        <div className="w-6"></div> {/* Placeholder for spacing */}
      </div>

      {/* Floating Form Card */}
      <form
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl flex flex-col items-center border border-gray-200"
        onSubmit={handleSubmit}
      >
        {/* Issue Title */}
        <div className="w-full mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Issue Title</label>
          <input
            type="text"
            placeholder="Enter issue title"
            className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="w-full mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Description</label>
          <textarea
            placeholder="Describe the issue within 50 words"
            className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition-all disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
};

export default AddCommonIssue;
