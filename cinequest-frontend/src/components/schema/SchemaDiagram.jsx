import { memo, useCallback, useMemo, useState } from "react";
import ReactFlow, { Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import SchemaEdge from "./SchemaEdge";

const layout = {
  nodeWidth: 240,
  topGapX: 300,
  rowGapY: 240,
  branchGapX: 300,
  originX: 60,
  originY: 20,
};

const positions = {
  MOVIES: { x: layout.originX, y: layout.originY },
  SCREENS: {
    x: layout.originX + layout.nodeWidth + layout.topGapX,
    y: layout.originY,
  },
};

positions.SHOWS = {
  x: Math.round((positions.MOVIES.x + positions.SCREENS.x) / 2),
  y: layout.originY + layout.rowGapY,
};

positions.SEATS = {
  x: positions.SHOWS.x - layout.branchGapX,
  y: positions.SHOWS.y + layout.rowGapY,
};

positions.BOOKINGS = {
  x: positions.SHOWS.x + layout.branchGapX,
  y: positions.SHOWS.y + layout.rowGapY,
};

positions.USERS = {
  x: positions.BOOKINGS.x,
  y: positions.BOOKINGS.y + layout.rowGapY,
};

const schemaTables = [
  {
    id: "movies",
    title: "MOVIES",
    position: positions.MOVIES,
    columns: [
      { name: "movie_id", role: "pk", type: "uuid" },
      { name: "title", role: "field", type: "varchar(255)" },
      { name: "duration", role: "field", type: "int" },
      { name: "genre", role: "field", type: "varchar(80)" },
    ],
  },
  {
    id: "screens",
    title: "SCREENS",
    position: positions.SCREENS,
    columns: [
      { name: "screen_id", role: "pk", type: "uuid" },
      { name: "label", role: "field", type: "varchar(120)" },
      { name: "capacity", role: "field", type: "int" },
      { name: "layout", role: "field", type: "jsonb" },
    ],
  },
  {
    id: "shows",
    title: "SHOWS",
    position: positions.SHOWS,
    columns: [
      { name: "show_id", role: "pk", type: "uuid" },
      { name: "movie_id", role: "fk", references: "MOVIES", type: "uuid" },
      { name: "screen_id", role: "fk", references: "SCREENS", type: "uuid" },
      { name: "show_time", role: "field", type: "timestamp" },
      { name: "price", role: "field", type: "numeric" },
    ],
  },
  {
    id: "seats",
    title: "SEATS",
    position: positions.SEATS,
    columns: [
      { name: "seat_id", role: "pk", type: "uuid" },
      { name: "show_id", role: "fk", references: "SHOWS", type: "uuid" },
      { name: "seat_number", role: "field", type: "varchar(8)" },
      { name: "status", role: "field", type: "enum" },
    ],
  },
  {
    id: "bookings",
    title: "BOOKINGS",
    position: positions.BOOKINGS,
    columns: [
      { name: "booking_id", role: "pk", type: "uuid" },
      { name: "user_id", role: "fk", references: "USERS", type: "uuid" },
      { name: "show_id", role: "fk", references: "SHOWS", type: "uuid" },
      { name: "status", role: "field", type: "enum" },
      { name: "total_amount", role: "field", type: "numeric" },
    ],
  },
  {
    id: "users",
    title: "USERS",
    position: positions.USERS,
    columns: [
      { name: "user_id", role: "pk", type: "uuid" },
      { name: "full_name", role: "field", type: "varchar(120)" },
      { name: "email", role: "field", type: "varchar(160)" },
      { name: "created_at", role: "field", type: "timestamp" },
    ],
  },
];

const schemaEdges = [
  {
    id: "movies-shows",
    source: "movies",
    target: "shows",
    color: "var(--cq-success)",
    ariaLabel: "One to many relationship from MOVIES to SHOWS",
  },
  {
    id: "screens-shows",
    source: "screens",
    target: "shows",
    color: "var(--cq-accent)",
    ariaLabel: "One to many relationship from SCREENS to SHOWS",
  },
  {
    id: "shows-seats",
    source: "shows",
    target: "seats",
    color: "var(--cq-accent)",
    ariaLabel: "One to many relationship from SHOWS to SEATS",
  },
  {
    id: "shows-bookings",
    source: "shows",
    target: "bookings",
    color: "var(--cq-accent)",
    ariaLabel: "One to many relationship from SHOWS to BOOKINGS",
  },
  {
    id: "users-bookings",
    source: "users",
    target: "bookings",
    color: "var(--cq-success)",
    ariaLabel: "One to many relationship from USERS to BOOKINGS",
  },
];

const columnLabel = (column) => {
  if (column.role === "pk") {
    return `${column.name} (PK)`;
  }

  if (column.role === "fk" && column.references) {
    return `${column.name} (FK → ${column.references})`;
  }

  return column.name;
};

const TableNode = memo(({ data }) => {
  const { table, isHovered, isLinked, isEdgeLinked, isCore, onHover, onLeave } = data;

  const surfaceClasses = [
    "w-[240px] rounded-lg border bg-card p-0 text-xs transition-colors duration-150",
    "shadow-sm",
    isCore ? "border-2 border-border" : "border border-border",
    isHovered
      ? "border-accent shadow-md"
      : isEdgeLinked
      ? "border-accent"
      : isLinked
      ? "border-border/80"
      : "border-border",
  ].join(" ");

  return (
    <div
      role="group"
      aria-label={`Table ${table.title} with ${table.columns.length} fields`}
      tabIndex={0}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      className={surfaceClasses}
    >
      <Handle type="target" position={Position.Left} className="schema-handle" />
      <Handle type="source" position={Position.Right} className="schema-handle" />

      <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
        <p className="text-sm font-semibold tracking-wide text-white">{table.title}</p>
      </div>

      <div>
        {table.columns.map((column, index) => {
          const isLastRow = index === table.columns.length - 1;
          const rowBorder = isLastRow ? "border-b-0" : "border-b border-border";

          const leftCellStyles =
            column.role === "pk"
              ? "border-l-2 border-success text-success"
              : column.role === "fk"
              ? "border-l-2 border-accent text-accent"
              : "border-l-2 border-transparent text-white";

          return (
            <div
              key={`${table.id}-${column.name}`}
              className={`flex items-center justify-between px-4 py-2 ${rowBorder} text-xs`}
            >
              <span className={`flex-1 pl-2 font-medium ${leftCellStyles}`}>{columnLabel(column)}</span>
              <span
                className={`shrink-0 text-[10px] uppercase tracking-wider text-muted ${
                  column.role === "pk" ? "font-semibold" : "font-medium"
                }`}
              >
                {column.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const nodeTypes = { schema: TableNode };
const edgeTypes = { schema: SchemaEdge };

export default function SchemaDiagram() {
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const linkedNodeIds = hoveredEdge?.nodes ?? [];

  const nodes = useMemo(
    () =>
      schemaTables.map((table) => ({
        id: table.id,
        position: table.position,
        type: "schema",
        data: {
          table,
          isHovered: hoveredNodeId === table.id,
          isLinked: false,
          isEdgeLinked: linkedNodeIds.includes(table.id),
          isCore: table.id === "shows",
          onHover: () => setHoveredNodeId(table.id),
          onLeave: () =>
            setHoveredNodeId((current) => (current === table.id ? null : current)),
        },
        draggable: false,
        selectable: false,
      })),
    [hoveredNodeId, linkedNodeIds]
  );

  const edges = useMemo(
    () =>
      schemaEdges.map((edge) => {
        const isActive = hoveredEdge?.id === edge.id;
        const strokeColor = isActive ? edge.color : edge.color;

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "schema",
          label: "1 → N",
          style: {
            stroke: strokeColor,
            strokeWidth: isActive ? 2 : 1.5,
            opacity: 0.95,
          },
          selectable: false,
          focusable: false,
          ariaLabel: edge.ariaLabel,
          interactionWidth: 28,
          pathOptions: { offset: 22, borderRadius: 18 },
          className: isActive ? "schema-edge schema-edge--active" : "schema-edge",
        };
      }),
    [hoveredEdge]
  );

  const handleEdgeMouseEnter = useCallback((_, edge) => {
    setHoveredEdge({ id: edge.id, nodes: [edge.source, edge.target] });
  }, []);

  const handleEdgeMouseLeave = useCallback(() => {
    setHoveredEdge(null);
  }, []);

  const handlePaneLeave = useCallback(() => {
    setHoveredNodeId(null);
    setHoveredEdge(null);
  }, []);

  const handleInit = useCallback((instance) => {
    instance.fitView({ padding: 0.2, duration: 400 });
  }, []);

  return (
    <section className="space-y-4 font-display" aria-label="CineQuest ER diagram">
      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Schema Visualizer</p>
          <p className="text-sm text-muted">
            Primary keys are marked in green, foreign keys in accent orange, and relationships are annotated 1 → N.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" /> PK
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" /> FK
          </span>
        </div>
      </div>

      <div className="schema-flow relative h-[920px] min-h-[600px] w-full rounded-md border border-border bg-bg">
        <div className="absolute inset-8">
          <ReactFlow
            fitView
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            className="h-full w-full"
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnDoubleClick={false}
            onInit={handleInit}
            minZoom={0.45}
            maxZoom={1.5}
            onPaneMouseLeave={handlePaneLeave}
            onEdgeMouseEnter={handleEdgeMouseEnter}
            onEdgeMouseLeave={handleEdgeMouseLeave}
            panOnDrag
          >
            <Controls position="top-right" showInteractive={false} />
          </ReactFlow>
        </div>

        <ul className="sr-only" aria-label="Schema relationships">
          {schemaEdges.map((edge) => (
            <li key={edge.id}>{edge.ariaLabel}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
