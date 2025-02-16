import { useRef, useState, useEffect } from "react";
import { options } from "./utils/constant";
import { storage, db, auth } from "../firebaseConfig"; // Ensure correct Firebase import
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Complaints = () => {
  console.log("Component Loaded ✅");

  const description = useRef(null);
  const [complaintType, setComplaintType] = useState("academics");
  const [subCategory, setSubCategory] = useState("");
  const [issue, setIssue] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [higherAuthority, setHigherAuthority] = useState("");
  const [higherAuthorityName, setHigherAuthorityName] = useState(""); // New state for higher authority name

  // Fetch authenticated user info
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
          
          // Fetch higher authority name if it exists
          if (userData.higherAuthority) {
            const higherAuthorityRef = doc(db, "Users", userData.higherAuthority);
            const higherAuthoritySnap = await getDoc(higherAuthorityRef);
            if (higherAuthoritySnap.exists()) {
              const higherAuthorityData = higherAuthoritySnap.data();
              setHigherAuthorityName(higherAuthorityData.name || "No name available");
            } else {
              setHigherAuthorityName("No higher authority found");
            }
          }
        } else {
          console.error("User data not found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        console.error("User not authenticated.");
      }
    });
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting Complaint...");
      let fileURL = "";

      // If a file is selected, upload it to Firebase Storage
      if (file) {
        console.log("Uploading File:", file.name);
        const fileRef = ref(storage, `complaints/${file.name}-${Date.now()}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
        console.log("File Uploaded Successfully:", fileURL);
      }

      // Store complaint in Firestore
      await addDoc(collection(db, "Complaints"), {
        complaintType,
        subCategory,
        issue,
        description: description.current.value,
        fileURL,
        timestamp: Timestamp.now(),
        userId: auth.currentUser.uid,
        assignedTo: higherAuthority, // Keep the higher authority ID
        status: "Pending",
      });

      alert("Complaint submitted successfully!");
      setSubCategory("");
      setIssue("");
      description.current.value = "";
      setFile(null);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl px-8 py-8 rounded-b-2xl shadow-lg bg-white">
        File Complaint
      </h2>
      <div className="flex-col justify-center items-center min-h-screen p-6 bg-gray-200 text-xl pt-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Category Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category:
            </label>
            <select
              className="w-full bg-white rounded-md p-2 focus:ring focus:ring-blue-200"
              value={complaintType}
              onChange={(e) => {
                setComplaintType(e.target.value);
                setSubCategory("");
                setIssue("");
              }}
            >
              <option value="academics">Academics</option>
              <option value="nonAcademics">Non Academics</option>
            </select>
          </div>

          {/* Subcategory Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Subcategory:
            </label>
            <select
              className="w-full bg-white rounded-md p-2 focus:ring focus:ring-blue-200"
              value={subCategory}
              onChange={(e) => {
                setSubCategory(e.target.value);
                setIssue("");
              }}
            >
              <option value="" disabled>
                Select a subcategory
              </option>
              {Object.keys(options?.[complaintType])?.map((key, index) => (
                <option key={index} value={key}>
                  {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Issue:
            </label>
            <select
              className="w-full rounded-md p-2 bg-white focus:ring focus:ring-blue-200"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            >
              <option value="" disabled>
                Select an issue
              </option>
              {options?.[complaintType]?.[subCategory]?.map((choice, index) => (
                <option key={index} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>

          {/* Description Box */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description:
            </label>
            <textarea
              ref={description}
              placeholder="Briefly describe the issue..."
              className="w-full h-32 rounded-md p-3 bg-white resize-none focus:ring focus:ring-blue-200"
            ></textarea>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Attach File (Optional):
            </label>
            <input
              type="file"
              className="w-full bg-white rounded-md p-2 focus:ring focus:ring-blue-200"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {/* Assigned Higher Authority (Name Displayed) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Assigned Higher Authority:
            </label>
            <input
              type="text"
              value={higherAuthorityName ? higherAuthorityName : "No assigned authority"}
              disabled
              className="w-full bg-gray-100 rounded-md p-2"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-[80%] py-2 text-black font-semibold rounded-md transition bg-blue-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-400"
            }`}
            disabled={!issue || loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Complaints;
