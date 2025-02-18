import React, { useState, useEffect } from 'react';
import { ChevronRight, Send, ArrowLeft, Folder, FolderOpen, MessageSquare, PenLine, Home, Search } from 'lucide-react';
import { storage, db, auth } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { categories } from './utils/constant';
import { useNavigate } from 'react-router-dom';

// Priority configuration
const PRIORITY_LEVELS = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

const PRIORITY_KEYWORDS = {
  [PRIORITY_LEVELS.HIGH]: [
    'water', 'current', 'electricity', 'emergency', 'medical', 'fire', 
    'security', 'safety', 'harassment', 'bullying', 'health'
  ],
  [PRIORITY_LEVELS.MEDIUM]: [
    'network', 'wifi', 'ventilation', 'cleanliness', 'hygiene', 
    'transportation', 'food quality', 'scholarship', 'financial'
  ],
  [PRIORITY_LEVELS.LOW]: [
    'door repair', 'furniture', 'curriculum', 'syllabus', 
    'stationary', 'sports equipment', 'laundry'
  ]
};

// Determine priority based on issue and description
function determinePriority(issue, description) {
  const content = `${issue.toLowerCase()} ${description.toLowerCase()}`;
  
  for (const keyword of PRIORITY_KEYWORDS[PRIORITY_LEVELS.HIGH]) {
    if (content.includes(keyword)) return PRIORITY_LEVELS.HIGH;
  }
  
  for (const keyword of PRIORITY_KEYWORDS[PRIORITY_LEVELS.MEDIUM]) {
    if (content.includes(keyword)) return PRIORITY_LEVELS.MEDIUM;
  }
  
  for (const keyword of PRIORITY_KEYWORDS[PRIORITY_LEVELS.LOW]) {
    if (content.includes(keyword)) return PRIORITY_LEVELS.LOW;
  }
  
  return PRIORITY_LEVELS.MEDIUM; // Default priority
}
function ComplaintForm({ selectedCategory, selectedSubcategory, selectedIssue, description, onDescriptionChange, onFileChange, onSubmit, loading }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 space-y-3 transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="font-medium text-indigo-700">Category:</span>
          <span className="text-gray-800">{selectedCategory.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-indigo-700">Subcategory:</span>
          <span className="text-gray-800">{selectedSubcategory.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-indigo-700">Issue:</span>
          <span className="text-gray-800">{selectedIssue}</span>
        </div>
      </div>

      <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <div className="relative">
          <PenLine className="absolute top-3 left-3 w-5 h-5 text-indigo-400" />
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-lg border-2 border-indigo-100 pl-10 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300"
            placeholder="Please provide details about your issue..."
            value={description}
            onChange={onDescriptionChange}
            required
          />
        </div>
      </div>

      <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
          Attachments (optional)
        </label>
        <input
          type="file"
          id="attachments"
          multiple
          onChange={onFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-300"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 group"
        onClick={onSubmit}
      >
        {loading ? 'Submitting...' : 'Submit Complaint'}
        <Send className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
      </button>
    </div>
  );
}
function IssueSelector({ issues, onSelectIssue }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
      {issues.map((issue) => (
        <button
          key={issue}
          type="button"
          onClick={() => onSelectIssue(issue)}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center transition-all duration-300 group-hover:bg-pink-200">
            <MessageSquare className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-lg font-medium text-gray-800">{issue}</span>
        </button>
      ))}
    </div>
  );
}
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = (input) => {
    setQuery(input);
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }

    const allIssues = categories.flatMap((category) =>
      category.subcategories.flatMap((sub) => sub.issues)
    );

    const uniqueIssues = Array.from(new Set(allIssues));
    const filteredSuggestions = uniqueIssues.filter((issue) =>
      issue.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filteredSuggestions.slice(0, 5));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(query); }} className="w-full max-w-2xl mx-auto mb-8 relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for your issue..."
          className="w-full px-4 py-3 pl-12 rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-indigo-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
                setSuggestions([]);
              }}
              className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
function Breadcrumbs({ selectedCategory, selectedSubcategory, selectedIssue, onBreadcrumbClick }) {
  const breadcrumbs = [
    {
      icon: Home,
      text: 'Home',
      active: !selectedCategory,
      onClick: () => onBreadcrumbClick('home'),
    },
  ];

  if (selectedCategory) {
    breadcrumbs.push({
      icon: Folder,
      text: selectedCategory.name,
      active: !selectedSubcategory,
      onClick: () => onBreadcrumbClick('category'),
    });
  }

  if (selectedSubcategory) {
    breadcrumbs.push({
      icon: FolderOpen,
      text: selectedSubcategory.name,
      active: !selectedIssue,
      onClick: () => onBreadcrumbClick('subcategory'),
    });
  }

  if (selectedIssue) {
    breadcrumbs.push({
      icon: MessageSquare,
      text: selectedIssue,
      active: true,
      onClick: () => {},
    });
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-md">
      <div className="flex items-center flex-wrap gap-2">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.text}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            <button
              onClick={crumb.onClick}
              className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-300 ${
                crumb.active
                  ? 'text-indigo-600 font-semibold hover:bg-indigo-50'
                  : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <crumb.icon className="w-4 h-4" />
              <span>{crumb.text}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
function CategorySelector({ categories, onSelectCategory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelectCategory(category)}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-200">
            <Folder className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-lg font-medium text-gray-800">{category.name}</span>
        </button>
      ))}
    </div>
  );
} 
function SubcategorySelector({ subcategories, onSelectSubcategory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
      {subcategories.map((subcategory) => (
        <button
          key={subcategory.id}
          type="button"
          onClick={() => onSelectSubcategory(subcategory)}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-200">
            <FolderOpen className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-lg font-medium text-gray-800">{subcategory.name}</span>
        </button>
      ))}
    </div>
  );
}


function FileComplaint({ onBack }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [higherAuthority, setHigherAuthority] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, 'Users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setHigherAuthority(data.higherAuthority || '');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchUserData(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        const matchingIssue = subcategory.issues.find((issue) =>
          issue.toLowerCase().includes(query.toLowerCase())
        );
        if (matchingIssue) {
          setSelectedCategory(category);
          setSelectedSubcategory(subcategory);
          setSelectedIssue(matchingIssue);
          return;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) return;

    if (!selectedCategory || !selectedSubcategory || !selectedIssue || !description.trim()) {
      alert('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Upload attachments if any
      let fileURLs = [];
      if (attachments.length > 0) {
        fileURLs = await Promise.all(
          attachments.map(async (file) => {
            const fileRef = ref(storage, `complaints/${file.name}-${Date.now()}`);
            await uploadBytes(fileRef, file);
            return getDownloadURL(fileRef);
          })
        );
      }

      // Determine priority
      const priority = determinePriority(selectedIssue, description);

      // Determine assignment
      let assignedTo = higherAuthority;
      const isHostelComplaint = 
        selectedCategory.name === "Non-Academic Issues" && 
        selectedSubcategory.name === "Hostel & Accommodation Issues";

      if (isHostelComplaint) {
        const wardensQuery = query(collection(db, 'Users'), where('warden', '==', true));
        const querySnapshot = await getDocs(wardensQuery);
        
        if (!querySnapshot.empty) {
          assignedTo = querySnapshot.docs[0].id; // Assign to first warden found
        }
      }

      // Create complaint document
      const complaintData = {
        complaintType: selectedCategory.name,
        subCategory: selectedSubcategory.name,
        issue: selectedIssue,
        description,
        fileURLs,
        priority,
        timestamp: Timestamp.now(),
        userId: auth.currentUser.uid,
        userDepartment: userData.department,
        userYear: userData.year,
        userSection: userData.section,
        assignedTo,
        status: "Pending",
        escalationHistory: [],
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now()
      };

      await addDoc(collection(db, "Complaints"), complaintData);

      alert('Complaint submitted successfully!');
      // Reset form
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedIssue(null);
      setDescription('');
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleBack = () => {
    if (selectedIssue) {
      setSelectedIssue(null);
    } else if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate(-1);
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      {
        icon: Home,
        text: 'Home',
        active: !selectedCategory,
        onClick: () => {
          setSelectedCategory(null);
          setSelectedSubcategory(null);
          setSelectedIssue(null);
        },
      },
    ];

    if (selectedCategory) {
      breadcrumbs.push({
        icon: Folder,
        text: selectedCategory.name,
        active: !selectedSubcategory,
        onClick: () => {
          setSelectedSubcategory(null);
          setSelectedIssue(null);
        },
      });
    }

    if (selectedSubcategory) {
      breadcrumbs.push({
        icon: FolderOpen,
        text: selectedSubcategory.name,
        active: !selectedIssue,
        onClick: () => setSelectedIssue(null),
      });
    }

    if (selectedIssue) {
      breadcrumbs.push({
        icon: MessageSquare,
        text: selectedIssue,
        active: true,
        onClick: () => {},
      });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 transition-all duration-500">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-all duration-300 mb-8 group"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-all duration-300" />
          Back
        </button>

        {/* Interactive Breadcrumb Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-md">
          <div className="flex items-center flex-wrap gap-2">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.text}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <button
                  onClick={crumb.onClick}
                  className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-300 ${
                    crumb.active
                      ? 'text-indigo-600 font-semibold hover:bg-indigo-50'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <crumb.icon className="w-4 h-4" />
                  <span>{crumb.text}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-200/50 p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-300/50">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 animate-fade-in">
            File a Complaint
          </h2>

          {!selectedIssue && <SearchBar onSearch={handleSearch} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!selectedCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 group transform hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-200">
                      <Folder className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-lg font-medium text-gray-800">{category.name}</span>
                  </button>
                ))}
              </div>
            ) : !selectedSubcategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                {selectedCategory.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group transform hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-200">
                      <FolderOpen className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-lg font-medium text-gray-800">{subcategory.name}</span>
                  </button>
                ))}
              </div>
            ) : !selectedIssue ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                {selectedSubcategory.issues.map((issue) => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => setSelectedIssue(issue)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 group transform hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center transition-all duration-300 group-hover:bg-pink-200">
                      <MessageSquare className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-lg font-medium text-gray-800">{issue}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 space-y-3 transform hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-indigo-700">Category:</span>
                    <span className="text-gray-800">{selectedCategory.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-indigo-700">Subcategory:</span>
                    <span className="text-gray-800">{selectedSubcategory.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-indigo-700">Issue:</span>
                    <span className="text-gray-800">{selectedIssue}</span>
                  </div>
                </div>

                <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <PenLine className="absolute top-3 left-3 w-5 h-5 text-indigo-400" />
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full rounded-lg border-2 border-indigo-100 pl-10 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300"
                      placeholder="Please provide details about your issue..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (optional)
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                  <Send className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default FileComplaint;