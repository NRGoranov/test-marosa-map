import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
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
    isDesktop = false,
}) => {
    const userLocationIcon = useMemo(() => createUserLocationMarker(), []);
    const mapOptions = useMapOptions();
    const [hoveredCluster, setHoveredCluster] = useState(null);
    const [hoveredClusterLocation, setHoveredClusterLocation] = useState(null);
    const [hoveredClusterMousePosition, setHoveredClusterMousePosition] = useState(null); // Track mouse pixel position { x, y, transform } - fixed once set
    const [isHoveringCluster, setIsHoveringCluster] = useState(false);
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const hoveredClusterRef = useRef(null); // Track hovered cluster to avoid dependency issues
    const clustererRef = useRef(null);
    const clusterListenersRef = useRef([]);
    const hideCardTimeoutRef = useRef(null); // For debouncing card hide
    const isHoveringClusterRef = useRef(false); // Ref to track cluster hover state
    const isHoveringCardRef = useRef(false); // Ref to track card hover state
    const hideCardFunctionRef = useRef(null); // Ref to store hideCard function
    const currentHoveredClusterDivRef = useRef(null); // Ref to store current hovered cluster div
    const removeClusterHighlightRef = useRef(null); // Ref to store removeClusterHighlight function
    const clusterOriginalIconsRef = useRef(null); // Ref to store cluster original icons map

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

    // Helper function to check if a location has full data
    const hasFullData = useCallback((location) => {
        return location && 
               location.displayName?.text && 
               (location.imageUrl || location.photos?.length > 0) &&
               location.position;
    }, []);

    // Helper function to select a random shop from cluster, preferring shops with full data
    const selectRandomShop = useCallback((clusterLocations) => {
        if (!clusterLocations || clusterLocations.length === 0) return null;
        
        // Separate shops with full data from others
        const shopsWithFullData = clusterLocations.filter(hasFullData);
        const allShops = clusterLocations;
        
        // Prefer shops with full data, fall back to any marker
        const candidates = shopsWithFullData.length > 0 ? shopsWithFullData : allShops;
        
        // Pick random shop
        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex];
    }, [hasFullData]);


    // Helper function to get logo pin icon (same as used for individual markers when hovered)
    const getLogoPinIcon = useCallback(() => {
        // Use the open/selected marker icon (logo pin) - same as createSelectedMarkerIcon(OPEN_COLOR)
        const logoPinSvg = `<svg width="72" height="84" viewBox="0 0 72 84" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 24C0 10.7452 10.7452 0 24 0H48C61.2548 0 72 10.7452 72 24V53.459C72 63.6989 63.6989 72 53.459 72C46.4362 72 40.0161 75.9678 36.8754 82.2492L36 84L35.1246 82.2492C31.9839 75.9678 25.5638 72 18.541 72C8.3011 72 0 63.6989 0 53.459V24Z" fill="#1B4712" stroke="#000000" stroke-opacity="0.1" stroke-width="1"/><circle cx="36" cy="36" r="21" fill="white"/><mask id="mask0_40_200" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="15" y="15" width="42" height="42"><circle cx="36" cy="36" r="21" fill="#F4FFF2"/></mask><g mask="url(#mask0_40_200)"><path d="M-26.1768 37.5784C-27.293 38.6669 -25.764 39.1707 -24.8309 39.4604C-18.7493 41.3506 -8.62166 40.7109 -2.16714 40.5915C5.05256 40.457 12.2186 40.1934 19.4438 39.9093C24.1863 39.7226 28.999 39.2215 33.7566 39.6375C37.5949 39.9738 40.6391 41.2147 43.8058 43.3411C44.0288 43.2038 43.7604 43.0377 43.6682 42.9293C42.2245 41.2161 39.7996 40.2167 37.6802 39.6347C37.7821 39.3464 38.3174 39.2723 38.5899 39.2394C41.619 38.8838 44.6784 39.6443 46.4372 42.2264C46.751 42.6877 48.7176 46.2897 48.5511 46.4997C46.4042 45.488 43.8994 45.8051 41.641 45.0885C39.4611 44.3953 38.1358 42.6808 35.9242 42.28C33.6781 41.8723 31.2147 41.9244 28.9343 41.8393C14.521 41.2998 -0.00508308 42.3966 -14.4101 41.5579C-17.1818 41.3959 -24.0093 40.9059 -26.225 39.4782C-27.1058 38.9099 -27.4182 37.8474 -26.1782 37.5797L-26.1768 37.5784Z" fill="#1B4712"/><path d="M36.1677 37.5772C37.0829 35.0734 37.6086 32.4185 37.6788 29.7527L37.3678 30.1961L35.4094 36.8881C32.222 32.5421 35.3832 28.4472 38.7123 25.5C39.8918 27.0594 40.6033 29.0663 40.4299 31.0554C40.2055 33.6252 37.9623 35.908 36.1677 37.5786V37.5772Z" fill="#1B4712"/><path d="M48.4134 30.1648C48.017 31.8038 47.7005 33.4991 46.8334 34.9707C45.1889 37.7642 42.0552 38.9228 38.9187 38.8816C41.4937 37.6489 43.4163 35.4841 45.1104 33.2521C45.1297 33.1477 44.9797 33.1656 44.9026 33.182C44.6218 33.2397 42.3979 34.8732 41.9575 35.1862C40.6569 36.1128 39.5036 37.2755 37.9554 37.8507C37.8191 37.7134 39.6743 34.8293 39.9069 34.5136C42.0965 31.543 44.893 30.788 48.4134 30.1648Z" fill="#1B4712"/><path d="M26.808 26.7327C28.8779 27.4616 31.856 28.5186 32.9377 30.5708C33.6699 31.9586 33.9066 34.0163 33.4827 35.5181C32.3184 33.8008 31.3757 31.8722 29.6981 30.5777C30.4165 32.5366 31.5932 34.3993 31.9744 36.4735C31.9964 36.5957 32.1382 36.8373 31.9689 36.8908C30.4385 35.4865 28.2641 34.7 27.3558 32.7068C27.1782 32.3183 26.8066 31.1528 26.8066 30.7836V26.734L26.808 26.7327Z" fill="#1B4712"/></g></svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(logoPinSvg)}`;
    }, []);

    // Helper function to apply visual highlighting to cluster with smooth animations
    const applyClusterHighlight = useCallback((clusterDiv, clusterOriginalIcons) => {
        if (!clusterDiv) return;
        // Apply visual highlight with smooth scale-in animation (ease-out for snappy feel)
        clusterDiv.style.transformOrigin = 'center center';
        clusterDiv.style.transform = 'scale(1.2)';
        clusterDiv.style.transition = 'transform 0.18s ease-out, filter 0.18s ease-out, box-shadow 0.18s ease-out';
        clusterDiv.style.filter = 'drop-shadow(0 6px 16px rgba(27, 71, 18, 0.5))';
        clusterDiv.style.boxShadow = '0 0 0 4px rgba(27, 71, 18, 0.7)';
        clusterDiv.style.zIndex = '1000';
        clusterDiv.style.cursor = 'pointer';
        
        // Swap cluster icon to logo pin on hover
        const img = clusterDiv.querySelector('img');
        if (img) {
            // Store original icon if not already stored
            if (!clusterOriginalIcons.has(clusterDiv)) {
                clusterOriginalIcons.set(clusterDiv, img.src);
            }
            // Swap to logo pin icon with smooth transition
            const logoPinIcon = getLogoPinIcon();
            img.src = logoPinIcon;
            img.style.transform = 'scale(1.2)';
            img.style.transition = 'transform 0.18s ease-out';
        }
        
    }, [getLogoPinIcon]);

    // Helper function to remove visual highlighting from cluster with smooth scale-out animation
    const removeClusterHighlight = useCallback((clusterDiv, clusterOriginalIcons) => {
        if (!clusterDiv) return;
        // Smooth scale-out animation (ease-in for smooth return)
        clusterDiv.style.transform = 'scale(1)';
        clusterDiv.style.transition = 'transform 0.18s ease-in, filter 0.18s ease-in, box-shadow 0.18s ease-in';
        clusterDiv.style.filter = '';
        clusterDiv.style.boxShadow = '';
        clusterDiv.style.zIndex = '';
        
        // Restore original cluster icon with smooth transition
        const img = clusterDiv.querySelector('img');
        if (img) {
            const originalIcon = clusterOriginalIcons.get(clusterDiv);
            if (originalIcon) {
                img.src = originalIcon;
            }
            img.style.transform = 'scale(1)';
            img.style.transition = 'transform 0.18s ease-in';
        }
    }, []);

    // Setup cluster hover using global mouseover on map container
    useEffect(() => {
        if (!map || !clustererRef.current || !locations) return;

        const clusterer = clustererRef.current;
        const mapDiv = map.getDiv();
        
        // Setup cluster hover
        
        // Store cluster data map
        const clusterDataMap = new Map();
        let currentHoveredClusterDiv = null;
        const clusterOriginalIcons = new Map(); // Store original cluster icon URLs to restore on unhover
        
        // Function to update cluster data map by finding cluster divs in DOM
        const updateClusterDataMap = () => {
            clusterDataMap.clear();
            
            if (!clusterer) {
                return;
            }
            
            const clusters = clusterer.getClusters();
            if (!clusters || clusters.length === 0) {
                return;
            }
            
            // Find all cluster divs in the DOM by looking for SVG images
            const clusterImages = mapDiv.querySelectorAll('img[src*="data:image/svg+xml"]');
            
            // Build cluster data first
            const clusterDataArray = [];
            clusters.forEach((cluster) => {
                try {
                    const markers = cluster.getMarkers();
                    if (!markers || markers.length === 0) return;
                    
                    const clusterCenter = cluster.getCenter();
                    const clusterLocations = [];
                    
                    markers.forEach((marker) => {
                        const markerPos = marker.getPosition();
                        const location = locations.find(loc => {
                            if (!loc.position) return false;
                            const latMatch = Math.abs(loc.position.lat - markerPos.lat()) < 0.0001;
                            const lngMatch = Math.abs(loc.position.lng - markerPos.lng()) < 0.0001;
                            return latMatch && lngMatch;
                        });
                        if (location) {
                            clusterLocations.push(location);
                        }
                    });
                    
                    if (clusterLocations.length > 0) {
                        clusterDataArray.push({
                            cluster,
                            clusterCenter,
                            clusterLocations,
                            position: {
                                lat: clusterCenter.lat(),
                                lng: clusterCenter.lng()
                            }
                        });
                    }
                    } catch {
                        // Continue
                    }
            });
            
            // Match DOM elements to cluster data
            // Try to get cluster icons from clusters first
            const clusterDivsWithData = new Map();
            
            clusters.forEach((cluster) => {
                try {
                    // Try multiple ways to get the cluster icon
                    let clusterIcon = null;
                    let clusterDiv = null;
                    
                    // Method 1: getClusterIcon()
                    if (cluster.getClusterIcon) {
                        clusterIcon = cluster.getClusterIcon();
                        if (clusterIcon && clusterIcon.div_) {
                            clusterDiv = clusterIcon.div_;
                        }
                    }
                    
                    // Method 2: clusterIcon_ property
                    if (!clusterDiv && cluster.clusterIcon_) {
                        clusterIcon = cluster.clusterIcon_;
                        if (clusterIcon && clusterIcon.div_) {
                            clusterDiv = clusterIcon.div_;
                        }
                    }
                    
                    // Method 3: Check all cluster divs and match by trying to get icon
                    if (!clusterDiv) {
                        clusterImages.forEach((img) => {
                            const div = img.closest('div[style*="position: absolute"]');
                            if (div && !clusterDivsWithData.has(div)) {
                                // Try to see if this div belongs to this cluster
                                // by checking if we can get the icon from the cluster
                                try {
                                    const testIcon = cluster.getClusterIcon ? cluster.getClusterIcon() : cluster.clusterIcon_;
                                    if (testIcon && testIcon.div_ === div) {
                                        clusterDiv = div;
                                        clusterIcon = testIcon;
                                    }
                                } catch {
                                    // Continue
                                }
                            }
                        });
                    }
                    
                    if (clusterDiv) {
                        const data = clusterDataArray.find(d => d.cluster === cluster);
                        if (data) {
                            clusterDivsWithData.set(clusterDiv, data);
                            clusterDiv.removeAttribute('title');
                        }
                    }
                    } catch {
                        // Continue
                    }
            });
            
            // If we still have unmatched cluster divs, match them to remaining cluster data
            // Use a better matching strategy: try to match by position
            const unmatchedDivs = [];
            clusterImages.forEach((img) => {
                const clusterDiv = img.closest('div[style*="position: absolute"]');
                if (!clusterDiv || clusterDivsWithData.has(clusterDiv)) return;
                unmatchedDivs.push(clusterDiv);
            });
            
            const remainingData = clusterDataArray.filter(d => 
                !Array.from(clusterDivsWithData.values()).includes(d)
            );
            
            // Match unmatched divs to remaining data (simple sequential match)
            unmatchedDivs.forEach((div, index) => {
                if (index < remainingData.length) {
                    clusterDivsWithData.set(div, remainingData[index]);
                    div.removeAttribute('title');
                }
            });
            
            // Copy to clusterDataMap
            clusterDivsWithData.forEach((data, div) => {
                clusterDataMap.set(div, data);
            });
            
            // Only log if we found clusters
            if (clusterDataMap.size > 0 && import.meta.env.DEV) {
                console.log('Updated cluster data map:', clusterDataMap.size, 'clusters (found', clusterImages.length, 'cluster images)');
            }
        };
        
        // Store in refs for access outside useEffect
        removeClusterHighlightRef.current = removeClusterHighlight;
        clusterOriginalIconsRef.current = clusterOriginalIcons;
        
        // Helper function to get mouse/touch pixel coordinates relative to map container
        // with conditional positioning: centered above by default, next to cluster only in 50%-70% zone
        const getMousePixelPosition = (clientX, clientY) => {
            try {
                const mapDiv = map.getDiv();
                if (!mapDiv) return null;
                
                const mapRect = mapDiv.getBoundingClientRect();
                
                // Get raw pixel coordinates relative to map container
                const rawX = clientX - mapRect.left;
                const rawY = clientY - mapRect.top;
                
                // Constants for positioning calculation
                const CARD_WIDTH = 450; // Card width from CustomInfoWindowCard style
                const MARGIN = 16; // Safe gap
                
                // Get cluster position in viewport coordinates (screen-relative, not map-relative)
                const clusterViewportX = clientX;
                const screenWidth = window.innerWidth;
                
                // Calculate if cluster is in left 40% of screen's right 50%
                // Right 50% of screen = 50% to 100% of screen width
                // Left 40% of that = 50% to 70% of screen width
                const rightHalfStart = screenWidth * 0.5; // 50% of screen
                const rightHalfLeft40End = screenWidth * 0.7; // 70% of screen
                
                // Decide positioning based on cluster position in viewport
                let cardX, cardY, cardTransform;
                
                // Check if cluster is in the 50%-70% zone (left 40% of screen's right 50%)
                const isInRightHalfLeft40 = clusterViewportX >= rightHalfStart && clusterViewportX <= rightHalfLeft40End;
                
                if (isInRightHalfLeft40) {
                    // Cluster is in 50%-70% zone → show card right next to the cluster (horizontally aligned)
                    // Position card's left edge to the right of the cluster pin
                    cardX = rawX + MARGIN; // Position card to the right of the pin
                    cardY = rawY; // Same Y position as the pin (center of pin)
                    cardTransform = 'translate(0, -50%)'; // Center vertically on the pin, anchor left edge horizontally
                    
                    // Safety check: if card would go off right edge of map, center it above instead
                    const cardRightEdge = cardX + CARD_WIDTH;
                    const mapMaxX = mapRect.width - MARGIN;
                    if (cardRightEdge > mapMaxX || rawX < 0) {
                        // Fallback to centered above
                        cardX = rawX;
                        cardY = rawY;
                        cardTransform = 'translate(-50%, -100%)';
                    }
                } else {
                    // Default: all other positions (left < 50%, right > 70%) → show card ON TOP of cluster (centered)
                    // Always use centered-above positioning when outside the 50%-70% zone
                    cardX = rawX;
                    cardY = rawY;
                    cardTransform = 'translate(-50%, -100%)'; // Centered horizontally, above the pin
                }
                
                // Final clamp: ensure card stays within map container bounds
                // For centered-above positioning, adjust if it would go off screen edges
                if (cardTransform === 'translate(-50%, -100%)') {
                    const maxX = mapRect.width - CARD_WIDTH / 2 - MARGIN;
                    const minX = CARD_WIDTH / 2 + MARGIN;
                    if (cardX > maxX) {
                        // Card would go off right edge, anchor from right but keep it on top
                        cardX = Math.min(cardX, mapRect.width - MARGIN);
                        cardTransform = 'translate(-100%, -100%)'; // Anchor from right, still on top
                    } else if (cardX < minX) {
                        // Card would go off left edge, anchor from left but keep it on top
                        cardX = Math.max(cardX, MARGIN);
                        cardTransform = 'translate(0, -100%)'; // Anchor from left, still on top
                    }
                } else if (cardTransform === 'translate(0, -50%)') {
                    // For "next to" positioning (50%-70% zone), ensure it doesn't go off edges
                    const maxX = mapRect.width - CARD_WIDTH - MARGIN;
                    if (cardX > maxX) {
                        // Would go off right edge, fallback to centered above
                        cardX = rawX;
                        cardY = rawY;
                        cardTransform = 'translate(-50%, -100%)';
                    }
                    // Ensure it doesn't go off the left edge
                    if (cardX < MARGIN) {
                        // Would go off left edge, fallback to centered above
                        cardX = rawX;
                        cardY = rawY;
                        cardTransform = 'translate(-50%, -100%)';
                    }
                }
                
                // Ensure cardX is never negative
                cardX = Math.max(0, cardX);
                
                return { x: cardX, y: cardY, transform: cardTransform };
            } catch (error) {
                console.error('Error calculating mouse pixel position:', error);
                return null;
            }
        };
        
        // Helper function to hide the card with debounce
        // Note: Cluster visuals are reset immediately on mouseleave, not here
        const hideCard = () => {
            if (hideCardTimeoutRef.current) {
                clearTimeout(hideCardTimeoutRef.current);
            }
            hideCardTimeoutRef.current = setTimeout(() => {
                // Check refs for current hover state
                if (!isHoveringClusterRef.current && !isHoveringCardRef.current) {
                    const clusterDiv = currentHoveredClusterDivRef.current;
                    // Don't reset cluster visuals here - they're reset immediately on mouseleave
                    currentHoveredClusterDivRef.current = null;
                    hoveredClusterRef.current = null;
                    setHoveredCluster(null);
                    setHoveredClusterLocation(null);
                    setHoveredClusterMousePosition(null);
                    setIsHoveringCluster(false);
                    setIsHoveringCard(false);
                }
            }, 120);
        };
        
        // Store hideCard function in ref so it can be accessed outside useEffect
        hideCardFunctionRef.current = hideCard;

        // Global mouseenter handler for clusters
        const handleGlobalMouseEnter = (e) => {
            let target = e.target;
            
            // Walk up DOM to find cluster div
            while (target && target !== mapDiv) {
                if (clusterDataMap.has(target)) {
                    // Found a cluster! Process EVERY hover, even if same cluster
                    const wasDifferentCluster = currentHoveredClusterDiv !== target;
                    
                    // If switching from a different cluster, reset the previous one
                    if (wasDifferentCluster && currentHoveredClusterDiv) {
                        removeClusterHighlight(currentHoveredClusterDiv, clusterOriginalIcons);
                    }
                    
                    currentHoveredClusterDiv = target;
                    currentHoveredClusterDivRef.current = target;
                    const data = clusterDataMap.get(target);
                    
                    // Apply highlight immediately - no delays, no guards
                    applyClusterHighlight(target, clusterOriginalIcons);
                    
                    // Clear any pending hide timeout (allows immediate re-hovering)
                    if (hideCardTimeoutRef.current) {
                        clearTimeout(hideCardTimeoutRef.current);
                        hideCardTimeoutRef.current = null;
                    }
                    
                    // Capture mouse position ONCE at mouseenter (fixed position)
                    const mousePos = getMousePixelPosition(e.clientX, e.clientY);
                    if (!mousePos) return;
                    
                    // Set position and transform when entering cluster (will stay fixed)
                    setHoveredClusterMousePosition(mousePos);
                    
                    // Always select a new random shop each time the cluster is hovered
                    const randomLocation = selectRandomShop(data.clusterLocations);
                    
                    if (randomLocation) {
                        hoveredClusterRef.current = {
                            clusterId: `cluster-${Date.now()}`
                        };
                        setHoveredCluster(hoveredClusterRef.current);
                        setHoveredClusterLocation(randomLocation);
                        isHoveringClusterRef.current = true;
                        setIsHoveringCluster(true);
                    }
                    return;
                }
                target = target.parentElement;
            }
        };
        
        
        // Global mouseleave handler for clusters
        const handleGlobalMouseLeave = (e) => {
            if (!currentHoveredClusterDiv) return;
            
            // Check if we're leaving the cluster
            let target = e.relatedTarget;
            let movingToCard = false;
            
            while (target && target !== mapDiv) {
                // Check if moving to overlay card
                if (target.closest && target.closest('[data-cluster-hover-overlay]')) {
                    movingToCard = true;
                    break;
                }
                target = target.parentElement;
            }
            
            // Set isHoveringCluster to false immediately
            isHoveringClusterRef.current = false;
            setIsHoveringCluster(false);
            
            // Only remove cluster visuals if NOT moving to card AND card is not hovered
            // This ensures cluster stays visually active while hovering the card
            const effectiveHover = isHoveringClusterRef.current || isHoveringCardRef.current;
            if (!movingToCard && !effectiveHover) {
                // Both hover states are false, remove visuals with smooth animation
                removeClusterHighlight(currentHoveredClusterDiv, clusterOriginalIcons);
                currentHoveredClusterDivRef.current = null;
            }
            // If moving to card or card is hovered, keep visuals active (don't remove)
            
            // Only hide card if not moving to card and card is also not hovered
            if (!movingToCard) {
                hideCard();
            }
        };
        
        // Touch handler for mobile devices
        const handleGlobalTouchStart = (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            
            let target = e.target;
            
            // Walk up DOM to find cluster div
            while (target && target !== mapDiv) {
                if (clusterDataMap.has(target)) {
                    // Found a cluster!
                    if (currentHoveredClusterDiv === target) {
                        setIsHoveringCluster(true);
                        if (hideCardTimeoutRef.current) {
                            clearTimeout(hideCardTimeoutRef.current);
                            hideCardTimeoutRef.current = null;
                        }
                        return;
                    }
                    
                    currentHoveredClusterDiv = target;
                    currentHoveredClusterDivRef.current = target;
                    const data = clusterDataMap.get(target);
                    
                    // Apply highlight immediately - no delays
                    applyClusterHighlight(target);
                    
                    // Clear any pending hide timeout (allows immediate re-hovering)
                    if (hideCardTimeoutRef.current) {
                        clearTimeout(hideCardTimeoutRef.current);
                        hideCardTimeoutRef.current = null;
                    }
                    
                    // Capture touch position ONCE at touchstart (fixed position)
                    const touchPos = getMousePixelPosition(touch.clientX, touch.clientY);
                    if (!touchPos) return;
                    
                    // Set position and transform when touching cluster (will stay fixed)
                    setHoveredClusterMousePosition(touchPos);
                    
                    // Always select a new random shop each time the cluster is hovered
                    const randomLocation = selectRandomShop(data.clusterLocations);
                    
                    if (randomLocation) {
                        hoveredClusterRef.current = {
                            clusterId: `cluster-${Date.now()}`
                        };
                        setHoveredCluster(hoveredClusterRef.current);
                        setHoveredClusterLocation(randomLocation);
                        isHoveringClusterRef.current = true;
                        setIsHoveringCluster(true);
                    }
                    return;
                }
                target = target.parentElement;
            }
        };
        
        const handleGlobalTouchEnd = () => {
            // Reset cluster visuals immediately on touch end - scale, border, and icon reset
            const clusterDiv = currentHoveredClusterDivRef.current;
            if (clusterDiv) {
                removeClusterHighlight(clusterDiv, clusterOriginalIcons);
            }
            
            isHoveringClusterRef.current = false;
            setIsHoveringCluster(false);
            currentHoveredClusterDivRef.current = null;
            hideCard();
        };
        
        // Attach global listeners
        mapDiv.addEventListener('mouseenter', handleGlobalMouseEnter, true);
        mapDiv.addEventListener('mouseleave', handleGlobalMouseLeave, true);
        mapDiv.addEventListener('touchstart', handleGlobalTouchStart, true);
        mapDiv.addEventListener('touchend', handleGlobalTouchEnd, true);
        
        // Update cluster data on map idle with multiple attempts
        const updateWithDelay = () => {
            setTimeout(() => {
                updateClusterDataMap();
            }, 500);
            setTimeout(() => {
                updateClusterDataMap();
            }, 1000);
            setTimeout(() => {
                updateClusterDataMap();
            }, 2000);
        };
        
        // Try immediately and with delays
        updateClusterDataMap();
        setTimeout(() => updateClusterDataMap(), 500);
        setTimeout(() => updateClusterDataMap(), 1000);
        setTimeout(() => updateClusterDataMap(), 2000);
        
        const idleListener = window.google.maps.event.addListener(map, 'idle', updateWithDelay);
        
        // Also try on a timer
        const intervalId = setInterval(() => {
            updateClusterDataMap();
        }, 3000);
        
        return () => {
            clearInterval(intervalId);
            if (hideCardTimeoutRef.current) {
                clearTimeout(hideCardTimeoutRef.current);
            }
            mapDiv.removeEventListener('mouseenter', handleGlobalMouseEnter, true);
            mapDiv.removeEventListener('mouseleave', handleGlobalMouseLeave, true);
            mapDiv.removeEventListener('touchstart', handleGlobalTouchStart, true);
            mapDiv.removeEventListener('touchend', handleGlobalTouchEnd, true);
            if (idleListener) window.google.maps.event.removeListener(idleListener);
        };
    }, [map, locations, selectRandomShop, applyClusterHighlight, removeClusterHighlight]);

    // Sync cluster visuals with effectiveHover state (isHoveringCluster || isHoveringCard)
    useEffect(() => {
        const effectiveHover = isHoveringCluster || isHoveringCard;
        const clusterDiv = currentHoveredClusterDivRef.current;
        
        if (!clusterDiv || !clusterOriginalIconsRef.current) return;
        
        if (effectiveHover) {
            // Apply or maintain hover visuals when either cluster or card is hovered
            applyClusterHighlight(clusterDiv, clusterOriginalIconsRef.current);
        } else {
            // Remove visuals only when both hover states are false
            removeClusterHighlight(clusterDiv, clusterOriginalIconsRef.current);
        }
    }, [isHoveringCluster, isHoveringCard, applyClusterHighlight, removeClusterHighlight]);

    // Cleanup cluster listeners on unmount
    useEffect(() => {
        return () => {
            if (window.google && window.google.maps) {
                clusterListenersRef.current.forEach(listener => {
                    window.google.maps.event.removeListener(listener);
                });
                clusterListenersRef.current = [];
            }
        };
    }, []);

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
                    options={{ styles: clusterStyles, calculator }}
                    onClusteringBegin={(clusterer) => {
                        clustererRef.current = clusterer;
                    }}
                    onClusteringComplete={() => {
                        // Cluster hover is now handled by useEffect
                    }}
                >
                    {(clusterer) => {
                        // Store clusterer reference
                        if (!clustererRef.current) {
                            clustererRef.current = clusterer;
                        }

                        return locations && locations.map((loc) => {
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

            {/* Render cluster hover card outside GoogleMap for proper positioning */}
            {(isHoveringCluster || isHoveringCard) && hoveredCluster && hoveredClusterLocation && hoveredClusterMousePosition && (
                <div
                    data-cluster-hover-overlay
                    style={{
                        position: 'absolute',
                        left: `${hoveredClusterMousePosition.x}px`,
                        top: `${hoveredClusterMousePosition.y}px`,
                        transform: hoveredClusterMousePosition.transform || 'translate(-50%, -100%)',
                        zIndex: 1000,
                        pointerEvents: 'auto',
                        willChange: 'transform',
                    }}
                    onMouseEnter={() => {
                        // Clear any pending hide timeout
                        if (hideCardTimeoutRef.current) {
                            clearTimeout(hideCardTimeoutRef.current);
                            hideCardTimeoutRef.current = null;
                        }
                        isHoveringCardRef.current = true;
                        setIsHoveringCard(true);
                        
                        // Ensure cluster visuals remain active when hovering card
                        const clusterDiv = currentHoveredClusterDivRef.current;
                        if (clusterDiv && clusterOriginalIconsRef.current) {
                            // Re-apply highlight if not already applied (maintains visuals)
                            applyClusterHighlight(clusterDiv, clusterOriginalIconsRef.current);
                        }
                    }}
                    onMouseLeave={(e) => {
                        // Check if moving to cluster
                        const target = e.relatedTarget;
                        let movingToCluster = false;
                        
                        if (target) {
                            let current = target;
                            const mapDiv = map?.getDiv();
                            while (current && current !== mapDiv && current !== document.body) {
                                // Check for cluster image
                                if (current.querySelector && current.querySelector('img[src*="data:image/svg+xml"]')) {
                                    movingToCluster = true;
                                    break;
                                }
                                current = current.parentElement;
                            }
                        }
                        
                        isHoveringCardRef.current = false;
                        setIsHoveringCard(false);
                        
                        // Check effectiveHover - only remove cluster visuals if both are false
                        const effectiveHover = isHoveringClusterRef.current || isHoveringCardRef.current;
                        const clusterDiv = currentHoveredClusterDivRef.current;
                        
                        if (!effectiveHover && clusterDiv && clusterOriginalIconsRef.current) {
                            // Both hover states are false, remove visuals with smooth animation
                            removeClusterHighlight(clusterDiv, clusterOriginalIconsRef.current);
                        }
                        
                        // Only hide if not moving to cluster and cluster is also not hovered
                        if (!movingToCluster && hideCardFunctionRef.current) {
                            hideCardFunctionRef.current();
                        }
                    }}
                >
                    <CustomInfoWindowCard
                        location={hoveredClusterLocation}
                        onClose={() => {
                            if (hideCardTimeoutRef.current) {
                                clearTimeout(hideCardTimeoutRef.current);
                            }
                            const clusterDiv = currentHoveredClusterDivRef.current;
                            if (clusterDiv && removeClusterHighlightRef.current) {
                                removeClusterHighlightRef.current(clusterDiv, clusterOriginalIconsRef.current || new Map());
                            }
                            currentHoveredClusterDivRef.current = null;
                            hoveredClusterRef.current = null;
                            setHoveredCluster(null);
                            setHoveredClusterLocation(null);
                            setHoveredClusterMousePosition(null);
                            isHoveringClusterRef.current = false;
                            isHoveringCardRef.current = false;
                            setIsHoveringCluster(false);
                            setIsHoveringCard(false);
                        }}
                        onShareClick={onShareClick}
                    />
                </div>
            )}

            {map && isDesktop && (
                <CustomZoomControl
                    map={map}
                />
            )}
        </div>
    );
};

export default MapCanvas;




