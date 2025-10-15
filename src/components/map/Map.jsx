import React, { useMemo, useState } from 'react';
import { GoogleMap, Marker, MarkerF, InfoWindow, Data, MarkerClustererF } from '@react-google-maps/api';

import CustomInfoWindowCard from './CustomInfoWindowCard';
import CustomZoomControl from './map-buttons/CustomZoomControl';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getMarkerIcons, createUserLocationMarker } from '../../utils/markerUtils';

import { mapStyles } from './mapStyles';

import borderData from '../../data/bulgaria-border.json';

const mapContainerStyle = { width: '100%', height: '100%' };

const DEFAULT_CENTER = { lat: 42.7339, lng: 25.4858 };

const clusterStyles = [
    {
        textColor: '#00562A',
        url: '/cluster-1.png',
        height: 80,
        width: 80,
        textSize: 20,
    },
    {
        textColor: '#00562A',
        url: '/cluster-2.png',
        height: 85,
        width: 85,
        textSize: 21,
    },
    {
        textColor: '#00562A',
        url: '/cluster-3.png',
        height: 90,
        width: 90,
        textSize: 22,
    },
];

const calculator = (markers, numStyles) => {
    const count = markers.length;
    let index = 0;

    if (count >= 6) {
        index = 1;
    }
    if (count >= 16) {
        index = 2;
    }

    return {
        text: count.toString(),
        index: index + 1,
    };
};

const Map = ({
    map,
    onLoad,
    locations,
    selectedPlace,
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

    const center = currentUserPosition || DEFAULT_CENTER;

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
        height: '-webkit-fill-available',
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
                center={center}
                zoom={currentUserPosition ? 14 : 7}
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
                            strokeWeight: 2,
                            clickable: false,
                        });
                    }}
                />

                <MarkerClustererF options={{ styles: clusterStyles }}>
                    {(clusterer) =>
                        locations && locations.map((loc) => {
                            const isSelected = selectedPlace?.id === loc.id;
                            const isHovered = hoveredPlaceId === loc.placeId;
                            const { url, size } = getMarkerIcons(isSelected, isHovered, loc);

                            return (
                                <MarkerF
                                    key={loc.id}
                                    position={loc.position}
                                    clusterer={clusterer}
                                    onClick={() => onMarkerClick(loc)}
                                    icon={{
                                        url: url,
                                        scaledSize: size,
                                        anchor: new window.google.maps.Point(size.width / 2, size.height),
                                    }}
                                    title={loc.displayName.text}
                                    zIndex={isSelected || isHovered ? 10 : 1}
                                    onMouseOver={() => onMarkerHover(loc.placeId)}
                                    onMouseOut={() => onMarkerHover(null)}
                                />
                            );
                        })
                    }
                </MarkerClustererF>

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
                    <InfoWindow
                        position={selectedPlace.position}
                        onCloseClick={onCloseInfoWindow}
                        options={{ pixelOffset: new window.google.maps.Size(0, -75) }}
                    >
                        <CustomInfoWindowCard location={selectedPlace} onClose={onCloseInfoWindow} />
                    </InfoWindow>
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