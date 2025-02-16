import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Paperclip, XCircle } from "lucide-react";
import { options } from "./utils/constant";
import { storage, db, auth } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const FileComplaint = ({ onBack }) => {
  console.log("Component Loaded ✅");
  const navigate = useNavigate()
  const [complaintType, setComplaintType] = useState("academics");
  const [subCategory, setSubCategory] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState(""); // ✅ Fixed description state
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [higherAuthority, setHigherAuthority] = useState("");
  const [higherAuthorityName, setHigherAuthorityName] = useState("");

  useEffect(() => {
    console.log("Complaints Component Rendered");

    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
          setHigherAuthority(userData.higherAuthority || "");

          if (userData.higherAuthority) {
            const higherAuthorityRef = doc(db, "Users", userData.higherAuthority);
            const higherAuthoritySnap = await getDoc(higherAuthorityRef);
            if (higherAuthoritySnap.exists()) {
              setHigherAuthorityName(higherAuthoritySnap.data().name || "No name available");
            } else {
              setHigherAuthorityName("No higher authority found");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!complaintType || !subCategory || !issue || !description.trim()) return;

    setLoading(true);
    try {
      let fileURL = "";
      if (file) {
        const fileRef = ref(storage, `complaints/${file.name}-${Date.now()}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "Complaints"), {
        complaintType,
        subCategory,
        issue,
        description,
        fileURL,
        timestamp: Timestamp.now(),
        userId: auth.currentUser.uid,
        assignedTo: higherAuthority,
        status: "Pending"
      });

      alert("Complaint submitted successfully!");
      setSubCategory("");
      setIssue("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = complaintType && subCategory && issue && description.trim(); // ✅ Fixed validation logic

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* ✅ Fixed Back Button */}
        <button
          onClick={()=>navigate(-1)} 
          className='flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-all duration-300 mb-8'>
          <ArrowLeft className='transition-all duration-300' />
          Back to Home
        </button>

        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8'>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8'>
            File a Complaint
          </h2>

          <form onSubmit={handleSubmit} className='space-y-6'>

            {/* Category Selection */}
            <div>
              <h3 className="text-gray-700 font-semibold mb-2">Select Category</h3>
              <div className="flex gap-3">
                {Object.keys(options).map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => {
                      setComplaintType(category);
                      setSubCategory("");
                      setIssue("");
                    }}
                    className={`px-4 py-2 rounded-lg text-gray-700 font-medium shadow-sm transition-all 
                      ${complaintType === category ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {category.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Selection */}
            <div>
              <h3 className="text-gray-700 font-semibold mb-2">Select Subcategory</h3>
              <div className="flex flex-wrap gap-3">
                {Object.keys(options[complaintType]).map((subcategory) => (
                  <button
                    type="button"
                    key={subcategory}
                    onClick={() => setSubCategory(subcategory)}
                    className={`px-4 py-2 rounded-lg text-gray-700 font-medium shadow-sm transition-all 
                      ${subCategory === subcategory ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {subcategory.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Selection */}
            <div>
              <h3 className="text-gray-700 font-semibold mb-2">Select Issue</h3>
              <div className="flex flex-wrap gap-3">
                {options[complaintType][subCategory]?.map((issueItem, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setIssue(issueItem)}
                    className={`px-4 py-2 rounded-lg text-gray-700 font-medium shadow-sm transition-all 
                      ${issue === issueItem ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {issueItem}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe your issue...'
              className='w-full h-32 rounded-md p-3 bg-white resize-none focus:ring focus:ring-blue-200'></textarea>

            {/* File Upload (Optional) */}
            <div>
              <label className="text-gray-700 font-medium">Attach File (Optional):</label>
              <div className="flex items-center gap-2">
                <input type="file" className="bg-white rounded-md p-2" onChange={(e) => setFile(e.target.files[0])} />
                {file && (
                  <div className="flex items-center gap-2">
                    <Paperclip className="text-gray-500" />
                    <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button type='submit' className={`w-full py-2 text-black font-semibold rounded-md 
              ${isFormValid ? "bg-blue-300 hover:bg-blue-400" : "bg-gray-300 cursor-not-allowed"}`} disabled={!isFormValid || loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileComplaint;
