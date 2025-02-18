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