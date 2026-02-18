export default function Seat({ number, status, isSelected, onClick }) {
	const base =
		"w-9 h-9 text-xs border rounded-sm transition-colors flex items-center justify-center";

	let style = "";

	if (status === "confirmed") {
		style = "bg-gray-600 border-gray-600 text-gray-300 cursor-not-allowed";
	} else if (status === "locked") {
		style = "bg-gray-700 border-gray-700 text-gray-400 cursor-not-allowed";
	} else if (isSelected) {
		style = "bg-accent text-black border-accent";
	} else {
		style = "border-border hover:border-accent";
	}

	return (
		<button
			type="button"
			disabled={status !== "available"}
			onClick={onClick}
			className={`${base} ${style}`}
		>
			{number}
		</button>
	);
}
