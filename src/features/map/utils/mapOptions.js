import { useMemo } from 'react';

export const mapContainerStyle = { width: '100%', height: '100%' };

const baseOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    clickableIcons: false,
    minZoom: 7,
    gestureHandling: 'greedy',
};

export function useMapOptions() {
    return useMemo(() => baseOptions, []);
}

