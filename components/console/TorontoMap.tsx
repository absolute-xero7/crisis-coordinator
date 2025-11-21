import { SimulationState, Incident, Resource, TorontoHospital } from '@/lib/types';
import { TORONTO_STREETS } from '@/lib/torontoData';

interface TorontoMapProps {
  state: SimulationState;
}

export default function TorontoMap({ state }: TorontoMapProps) {
  const { citySize } = state.scenario;
  const cellSize = 40;
  const width = citySize.width * cellSize;
  const height = citySize.height * cellSize;

  // Severity colors
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5:
        return '#DC2626';
      case 4:
        return '#F59E0B';
      case 3:
        return '#EAB308';
      case 2:
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  // Resource type colors
  const getResourceColor = (type: string) => {
    if (type.startsWith('fire')) return '#CC0000';
    if (type.startsWith('ambulance')) return '#00563F';
    if (type.startsWith('police')) return '#003A70';
    return '#6B7280';
  };

  return (
    <div className="ops-panel p-4 flex-1">
      <h2 className="text-lg font-display font-semibold mb-4">
        Toronto Map - {state.scenario.locationFocus}
      </h2>

      <div className="bg-ops-bg rounded overflow-auto" style={{ maxHeight: '500px' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid */}
          {Array.from({ length: citySize.height }).map((_, y) =>
            Array.from({ length: citySize.width }).map((_, x) => (
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

          {/* Toronto Street Labels */}
          {TORONTO_STREETS.map((street) => {
            if (street.orientation === 'horizontal') {
              return (
                <text
                  key={street.name}
                  x={5}
                  y={street.gridLine * cellSize + cellSize / 2}
                  fill="#6B7280"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {street.name}
                </text>
              );
            } else {
              return (
                <text
                  key={street.name}
                  x={street.gridLine * cellSize + 5}
                  y={15}
                  fill="#6B7280"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  transform={`rotate(-90 ${street.gridLine * cellSize + 5} 15)`}
                >
                  {street.name}
                </text>
              );
            }
          })}

          {/* Hospitals */}
          {state.hospitals.map((hospital) => (
            <g key={hospital.id}>
              <rect
                x={hospital.location.x * cellSize + 5}
                y={hospital.location.y * cellSize + 5}
                width={cellSize - 10}
                height={cellSize - 10}
                fill="#1E40AF"
                fillOpacity="0.3"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              <text
                x={hospital.location.x * cellSize + cellSize / 2}
                y={hospital.location.y * cellSize + cellSize / 2}
                fill="#93C5FD"
                fontSize="16"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                🏥
              </text>
            </g>
          ))}

          {/* Incidents */}
          {state.incidents
            .filter((i) => i.status !== 'resolved')
            .map((incident) => {
              const color = getSeverityColor(incident.severity);
              return (
                <g key={incident.id} className="incident-marker">
                  <circle
                    cx={incident.location.x * cellSize + cellSize / 2}
                    cy={incident.location.y * cellSize + cellSize / 2}
                    r={8}
                    fill={color}
                    fillOpacity="0.8"
                    stroke={color}
                    strokeWidth="2"
                  >
                    <animate
                      attributeName="r"
                      values="8;12;8"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.4;0.8"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text
                    x={incident.location.x * cellSize + cellSize / 2}
                    y={incident.location.y * cellSize + cellSize / 2 - 15}
                    fill={color}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {incident.id.split('-')[2]}
                  </text>
                </g>
              );
            })}

          {/* Resources */}
          {state.resources
            .filter((r) => r.status !== 'available')
            .map((resource) => {
              const color = getResourceColor(resource.type);
              return (
                <g key={resource.id}>
                  <rect
                    x={resource.location.x * cellSize + cellSize / 2 - 6}
                    y={resource.location.y * cellSize + cellSize / 2 - 6}
                    width={12}
                    height={12}
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-critical"></div>
          <span>Critical (5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-high"></div>
          <span>High (4)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-medium"></div>
          <span>Medium (3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-low"></div>
          <span>Low (1-2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-toronto-fire"></div>
          <span>TFS Units</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-toronto-ems"></div>
          <span>EMS Units</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-toronto-police"></div>
          <span>TPS Units</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">🏥</span>
          <span>Hospitals</span>
        </div>
      </div>
    </div>
  );
}
