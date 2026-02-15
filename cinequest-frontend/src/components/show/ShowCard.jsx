import { Link } from "react-router-dom";
import Button from "../ui/Button";

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
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-gray-200">{screenLabel}</h3>
          {availableSeats !== undefined && (
            <span className="text-xs text-muted">
              {availableSeats} seats left
            </span>
          )}
        </div>
        <div className="grid gap-2 text-sm text-muted sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Time</p>
            <p className="text-gray-200">{timeLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Price</p>
            <p className="text-gray-200">{priceLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Show ID</p>
            <p className="text-gray-200">{showId ?? "-"}</p>
          </div>
        </div>
        {showId && (
          <div className="pt-2">
            <Button as={Link} to={`/show/${showId}/seats`} className="w-full sm:w-auto">
              Select Seats
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
