import { useMemo } from 'react';
import { isMobileDevice } from '../../../utils/mobileUtils';

export const mapContainerStyle = { 
    width: '100%', 
    height: '100%',
    backgroundColor: 'transparent'
};

const baseOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    clickableIcons: false,
    minZoom: 7,
    gestureHandling: 'greedy',
};

const mobileOptions = {
    ...baseOptions,
    gestureHandling: 'none', // Disable all gestures (zoom, pan)
    disableDoubleClickZoom: true,
    scrollwheel: false,
    draggable: true, // Keep draggable but we'll control it with touch handlers
    keyboardShortcuts: false,
};

export function useMapOptions() {
    return useMemo(() => {
        return isMobileDevice() ? mobileOptions : baseOptions;
    }, []);
}




