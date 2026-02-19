import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";

const arrowPoints = ({ x, y, direction, size }) => {
  const half = size / 2;

  switch (direction) {
    case "right":
      return `${x},${y} ${x - size},${y - half} ${x - size},${y + half}`;
    case "left":
      return `${x},${y} ${x + size},${y - half} ${x + size},${y + half}`;
    case "down":
      return `${x},${y} ${x - half},${y - size} ${x + half},${y - size}`;
    case "up":
    default:
      return `${x},${y} ${x - half},${y + size} ${x + half},${y + size}`;
  }
};

const directionFromTargetPosition = (targetPosition) => {
  switch (targetPosition) {
    case "left":
      return "right";
    case "right":
      return "left";
    case "top":
      return "down";
    case "bottom":
    default:
      return "up";
  }
};

function SchemaEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  label,
  interactionWidth,
  ariaLabel,
  pathOptions,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: pathOptions?.borderRadius ?? 18,
    offset: pathOptions?.offset ?? 22,
  });

  const stroke = style?.stroke ?? "var(--cq-border)";
  const strokeWidth = style?.strokeWidth ?? 1.5;

  const arrowDir = directionFromTargetPosition(targetPosition);
  const arrowSize = 9;
  const points = arrowPoints({ x: targetX, y: targetY, direction: arrowDir, size: arrowSize });

  return (
    <g className="schema-edge" aria-label={ariaLabel} role="img">
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke, strokeWidth, opacity: style?.opacity ?? 0.95 }}
        interactionWidth={interactionWidth}
      />

      <polygon points={points} fill={stroke} stroke={stroke} strokeWidth={0.5} />

      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
            }}
            className="pointer-events-none select-none text-[10px] uppercase tracking-wider text-muted"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </g>
  );
}

export default memo(SchemaEdge);
