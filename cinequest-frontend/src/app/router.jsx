import { createBrowserRouter } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import OauthConsent from "../pages/OauthConsent";
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
		element: <Landing />,
		errorElement: <NotFound />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/oauth/consent",
		element: <OauthConsent />,
	},
	{
		path: "/movies",
		element: <Movies />,
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
