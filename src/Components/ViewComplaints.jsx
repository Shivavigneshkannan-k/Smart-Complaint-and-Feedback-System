
import ViewComplaintMessage from "./ViewComplaintMessage";

const ViewComplaints = () => {
  return (
    <div className="bg-gray-200 h-screen">
      <h1 className="text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white">Complaints</h1>
      <div className="m-4">
            <ViewComplaintMessage complaintTitle={"wifi issue"} name={"Shivavigneshkanna K"} registerNumber={"23CS085"}/>
            <ViewComplaintMessage complaintTitle={"Electricty issue"} name={"Sarvesh E G"} registerNumber={"23ACT048"}/>
            <ViewComplaintMessage complaintTitle={"wifi issue"} name={"Shiva"} registerNumber={"23CS085"}/>
            
      </div>
    </div>
  );
};

export default ViewComplaints;
