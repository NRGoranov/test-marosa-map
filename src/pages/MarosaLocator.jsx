import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

import { db } from '../firebase';

import DesktopView from '../components/layout/desktop/DesktopView';
import MobileSearchView from '../components/layout/mobile/MobileSearchView';
import MobileView from '../components/layout/mobile/MobileView';

import StyleInjector from '../components/ui/StyleInjector';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import { useMediaQuery } from '../hooks/useMediaQuery';

const googleMapsApiKey = "AIzaSyB3HnHvGA4yPr85twsipz7YAT6EmZAo1wk";

const libraries = ['places'];

function MarosaLocator({ initialSearchState = false }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
        libraries,
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
    const { allPlaceDetails, isInitialLoading } = useGooglePlaces(map, isLoaded, locations);
    const [visibleLocations, setVisibleLocations] = useState([]);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isSearching, setIsSearching] = useState(initialSearchState);
    const markerClickRef = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const locationsQuery = getDocs(collection(db, "locations"));
                const citiesQuery = getDocs(collection(db, "cities"));

                const [locationsSnapshot, citiesSnapshot] = await Promise.all([locationsQuery, citiesQuery]);

                const locationsData = locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLocations(locationsData);

                const citiesData = citiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllCities(citiesData);

                console.log("Successfully fetched locations and cities.");

            } catch (error) {
                console.error("Error fetching data: ", error);
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

    const handleHomeMarkerClick = (place) => {
        if (map) {
            map.panTo(place.position);
            map.setZoom(14);
        }

        setIsSearching(true);
    };

    const handleMapClick = useCallback(() => {
        if (markerClickRef.current) {
            markerClickRef.current = false;
            return;
        }
        closeInfoWindow();
    }, [closeInfoWindow]);

    const handleMarkerClick = useCallback((place) => {
        markerClickRef.current = true;
        if (selectedPlace?.placeId === place.placeId) {
            setSelectedPlace(null);
            setPlaceDetails(null);
        } else {
            if (map) {
                map.panTo(place.position);
                map.setZoom(18);
            }
            setSelectedPlace(place);
            setPlaceDetails(allPlaceDetails[place.placeId] || { name: place.name });
        }
    }, [map, selectedPlace, allPlaceDetails]);

    const onMapLoad = useCallback((map) => setMap(map), []);

    const viewProps = {
        map,
        onLoad: onMapLoad,
        locations: visibleLocations,
        allLocations: locations,
        allCities: allCities,
        isInitialLoading: isInitialLoading || isLoadingData,
        selectedPlace,
        placeDetails,
        allPlaceDetails,
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