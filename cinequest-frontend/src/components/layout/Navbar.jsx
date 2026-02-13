import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
	return (
		<nav className="w-full border-b bg-white/80 backdrop-blur">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
				<Link to="/" className="text-lg font-semibold">
					CineQuest
				</Link>
				<div className="flex gap-4 text-sm">
					<NavLink
						to="/"
						className={({ isActive }) =>
							isActive ? "text-blue-600 font-semibold" : "text-gray-700"
						}
					>
						Movies
					</NavLink>
					<NavLink
						to="/my-bookings"
						className={({ isActive }) =>
							isActive ? "text-blue-600 font-semibold" : "text-gray-700"
						}
					>
						My Bookings
					</NavLink>
				</div>
			</div>
		</nav>
	);
}
