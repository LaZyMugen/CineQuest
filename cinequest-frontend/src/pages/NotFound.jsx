import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";

export default function NotFound() {
	return (
		<>
			<Navbar />
			<PageWrapper title="Page not found" subtitle="The resource you requested does not exist.">
				<section className="rounded-lg border border-border bg-surface p-6 space-y-4">
					<p className="text-sm text-textSecondary">
						Double-check the URL or jump back to the movie catalog.
					</p>
					<Button as={Link} to="/">
						Go back home
					</Button>
				</section>
			</PageWrapper>
		</>
	);
}
