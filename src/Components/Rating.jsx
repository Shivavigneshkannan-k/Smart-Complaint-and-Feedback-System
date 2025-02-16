import { useState } from "react";

const Rating = ({ setShowRating }) => {
  const [rating, setRating] = useState(0);

  return (
    <div className="mt-2 flex flex-col items-center bg-gray-100 p-4 rounded-md">
      <h3 className="text-lg font-semibold">Rate the Resolution</h3>
      <div className="flex gap-2 my-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`p-2 ${rating >= star ? "text-yellow-500" : "text-gray-400"}`}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded-md"
        onClick={() => {
          alert(`You rated ${rating} stars`);
          setShowRating(false);
        }}
      >
        Submit Rating
      </button>
    </div>
  );
};

export default Rating;
