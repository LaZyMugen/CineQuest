import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import SchemaDiagram from "../components/schema/SchemaDiagram";

export default function Architecture() {
	return (
		<>
			<Navbar />
			<PageWrapper title="System" subtitle="Database Schema Overview">
				<div className="space-y-8 p-2 sm:p-4">
					<SchemaDiagram />

					<div className="grid gap-4 lg:grid-cols-2">
						<div className="rounded-md border border-border bg-card p-6">
							<h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Normalization</h2>
							<ul className="mt-3 space-y-2 text-xs text-muted">
								<li>• 1NF — atomic columns, no repeating groups.</li>
								<li>• 2NF — every non-key attribute depends on the full primary key.</li>
								<li>• 3NF — no transitive dependency; foreign keys enforce referential integrity.</li>
							</ul>
						</div>

						<div className="rounded-md border border-border bg-card p-6">
							<h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Demo Notes</h2>
							<ul className="mt-3 space-y-2 text-xs text-muted">
								<li>• Highlight PKs (green) vs FKs (orange) to explain integrity constraints.</li>
								<li>• Use the 1 → N labels to describe how seat and booking fan-out works.</li>
								<li>• Pan or zoom to focus when walking through USERS and SCREENS additions.</li>
							</ul>
						</div>
					</div>
				</div>
			</PageWrapper>
		</>
	);
}