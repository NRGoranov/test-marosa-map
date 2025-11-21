import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import DesktopView from '../components/layout/desktop/DesktopView';
import MobileView from '../components/layout/mobile/MobileView';

import StyleInjector from '../components/ui/StyleInjector';
import LocationPermissionModal from '../components/ui/LocationPermissionModal';
import { useMediaQuery } from '../hooks/useMediaQuery';

import citiesData from '../data/filtered_cities_minified.json';

function MarosaLocator() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const navigate = useNavigate();

    const [locations, setLocations] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [map, setMap] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
    const [currentUserPosition, setCurrentUserPosition] = useState(null);
    const [placeDetails, setPlaceDetails] = useState(null);
    const [visibleLocations, setVisibleLocations] = useState([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

    const isDesktop = useMediaQuery('(min-width: 768px)');

    const markerClickRef = useRef(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const locationsResponse = await fetch('https://api.marosamap.eu/api/stores');

                if (!locationsResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const locationsData = await locationsResponse.json();

                const transformedLocationsData = locationsData.map(location => ({
                    ...location,
                    position: { lat: location.lat, lng: location.lng }
                }));

                setLocations(transformedLocationsData);

                const uniqueCities = citiesData.reduce((accumulator, current) => {
                    if (!accumulator.find(item => item.city === current.city)) {
                        accumulator.push(current);
                    }
                    return accumulator;
                }, []);

                const transformedCitiesData = uniqueCities.map(city => {
                    const bulgarianName = (city.alt_names && city.alt_names.length > 0)
                        ? city.alt_names[city.alt_names.length - 1]
                        : city.city;

                    return {
                        englishName: city.city,
                        bulgarianName: bulgarianName,
                        lat: city.lat,
                        lng: city.lng,
                    };
                });

                setAllCities(transformedCitiesData);

                console.log("Successfully fetched data.");

                console.log(transformedLocationsData);
            } catch (error) {
                console.error("Error fetching data from API: ", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, []);

    const requestLocation = useCallback(() => {
        if (!map || !navigator.geolocation) return;
        
        setHasRequestedLocation(true);
        setIsLocationModalOpen(false);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Geolocation Success! Position:", position.coords);
                const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
                setCurrentUserPosition(userPos);
                map.panTo(userPos);
                map.setZoom(15);
            },
            () => {
                console.error("Geolocation permission denied or service failed.");
            }
        );
    }, [map]);

    const handleLocationAllow = useCallback(() => {
        requestLocation();
    }, [requestLocation]);

    const handleLocationCancel = useCallback(() => {
        setIsLocationModalOpen(false);
        setHasRequestedLocation(true);
    }, []);

    useEffect(() => {
        if (isLoaded && map && navigator.geolocation && !hasRequestedLocation) {
            // Small delay to ensure map is fully rendered
            const timer = setTimeout(() => {
                console.log('Checking location permission...');
                // Check if permission was already granted
                if (navigator.permissions) {
                    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                        console.log('Permission state:', result.state);
                        if (result.state === 'granted') {
                            // Permission already granted, request location directly
                            requestLocation();
                        } else {
                            // Show modal for prompt or denied state
                            console.log('Showing location modal');
                            setIsLocationModalOpen(true);
                        }
                    }).catch((error) => {
                        console.log('Permissions API error, showing modal:', error);
                        // Permissions API not supported or failed, show modal
                        setIsLocationModalOpen(true);
                    });
                } else {
                    console.log('Permissions API not supported, showing modal');
                    // Permissions API not supported, show modal
                    setIsLocationModalOpen(true);
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isLoaded, map, hasRequestedLocation, requestLocation]);

    const handleCitySelect = useCallback((cityName) => {
        if (!map) return;

        console.log(`Searching for city: ${cityName}`);

        const cityData = allCities.find(city => city.bulgarianName === cityName);

        if (cityData) {
            const position = { lat: cityData.lat, lng: cityData.lng };
            map.panTo(position);
            map.setZoom(11);
            console.log(`Panned to ${cityName} at`, position);
        } else {
            console.error(`City not found in local data: ${cityName}`);
        }
    }, [map, allCities]);

    const handleMapIdle = useCallback(() => {
        if (!map || locations.length === 0) {
            if (locations.length > 0) {
                setVisibleLocations([]);
            }

            return;
        }

        const bounds = map.getBounds();

        if (bounds) {
            const visible = locations.filter(loc =>
                bounds.contains(loc.position)
            );

            setVisibleLocations(visible);
        }
    }, [map, locations]);

    useEffect(() => {
        if (map && locations.length > 0) {
            handleMapIdle();
        }
    }, [locations, map, handleMapIdle]);

    const closeInfoWindow = useCallback(() => {
        setSelectedPlace(null);
        setPlaceDetails(null);
    }, []);

    const handleMapClick = useCallback(() => {
        if (markerClickRef.current) {
            markerClickRef.current = false;
            return;
        }
        closeInfoWindow();
    }, [closeInfoWindow]);

    const handleMarkerClick = useCallback((place) => {
        markerClickRef.current = true;

        if (selectedPlace?.id === place.id) {
            setSelectedPlace(null);
            setPlaceDetails(null);
        } else {
            if (map) {
                map.panTo(place.position);
                map.setZoom(14);
            }
            setSelectedPlace(place);
            setPlaceDetails(place);
        }
    }, [map, selectedPlace]);

    const onMapLoad = useCallback((map) => setMap(map), []);

    const viewProps = {
        map,
        onLoad: onMapLoad,
        locations: visibleLocations,
        allLocations: locations,
        allCities: allCities,
        isInitialLoading: isLoadingData,
        selectedPlace,
        placeDetails,
        onMarkerClick: handleMarkerClick,
        onCloseInfoWindow: closeInfoWindow,
        onMapClick: handleMapClick,
        currentUserPosition,
        hoveredPlaceId,
        onMarkerHover: setHoveredPlaceId,
        onListItemHover: setHoveredPlaceId,
        onIdle: handleMapIdle,
        loadError,
        isLoaded,
        showInfoWindow: isDesktop,
        onCitySelect: handleCitySelect,
    };

    return (
        <>
            <Helmet>
                <title>Мароса Градина Карта</title>
                <meta property="og:title" content="Мароса Градина Карта" />
                <meta property="og:description" content="Намерете най-близкия до вас търговски обект." />
                <meta property="og:image" content="https://marosamap.eu/brochure-preview.jpg" />
            </Helmet>

            <StyleInjector />
            {isDesktop ? (
                <DesktopView {...viewProps} />
            ) : (
                <MobileView
                    {...viewProps}
                    onNavigateToBrochure={() => navigate('/brochure')}
                />
            )}
            <LocationPermissionModal
                isOpen={isLocationModalOpen}
                onAllow={handleLocationAllow}
                onCancel={handleLocationCancel}
            />
        </>
    );
}

export default MarosaLocator;