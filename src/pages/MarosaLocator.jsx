import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

import DesktopView from '../components/layout/desktop/DesktopView';
import MobileSearchView from '../components/layout/mobile/MobileSearchView';
import MobileView from '../components/layout/mobile/MobileView';

import StyleInjector from '../components/ui/StyleInjector';
import { useMediaQuery } from '../hooks/useMediaQuery';

//const libraries = ['places'];

function MarosaLocator({ initialSearchState = false }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        //libraries,
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
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isSearching, setIsSearching] = useState(initialSearchState);
    const markerClickRef = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const locationsResponse = await Promise.all([
                    fetch('https://api.marosamap.eu/api/stores'),
                ]);

                if (!locationsResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const locationsData = await locationsResponse.json();

                const transformedLocationsData = locationsData.map(location => ({
                    ...location,
                    position: { lat: location.lat, lng: location.lng }
                }));

                setLocations(transformedLocationsData);

                console.log("Successfully fetched data from custom API.");
                console.log(locations);
            } catch (error) {
                console.error("Error fetching data from API: ", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (isLoaded && map && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Geolocation Success! Position:", position.coords);
                    const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setCurrentUserPosition(userPos);
                    map.panTo(userPos);
                    map.setZoom(15);
                },
                () => console.error("Geolocation permission denied or service failed.")
            );
        }
    }, [isLoaded, map]);

    useEffect(() => {
        setIsSearching(initialSearchState);
    }, [initialSearchState]);

    const handleNavigateToBrochure = () => {
        navigate('/brochure');
    };



    // TO CHANGE
    const handleCitySelect = useCallback(async (cityName) => {
        if (!map) return;

        console.log(`Searching for city: ${cityName}`);
        const cityDocRef = doc(db, "cities", cityName);
        try {
            const cityDoc = await getDoc(cityDocRef);
            if (cityDoc.exists()) {
                const cityData = cityDoc.data();
                const { position } = cityData;
                map.panTo(position);
                map.setZoom(11);
                console.log(`Panned to ${cityName} at`, position);
            } else {
                console.error(`City not found in database: ${cityName}`);
            }
        } catch (error) {
            console.error("Error fetching city details: ", error);
        }
    }, [map]);
    //



    const handleMapIdle = useCallback(() => {
        if (!map || locations.length === 0) return;
        const bounds = map.getBounds();
        if (bounds) {
            const visible = locations.filter(loc =>
                bounds.contains(loc.position)
            );
            setVisibleLocations(visible);
        }
    }, [map, locations]);

    const closeInfoWindow = useCallback(() => {
        setSelectedPlace(null);
        setPlaceDetails(null);
    }, []);

    const handleEnterSearchMode = () => {
        closeInfoWindow();
        navigate('/search');
    };

    const handleExitSearchMode = () => {
        closeInfoWindow();
        navigate('/');
    };



    // TO REMOVE?
    const handleHomeMarkerClick = (place) => {
        if (map) {
            map.panTo(place.position);
            map.setZoom(14);
        }

        setIsSearching(true);
    };
    //



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
    };

    return (
        <>
            <StyleInjector />
            {isDesktop ? (
                <DesktopView {...viewProps} />
            ) : (
                isSearching ? (
                    <MobileSearchView
                        {...viewProps}
                        onExitSearch={handleExitSearchMode}
                        onCitySelect={handleCitySelect}
                    />
                ) : (
                    <MobileView
                        {...viewProps}
                        onEnterSearch={handleEnterSearchMode}
                        onNavigateToBrochure={() => navigate('/brochure')}
                        onMarkerClick={handleMarkerClick}
                        selectedPlace={selectedPlace}
                        onCloseInfoWindow={closeInfoWindow}
                    />
                )
            )}
        </>
    );
}

export default MarosaLocator;