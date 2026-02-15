const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-border disabled:opacity-60 disabled:cursor-not-allowed";

const variantStyles = {
  primary: "bg-accent text-black hover:bg-[#e18b0f]",
  secondary: "bg-elevated text-textPrimary border border-border hover:bg-[#353535]",
  danger: "bg-danger text-white hover:bg-[#d73232]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const resolvedVariant = variantStyles[variant] || variantStyles.primary;
  const resolvedSize = sizeStyles[size] || sizeStyles.md;
  const componentProps = { ...props };

  if (Component === "button" && componentProps.type === undefined) {
    componentProps.type = "button";
  }

  return (
    <Component
      className={cn(baseStyles, resolvedVariant, resolvedSize, className)}
      {...componentProps}
    />
  );
}
