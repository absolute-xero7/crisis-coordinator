import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SimulationState, TorontoHospital, Incident, Resource, GeoPosition } from '@/lib/types';

interface TorontoMapProps {
  state: SimulationState;
}

interface TooltipData {
  x: number;
  y: number;
  type: 'hospital' | 'incident' | 'resource';
  data: TorontoHospital | Incident | Resource;
}

// Calculate bounds from incident locations only (hospitals/shelters may be far from action)
function calculateScenarioBounds(state: SimulationState): {
  west: number;
  east: number;
  north: number;
  south: number;
  center: [number, number];
} {
  const positions: GeoPosition[] = [];

  // Only collect positions from incidents (the primary focus area)
  state.scenario.initialIncidents.forEach((inc) => positions.push(inc.location));
  state.scenario.scriptedEvents?.forEach((evt) => {
    if (evt.type === 'spawn_incident' && evt.payload?.location) {
      positions.push(evt.payload.location as GeoPosition);
    }
  });

  if (positions.length === 0) {
    // Default to downtown Toronto if no positions
    return {
      west: -79.405,
      east: -79.360,
      north: 43.665,
      south: 43.640,
      center: [-79.3825, 43.6525],
    };
  }

  // Calculate min/max bounds from incidents only
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  positions.forEach((pos) => {
    minLat = Math.min(minLat, pos.lat);
    maxLat = Math.max(maxLat, pos.lat);
    minLng = Math.min(minLng, pos.lng);
    maxLng = Math.max(maxLng, pos.lng);
  });

  // Add padding (15% on each side for comfortable viewing)
  const latPadding = (maxLat - minLat) * 0.15;
  const lngPadding = (maxLng - minLng) * 0.15;

  // Ensure minimum bounds size (prevent over-zoom on clustered incidents)
  const minLatSpan = 0.02;  // ~2.2km
  const minLngSpan = 0.025; // ~1.9km
  const latSpan = Math.max(maxLat - minLat + 2 * latPadding, minLatSpan);
  const lngSpan = Math.max(maxLng - minLng + 2 * lngPadding, minLngSpan);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return {
    west: centerLng - lngSpan / 2,
    east: centerLng + lngSpan / 2,
    north: centerLat + latSpan / 2,
    south: centerLat - latSpan / 2,
    center: [centerLng, centerLat],
  };
}

export default function TorontoMap({ state }: TorontoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mapVersion, setMapVersion] = useState(0); // Triggers re-render on map move

  // Calculate bounds once from scenario data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scenarioBounds = useMemo(() => calculateScenarioBounds(state), [state.scenario.id]);

  // Severity colors
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5:
        return '#f06767';
      case 4:
        return '#f5b75f';
      case 3:
        return '#8bc6ff';
      case 2:
        return '#7be0c3';
      default:
        return '#6B7280';
    }
  };

  // Resource type colors
  const getResourceColor = (type: string) => {
    if (type.startsWith('fire')) return '#d83a36';
    if (type.startsWith('ambulance')) return '#1f8f78';
    if (type.startsWith('police')) return '#1f4f8f';
    return '#6B7280';
  };

  // Severity label
  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      default: return 'Minor';
    }
  };

  // Format incident type for display
  const formatIncidentType = (type: string) => {
    return type.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Handle tooltip show/hide
  const handleMouseEnter = useCallback((
    e: React.MouseEvent<SVGGElement>,
    type: 'hospital' | 'incident' | 'resource',
    data: TorontoHospital | Incident | Resource
  ) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        type,
        data,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Initialize basemap (MapLibre + MapTiler Dark)
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!apiKey) {
      console.warn('MapTiler key missing; skipping basemap');
      return;
    }

    // Use a more detailed street style for richer labels/features
    const styleUrl = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${apiKey}`;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: scenarioBounds.center,
      zoom: 12,
      interactive: true,
      attributionControl: false,
      dragRotate: false,        // Disable rotation for simplicity
      touchZoomRotate: true,
      scrollZoom: true,
      doubleClickZoom: true,
      dragPan: true,
    });

    map.once('load', () => {
      map.fitBounds(
        [
          [scenarioBounds.west, scenarioBounds.south],
          [scenarioBounds.east, scenarioBounds.north],
        ],
        { padding: 20, animate: false, maxZoom: 15 }
      );
      setMapLoaded(true);
    });

    // Update overlay positions when map moves/zooms
    const handleMove = () => setMapVersion((v) => v + 1);
    map.on('move', handleMove);

    mapInstanceRef.current = map;

    return () => {
      map.off('move', handleMove);
      map.remove();
      mapInstanceRef.current = null;
      setMapLoaded(false);
    };
  }, [scenarioBounds]);

  // Track overlay size to align SVG with the map's pixel space
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect) {
        setOverlaySize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Project real lat/lng coordinate to screen pixel using MapLibre
  const projectLatLng = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !mapLoaded) return { x: -9999, y: -9999 };
    const pt = mapInstanceRef.current.project([lng, lat]);
    return { x: pt.x, y: pt.y };
  };

  // Include mapVersion in dependency to trigger re-render on pan/zoom
  const overlayReady = mapLoaded && overlaySize.width > 0 && overlaySize.height > 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _forceUpdate = mapVersion; // Used to trigger re-render when map moves

  return (
    <div className="ops-panel p-4 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 flex-shrink-0">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Toronto Map</p>
          <h2 className="text-lg font-display font-semibold text-blue-200">
            {state.scenario.locationFocus}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-300">
          <span className="rounded-full border border-ops-border px-2 py-1 bg-ops-panel-light">
            {state.incidents.filter((i) => i.status !== 'resolved').length} active
          </span>
          <span className="rounded-full border border-ops-border px-2 py-1 bg-ops-panel-light">
            {state.resources.filter((r) => r.status !== 'available').length} deployed
          </span>
        </div>
      </div>

      <div
        className="relative flex-1 min-h-0 overflow-hidden border border-ops-border bg-gradient-to-br from-ops-panel to-ops-panel-light shadow-xl"
      >
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full z-0"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/18 pointer-events-none"></div>

        {overlayReady && (
          <svg
            className="absolute inset-0 w-full h-full z-10"
            viewBox={`0 0 ${overlaySize.width} ${overlaySize.height}`}
            preserveAspectRatio="none"
            style={{ pointerEvents: 'none' }}
          >
            {/* Hospitals */}
            {state.hospitals.map((hospital) => {
              const pos = projectLatLng(hospital.location.lat, hospital.location.lng);
              // Skip if outside visible bounds
              if (pos.x < -50 || pos.x > overlaySize.width + 50 || pos.y < -50 || pos.y > overlaySize.height + 50) {
                return null;
              }
              return (
                <g
                  key={hospital.id}
                  className="cursor-pointer transition-transform duration-150 hover:scale-110"
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px`, pointerEvents: 'all' }}
                  onMouseEnter={(e) => handleMouseEnter(e, 'hospital', hospital)}
                  onMouseLeave={handleMouseLeave}
                >
                  <rect
                    x={pos.x - 14}
                    y={pos.y - 14}
                    width={28}
                    height={28}
                    fill="#1E40AF"
                    fillOpacity="0.28"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    rx={6}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    fill="#93C5FD"
                    fontSize="16"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    🏥
                  </text>
                </g>
              );
            })}

            {/* Incidents */}
            {state.incidents
              .filter((i) => i.status !== 'resolved')
              .map((incident) => {
                const color = getSeverityColor(incident.severity);
                const pos = projectLatLng(incident.location.lat, incident.location.lng);
                return (
                  <g
                    key={incident.id}
                    style={{ pointerEvents: 'none' }}
                  >
                    {/* Pulsing outer ring - CSS animation only */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={10}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      className="incident-pulse-ring"
                    />
                    {/* Solid inner circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={8}
                      fill={color}
                      fillOpacity="0.9"
                      stroke={color}
                      strokeWidth="2"
                    />
                    {/* Invisible hit area - only interactive element */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={22}
                      fill="transparent"
                      className="cursor-pointer"
                      style={{ pointerEvents: 'all' }}
                      onMouseEnter={(e) => handleMouseEnter(e, 'incident', incident)}
                      onMouseLeave={handleMouseLeave}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 16}
                      fill={color}
                      fontSize="11"
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
                const pos = projectLatLng(resource.location.lat, resource.location.lng);
                return (
                  <g
                    key={resource.id}
                    className="cursor-pointer transition-transform duration-150 hover:scale-125"
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px`, pointerEvents: 'all' }}
                    onMouseEnter={(e) => handleMouseEnter(e, 'resource', resource)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Larger invisible hit area */}
                    <rect
                      x={pos.x - 12}
                      y={pos.y - 12}
                      width={24}
                      height={24}
                      fill="transparent"
                    />
                    <rect
                      x={pos.x - 6}
                      y={pos.y - 6}
                      width={12}
                      height={12}
                      fill={color}
                      stroke="white"
                      strokeWidth="1.5"
                      rx={2}
                    />
                  </g>
                );
              })}
          </svg>
        )}

        {/* Elegant Tooltip */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none animate-in fade-in duration-150"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: `translate(${tooltip.x > overlaySize.width / 2 ? '-100%' : '10px'}, ${tooltip.y > overlaySize.height / 2 ? '-100%' : '10px'})`,
            }}
          >
            <div className="bg-ops-panel/95 backdrop-blur-xl border border-ops-border rounded-lg shadow-2xl overflow-hidden min-w-[200px] max-w-[280px]">
              {tooltip.type === 'hospital' && (() => {
                const hospital = tooltip.data as TorontoHospital;
                const capacityPercent = Math.round((hospital.capacityUsed / hospital.capacityTotal) * 100);
                return (
                  <>
                    <div className="bg-blue-600/20 border-b border-ops-border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏥</span>
                        <span className="font-semibold text-blue-200 text-sm">{hospital.name}</span>
                      </div>
                    </div>
                    <div className="px-3 py-2 space-y-2 text-xs">
                      <p className="text-gray-400">{hospital.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Capacity</span>
                        <span className={`font-mono ${capacityPercent > 80 ? 'text-red-400' : capacityPercent > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {hospital.capacityUsed}/{hospital.capacityTotal} ({capacityPercent}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${capacityPercent > 80 ? 'bg-red-500' : capacityPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                      {hospital.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {hospital.specialties.slice(0, 3).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <span className="px-1.5 py-0.5 text-gray-500 text-[10px]">
                              +{hospital.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {tooltip.type === 'incident' && (() => {
                const incident = tooltip.data as Incident;
                const color = getSeverityColor(incident.severity);
                return (
                  <>
                    <div
                      className="border-b border-ops-border px-3 py-2"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm" style={{ color }}>
                          {formatIncidentType(incident.type)}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${color}30`, color }}
                        >
                          {getSeverityLabel(incident.severity)}
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-2 space-y-2 text-xs">
                      {(incident.location.address || incident.location.landmark || incident.location.neighborhood) && (
                        <p className="text-blue-300 font-medium">
                          {incident.location.address || incident.location.landmark || incident.location.neighborhood}
                        </p>
                      )}
                      <p className="text-gray-200 leading-relaxed">{incident.details}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-ops-border/50">
                        <div>
                          <span className="text-gray-500 text-[10px] uppercase">Status</span>
                          <p className="text-gray-300 capitalize">{incident.status.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] uppercase">Affected</span>
                          <p className="text-gray-300">{incident.peopleAffected} people</p>
                        </div>
                      </div>
                      {incident.assignedResources.length > 0 && (
                        <div className="pt-1">
                          <span className="text-gray-500 text-[10px] uppercase">Units Assigned</span>
                          <p className="text-green-400 font-mono">{incident.assignedResources.length} responding</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {tooltip.type === 'resource' && (() => {
                const resource = tooltip.data as Resource;
                const color = getResourceColor(resource.type);
                const assignedIncident = resource.assignedTo
                  ? state.incidents.find((i) => i.id === resource.assignedTo)
                  : null;
                return (
                  <>
                    <div
                      className="border-b border-ops-border px-3 py-2"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-sm text-gray-100">{resource.name}</span>
                      </div>
                    </div>
                    <div className="px-3 py-2 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Type</span>
                        <span className="text-gray-200">{formatIncidentType(resource.type)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className={`capitalize ${
                          resource.status === 'on-scene' ? 'text-green-400' :
                          resource.status === 'en-route' ? 'text-yellow-400' :
                          resource.status === 'dispatched' ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                          {resource.status.replace('-', ' ')}
                        </span>
                      </div>
                      {resource.station && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Station</span>
                          <span className="text-gray-300 text-right text-[10px]">{resource.station}</span>
                        </div>
                      )}
                      {assignedIncident && (
                        <div className="pt-1 border-t border-ops-border/50">
                          <span className="text-gray-500 text-[10px] uppercase">Responding To</span>
                          <p className="text-gray-200 truncate">{assignedIncident.details.slice(0, 50)}...</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 bg-ops-panel/90 backdrop-blur-md border border-ops-border p-3 text-xs text-gray-200 shadow-md min-w-[200px] z-20">
          <div className="grid grid-cols-2 gap-2">
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
      </div>
    </div>
  );
}
