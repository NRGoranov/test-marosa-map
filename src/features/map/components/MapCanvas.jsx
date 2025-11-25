import React, { useMemo, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindow, Data, MarkerClustererF } from '@react-google-maps/api';

import CustomInfoWindowCard from './CustomInfoWindowCard';
import CustomZoomControl from './controls/CustomZoomControl';
import { mapContainerStyle, useMapOptions } from '../utils/mapOptions';
import { clusterStyles, calculator } from '../utils/clusterStyles';
import { getMarkerIcons, createUserLocationMarker } from '../../../utils/markerUtils';
import borderData from '../../../data/bulgaria-border.json';

const DEFAULT_CENTER = { lat: 42.7339, lng: 25.4858 };

const MapCanvas = ({
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
    onShareClick,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const userLocationIcon = useMemo(() => createUserLocationMarker(), []);
    const mapOptions = useMapOptions();

    const center = currentUserPosition || DEFAULT_CENTER;
    const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

    const baseWrapperStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
    };

    const fullscreenStyle = isFullscreen
        ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
        }
        : {};

    return (
        <div style={{ ...baseWrapperStyle, ...fullscreenStyle }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={currentUserPosition ? 14 : 7}
                options={mapOptions}
                onLoad={onLoad}
                onIdle={onIdle}
                onClick={onMapClick}
            >
                <Data
                    onLoad={(dataLayer) => {
                        dataLayer.addGeoJson(borderData);
                        dataLayer.setStyle({
                            fillOpacity: 0,
                            strokeColor: '#1B4712',
                            strokeWeight: 2,
                            clickable: false,
                        });
                    }}
                />

                <MarkerClustererF options={{ styles: clusterStyles, calculator }}>
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
                                        url,
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
                        title="Вашето местоположение"
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
                        <CustomInfoWindowCard
                            location={selectedPlace}
                            onClose={onCloseInfoWindow}
                            onShareClick={onShareClick}
                        />
                    </InfoWindow>
                )}
            </GoogleMap>

            {map && (
                <CustomZoomControl
                    map={map}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                />
            )}
        </div>
    );
};

export default MapCanvas;

