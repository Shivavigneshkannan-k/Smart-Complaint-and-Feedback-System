import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Section with Back Button */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <span className="text-lg">←</span> Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Add Common Issue</h1>
        <div className="w-12"></div> {/* Empty div for alignment */}
      </div>

      {/* Form Section */}
      <form className="flex flex-col items-center px-6 mt-8" onSubmit={handleSubmit}>
        {/* Issue Title */}
        <div className="w-full max-w-lg mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Issue Title:</label>
          <input
            type="text"
            placeholder="Enter issue title"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="w-full max-w-lg mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Description:</label>
          <textarea
            placeholder="Describe the issue within 50 words"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full max-w-lg py-3 text-lg font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-all disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
};

export default AddCommonIssue;
