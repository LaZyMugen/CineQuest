import { Link, NavLink } from "react-router-dom";

const linkBase = "text-sm font-medium transition-colors";

export default function Navbar() {
	return (
		<nav className="border-b border-border bg-background/95 text-textSecondary">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<Link to="/" className="text-lg font-semibold text-textPrimary">
					CineQuest
				</Link>
				<div className="flex items-center gap-6">
					<NavItem to="/">Movies</NavItem>
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
				`${linkBase} ${
					isActive
						? "text-accent"
						: "text-textSecondary hover:text-textPrimary"
				}`
			}
		>
			{children}
		</NavLink>
	);
}
