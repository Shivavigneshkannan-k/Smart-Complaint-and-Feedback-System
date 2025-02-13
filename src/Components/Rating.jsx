import { useState } from "react";
import { STAR, UN_STAR } from "./utils/constant";
import Alert from "./Alert";

const Rating = ({setShowRating}) => {
  const [rating, setRating] = useState(0);
  const [showAlert, setShowAlert] = useState(false); // State for alert

  if(showAlert){
    setTimeout(()=>{
        setShowRating(false)
    },3000)
  }
  

  return (
    <div className='p-8 mt-4 bg-blue-200 rounded-lg shadow-2xl absolute top-[20%]  '>
      <p className='text-2xl font-semibold mb-5'>Rate your satisfaction:</p>

      {/* Star Rating */}
      <div className='flex space-x-2 text-yellow-500 h-10 text-lg'>
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className='cursor-pointer text-4xl'
            onClick={() => setRating(star)}>
            {star <= rating ? (
              <img
                src={STAR}
                alt='star'
              />
            ) : (
              <img
                src={UN_STAR}
                alt='star'
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        className='bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-md text-lg mt-6 text-white font-bold transition'
        onClick={() => setShowAlert(true)}>
        Submit
      </button>

      {/* Show Alert After Clicking Submit */}
      {showAlert && (
        <Alert
          message='Thanks for your feedback!'
          type='success'
        />
      )}
    </div>
  );
};

export default Rating;
