import { useState } from "react";
import Rating from "./Rating";

const ResolvedComplaint = ({ complaintTitle }) => {
  const [showRating,setShowRating] = useState(false);
  return (
    <div className='p-4 shadow-md bg-white rounded-lg flex flex-col my-4 '>
        <h1 className='ml-2  text-lg font-semibold'>{complaintTitle}</h1>
        <div className="flex gap-4  justify-end">
            <button className="bg-green-400 py-1 px-2 rounded-md text-md cursor-pointer shadow-md " onClick={()=>{
              setShowRating(true);
            }}>Satisfied</button>
            <button className="bg-red-500 py-1 px-2 rounded-md text-md cursor-pointer shadow-md ">Unsatisfied</button>
        </div>
        {
          showRating && <Rating setShowRating={setShowRating}/>
        }
    </div>
  );
};

export default ResolvedComplaint;
