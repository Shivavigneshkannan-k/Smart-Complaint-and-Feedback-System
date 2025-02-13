import { useNavigate } from "react-router-dom";

const ViewComplaintMessage = ({ complaintTitle, name ,registerNumber}) => {
  const navigate = useNavigate();
  return (
    <div className='p-4 shadow-md bg-white rounded-lg flex flex-col my-4 ' onClick={()=>{
      navigate('/viewDetail')
    }}>
      <div className='flex items-center gap-2 text-lg '>
        <div className='bg-black w-14 rounded-4xl '>
          <img
            src='https://img.icons8.com/?size=100&id=7819&format=png&color=FFFFFF'
            alt='user-image'
          />
        </div>
        <div className="ml-2">
          <p>{name}</p>
          <p className="text-sm">{registerNumber}</p>
        </div>
      </div>
      <div className='ml-10 flex items-center justify-between my-2'>
        <h1 className='text-xl font-semibold'>{complaintTitle}</h1>
        <p className='text-sm'>x hours ago</p>
      </div>
    </div>
  );
};

export default ViewComplaintMessage;
