const ViewDetail = ({ name, registerNumber, issue, description }) => {
  return (
    <div className='bg-gray-200 h-screen'>
      <h1 className='text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white'>
        View Details
      </h1>
      <div className='m-4 text-lg'>
        <div className="p-4 bg-white rounded-md my-6">
          <h3 className='text-2xl font-semibold my-2'>Issue: </h3>
          <p className="ml-4">
            Water Leak in Hostel
          </p>
        </div>
        <div className=" p-4 bg-white rounded-md my-6">
          <h3 className='text-2xl font-semibold my-2'>Description:</h3>
          <p className='ml-4'>
            from the morining water has been flooded in the ground floor
            bathroom, and now became unable to use.
          </p>
        </div>
        <div className="p-4 bg-white rounded-md my-6">
          <h3 className='text-2xl font-semibold my-2'>Raised By : </h3>
          <div className='ml-4 flex justify-end gap-4'>
            <p className='font-semibold'>Karthik S</p>
            <p className='text-md mr-4'>23CS093</p>
          </div>
        </div>
        <div className="p-4 bg-red-200       rounded-md my-6 flex items-center justify-between">
          <h3 className='text-2xl font-semibold my-2'>Deadline : </h3>
          <p className="flex items-center mr-4">6 hours</p>
        </div>
      </div>
      <div className='flex gap-4 justify-around w-full absolute bottom-10 font-semibold '>
        <button className='bg-green-400 py-2 px-4 rounded-md text-xl cursor-pointer shadow-md '>
          Resolved
        </button>
        <button className='bg-blue-400 py-2 px-4 rounded-md text-xl cursor-pointer shadow-md '>
          Forward
        </button>
      </div>
    </div>
  );
};

export default ViewDetail;
