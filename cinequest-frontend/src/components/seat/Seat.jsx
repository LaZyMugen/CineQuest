const baseClasses =
	"w-9 h-9 text-xs border rounded-sm flex items-center justify-center font-medium transition-colors duration-150";

const seatStateClasses = {
	available: "border-border text-gray-200 hover:border-accent",
	selected: "bg-accent text-black border-accent",
	locked: "bg-border text-muted border-border cursor-not-allowed",
	confirmed: "border-success text-success",
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
