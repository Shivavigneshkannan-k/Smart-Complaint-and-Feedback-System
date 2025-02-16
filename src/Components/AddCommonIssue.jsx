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
    <div className="h-screen bg-gray-200">
      <h1 className="text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white">
        Add Common Issue
      </h1>

      <form className="w-full text-xl flex-col items-center m-4 mt-10" onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-2xl font-semibold my-2">Issue:</p>
          <input
            type="text"
            placeholder="Enter issue title"
            className="px-2 py-2 bg-white rounded-md w-[90%]"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <p className="text-2xl font-semibold my-2">Description:</p>
          <textarea
            placeholder="Describe the issue within 50 words"
            className="bg-white p-4 w-[90%] h-40 rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-500 w-[90%] px-2 py-2 rounded-md absolute bottom-5"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
};

export default AddCommonIssue;
