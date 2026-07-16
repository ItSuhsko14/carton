import type { Point } from "@/types/template";

interface CornerMarkersProps {
  displayedPoints: Point[];
  displayedWidth: number;
  displayedHeight: number;
}

export default function CornerMarkers({
  displayedPoints,
  displayedWidth,
  displayedHeight,
}: CornerMarkersProps) {
  const linePoints = displayedPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${displayedWidth} ${displayedHeight}`}
      preserveAspectRatio="none"
    >
      {displayedPoints.length >= 2 && displayedPoints.length < 4 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}
      {displayedPoints.length === 4 && (
        <polygon
          points={linePoints}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth={2}
        />
      )}
      {displayedPoints.map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x}
            cy={point.y}
            r={10}
            fill="rgb(59, 130, 246)"
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={12}
            fontWeight="bold"
          >
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
