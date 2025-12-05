import { useMemo } from 'react';

// Map container style for GoogleMap component
export const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

// Hook to get map options
export const useMapOptions = () => {
    return useMemo(() => ({
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
    }), []);
};
