export default function TableCard({ name, columns }) {
	return (
		<div className="w-64 rounded-md border border-border bg-card p-4">
			<h3 className="mb-3 text-sm font-semibold tracking-wide">{name}</h3>

			<ul className="space-y-2 text-xs">
				{columns.map((col, index) => (
					<li key={index} className="flex items-center justify-between gap-3">
						<span>{col.name}</span>
						<span
							className={`rounded px-2 py-0.5 text-xs ${
								col.type.includes("PK")
									? "border border-success text-success"
									: col.type.includes("FK")
									? "border border-accent text-accent"
									: "text-muted"
							}`}
						>
							{col.type}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}