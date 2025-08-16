import { useState, useEffect } from 'react';

export const useGooglePlaces = (map, isLoaded, locations) => {
    const [allPlaceDetails, setAllPlaceDetails] = useState({});
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !map || !locations || locations.length === 0) {
            return;
        }

        const placesService = new window.google.maps.places.PlacesService(map);

        const requests = locations.map(loc => {
            return new Promise((resolve) => {
                const request = {
                    placeId: loc.placeId,
                    fields: ['name', 'rating', 'opening_hours', 'photos', 'utc_offset_minutes', 'formatted_address', 'place_id', 'geometry']
                };

                placesService.getDetails(request, (details, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve({ [loc.placeId]: details });
                    } else {
                        console.error(`Failed to fetch details for ${loc.name}: ${status}`);
                        resolve({ [loc.placeId]: { name: loc.name, place_id: loc.placeId, formatted_address: loc.name } });
                    }
                });
            });
        });

        Promise.all(requests).then(results => {
            const detailsMap = results.reduce((acc, current) => ({ ...acc, ...current }), {});
            
            setAllPlaceDetails(detailsMap);
            setIsInitialLoading(false);
        });
    }, [isLoaded, map, locations]);

    return { allPlaceDetails, isInitialLoading };
};