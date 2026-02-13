import { useParams } from "react-router-dom";

export default function Shows() {
	const { id } = useParams();

	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold">Shows</h1>
			<p className="text-sm text-gray-600">Movie ID: {id}</p>
		</div>
	);
}
