// MapTiler Geocoding Utility
// Pre-geocoded Toronto landmarks with real coordinates

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

// Pre-geocoded Toronto hospital locations (real coordinates)
export const HOSPITAL_COORDINATES: Record<string, GeoCoordinate> = {
  'toronto-general': { lat: 43.6596, lng: -79.3877 }, // 200 Elizabeth St
  'st-michaels': { lat: 43.6538, lng: -79.3776 }, // 36 Queen St E
  'mount-sinai': { lat: 43.6573, lng: -79.3904 }, // 600 University Ave
  'sunnybrook': { lat: 43.7242, lng: -79.3768 }, // 2075 Bayview Ave (north of downtown)
  'north-york-general': { lat: 43.7679, lng: -79.3647 }, // 4001 Leslie St (north of downtown)
};

// Pre-geocoded Toronto shelter locations (real coordinates)
export const SHELTER_COORDINATES: Record<string, GeoCoordinate> = {
  'metro-convention': { lat: 43.6441, lng: -79.3875 }, // 255 Front St W
  'yonge-dundas': { lat: 43.6561, lng: -79.3802 }, // Yonge-Dundas Square
  'nathan-phillips': { lat: 43.6525, lng: -79.3832 }, // Nathan Phillips Square
  'harbourfront': { lat: 43.6389, lng: -79.3818 }, // 235 Queens Quay W
};

// Pre-geocoded Toronto landmarks (real coordinates)
export const LANDMARK_COORDINATES: Record<string, GeoCoordinate> = {
  // Transit Hubs
  'union-station': { lat: 43.6453, lng: -79.3806 },
  'king-station': { lat: 43.6492, lng: -79.3782 },
  'queen-station': { lat: 43.6523, lng: -79.3792 },
  'dundas-station': { lat: 43.6561, lng: -79.3802 },
  'st-andrew-station': { lat: 43.6476, lng: -79.3847 },
  'osgoode-station': { lat: 43.6506, lng: -79.3867 },

  // Major Buildings
  'td-centre': { lat: 43.6474, lng: -79.3815 },
  'scotia-plaza': { lat: 43.6494, lng: -79.3803 },
  'cn-tower': { lat: 43.6426, lng: -79.3871 },
  'city-hall': { lat: 43.6534, lng: -79.3843 },
  'rogers-centre': { lat: 43.6414, lng: -79.3894 },
  'acc-scotiabank-arena': { lat: 43.6435, lng: -79.3791 },

  // PATH System key locations
  'path-king-bay': { lat: 43.6486, lng: -79.3817 },
  'path-york-st': { lat: 43.6463, lng: -79.3830 },
  'path-union': { lat: 43.6453, lng: -79.3806 },
};

// Pre-geocoded Toronto Fire Stations (real coordinates)
// Reference: Toronto Fire Services station locations
export const FIRE_STATION_COORDINATES: Record<string, GeoCoordinate> = {
  'station-312': { lat: 43.6484, lng: -79.4014 }, // 34 Yorkville Ave
  'station-315': { lat: 43.6562, lng: -79.3591 }, // 257 Sherbourne St
  'station-333': { lat: 43.6621, lng: -79.3869 }, // 83 Davenport Rd
  'station-334': { lat: 43.6391, lng: -79.3804 }, // 2 Rees St (Harbourfront)
  'station-344': { lat: 43.6386, lng: -79.3761 }, // 295 Queens Quay E
};

// Common incident locations in downtown Toronto
export const COMMON_LOCATIONS: Record<string, GeoCoordinate> = {
  // Financial District
  'king-bay': { lat: 43.6486, lng: -79.3817 },
  'king-york': { lat: 43.6476, lng: -79.3847 },
  'front-bay': { lat: 43.6459, lng: -79.3810 },
  'front-york': { lat: 43.6449, lng: -79.3840 },

  // Entertainment District
  'king-john': { lat: 43.6459, lng: -79.3914 },
  'king-spadina': { lat: 43.6447, lng: -79.3958 },

  // Waterfront
  'queens-quay-bay': { lat: 43.6401, lng: -79.3780 },
  'queens-quay-york': { lat: 43.6391, lng: -79.3820 },

  // Dundas/Queen Area
  'dundas-yonge': { lat: 43.6561, lng: -79.3802 },
  'queen-yonge': { lat: 43.6523, lng: -79.3792 },
  'queen-bay': { lat: 43.6511, lng: -79.3837 },

  // College/University Area
  'college-university': { lat: 43.6613, lng: -79.3918 },
  'college-yonge': { lat: 43.6610, lng: -79.3834 },
};

// Downtown Toronto bounds for map display
export const DOWNTOWN_BOUNDS = {
  west: -79.412, // roughly Bathurst
  east: -79.354, // Parliament (extended slightly)
  north: 43.675, // north of Bloor (extended for Sunnybrook reference)
  south: 43.635, // Queens Quay / Waterfront
};

/**
 * Convert lat/lng to the percentage position within downtown bounds
 * Returns { x: 0-1, y: 0-1 } where (0,0) is top-left (NW corner)
 */
export function coordsToNormalized(coord: GeoCoordinate): { x: number; y: number } {
  const x = (coord.lng - DOWNTOWN_BOUNDS.west) / (DOWNTOWN_BOUNDS.east - DOWNTOWN_BOUNDS.west);
  // Y is inverted: north (high lat) should be at top (low y)
  const y = (DOWNTOWN_BOUNDS.north - coord.lat) / (DOWNTOWN_BOUNDS.north - DOWNTOWN_BOUNDS.south);
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
}

/**
 * Check if a coordinate is within the downtown bounds
 */
export function isWithinBounds(coord: GeoCoordinate): boolean {
  return (
    coord.lng >= DOWNTOWN_BOUNDS.west &&
    coord.lng <= DOWNTOWN_BOUNDS.east &&
    coord.lat >= DOWNTOWN_BOUNDS.south &&
    coord.lat <= DOWNTOWN_BOUNDS.north
  );
}

/**
 * Get the real coordinate for a landmark by ID
 */
export function getLandmarkCoordinate(landmarkId: string): GeoCoordinate | null {
  return (
    HOSPITAL_COORDINATES[landmarkId] ||
    SHELTER_COORDINATES[landmarkId] ||
    LANDMARK_COORDINATES[landmarkId] ||
    FIRE_STATION_COORDINATES[landmarkId] ||
    COMMON_LOCATIONS[landmarkId] ||
    null
  );
}

/**
 * Optional: Fetch coordinates from MapTiler Geocoding API
 * Use this for dynamic geocoding of addresses not in our pre-defined list
 */
export async function geocodeAddress(address: string): Promise<GeoCoordinate | null> {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!apiKey) {
    console.warn('MapTiler API key not available');
    return null;
  }

  const query = encodeURIComponent(`${address}, Toronto, ON, Canada`);
  const url = `https://api.maptiler.com/geocoding/${query}.json?key=${apiKey}&proximity=-79.38,43.65&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
