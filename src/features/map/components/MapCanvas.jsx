import React, { useMemo, useEffect, useState, useRef } from 'react';
import { GoogleMap, MarkerF, InfoWindow, Data, MarkerClustererF } from '@react-google-maps/api';

import CustomInfoWindowCard from './CustomInfoWindowCard';
import CustomZoomControl from './controls/CustomZoomControl';
import { mapContainerStyle, useMapOptions } from '../utils/mapOptions';
import { clusterStyles, clusterStylesHovered, calculator } from '../utils/clusterStyles';
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
    isDesktop = false,
}) => {
    const userLocationIcon = useMemo(() => createUserLocationMarker(), []);
    const mapOptions = useMapOptions();
    const [hoveredClusterId, setHoveredClusterId] = useState(null);
    const [hoveredClusterRandomShop, setHoveredClusterRandomShop] = useState(null);
    const [hoveredClusterPosition, setHoveredClusterPosition] = useState(null);
    const clustererRef = useRef(null);
    const longPressTimerRef = useRef(null);
    const clusterDataMapRef = useRef(new Map()); // Map cluster position to cluster data

    const center = currentUserPosition || DEFAULT_CENTER;

    // Ensure map resizes when container size changes
    useEffect(() => {
        if (map && window.google && window.google.maps) {
            const handleResize = () => {
                try {
                    window.google.maps.event.trigger(map, 'resize');
                } catch (e) {
                    console.warn('Failed to trigger map resize:', e);
                }
            };
            
            // Trigger resize after a short delay to ensure DOM is ready
            const timer = setTimeout(handleResize, 100);
            
            // Also listen to window resize
            window.addEventListener('resize', handleResize);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [map]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100%' }}>
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

                <MarkerClustererF 
                    options={{ 
                        // Use hovered styles when any cluster is hovered
                        styles: hoveredClusterId !== null ? clusterStylesHovered : clusterStyles, 
                        calculator,
                        onClusterClick: (cluster) => {
                            // Clear hover state on click
                            setHoveredClusterId(null);
                            setHoveredClusterRandomShop(null);
                            setHoveredClusterPosition(null);
                            // Zoom into cluster's bounding box on click
                            if (map && cluster.markers && cluster.markers.length > 0) {
                                const bounds = new window.google.maps.LatLngBounds();
                                cluster.markers.forEach(marker => {
                                    if (marker.position) {
                                        bounds.extend(marker.position);
                                    }
                                });
                                map.fitBounds(bounds);
                            }
                        },
                        onClusteringEnd: (clusterer) => {
                            clustererRef.current = clusterer;
                            
                            // Store cluster data and attach hover listeners
                            if (clusterer && map && locations) {
                                const clusters = clusterer.getClusters();
                                clusterDataMapRef.current.clear();
                                
                                // Store clusters with their marker locations
                                clusters.forEach(cluster => {
                                    if (cluster.markers && cluster.markers.length > 0) {
                                        // Get locations from cluster markers
                                        const markerLocations = cluster.markers
                                            .map(marker => {
                                                const markerPos = marker.position || (marker.getPosition?.());
                                                if (!markerPos) return null;
                                                
                                                const mLat = typeof markerPos.lat === 'function' ? markerPos.lat() : markerPos.lat;
                                                const mLng = typeof markerPos.lng === 'function' ? markerPos.lng() : markerPos.lng;
                                                
                                                return locations.find(loc => 
                                                    loc.position && 
                                                    Math.abs(loc.position.lat - mLat) < 0.0001 &&
                                                    Math.abs(loc.position.lng - mLng) < 0.0001
                                                );
                                            })
                                            .filter(Boolean);
                                        
                                        if (markerLocations.length > 0) {
                                            const center = cluster.getCenter();
                                            if (center) {
                                                const centerLat = typeof center.lat === 'function' ? center.lat() : center.lat;
                                                const centerLng = typeof center.lng === 'function' ? center.lng() : center.lng;
                                                const key = `${centerLat.toFixed(4)},${centerLng.toFixed(4)}`;
                                                clusterDataMapRef.current.set(key, {
                                                    cluster,
                                                    locations: markerLocations
                                                });
                                            }
                                        }
                                    }
                                });
                                
                                // Attach hover listeners after clusters are rendered
                                setTimeout(() => {
                                    const mapDiv = map.getDiv();
                                    if (!mapDiv) return;
                                    
                                    const attachHoverListeners = () => {
                                        const allDivs = mapDiv.querySelectorAll('div');
                                        
                                        allDivs.forEach((div) => {
                                            const text = div.textContent?.trim();
                                            const isCluster = text && 
                                                             /^\d+$/.test(text) && 
                                                             parseInt(text) > 1 && 
                                                             !div.dataset.clusterHoverAttached;
                                            
                                            if (isCluster) {
                                                div.dataset.clusterHoverAttached = 'true';
                                                
                                                if (isDesktop) {
                                                    // Desktop: hover to show random shop
                                                    const handleMouseEnter = () => {
                                                        // Find cluster by screen position
                                                        const divRect = div.getBoundingClientRect();
                                                        const mapDivRect = mapDiv.getBoundingClientRect();
                                                        const mapBounds = map.getBounds();
                                                        
                                                        if (!mapBounds) return;
                                                        
                                                        const x = (divRect.left + divRect.width / 2 - mapDivRect.left) / mapDivRect.width;
                                                        const y = (divRect.top + divRect.height / 2 - mapDivRect.top) / mapDivRect.height;
                                                        
                                                        const ne = mapBounds.getNorthEast();
                                                        const sw = mapBounds.getSouthWest();
                                                        
                                                        const lat = sw.lat() + (ne.lat() - sw.lat()) * (1 - y);
                                                        const lng = sw.lng() + (ne.lng() - sw.lng()) * x;
                                                        
                                                        // Find closest cluster
                                                        let closestData = null;
                                                        let minDist = Infinity;
                                                        
                                                        clusterDataMapRef.current.forEach((data, key) => {
                                                            const [cLat, cLng] = key.split(',').map(Number);
                                                            const dist = Math.sqrt(Math.pow(lat - cLat, 2) + Math.pow(lng - cLng, 2));
                                                            if (dist < minDist) {
                                                                minDist = dist;
                                                                closestData = data;
                                                            }
                                                        });
                                                        
                                                        if (closestData && closestData.locations && closestData.locations.length > 0) {
                                                            const randomShop = closestData.locations[Math.floor(Math.random() * closestData.locations.length)];
                                                            setHoveredClusterRandomShop(randomShop);
                                                            
                                                            const clusterCenter = closestData.cluster.getCenter();
                                                            if (clusterCenter) {
                                                                const cLat = typeof clusterCenter.lat === 'function' ? clusterCenter.lat() : clusterCenter.lat;
                                                                const cLng = typeof clusterCenter.lng === 'function' ? clusterCenter.lng() : clusterCenter.lng;
                                                                setHoveredClusterPosition({ lat: cLat, lng: cLng });
                                                            }
                                                            setHoveredClusterId(text);
                                                        }
                                                    };
                                                    
                                                    const handleMouseLeave = () => {
                                                        setHoveredClusterId(null);
                                                        setHoveredClusterRandomShop(null);
                                                        setHoveredClusterPosition(null);
                                                    };
                                                    
                                                    div.addEventListener('mouseenter', handleMouseEnter);
                                                    div.addEventListener('mouseleave', handleMouseLeave);
                                                    div.style.cursor = 'pointer';
                                                } else {
                                                    // Mobile: long-press to show random shop
                                                    const handleTouchStart = () => {
                                                        longPressTimerRef.current = setTimeout(() => {
                                                            const divRect = div.getBoundingClientRect();
                                                            const mapDivRect = mapDiv.getBoundingClientRect();
                                                            const mapBounds = map.getBounds();
                                                            
                                                            if (!mapBounds) return;
                                                            
                                                            const x = (divRect.left + divRect.width / 2 - mapDivRect.left) / mapDivRect.width;
                                                            const y = (divRect.top + divRect.height / 2 - mapDivRect.top) / mapDivRect.height;
                                                            
                                                            const ne = mapBounds.getNorthEast();
                                                            const sw = mapBounds.getSouthWest();
                                                            
                                                            const lat = sw.lat() + (ne.lat() - sw.lat()) * (1 - y);
                                                            const lng = sw.lng() + (ne.lng() - sw.lng()) * x;
                                                            
                                                            let closestData = null;
                                                            let minDist = Infinity;
                                                            
                                                            clusterDataMapRef.current.forEach((data, key) => {
                                                                const [cLat, cLng] = key.split(',').map(Number);
                                                                const dist = Math.sqrt(Math.pow(lat - cLat, 2) + Math.pow(lng - cLng, 2));
                                                                if (dist < minDist) {
                                                                    minDist = dist;
                                                                    closestData = data;
                                                                }
                                                            });
                                                            
                                                            if (closestData && closestData.locations && closestData.locations.length > 0) {
                                                                const randomShop = closestData.locations[Math.floor(Math.random() * closestData.locations.length)];
                                                                setHoveredClusterRandomShop(randomShop);
                                                                
                                                                const clusterCenter = closestData.cluster.getCenter();
                                                                if (clusterCenter) {
                                                                    const cLat = typeof clusterCenter.lat === 'function' ? clusterCenter.lat() : clusterCenter.lat;
                                                                    const cLng = typeof clusterCenter.lng === 'function' ? clusterCenter.lng() : clusterCenter.lng;
                                                                    setHoveredClusterPosition({ lat: cLat, lng: cLng });
                                                                }
                                                                setHoveredClusterId(text);
                                                                
                                                                // Keep shown for 2 seconds
                                                                setTimeout(() => {
                                                                    setHoveredClusterId(null);
                                                                    setHoveredClusterRandomShop(null);
                                                                    setHoveredClusterPosition(null);
                                                                }, 2000);
                                                            }
                                                        }, 500);
                                                    };
                                                    
                                                    const handleTouchEnd = () => {
                                                        if (longPressTimerRef.current) {
                                                            clearTimeout(longPressTimerRef.current);
                                                            longPressTimerRef.current = null;
                                                        }
                                                    };
                                                    
                                                    div.addEventListener('touchstart', handleTouchStart, { passive: true });
                                                    div.addEventListener('touchend', handleTouchEnd, { passive: true });
                                                    div.addEventListener('touchcancel', handleTouchEnd, { passive: true });
                                                }
                                            }
                                        });
                                    };
                                    
                                    attachHoverListeners();
                                    
                                    // Watch for new clusters
                                    const observer = new MutationObserver(() => {
                                        attachHoverListeners();
                                    });
                                    
                                    observer.observe(mapDiv, { childList: true, subtree: true });
                                }, 500);
                            }
                        },
                        enableRetinaIcons: true,
                        maxZoom: 15,
                    }}
                >
                    {(clusterer) => {
                        clustererRef.current = clusterer;
                        if (!locations || locations.length === 0) return null;
                        return locations.map((loc) => {
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
                                    title={loc.displayName?.text || loc.name || ''}
                                    zIndex={isSelected || isHovered ? 10 : 1}
                                    onMouseOver={() => onMarkerHover(loc.placeId)}
                                    onMouseOut={() => onMarkerHover(null)}
                                />
                            );
                        });
                    }}
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
                        options={{ 
                            pixelOffset: new window.google.maps.Size(0, -75),
                            disableAutoPan: false,
                        }}
                    >
                        <CustomInfoWindowCard
                            location={selectedPlace}
                            onClose={onCloseInfoWindow}
                            onShareClick={onShareClick}
                        />
                    </InfoWindow>
                )}

                {/* Show random shop card when hovering over cluster */}
                {hoveredClusterRandomShop && hoveredClusterPosition && isDesktop && (
                    <InfoWindow
                        position={hoveredClusterPosition}
                        options={{ 
                            pixelOffset: new window.google.maps.Size(0, -75),
                            disableAutoPan: false,
                        }}
                    >
                        <CustomInfoWindowCard
                            location={hoveredClusterRandomShop}
                            onClose={() => {
                                setHoveredClusterRandomShop(null);
                                setHoveredClusterPosition(null);
                                setHoveredClusterId(null);
                            }}
                            onShareClick={onShareClick}
                        />
                    </InfoWindow>
                )}
            </GoogleMap>

            {map && isDesktop && (
                <CustomZoomControl
                    map={map}
                />
            )}
        </div>
    );
};

export default MapCanvas;




