import { useMemo } from 'react';

export const mapContainerStyle = { 
    width: '100%', 
    height: '100%',
    backgroundColor: 'transparent'
};

// Map style with specified colors - minimal overrides
const minimalisticMapStyle = [
    // General land - #f4f2f0
    {
        featureType: 'landscape',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f4f2f0' }]
    },
    {
        featureType: 'landscape.natural',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f4f2f0' }]
    },
    // Remove terrain color - use same as general land
    {
        featureType: 'landscape.natural.terrain',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f4f2f0' }]
    },
    {
        featureType: 'landscape.natural.landcover',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f4f2f0' }]
    },
    {
        featureType: 'landscape.natural',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: 'off' }]
    },
    // Hide only restaurants and food-related POIs
    {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
    },
    // Show other POIs (attractions, businesses, etc.) but keep restaurants hidden
    {
        featureType: 'poi.attraction',
        elementType: 'all',
        stylers: [{ visibility: 'on' }]
    },
    {
        featureType: 'poi.business',
        elementType: 'all',
        stylers: [{ visibility: 'on' }]
    },
    {
        featureType: 'poi.place_of_worship',
        elementType: 'all',
        stylers: [{ visibility: 'on' }]
    },
    {
        featureType: 'poi.school',
        elementType: 'all',
        stylers: [{ visibility: 'on' }]
    },
    {
        featureType: 'poi.sports_complex',
        elementType: 'all',
        stylers: [{ visibility: 'on' }]
    },
    // Parks and green areas - #d8f2c4
    {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{ color: '#d8f2c4' }, { visibility: 'on' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
    }
];

// Bulgaria bounds (approximate bounding box)
const BULGARIA_BOUNDS = {
    north: 44.2170,
    south: 41.2340,
    west: 22.3570,
    east: 28.6120
};

const baseOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    clickableIcons: false,
    minZoom: 7,
    gestureHandling: 'greedy',
    mapTypeId: 'roadmap', // Keep roadmap view
    styles: minimalisticMapStyle,
    restriction: {
        latLngBounds: BULGARIA_BOUNDS,
        strictBounds: false, // Allow some flexibility at edges
    },
};

export function useMapOptions() {
    return useMemo(() => baseOptions, []);
}




