import { ScenarioDefinition, GeoPosition } from '@/lib/types';

interface MapPreviewProps {
  scenario: ScenarioDefinition;
}

const SEVERITY_COLORS: Record<number, string> = {
  1: '#3B82F6',
  2: '#3B82F6',
  3: '#EAB308',
  4: '#F97316',
  5: '#DC2626',
};

// Downtown Toronto bounds for coordinate conversion
const BOUNDS = {
  west: -79.42,
  east: -79.34,
  north: 43.68,
  south: 43.63,
};

// Convert lat/lng to grid position for preview
function geoToGrid(pos: GeoPosition, gridWidth: number, gridHeight: number): { x: number; y: number } {
  const x = ((pos.lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * gridWidth;
  const y = ((BOUNDS.north - pos.lat) / (BOUNDS.north - BOUNDS.south)) * gridHeight;
  return {
    x: Math.max(0, Math.min(gridWidth - 1, x)),
    y: Math.max(0, Math.min(gridHeight - 1, y)),
  };
}

export default function MapPreview({ scenario }: MapPreviewProps) {
  const cellSize = 28;
  const width = scenario.citySize.width * cellSize;
  const height = scenario.citySize.height * cellSize;

  return (
    <div className="rounded border border-ops-border bg-ops-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Preview Map</h3>
          <p className="text-sm text-gray-400">
            Quickly verify grids, incidents, hospitals, and shelters before saving.
          </p>
        </div>
        <span className="text-xs text-gray-500">{scenario.citySize.width}x{scenario.citySize.height}</span>
      </div>

      <div className="flex-1 overflow-auto rounded bg-ops-bg p-3">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
          {Array.from({ length: scenario.citySize.height }).map((_, y) =>
            Array.from({ length: scenario.citySize.width }).map((_, x) => (
              <rect
                key={`cell-${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="none"
                stroke="#1E293B"
                strokeWidth="0.5"
              />
            ))
          )}

          {scenario.hospitals.map((hospital) => {
            const gridPos = geoToGrid(hospital.location, scenario.citySize.width, scenario.citySize.height);
            return (
              <g key={hospital.id}>
                <rect
                  x={gridPos.x * cellSize + 5}
                  y={gridPos.y * cellSize + 5}
                  width={cellSize - 10}
                  height={cellSize - 10}
                  fill="#1E40AF"
                  fillOpacity="0.25"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                />
                <text
                  x={gridPos.x * cellSize + cellSize / 2}
                  y={gridPos.y * cellSize + cellSize / 2}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#93C5FD"
                >
                  🏥
                </text>
              </g>
            );
          })}

          {scenario.shelters.map((shelter) => {
            const gridPos = geoToGrid(shelter.location, scenario.citySize.width, scenario.citySize.height);
            return (
              <g key={shelter.id}>
                <circle
                  cx={gridPos.x * cellSize + cellSize / 2}
                  cy={gridPos.y * cellSize + cellSize / 2}
                  r={6}
                  fill="#0EA5E9"
                  fillOpacity="0.5"
                />
              </g>
            );
          })}

          {scenario.initialIncidents.map((incident) => {
            const gridPos = geoToGrid(incident.location, scenario.citySize.width, scenario.citySize.height);
            return (
              <g key={incident.id}>
                <circle
                  cx={gridPos.x * cellSize + cellSize / 2}
                  cy={gridPos.y * cellSize + cellSize / 2}
                  r={8}
                  fill={SEVERITY_COLORS[incident.severity] || '#9CA3AF'}
                  fillOpacity="0.8"
                />
                <text
                  x={gridPos.x * cellSize + cellSize / 2}
                  y={gridPos.y * cellSize + cellSize / 2 - 12}
                  textAnchor="middle"
                  fill="#CBD5F5"
                  fontSize="8"
                >
                  {incident.id.split('-').slice(-1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#DC2626]"></span>
          Critical incidents
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#3B82F6]"></span>
          Low / Medium incidents
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">🏥</span>
          Hospitals
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#0EA5E9]"></span>
          Shelters
        </div>
      </div>
    </div>
  );
}
