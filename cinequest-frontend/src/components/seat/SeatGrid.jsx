	import Seat from "./Seat";

	export default function SeatGrid({ seats, selectedSeats, toggleSeat }) {
		return (
			<div className="space-y-6">
				{Object.entries(seats).map(([row, rowSeats]) => (
					<div key={row}>
						<p className="mb-2 text-xs text-muted">{row}</p>
						<div className="flex flex-wrap gap-2">
							{rowSeats.map((seat) => (
								<Seat
									key={seat.id}
									label={seat.label}
									status={seat.status}
									isSelected={selectedSeats.includes(seat.id)}
									onClick={() => toggleSeat(seat.id)}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		);
	}
