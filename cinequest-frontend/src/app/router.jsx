import { createBrowserRouter } from "react-router-dom";
import Movies from "../pages/Movies";
import Shows from "../pages/Shows";
import SeatSelection from "../pages/SeatSelection";
import Admin from "../pages/Admin";
import NotFound from "../pages/NotFound";
import MyBookings from "../pages/MyBookings";
import Architecture from "../pages/Architecture";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Movies />,
		errorElement: <NotFound />,
	},
	{
		path: "/movie/:id",
		element: <Shows />,
	},
	{
		path: "/show/:id/seats",
		element: <SeatSelection />,
	},
	{
		path: "/admin",
		element: <Admin />,
	},
	{
		path: "/my-bookings",
		element: <MyBookings />,
	},
	{
		path: "/architecture",
		element: <Architecture />,
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
