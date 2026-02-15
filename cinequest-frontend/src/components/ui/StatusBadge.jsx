const STATUS_STYLES = {
  LOCKED: "text-accent border-accent",
  CONFIRMED: "text-success border-success",
  CANCELLED: "text-muted border-border",
  EXPIRED: "text-danger border-danger",
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
      className={`inline-flex items-center rounded border px-2 py-1 text-xs font-medium tracking-wide ${style} ${className}`}
    >
      {normalized}
    </span>
  );
}
