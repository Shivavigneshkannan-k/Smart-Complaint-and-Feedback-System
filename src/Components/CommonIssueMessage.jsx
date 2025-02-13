const CommonIssueMessage = ({ complaintTitle }) => {
  return (
    <div className='p-4 shadow-md bg-white rounded-lg flex flex-col my-4 '>
      <div className='flex justify-between mb-4'>
        <h1 className='ml-2  text-lg font-semibold'>{complaintTitle}</h1>
        <div className='flex gap-2 text-xl pb-2 px-2'>
          <p>⬆️ 10</p>
          <p>⬇️ 2</p>
        </div>
      </div>
      <div className='flex gap-4  justify-between'>
        <div className="ml-2">
          <p>Total votes: 12</p>
        </div>
        <div className="">
          <button className='bg-green-400 py-1 px-2 rounded-md text-md cursor-pointer shadow-lg mr-4'>
            up vote
          </button>
          <button className='bg-red-500 py-1 px-2 rounded-md text-md cursor-pointer shadow-lg'>
            down vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonIssueMessage;
