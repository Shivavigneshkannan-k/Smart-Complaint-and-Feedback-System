const AddCommonIssue = () => {
  return (
    <div className='h-screen bg-gray-200 '>
      <h1 className='text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white'>
        Common Issue
      </h1>
      <form className='w-full text-xl flex-col items-center m-4 mt-10'>
        <div className="mb-6">
          <p className='text-2xl font-semibold my-2'>Issue :</p>
          <input
            type='text'
            placeholder=''
            className='px-2 py-2  bg-white rounded-md w-[90%]'
          />
        </div>
        <div className="mb-6">
          <p className='text-2xl font-semibold my-2'>Description :</p>
          <textarea
            type='text'
            placeholder='Describe about the issue within 50 words'
            className='bg-white  p-4  w-[90%] h-56  rounded-md'></textarea>
        </div>
        <button className=' bg-green-500 w-[90%] px-2 py-2 rounded-md absolute bottom-5'>
          Publish
        </button>
      </form>
    </div>
  );
};

export default AddCommonIssue;
