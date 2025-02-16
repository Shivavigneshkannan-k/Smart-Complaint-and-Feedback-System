import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Complaints from "./Components/Complaints";
import DashBoard from "./Components/DashBoard";
import ViewComplaints from "./Components/ViewComplaints";
import TrackProgress from "./Components/TrackProgress";
import CommonIssues from "./Components/CommonIssues";
import AddCommonIssue from "./Components/AddCommonIssue";
import ViewDetail from "./Components/ViewDetail"; // View Complaint Details Component
import Rating from "./Components/Rating";
import GoogleLogin from "./Login";
import Body from "./Body"; // Ensure this contains <Outlet />
import EditProfile from "./Components/EditProfile";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Body />, // Main layout
    children: [
      { index: true, element: <GoogleLogin /> }, // Login as default route
      { path: "dashboard", element: <DashBoard /> },
      { path: "complaints", element: <Complaints /> },
      { path: "viewComplaints", element: <ViewComplaints /> },
      { path: "viewDetail/:id", element: <ViewDetail /> }, // Updated to accept complaint ID
      { path: "commonIssues", element: <CommonIssues /> },
      { path: "trackProgress", element: <TrackProgress /> },
      { path: "rating", element: <Rating /> },
      { path: "addCommonIssue", element: <AddCommonIssue /> },
      { path: "editProfile", element: <EditProfile /> },
    ]
  }
]);

const App = () => {
  return <RouterProvider router={routes} />;
};

export default App;
