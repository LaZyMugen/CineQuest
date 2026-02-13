export default function Seat({ seat, isSelected, onToggle, disabled }) {
	const label = seat?.seat_label || seat?.seat_number || seat?.seat_id;
	const available = disabled ? false : seat?.is_available ?? seat?.available ?? true;
	const canSelect = available && !disabled;

	return (
		<button
			type="button"
			onClick={() => canSelect && onToggle(seat?.seat_id)}
			disabled={!canSelect}
			className={`w-12 h-12 rounded-md text-sm font-medium transition-colors border
			${!available ? "bg-gray-200 text-gray-500 border-gray-300" : ""}
			${available && isSelected ? "bg-blue-600 text-white border-blue-700" : ""}
			${available && !isSelected ? "bg-white text-gray-800 border-gray-300" : ""}
			`}
		>
			{label}
		</button>
	);
}
