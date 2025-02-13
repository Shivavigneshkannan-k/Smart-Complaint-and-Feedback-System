const ComplaintMessage = ({ complaintTitle }) => {
  return (
    <div className='p-4 shadow-md bg-white rounded-lg flex flex-col my-4 '>
      <div className='ml-2 flex items-center justify-between my-2'>
        <h1 className='text-xl font-semibold'>{complaintTitle}</h1>
        <p className='text-sm'>x hours ago</p>
      </div>
    </div>
  );
};

export default ComplaintMessage;
