import Complaints from "./Components/Complaints";
import DashBoard from "./Components/DashBoard";
import ViewComplaints from "./Components/ViewComplaints";
import TrackProgress from "./Components/TrackProgress";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import CommonIssues from "./Components/CommonIssues";
import AddCommonIssue from "./Components/AddCommonIssue";
import ViewDetail from "./Components/ViewDetail";
import Body from "./Body";
import Rating from "./Components/Rating";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Body />, // Body layout with <Outlet />
    children: [
      { index: true, element: <DashBoard /> }, // Default route
      { path: "complaints", element: <Complaints /> },
      { path: "viewComplaints", element: <ViewComplaints /> },
      { path: "viewDetail", element: <ViewDetail /> },
      { path: "commonIssues", element: <CommonIssues /> },
      { path: "trackProgress", element: <TrackProgress /> },
      { path: "rating", element: <Rating /> },
      { path: "addCommonIssue", element: <AddCommonIssue /> }
    ]
  }
]);
const App = () => {
  return <RouterProvider router={routes} />;
};

export default App;
