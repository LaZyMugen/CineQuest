import { Link } from "react-router-dom";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function ShowCard({ show }) {
  const showId = show?.show_id ?? show?.id;
  const timeLabel = formatDateTime(show?.show_time);
  const priceLabel =
    show?.price !== undefined && show?.price !== null ? `₹${show.price}` : "-";
  const screenLabel = show?.screen?.name || show?.screen_label || "Screen";
  const availableSeats = show?.available_seats ?? show?.seats_available;

  return (
		<section className="bg-card border border-border rounded-md p-5">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="text-sm font-medium text-gray-200">{screenLabel}</h3>
					{availableSeats !== undefined && (
						<span className="text-xs text-muted">{availableSeats} seats left</span>
					)}
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
					<div>
						<p className="text-xs text-muted uppercase">Time</p>
						<p className="mt-1 text-gray-200">{timeLabel}</p>
					</div>
					<div>
						<p className="text-xs text-muted uppercase">Price</p>
						<p className="mt-1 font-medium text-gray-200">{priceLabel}</p>
					</div>
					<div>
						<p className="text-xs text-muted uppercase">Show ID</p>
						<p className="mt-1 text-gray-200">{showId ?? "-"}</p>
					</div>
					{showId && (
						<div className="flex items-end justify-end">
							<Link
								to={`/show/${showId}/seats`}
								className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
							>
								Select Seats
							</Link>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
