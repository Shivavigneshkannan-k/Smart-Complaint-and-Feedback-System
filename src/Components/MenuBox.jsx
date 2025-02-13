import { useNavigate} from "react-router-dom";

const MenuBox = ({ name,url }) => {
  const navigate = useNavigate();
  return (
    
    <div
      onClick={()=>{
        navigate(url)
      }}
      className='bg-violet-400 w-[80%] p-4 text-2xl h-40 flex justify-center items-center rounded-2xl m-auto text-white font-semibold my-4'>
      <h1>{name}</h1>
    </div>
  );
};

export default MenuBox;
