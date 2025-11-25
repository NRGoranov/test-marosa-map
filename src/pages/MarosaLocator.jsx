import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import StyleInjector from '../components/ui/StyleInjector';
import LocationPermissionModal from '../components/ui/LocationPermissionModal';
import SlideDownMenu from '../components/ui/SlideDownMenu';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ResponsiveShell from '../app/layout/ResponsiveShell';
import AppHeader from '../features/navigation/components/AppHeader';
import LocationSearchBar from '../features/search/components/LocationSearchBar';
import LocationList from '../features/locations/components/LocationList';
import MapCanvas from '../features/map/components/MapCanvas';
import ShareModal from '../features/sharing/components/ShareModal';
import { useLocationsData } from '../features/locations/hooks/useLocationsData';
import { useGeolocationGate } from '../features/geolocation/hooks/useGeolocationGate';

function MarosaLocator() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const navigate = useNavigate();

    const { locations, allCities, isLoading: isLoadingData } = useLocationsData();
    const [map, setMap] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
    const [visibleLocations, setVisibleLocations] = useState([]);
    const [locationToShare, setLocationToShare] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const markerClickRef = useRef(false);

    const {
        currentUserPosition,
        isPermissionModalOpen,
        handleAllow,
        handleDismiss,
    } = useGeolocationGate({ map, isMapReady: isLoaded });

    useEffect(() => {
        if (map && locations.length > 0) {
            const bounds = map.getBounds();
            if (!bounds) return;

            const visible = locations.filter((loc) => bounds.contains(loc.position));
            setVisibleLocations(visible);
        }
    }, [locations, map]);

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
        if (!map || locations.length === 0) return;
        const bounds = map.getBounds();
        if (bounds) {
            const visible = locations.filter((loc) => bounds.contains(loc.position));
            setVisibleLocations(visible);
        }
    }, [map, locations]);

    const closeInfoWindow = useCallback(() => {
        setSelectedPlace(null);
    }, []);

    const handleMapClick = useCallback(() => {
        // Use setTimeout to allow the marker click event to complete first
        setTimeout(() => {
            if (!markerClickRef.current) {
                closeInfoWindow();
            }
            markerClickRef.current = false;
        }, 0);
    }, [closeInfoWindow]);

    const handleMarkerClick = useCallback((place) => {
        markerClickRef.current = true;

        if (selectedPlace?.id === place.id) {
            setSelectedPlace(null);
        } else {
            if (map) {
                map.panTo(place.position);
                map.setZoom(14);
            }
            setSelectedPlace(place);
        }
        
        // Reset the ref after a short delay to allow proper click detection
        setTimeout(() => {
            markerClickRef.current = false;
        }, 100);
    }, [map, selectedPlace]);

    const handleShareClick = useCallback((location) => {
        const name = location.displayName?.text;
        const lat = location.geometry?.location?.lat ? location.geometry.location.lat() : location.lat;
        const lng = location.geometry?.location?.lng ? location.geometry.location.lng() : location.lng;

        let finalMapsUrl = '';

        if (location.place_id) {
            finalMapsUrl = `https://www.google.com/maps/place/?q=place_id:${location.place_id}`;
        } else if (lat && lng) {
            finalMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        } else if (name) {
            finalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
        }

        const comprehensiveLocationData = {
            ...location,
            name: name,
            displayName: { text: name },
            rating: 5,
            mapsUrl: finalMapsUrl
        };

        setLocationToShare(comprehensiveLocationData);
    }, []);

    const onMapLoad = useCallback((map) => setMap(map), []);

    const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

    const handleLocationSearchSelect = useCallback((location) => {
        setSearchQuery('');
        handleMarkerClick(location);
    }, [handleMarkerClick]);

    const panelTitle = selectedPlace
        ? selectedPlace.displayName?.text
        : `${visibleLocations.length || locations.length} обекта`;

    const panelData = selectedPlace ? [selectedPlace] : (visibleLocations.length ? visibleLocations : locations);

    return (
        <>
            <Helmet>
                <title>Мароса Градина Карта</title>
                <meta property="og:title" content="Мароса Градина Карта" />
                <meta property="og:description" content="Намерете най-близкия до вас търговски обект." />
                <meta property="og:image" content="https://marosamap.eu/brochure-preview.jpg" />
            </Helmet>

            <StyleInjector />

            <ResponsiveShell
                header={
                    <AppHeader
                        onMenuToggle={handleMenuToggle}
                        onNavigateToBrochure={() => navigate('/brochure')}
                    />
                }
                toolbar={
                    <LocationSearchBar
                        query={searchQuery}
                        onQueryChange={setSearchQuery}
                        allLocations={locations}
                        allCities={allCities}
                        onCitySelect={handleCitySelect}
                        onLocationSelect={handleLocationSearchSelect}
                    />
                }
                map={
                    isLoaded ? (
                        <MapCanvas
                            map={map}
                            onLoad={onMapLoad}
                            locations={locations}
                            selectedPlace={selectedPlace}
                            onMarkerClick={handleMarkerClick}
                            onCloseInfoWindow={closeInfoWindow}
                            currentUserPosition={currentUserPosition}
                            hoveredPlaceId={hoveredPlaceId}
                            onMarkerHover={setHoveredPlaceId}
                            onIdle={handleMapIdle}
                            onMapClick={handleMapClick}
                            showInfoWindow={isDesktop}
                            onShareClick={handleShareClick}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[#7A8E74]">
                            {loadError ? 'Проблем при зареждане на картата' : 'Зареждане на картата...'}
                        </div>
                    )
                }
                panelTitle={panelTitle}
                panel={
                    isLoadingData ? (
                        <div className="flex h-full items-center justify-center text-[#7A8E74]">
                            Зареждаме списъка...
                        </div>
                    ) : (
                        <LocationList
                            locations={panelData}
                            selectedPlaceId={selectedPlace?.id || selectedPlace?.placeId}
                            hoveredPlaceId={hoveredPlaceId}
                            onSelect={handleMarkerClick}
                            onHover={setHoveredPlaceId}
                            onShare={handleShareClick}
                        />
                    )
                }
            />

            <SlideDownMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onBrochureClick={() => navigate('/brochure')}
                menuVariant="home"
            />

            <LocationPermissionModal
                isOpen={isPermissionModalOpen}
                onAllow={handleAllow}
                onCancel={handleDismiss}
            />

            <ShareModal
                isOpen={!!locationToShare}
                onClose={() => setLocationToShare(null)}
                place={locationToShare}
            />
        </>
    );
}

export default MarosaLocator;