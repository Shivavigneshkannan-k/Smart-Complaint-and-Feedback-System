// import React from "react";

import MenuBox from "./MenuBox";

const DashBoard = () => {
  return (
    <div>
      <div className='h-screen flex justify-center items-center flex-col'>
        <MenuBox
          name={"File a Complaint"}
          url={"complaints"}
        />
        <MenuBox
          name={"Track Progress"}
          url={"trackProgress"}
        />
        <MenuBox
          name={"Common Issues"}
          url={"commonIssues"}
        />
        <MenuBox
          name={"View Complaints"}
          url={"viewComplaints"}
        />
      </div>
    </div>
  );
};

export default DashBoard;
