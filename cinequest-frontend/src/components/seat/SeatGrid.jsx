import Seat from "./Seat";

export default function SeatGrid({ groupedSeats, selectedSeats, onToggle }) {
	return (
		<div className="space-y-4">
			{Object.entries(groupedSeats).map(([row, seats]) => (
				<div key={row} className="space-y-2">
					<div className="text-sm font-semibold text-gray-700">Row {row}</div>
					<div className="flex flex-wrap gap-2">
						{seats.map((seat) => (
							<Seat
								key={seat.seat_id}
								seat={seat}
								isSelected={selectedSeats.includes(seat.seat_id)}
								onToggle={onToggle}
								disabled={seat?.is_available === false || seat?.available === false}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
