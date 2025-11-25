import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Centralizes the permission flow for geolocation:
 * - only prompts once per session
 * - exposes modal controls to UI layer
 */
export function useGeolocationGate({ map, isMapReady }) {
    const [currentUserPosition, setCurrentUserPosition] = useState(null);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

    const hasAttemptedRef = useRef(false);

    const requestLocation = useCallback(() => {
        if (!map || !navigator.geolocation) return;

        setHasRequestedLocation(true);
        setIsPermissionModalOpen(false);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const nextPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setCurrentUserPosition(nextPosition);
                map.panTo(nextPosition);
                map.setZoom(15);
            },
            () => {
                console.error('Geolocation permission denied.');
            }
        );
    }, [map]);

    const handleAllow = useCallback(() => {
        requestLocation();
    }, [requestLocation]);

    const handleDismiss = useCallback(() => {
        setIsPermissionModalOpen(false);
        setHasRequestedLocation(true);
    }, []);

    useEffect(() => {
        if (!isMapReady || !map || !navigator.geolocation || hasAttemptedRef.current) {
            return;
        }

        hasAttemptedRef.current = true;

        const permissionCheck = async () => {
            try {
                if (navigator.permissions) {
                    const result = await navigator.permissions.query({ name: 'geolocation' });
                    if (result.state === 'granted') {
                        requestLocation();
                        return;
                    }
                }
                setIsPermissionModalOpen(true);
            } catch (error) {
                console.warn('Permissions API unavailable, showing manual modal.', error);
                setIsPermissionModalOpen(true);
            }
        };

        permissionCheck();
    }, [isMapReady, map, requestLocation]);

    return {
        currentUserPosition,
        isPermissionModalOpen: isPermissionModalOpen && !hasRequestedLocation,
        handleAllow,
        handleDismiss,
    };
}

