import React, { useMemo, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, Data } from '@react-google-maps/api';

import CustomInfoWindowCard from './CustomInfoWindowCard';
import CustomZoomControl from './map-buttons/CustomZoomControl';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getMarkerIcons, createUserLocationMarker } from '../../utils/markerUtils';

import { mapStyles } from './mapStyles';

import borderData from '../../data/bulgaria-border.json';

const mapContainerStyle = { width: '100%', height: '100%' };

const Map = ({
    map,
    onLoad,
    locations,
    selectedPlace,
    placeDetails,
    allPlaceDetails,
    onMarkerClick,
    onCloseInfoWindow,
    showInfoWindow,
    currentUserPosition,
    hoveredPlaceId,
    onMarkerHover,
    onIdle,
    onMapClick,
}) => {
    const userLocationIcon = useMemo(() => createUserLocationMarker(), []);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const mapOptions = useMemo(() => ({
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: false,
        clickableIcons: false,
        minZoom: 7,
        gestureHandling: 'greedy'
    }), []);

    const baseWrapperStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
    };

    const fullscreenStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
    };

    const mobileMapOptions = useMemo(() => ({
        ...mapOptions,
        zoomControl: false,
    }), [mapOptions]);

    const mapWrapperStyle = isFullscreen ? { ...baseWrapperStyle, ...fullscreenStyle } : baseWrapperStyle;

    return (
        <div style={mapWrapperStyle}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentUserPosition}
                zoom={17}
                options={showInfoWindow ? mapOptions : mobileMapOptions}
                onLoad={onLoad}
                onIdle={onIdle}
                onClick={onMapClick}
            >

                <Data
                    onLoad={(data) => {
                        data.addGeoJson(borderData);
                        data.setStyle({
                            fillOpacity: 0,
                            strokeColor: '#1B4712',
                            strokeWeight: 4,
                        });
                    }}
                />

                {locations && locations.map((loc) => {
                    const isSelected = selectedPlace?.placeId === loc.placeId;
                    const isHovered = hoveredPlaceId === loc.placeId;

                    let detailsForIcon = null;
                    if (isSelected) {
                        detailsForIcon = placeDetails;
                    } else if (isHovered) {
                        detailsForIcon = allPlaceDetails[loc.placeId];
                    }

                    const { url, size } = getMarkerIcons(isSelected, isHovered, detailsForIcon);

                    return (
                        <MarkerF
                            key={loc.placeId}
                            position={loc.position}
                            onClick={() => onMarkerClick(loc)}
                            icon={{
                                url: url,
                                scaledSize: size,
                                anchor: new window.google.maps.Point(size.width / 2, size.height),
                            }}
                            title={loc.name}
                            zIndex={isSelected || isHovered ? 10 : 1}
                            onMouseOver={() => onMarkerHover(loc.placeId)}
                            onMouseOut={() => onMarkerHover(null)}
                        />
                    );
                })}

                {currentUserPosition && (
                    <MarkerF
                        position={currentUserPosition}
                        title="Your Location"
                        icon={{
                            url: userLocationIcon,
                            scaledSize: new window.google.maps.Size(48, 48),
                            anchor: new window.google.maps.Point(24, 24),
                        }}
                        zIndex={2}
                    />
                )}

                {showInfoWindow && selectedPlace && (
                    <InfoWindowF
                        position={selectedPlace.position}
                        onCloseClick={onCloseInfoWindow}
                        options={{ pixelOffset: new window.google.maps.Size(0, -75) }}
                    >
                        <CustomInfoWindowCard placeDetails={placeDetails} onClose={onCloseInfoWindow} />
                    </InfoWindowF>
                )}
            </GoogleMap>

            {map && isDesktop && (
                <CustomZoomControl
                    map={map}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                />
            )}
        </div>
    );
};

export default Map;