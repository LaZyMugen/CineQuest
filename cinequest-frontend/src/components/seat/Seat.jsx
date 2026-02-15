const baseClasses =
	"w-11 h-11 rounded-md border text-sm font-semibold flex items-center justify-center transition-colors duration-150";

const seatStateClasses = {
	available: "bg-card text-gray-200 border-border hover:bg-card/70 hover:text-black",
	selected: "bg-accent text-black border-accent",
	locked: "bg-[#5A1E1E] text-muted border-[#7F2D2D]",
	confirmed: "bg-[#14532D] text-gray-200 border-[#1E8E46]",
};

function resolveStatus(seat) {
	const rawStatus =
		seat?.status || seat?.seat_status || seat?.booking_status || seat?.state;
	if (!rawStatus) return null;
	return rawStatus.toString().toUpperCase();
}

export default function Seat({ seat, isSelected, onToggle, disabled }) {
	const label = seat?.seat_label || seat?.seat_number || seat?.seat_id;
	const status = resolveStatus(seat);
	const available = seat?.is_available ?? seat?.available ?? status !== "LOCKED";
	const isConfirmed = status === "CONFIRMED";
	const isLocked = status === "LOCKED" || available === false;
	const interactive = !disabled && !isLocked && !isConfirmed;
	const seatState = isSelected
		? "selected"
		: isConfirmed
		? "confirmed"
		: isLocked
		? "locked"
		: "available";
	const className = `${baseClasses} ${seatStateClasses[seatState]}`;

	return (
		<button
			type="button"
			onClick={() => interactive && onToggle(seat?.seat_id)}
			disabled={!interactive}
			aria-pressed={isSelected}
			className={className}
		>
			{label}
		</button>
	);
}
