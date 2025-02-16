import { useState, useEffect, useRef } from 'react';
import { FileText, Send, ArrowLeft } from 'lucide-react';
import { storage, db, auth } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';

const FileComplaint = ({ onBack }) => {
  const [complaintType, setComplaintType] = useState('academics');
  const [subCategory, setSubCategory] = useState('');
  const [issue, setIssue] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const description = useRef(null);

  useEffect(() => {
    const fetchUserData = async (uid) => {
      const userRef = doc(db, 'Users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser(userSnap.data());
      }
    };

    auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      let fileURL = '';
      if (file) {
        const fileRef = ref(storage, `complaints/${file.name}-${Date.now()}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'Complaints'), {
        complaintType,
        subCategory,
        issue,
        description: description.current.value,
        fileURL,
        timestamp: Timestamp.now(),
        userId: auth.currentUser.uid,
        status: 'Pending',
      });

      alert('Complaint submitted successfully!');
      setSubCategory('');
      setIssue('');
      description.current.value = '';
      setFile(null);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8">
          <ArrowLeft />
          Back to Home
        </button>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-8">File a Complaint</h2>

          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div>
              <label>Category:</label>
              <select
                className="w-full p-2 rounded-md"
                value={complaintType}
                onChange={(e) => {
                  setComplaintType(e.target.value);
                  setSubCategory('');
                  setIssue('');
                }}
              >
                <option value="academics">Academics</option>
                <option value="nonAcademics">Non Academics</option>
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label>Subcategory:</label>
              <select
                className="w-full p-2 rounded-md"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">Select Subcategory</option>
              </select>
            </div>

            {/* Issue */}
            <div>
              <label>Issue:</label>
              <select
                className="w-full p-2 rounded-md"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              >
                <option value="">Select Issue</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label>Description:</label>
              <textarea
                ref={description}
                className="w-full p-2 rounded-md"
                placeholder="Briefly describe the issue..."
              ></textarea>
            </div>

            {/* File Upload */}
            <div>
              <label>Attach File (Optional):</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 rounded-md"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2 bg-blue-500 text-white rounded-md mt-4"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileComplaint;
