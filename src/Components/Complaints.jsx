import { useRef, useState } from "react";
import { options } from "./utils/constant";
const Complaints = () => {
  const description = useRef(null);
  const [complaintType, setComplaintType] = useState("academics");
  const [subCategory, setSubCategory] = useState("");
  const [issue, setIssue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", {
      complaintType,
      subCategory,
      issue,
      description: description.current.value
    });
  };

  return (
    <>
      <h2 className='text-3xl px-8 py-8 rounded-b-2xl shadow-lg bg-white'>
        File Complaint
      </h2>
      <div className='flex-col justify-center items-center min-h-screen p-6 bg-gray-200 text-xl pt-10'>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4'>
          {/* Category Selection */}
          <div>
            <label className='block text-gray-700 font-medium mb-1'>
              Category:
            </label>
            <select
              className='w-full bg-white rounded-md p-2 focus:ring focus:ring-blue-200'
              value={complaintType}
              onChange={(e) => {
                setComplaintType(e.target.value);
                setSubCategory("");
                setIssue("");
              }}>
              <option
                value='academics'
                selected>
                Academics
              </option>
              <option value='nonAcademics'>Non Academics</option>
            </select>
          </div>

          {/* Academic Subcategory Selection */}
          <div>
            <label className='block text-gray-700 font-medium mb-1'>
              Subcategory:
            </label>
            <select
              className='w-full bg-white rounded-md p-2 focus:ring focus:ring-blue-200'
              value={subCategory}
              onChange={(e) => {
                setSubCategory(e.target.value);
                setIssue("");
              }}>
              <option
                value=''
                disabled>
                Select a subcategory
              </option>
              {Object.keys(options?.[complaintType])?.map((key, index) => (
                <option
                  key={index}
                  value={key}>
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Issue Selection */}
          <div>
            <label className='block text-gray-700 font-medium mb-1'>
              Issue:
            </label>
            <select
              className='w-full rounded-md p-2  bg-white focus:ring focus:ring-blue-200'
              value={issue}
              onChange={(e) => setIssue(e.target.value)}>
              <option
                value=''
                disabled>
                Select an issue
              </option>
              {options?.[complaintType]?.[subCategory]?.map((choice, index) => (
                <option
                  key={index}
                  value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>

          {/* Description Box */}
          <div>
            <label className='block text-gray-700 font-medium mb-1'>
              Description:
            </label>
            <textarea
              ref={description}
              placeholder='Briefly describe the issue...'
              className='w-full h-32 rounded-md p-3  bg-white resize-none focus:ring focus:ring-blue-200'></textarea>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            className={`w-[80%] py-2 text-black font-semibold rounded-md transition bottom-0 bg-blue-300 absolute m-4 `}
            disabled={!issue}>
            Submit Complaint
          </button>
        </form>
      </div>
    </>
  );
};

export default Complaints;
