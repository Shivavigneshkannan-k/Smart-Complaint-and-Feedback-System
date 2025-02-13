import ComplaintMessage from "./ComplaintMessage";
import ResolvedComplaint from "./ResolvedComplaint"

const TrackProgress = () => {
  return (
    <div className="bg-gray-200 h-screen">
      <h1 className="text-3xl px-8 py-8 rounded-b-xl shadow-lg bg-white">Track Complaints</h1>
      <div className="m-4">
            <ComplaintMessage complaintTitle={"Wifi Issue"} name={"Shivavigneshkanna K"} registerNumber={"23CS085"}/>
            <ComplaintMessage complaintTitle={"Electricty Issue"} name={"Sarvesh E G"} registerNumber={"23ACT048"}/>
            <ComplaintMessage complaintTitle={"Wifi Issue"} name={"Shiva"} registerNumber={"23CS085"}/>
            <ResolvedComplaint complaintTitle={"Water Issue"}/>
      </div>
    </div>
  );
};

export default TrackProgress;
