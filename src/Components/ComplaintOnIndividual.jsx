import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, User, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ComplaintOnIndividual = ({ onBack }) => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [higherAuthority, setHigherAuthority] = useState("");
  const [higherAuthorityName, setHigherAuthorityName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterRole, setFilterRole] = useState(""); // Added filter for role
  const [loading, setLoading] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false); // State to toggle filter visibility
  const description = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Users"));
        const userList = [];
        querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) &&
      (filterDept ? user.department === filterDept : true) &&
      (filterRole ? user.role === filterRole : true)
    );
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (dept, role) => {
    setFilterDept(dept);
    setFilterRole(role);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (dept ? user.department === dept : true) &&
      (role ? user.role === role : true)
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setHigherAuthority("");
    setHigherAuthorityName("");

    if (user.higherAuthority) {
      try {
        const higherAuthorityRef = doc(db, "Users", user.higherAuthority);
        const higherAuthoritySnap = await getDoc(higherAuthorityRef);
        if (higherAuthoritySnap.exists()) {
          const higherAuthData = higherAuthoritySnap.data();
          setHigherAuthority(user.higherAuthority);
          setHigherAuthorityName(higherAuthData.name || "No name available");
        }
      } catch (error) {
        console.error("Error fetching higher authority:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !description.current.value.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "Complaints"), {
        complainedUser: selectedUser.id,
        complainedUserName: selectedUser.name,
        description: description.current.value,
        timestamp: Timestamp.now(),
        userId: auth.currentUser.uid,
        assignedTo: higherAuthority,
        anonymous,
        status: "Pending",
      });

      alert("Complaint submitted successfully!");
      setSelectedUser(null);
      setHigherAuthority("");
      setHigherAuthorityName("");
      description.current.value = "";
      setAnonymous(false);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button onClick={()=>{navigate(-1)}} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-all duration-300 mb-8">
          <ArrowLeft className="transition-all duration-300" />
          Back
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
            File a Complaint on an Individual
          </h2>

          {/* Search Bar & Filters */}
          <div className="relative mb-6">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search for a user..."
                className="w-full pl-10 pr-16 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setFilterVisible(!filterVisible)} // Toggle the filter visibility
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
              >
                <Filter />
              </button>
            </div>
          </div>

          {/* Show filters only when filterVisible is true */}
          {filterVisible && (
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">Department</label>
                <select
                  className="p-2 border rounded-md text-sm focus:ring-indigo-500"
                  onChange={(e) => handleFilterChange(e.target.value, filterRole)}
                  value={filterDept}
                >
                  <option value="">Filter by Department</option>
                  {Array.from(new Set(users.map((user) => user.department))).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">Role</label>
                <select
                  className="p-2 border rounded-md text-sm focus:ring-indigo-500"
                  onChange={(e) => handleFilterChange(filterDept, e.target.value)}
                  value={filterRole}
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>
          )}

          {/* User Selection */}
          <div className="mb-6 max-h-60 overflow-y-auto border rounded-md p-3 bg-white">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-2 rounded-md flex justify-between items-center cursor-pointer transition-all
                  ${selectedUser?.id === user.id ? "bg-indigo-600 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <span className="flex items-center gap-2">
                    <User className="text-gray-600" />
                    {user.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No users found</p>
            )}
          </div>

          {/* Selected User & Higher Authority */}
          {selectedUser && (
            <div className="mb-6 bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold">Selected User:</h3>
              <p className="text-gray-700">{selectedUser.name} ({selectedUser.department})</p>
              {higherAuthorityName && (
                <p className="text-gray-500">Higher Authority: {higherAuthorityName}</p>
              )}
            </div>
          )}

          {/* Description Field */}
          <textarea
            ref={description}
            placeholder="Describe your complaint..."
            className="w-full h-32 rounded-md p-3 bg-white resize-none focus:ring focus:ring-blue-200"
          ></textarea>

          {/* Anonymous Checkbox */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
              className="cursor-pointer"
            />
            <label htmlFor="anonymous" className="cursor-pointer">
              Submit anonymously
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 text-black font-semibold rounded-md mt-4 ${selectedUser && description.current?.value.trim() ? "bg-blue-300 hover:bg-blue-400" : "bg-gray-300 cursor-not-allowed"}`}
            onClick={handleSubmit}
            disabled={!selectedUser || !description.current?.value.trim() || loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintOnIndividual;
