import { useEffect, useState } from 'react';

import citiesData from '../../../data/filtered_cities_minified.json';

const API_ENDPOINT = 'https://api.marosamap.eu/api/stores';

/**
 * Handles loading store locations and auxiliary city metadata.
 * Keeps fetching concerns outside of the main page component so layout code can stay focused on UI.
 */
export function useLocationsData(endpoint = API_ENDPOINT) {
    const [locations, setLocations] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }

                const data = await response.json();

                if (!isMounted) {
                    return;
                }

                const transformedLocations = data.map((location) => ({
                    ...location,
                    position: { lat: location.lat, lng: location.lng },
                }));

                setLocations(transformedLocations);

                const uniqueCities = citiesData.reduce((accumulator, current) => {
                    if (!accumulator.find((item) => item.city === current.city)) {
                        accumulator.push(current);
                    }
                    return accumulator;
                }, []);

                const transformedCities = uniqueCities.map((city) => {
                    const bulgarianName = (city.alt_names && city.alt_names.length > 0)
                        ? city.alt_names[city.alt_names.length - 1]
                        : city.city;

                    return {
                        englishName: city.city,
                        bulgarianName,
                        lat: city.lat,
                        lng: city.lng,
                    };
                });

                setAllCities(transformedCities);
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [endpoint]);

    return {
        locations,
        allCities,
        isLoading,
    };
}

