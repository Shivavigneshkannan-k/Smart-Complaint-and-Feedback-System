
import { useNavigate } from "react-router-dom";
import CommonIssueMessage from "./CommonIssueMessage"

const CommonIssues = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-200 h-screen flex-col">
        <h1 className="text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white">Common Issues</h1>

    <form onSubmit={(e)=>{e.preventDefault();}} className="flex justify-center mt-8 mb-4 mx-4">
      <input type="text" className="w-full rounded-md px-2 py-2  bg-white" placeholder="Search..."/>
      <button className="bg-blue-300 px-2 py-1 rounded-md mx-2">Search</button>
    </form>
      <div className="m-4">
            <CommonIssueMessage complaintTitle={"Wifi Issue"}/>
            <CommonIssueMessage complaintTitle={"Limited Visting Hour"}/>
            <CommonIssueMessage complaintTitle={"Improve Mess food"}/>
      </div>
      <button className="p-8 py-9 bg-blue-300 rounded-full absolute bottom-8 right-8 text-xl shadow-md" onClick={()=>{
        navigate("/addCommonIssue")
      }}>ADD</button>
    </div>
  );
};

export default CommonIssues;
