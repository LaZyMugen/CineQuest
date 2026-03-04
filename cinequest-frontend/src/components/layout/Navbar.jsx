import { Link, NavLink } from "react-router-dom";

const linkBase = "text-sm text-muted transition-colors";

export default function Navbar() {
	return (
		<nav className="border-b border-border bg-bg px-6 py-3">
			<div className="mx-auto flex max-w-6xl items-center justify-between">
				<Link to="/movies" className="text-lg font-semibold tracking-wide text-gray-200">
					CineQuest
				</Link>
				<div className="flex gap-6">
					<NavItem to="/movies">Movies</NavItem>
					<NavItem to="/architecture">System</NavItem>
					<NavItem to="/my-bookings">My Bookings</NavItem>
					<NavItem to="/admin">Admin</NavItem>
				</div>
			</div>
		</nav>
	);
}

function NavItem({ to, children }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				`${linkBase} ${isActive ? "text-white" : "hover:text-white"}`
			}
		>
			{children}
		</NavLink>
	);
}
