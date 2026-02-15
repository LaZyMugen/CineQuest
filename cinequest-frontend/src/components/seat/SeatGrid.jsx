import Seat from "./Seat";

export default function SeatGrid({ groupedSeats, selectedSeats, onToggle }) {
	return (
		<div className="space-y-6">
			{Object.entries(groupedSeats).map(([row, seats]) => (
				<div key={row} className="space-y-3">
					<div className="flex items-center gap-3">
						<span className="text-xs font-semibold uppercase tracking-wide text-muted">
							Row {row}
						</span>
						<span className="h-px flex-1 bg-border" aria-hidden />
					</div>
					<div className="flex flex-wrap gap-1.5">
						{seats.map((seat) => (
							<Seat
								key={seat.seat_id}
								seat={seat}
								isSelected={selectedSeats.includes(seat.seat_id)}
								onToggle={onToggle}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
