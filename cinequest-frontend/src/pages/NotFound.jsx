import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div className="p-6 space-y-3">
			<h1 className="text-xl font-semibold">Page not found</h1>
			<p className="text-sm text-gray-600">The page you requested does not exist.</p>
			<Link className="text-blue-600 underline" to="/">
				Go back home
			</Link>
		</div>
	);
}
