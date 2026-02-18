import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import TableCard from "../components/TableCard";

const schema = {
	MOVIES: [
		{ name: "movie_id", type: "PK" },
		{ name: "title", type: "varchar" },
		{ name: "duration", type: "int" },
		{ name: "genre", type: "varchar" },
	],
	SHOWS: [
		{ name: "show_id", type: "PK" },
		{ name: "movie_id", type: "FK → MOVIES" },
		{ name: "screen_id", type: "FK → SCREENS" },
		{ name: "show_time", type: "timestamp" },
		{ name: "price", type: "int" },
	],
	SEATS: [
		{ name: "seat_id", type: "PK" },
		{ name: "show_id", type: "FK → SHOWS" },
		{ name: "seat_number", type: "int" },
		{ name: "status", type: "enum" },
	],
	BOOKINGS: [
		{ name: "booking_id", type: "PK" },
		{ name: "user_id", type: "FK → USERS" },
		{ name: "show_id", type: "FK → SHOWS" },
		{ name: "status", type: "enum" },
	],
};

export default function Architecture() {
	return (
		<>
			<Navbar />
			<PageWrapper title="System" subtitle="Database Schema Overview">
				<div className="space-y-10 p-2 sm:p-4">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
						{Object.entries(schema).map(([table, columns]) => (
							<TableCard key={table} name={table} columns={columns} />
						))}
					</div>

					<div className="rounded-md border border-border bg-card p-6">
						<h2 className="mb-3 text-sm font-semibold">Relationships</h2>

						<ul className="space-y-2 text-xs text-muted">
							<li>• One Movie → Many Shows</li>
							<li>• One Show → Many Seats</li>
							<li>• One User → Many Bookings</li>
							<li>• One Show → Many Bookings</li>
						</ul>
					</div>

					<div className="rounded-md border border-border bg-card p-6">
						<h2 className="mb-3 text-sm font-semibold">Normalization Applied</h2>

						<ul className="space-y-2 text-xs text-muted">
							<li>• 1NF: No repeating groups</li>
							<li>• 2NF: No partial dependency</li>
							<li>• 3NF: No transitive dependency</li>
						</ul>
					</div>
				</div>
			</PageWrapper>
		</>
	);
}