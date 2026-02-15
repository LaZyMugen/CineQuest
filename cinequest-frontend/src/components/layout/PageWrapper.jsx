export default function PageWrapper({ title, subtitle, actions, children }) {
	return (
		<div className="min-h-screen bg-bg text-gray-200">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
				{(title || subtitle || actions) && (
					<header className="flex flex-col gap-3 border-b border-border pb-4">
						<div className="flex flex-wrap items-center gap-3">
							{title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
							{actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
						</div>
						{subtitle && <p className="text-sm text-muted">{subtitle}</p>}
					</header>
				)}
				{children}
			</div>
		</div>
	);
}