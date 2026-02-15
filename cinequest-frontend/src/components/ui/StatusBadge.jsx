const STATUS_STYLES = {
  LOCKED: "text-accent border-accent/40",
  CONFIRMED: "text-success border-success/50",
  CANCELLED: "text-muted border-border",
  EXPIRED: "text-danger border-danger/50",
  UNKNOWN: "text-muted border-border",
};

function normalizeStatus(status) {
  if (!status) return "UNKNOWN";
  return status
    .toString()
    .toUpperCase()
    .replace(/\s*\(.+\)$/u, "")
    .trim();
}

export default function StatusBadge({ status, className = "" }) {
  const normalized = normalizeStatus(status);
  const style = STATUS_STYLES[normalized] || STATUS_STYLES.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${style} ${className}`}
    >
      {normalized}
    </span>
  );
}
