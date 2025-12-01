import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import StyleInjector from '../components/ui/StyleInjector';
import LocationPermissionModal from '../components/ui/LocationPermissionModal';
import SlideDownMenu from '../components/ui/SlideDownMenu';
import { useMediaQuery } from '../hooks/useMediaQuery';
import LocationSearchBar from '../features/search/components/LocationSearchBar';
import MapCanvas from '../features/map/components/MapCanvas';
import ShareModal from '../features/sharing/components/ShareModal';
import { useLocationsData } from '../features/locations/hooks/useLocationsData';
import { useGeolocationGate } from '../features/geolocation/hooks/useGeolocationGate';
import LocationListWeb from '../components/layout/location-list/LocationList';
import BackToMapButton from '../components/ui/BackToMapButton';
import Logo from '../assets/icons/Logo';
import SocialIcon from '../assets/icons/SocialIcon';
import TikTokIcon from '../assets/icons/TikTokIcon';
import InstagramIcon from '../assets/icons/InstagramIcon';
import FacebookIcon from '../assets/icons/FacebookIcon';
import BurgerMenuIcon from '../assets/icons/BurgerMenuIcon';
import BrochureLinkIcon from '../assets/icons/BrochureLinkIcon';
import SearchIcon from '../assets/icons/SearchIcon';
import { filterLocationsByQuery } from '../utils/searchUtils';
import styles from './MarosaLocator.module.css';

function MarosaLocator() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const navigate = useNavigate();

    const { locations, allCities } = useLocationsData();
    const [map, setMap] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
    const [locationToShare, setLocationToShare] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasMapInteracted, setHasMapInteracted] = useState(false);
    const [visibleLocations, setVisibleLocations] = useState([]);
    const [showLocationList, setShowLocationList] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [listPosition, setListPosition] = useState('peek'); // 'peek', 'partial', 'full', 'hidden'
    const [listDragY, setListDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const listRef = useRef(null);
    const listStartY = useRef(0);
    const itemRefs = useRef({});
    const desktopListScrollRef = useRef(null);
    const mobileListContentRef = useRef(null);
    const headerSearchInputRef = useRef(null);
    const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    
    const [headerHeight, setHeaderHeight] = useState(80);
    const headerRef = useRef(null);
    const peekHeight = 120;
    
    // Update viewport height and header height on resize
    useEffect(() => {
        const handleResize = () => {
            setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };
        
        // Initial measurement
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobileMapHeight = viewportHeight - headerHeight;

    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const markerClickRef = useRef(false);
    const selectedPlaceZoomRef = useRef(null);
    const selectedPlacePositionRef = useRef(null);

    const {
        currentUserPosition,
        isPermissionModalOpen,
        handleAllow,
        handleDismiss,
    } = useGeolocationGate({ map, isMapReady: isLoaded });

    const handleCitySelect = useCallback((cityName) => {
        if (!map) return;

        console.log(`Searching for city: ${cityName}`);

        const cityData = allCities.find(city => city.bulgarianName === cityName);

        if (cityData) {
            const position = { lat: cityData.lat, lng: cityData.lng };
            map.panTo(position);
            map.setZoom(11);
            setHasMapInteracted(true);
            // Location list will show automatically via handleMapIdle when zoom > 11
            console.log(`Panned to ${cityName} at`, position);
        } else {
            console.error(`City not found in local data: ${cityName}`);
        }
    }, [map, allCities]);

    const closeInfoWindow = useCallback(() => {
        setSelectedPlace(null);
        selectedPlaceZoomRef.current = null;
        selectedPlacePositionRef.current = null;
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
            // Toggle: if clicking the same shop, deselect but keep list open
            setSelectedPlace(null);
            selectedPlaceZoomRef.current = null;
            selectedPlacePositionRef.current = null;
        } else {
            // Set selected place and show list first
            setSelectedPlace(place);
            setHasMapInteracted(true);
            setShowLocationList(true);
            
            // Immediately show at least the clicked location
            setVisibleLocations([place]);
            
            // On mobile, set to 'partial' to show more of the list so the clicked shop is visible
            const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
            if (isMobileDevice) {
                setListPosition('partial');
            } else {
                setListPosition('peek');
            }
            setListDragY(0);
            
            if (map) {
                map.panTo(place.position);
                map.setZoom(14);
                
                // Store the zoom level and position when marker is clicked
                selectedPlaceZoomRef.current = 14;
                selectedPlacePositionRef.current = place.position;
                
                // Update visible locations based on current bounds after map moves
                setTimeout(() => {
                    const bounds = map.getBounds();
                    if (bounds && locations) {
                        const visible = locations.filter(location => {
                            if (!location.position) return false;
                            return bounds.contains(location.position);
                        });
                        if (visible.length > 0) {
                            setVisibleLocations(visible);
                        }
                    }
                }, 300);
            }
            
            // Scroll mobile list content to top to show the clicked shop (which is first in sorted list)
            if (isMobileDevice) {
                setTimeout(() => {
                    if (mobileListContentRef.current) {
                        mobileListContentRef.current.scrollTop = 0;
                    }
                }, 200);
            }
            
            if (import.meta.env.DEV) {
                console.log('Marker clicked:', {
                    place,
                    showLocationList: true,
                    listPosition: isMobileDevice ? 'partial' : 'peek',
                    isMobileDevice
                });
            }
        }
        
        // Reset the ref after a short delay to allow proper click detection
        setTimeout(() => {
            markerClickRef.current = false;
        }, 100);
    }, [map, selectedPlace, locations]);

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

        // Get image URL with fallback
        let imageUrl = location.imageUrl;
        if (!imageUrl && location.photos?.[0]?.getUrl) {
            try {
                imageUrl = location.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 });
            } catch (e) {
                console.warn('Failed to get photo URL:', e);
            }
        }
        if (!imageUrl) {
            imageUrl = 'https://i.imgur.com/g2a4JAh.png'; // Fallback image
        }

        const comprehensiveLocationData = {
            ...location,
            name: name,
            displayName: { text: name },
            rating: location.rating || 5,
            mapsUrl: finalMapsUrl,
            imageUrl: imageUrl,
            icon: location.icon // Explicitly preserve the icon property
        };

        setLocationToShare(comprehensiveLocationData);
    }, []);

    const onMapLoad = useCallback((map) => {
        setMap(map);
        // Store initial map state
        if (map) {
            const center = map.getCenter();
            if (center) {
                initialMapCenter.current = { lat: center.lat(), lng: center.lng() };
            }
            const zoom = map.getZoom();
            if (zoom) {
                initialZoom.current = zoom;
            }
        }
    }, []);

    const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

    const handleLocationSearchSelect = useCallback((location) => {
        setSearchQuery('');
        handleMarkerClick(location);
        setHasMapInteracted(true);
        setShowLocationList(true);
    }, [handleMarkerClick]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return { locations: [], cities: [] };
        }
        return filterLocationsByQuery(searchQuery, locations, allCities);
    }, [searchQuery, locations, allCities]);

    const handleSearchSubmit = useCallback((event) => {
        event?.preventDefault?.();
        if (!searchQuery.trim()) return;

        setIsMenuOpen(false);

        if (searchResults.locations.length > 0) {
            handleMarkerClick(searchResults.locations[0]);
            setSearchQuery('');
            setHasMapInteracted(true);
            setShowLocationList(true);
            setListPosition('peek');
            setListDragY(0);
            return;
        }

        if (searchResults.cities.length > 0) {
            handleCitySelect(searchResults.cities[0].bulgarianName);
            setSearchQuery('');
            setHasMapInteracted(true);
            setShowLocationList(true);
            setListPosition('peek');
            setListDragY(0);
        }
    }, [searchQuery, searchResults, handleMarkerClick, handleCitySelect]);

    const initialMapCenter = useRef({ lat: 42.7339, lng: 25.4858 });
    const initialZoom = useRef(7);

    const handleMapIdle = useCallback(() => {
        if (!map || !locations || locations.length === 0) return;

        const bounds = map.getBounds();
        if (!bounds) return;

        const zoom = map.getZoom() || 7;
        const center = map.getCenter();

        // Check if map has been interacted with (zoom changed from initial OR center changed)
        if (center) {
            const currentCenter = { lat: center.lat(), lng: center.lng() };
            const centerChanged = 
                Math.abs(currentCenter.lat - initialMapCenter.current.lat) > 0.01 ||
                Math.abs(currentCenter.lng - initialMapCenter.current.lng) > 0.01;
            
            if (zoom !== initialZoom.current || centerChanged) {
                setHasMapInteracted(true);
            }
        }

        // Close info window if zoomed out or moved away from selected place
        if (selectedPlace && selectedPlaceZoomRef.current !== null && selectedPlacePositionRef.current) {
            const shouldClose = (() => {
                // Check if zoomed out significantly (more than 2 levels)
                if (zoom < selectedPlaceZoomRef.current - 2) {
                    return true;
                }

                // Check if selected place is no longer in viewport bounds
                if (!bounds.contains(selectedPlacePositionRef.current)) {
                    return true;
                }

                // Check if map center has moved far away from selected place
                // Using approximate distance: ~0.45 degrees ≈ 50km
                if (center && selectedPlacePositionRef.current) {
                    const latDiff = Math.abs(center.lat() - selectedPlacePositionRef.current.lat);
                    const lngDiff = Math.abs(center.lng() - selectedPlacePositionRef.current.lng);
                    // If center moved more than ~50km away, close the info window
                    if (latDiff > 0.45 || lngDiff > 0.45) {
                        return true;
                    }
                }

                return false;
            })();

            if (shouldClose) {
                closeInfoWindow();
            }
        }

        // Filter locations within viewport bounds
        const visible = locations.filter(location => {
            if (!location.position) return false;
            return bounds.contains(location.position);
        });

        setVisibleLocations(visible);

        // Show location list if zoomed in enough (zoom > 11) and there are visible locations
        // Only show if map has been interacted with (not just initial load)
        // Don't override if a shop was just clicked (selectedPlace exists)
        if (hasMapInteracted && zoom > 11 && visible.length > 0) {
            // Only auto-show list if no shop is currently selected (to avoid interfering with manual clicks)
            if (!selectedPlace) {
                setShowLocationList(true);
                setListPosition('peek');
                setListDragY(0);
            }
        } else if ((zoom <= 11 || !hasMapInteracted) && !selectedPlace) {
            // Only hide list if no shop is selected
            setShowLocationList(false);
        }
    }, [map, locations, hasMapInteracted, selectedPlace, closeInfoWindow, visibleLocations]);

    // Scroll mobile list to top when a shop is clicked
    useEffect(() => {
        if (!isDesktop && showLocationList && selectedPlace && mobileListContentRef.current) {
            // Small delay to ensure the list is rendered
            const timer = setTimeout(() => {
                if (mobileListContentRef.current) {
                    mobileListContentRef.current.scrollTop = 0;
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [selectedPlace, showLocationList, isDesktop]);

    // Focus the header searchbar when it appears after clicking the initial searchbar
    useEffect(() => {
        if (!isDesktop && hasMapInteracted && isSearchOpen && headerSearchInputRef.current) {
            // Small delay to ensure the searchbar is rendered in the DOM
            const timer = setTimeout(() => {
                if (headerSearchInputRef.current) {
                    headerSearchInputRef.current.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isDesktop, hasMapInteracted, isSearchOpen]);

    // Handle smooth centralization for desktop location list after 3 seconds of inactivity
    useEffect(() => {
        const scrollContainer = desktopListScrollRef.current;
        if (!scrollContainer || !isDesktop || !showLocationList) return;

        let scrollTimeout = null;

        const handleScroll = () => {
            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            // Set new timeout for 3 seconds
            scrollTimeout = setTimeout(() => {
                const currentScrollTop = scrollContainer.scrollTop;
                const gridContainer = scrollContainer.querySelector('div');
                if (!gridContainer) return;
                
                const firstRow = gridContainer.querySelector('article');
                if (!firstRow) return;
                
                const rowHeight = firstRow.offsetHeight + 32; // card height + gap (2rem = 32px)
                const rowIndex = Math.round(currentScrollTop / rowHeight);
                const targetScroll = rowIndex * rowHeight;
                
                // Only center if we're between rows (more than 20px off)
                if (Math.abs(currentScrollTop - targetScroll) > 20) {
                    scrollContainer.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }
            }, 3000); // 3 seconds delay
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, [isDesktop, showLocationList, visibleLocations]);

    return (
        <>
            <Helmet>
                <title>Мароса Градина Карта</title>
                <meta property="og:title" content="Мароса Градина Карта" />
                <meta property="og:description" content="Намерете най-близкия до вас търговски обект." />
                <meta property="og:image" content="https://marosamap.eu/brochure-preview.jpg" />
            </Helmet>

            <StyleInjector />

            <div className={styles.shell}>
                {!isDesktop && (
                    <header 
                        ref={headerRef}
                        className={`${styles.heroHeader} ${hasMapInteracted ? styles.heroHeaderFixed : ''}`}
                    >
                        <div className={styles.heroHeaderInner}>
                            <div 
                                className={styles.heroHeaderLogo}
                                onClick={() => window.location.reload()}
                                style={{ cursor: 'pointer' }}
                                role="button"
                                tabIndex={0}
                                aria-label="Refresh page"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        window.location.reload();
                                    }
                                }}
                            >
                                <Logo />
                            </div>
                        {hasMapInteracted && !isDesktop && (
                            <div className={`${styles.headerSearchFullWidth} ${isSearchOpen ? styles.active : ''}`}>
                                <LocationSearchBar
                                    ref={headerSearchInputRef}
                                    query={searchQuery}
                                    onQueryChange={(value) => {
                                        setSearchQuery(value);
                                        setIsMenuOpen(false);
                                    }}
                                    allLocations={locations}
                                    allCities={allCities}
                                    onCitySelect={(cityName) => {
                                        handleCitySelect(cityName);
                                        setIsSearchOpen(false);
                                        setIsMenuOpen(false);
                                    }}
                                    onLocationSelect={(location) => {
                                        handleLocationSearchSelect(location);
                                        setIsSearchOpen(false);
                                        setIsMenuOpen(false);
                                    }}
                                    showCloseButton={true}
                                    onClose={() => {
                                        setIsSearchOpen(false);
                                        setIsMenuOpen(false);
                                    }}
                                    compact={true}
                                    onFocus={() => {
                                        setIsSearchOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    isMobileSearchOpen={isSearchOpen}
                                    headerHeight={headerHeight}
                                />
                            </div>
                        )}
                        {!hasMapInteracted && !isDesktop && (
                            <div className={styles.headerActions}>
                                <div className={styles.socialRail}>
                                    <SocialIcon
                                        href="https://www.tiktok.com/@nedev.bg?_t=ZN-8xUznEkh4Mg"
                                        label="TikTok"
                                    >
                                        <TikTokIcon />
                                    </SocialIcon>
                                    <SocialIcon
                                        href="https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag=="
                                        label="Instagram"
                                    >
                                        <InstagramIcon />
                                    </SocialIcon>
                                    <SocialIcon
                                        href="https://www.facebook.com/profile.php?id=100066825065618"
                                        label="Facebook"
                                    >
                                        <FacebookIcon />
                                    </SocialIcon>
                                </div>
                            </div>
                        )}
                        {hasMapInteracted && !isDesktop && !isSearchOpen && (
                            <div className={styles.headerActions}>
                                <button
                                    type="button"
                                    className={styles.searchIconButton}
                                    onClick={() => {
                                        setIsSearchOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    aria-label="Търси"
                                >
                                    <SearchIcon />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.menuButtonMobile} ${isMenuOpen ? styles.menuButtonActive : ''}`}
                                    onClick={handleMenuToggle}
                                    aria-label="Отвори менюто"
                                >
                                    <BurgerMenuIcon />
                                </button>
                            </div>
                        )}
                        </div>
                    </header>
                )}

                {(!isDesktop && hasMapInteracted) ? null : (
                    <>
                        <div className={styles.decorTop} aria-hidden="true" />
                        <div className={styles.decorBottom} aria-hidden="true" />
                        <div className={styles.decorTopRight} aria-hidden="true" />
                        <div className={styles.decorMidRight} aria-hidden="true" />

                        <section className={`${styles.heroSection} ${isDesktop && showLocationList ? styles.heroSectionCompact : ''}`}>
                            {isDesktop && (
                                <div className={styles.heroBackdrop} aria-hidden="true" />
                            )}
                            <div className={styles.heroBackdropTopRight} aria-hidden="true" />
                            {isDesktop && (
                                <div className={styles.heroLogo}>
                                    <Logo />
                                </div>
                            )}
                            <a
                                href="https://marossa.bg/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.shopButton}
                            >
                                Онлайн магазин
                            </a>
                            <div className={styles.heroInner}>
                        <div className={`${styles.heroBody} ${isDesktop && showLocationList ? styles.heroBodyCompact : ''}`}>
                            <div className={styles.searchbarContainer} style={{ width: '100%', position: 'relative', overflow: 'visible' }}>
                                <div className={styles.decorBottomLeft} aria-hidden="true" />
                                {!isDesktop && (
                                    <div className={styles.heroBackdrop} aria-hidden="true" />
                                )}
                                {(!isDesktop || !showLocationList) && (
                                    <p className={styles.heroEyebrow}>Градинарят знае най-добре</p>
                                )}
                                <h1 className={`${styles.heroTitle} ${isDesktop && showLocationList ? styles.heroTitleCompact : ''}`}>
                                    Мароса вече е по-близо до теб.<br />Търси ни в<span className={styles.heroHighlight}>цялата страна</span>
                                </h1>
                                <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
                                    <div className={styles.searchInput}>
                                        <LocationSearchBar
                                            query={searchQuery}
                                            onQueryChange={(value) => {
                                                setSearchQuery(value);
                                                setIsMenuOpen(false);
                                                if (!hasMapInteracted && value) {
                                                    setHasMapInteracted(true);
                                                    setIsSearchOpen(true);
                                                }
                                            }}
                                            onFocus={() => {
                                                setIsMenuOpen(false);
                                                if (!hasMapInteracted) {
                                                    setHasMapInteracted(true);
                                                    setIsSearchOpen(true);
                                                    setShowLocationList(false);
                                                }
                                            }}
                                            allLocations={locations}
                                            allCities={allCities}
                                            onCitySelect={(cityName) => {
                                                handleCitySelect(cityName);
                                                setIsMenuOpen(false);
                                            }}
                                            onLocationSelect={(location) => {
                                                handleLocationSearchSelect(location);
                                                setIsMenuOpen(false);
                                            }}
                                        />
                                    </div>
                                    <button type="submit" className={styles.searchButton}>
                                        Търси
                                    </button>
                                </form>
                            </div>
                        </div>

                        {isDesktop && showLocationList && visibleLocations && visibleLocations.length > 0 && (
                            <div className={styles.desktopLocationList}>
                                <div className={styles.desktopLocationListHeader}>
                                    <h3 className={styles.desktopLocationListTitle}>
                                        Обекти в изгледа ({visibleLocations.length})
                                    </h3>
                                </div>
                                <div 
                                    ref={desktopListScrollRef}
                                    className={styles.desktopLocationListContent}
                                >
                                    <LocationListWeb
                                        locations={visibleLocations}
                                        selectedPlaceId={selectedPlace?.id || selectedPlace?.placeId}
                                        hoveredPlaceId={hoveredPlaceId}
                                        onListItemClick={handleMarkerClick}
                                        onListItemHover={setHoveredPlaceId}
                                        onShareClick={handleShareClick}
                                        isMobileView={false}
                                        itemRefs={itemRefs}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.heroFooter}>
                            <div className={styles.footerAccent} aria-hidden="true" />
                            <div className={styles.footerRow}>
                                <button
                                    type="button"
                                    className={styles.brochureHint}
                                    onClick={() => navigate('/brochure')}
                                >
                                    Разгледайте нашата <span>Брошура</span>
                                    <BrochureLinkIcon className={styles.brochureIcon} />
                                </button>

                                <div className={styles.socialRail}>
                                    <SocialIcon
                                        href="https://www.tiktok.com/@nedev.bg?_t=ZN-8xUznEkh4Mg"
                                        label="TikTok"
                                    >
                                        <TikTokIcon />
                                    </SocialIcon>
                                    <SocialIcon
                                        href="https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag=="
                                        label="Instagram"
                                    >
                                        <InstagramIcon />
                                    </SocialIcon>
                                    <SocialIcon
                                        href="https://www.facebook.com/profile.php?id=100066825065618"
                                        label="Facebook"
                                    >
                                        <FacebookIcon />
                                    </SocialIcon>
                                </div>
                            </div>
                        </div>
                    </div>
                        </section>
                    </>
                )}


                <section 
                    className={`${styles.mapSection} ${!isDesktop && hasMapInteracted ? 'hasMapInteracted' : ''} ${isDesktop && showLocationList ? styles.mapSectionExpanded : ''}`}
                    aria-label="Интерактивна карта"
                    style={!isDesktop && hasMapInteracted ? { 
                        height: `${mobileMapHeight}px`,
                        marginTop: `${headerHeight}px`
                    } : undefined}
                >
                    {isLoaded ? (
                        <div className={styles.mapSurface}>
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
                                onMapClick={handleMapClick}
                                onIdle={handleMapIdle}
                                showInfoWindow={isDesktop}
                                onShareClick={handleShareClick}
                                isDesktop={isDesktop}
                            />
                        </div>
                    ) : (
                        <div className={`${styles.mapSurface} ${styles.mapFallback}`}>
                            {loadError ? 'Проблем при зареждане на картата' : 'Зареждане на картата...'}
                        </div>
                    )}
                </section>
            </div>

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

            {!isDesktop && (
                !!locationToShare || 
                isSearchOpen || 
                isMenuOpen || 
                (showLocationList && (listPosition === 'partial' || listPosition === 'full'))
            ) && (
                <BackToMapButton
                    onClick={() => {
                        if (locationToShare) {
                            setLocationToShare(null);
                        } else if (isSearchOpen) {
                            setIsSearchOpen(false);
                        } else if (isMenuOpen) {
                            setIsMenuOpen(false);
                        } else if (showLocationList && (listPosition === 'partial' || listPosition === 'full')) {
                            // Push the list down to peek mode instead of hiding it
                            setListPosition('peek');
                            setListDragY(0);
                        }
                    }}
                />
            )}

            {!isDesktop && showLocationList && visibleLocations && visibleLocations.length > 0 && (() => {
                const vh = viewportHeight;
                const partialHeightCalc = vh * 0.5;
                
                // Sort to show selected location first
                const sortedLocations = selectedPlace 
                    ? [
                        visibleLocations.find(loc => loc.id === selectedPlace.id),
                        ...visibleLocations.filter(loc => loc.id !== selectedPlace.id)
                      ].filter(Boolean)
                    : visibleLocations;
                
                const getPositionY = () => {
                    // Position from top of viewport
                    const peek = vh - peekHeight; // Show 120px at bottom
                    const partial = vh - partialHeightCalc; // Show 50% of screen
                    const full = headerHeight; // Show from header to bottom
                    
                    switch (listPosition) {
                        case 'peek': return peek;
                        case 'partial': return partial;
                        case 'full': return full;
                        case 'hidden': return vh;
                        default: return peek;
                    }
                };
                
                const handleTouchStart = (e) => {
                    e.stopPropagation();
                    const touch = e.touches[0];
                    dragStartY.current = touch.clientY;
                    listStartY.current = getPositionY();
                    setIsDragging(true);
                };
                
                const handleTouchMove = (e) => {
                    if (!isDragging) return;
                    e.stopPropagation();
                    e.preventDefault();
                    const touch = e.touches[0];
                    const currentY = touch.clientY;
                    const deltaY = currentY - dragStartY.current;
                    const newY = listStartY.current + deltaY;
                    const vh = viewportHeight;
                    
                    // Constrain between headerHeight and vh
                    const constrainedY = Math.max(headerHeight, Math.min(vh, newY));
                    const dragOffset = constrainedY - getPositionY();
                    setListDragY(dragOffset);
                };
                
                const handleTouchEnd = (e) => {
                    if (!isDragging) return;
                    e.stopPropagation();
                    const vh = viewportHeight;
                    const partialHeightCalc = vh * 0.5;
                    const currentY = getPositionY() + listDragY;
                    const peek = vh - peekHeight;
                    const partial = vh - partialHeightCalc;
                    const full = headerHeight;
                    const threshold = 50;
                    
                    let newPosition = listPosition;
                    if (currentY <= full + threshold) {
                        newPosition = 'full';
                    } else if (currentY <= partial + threshold) {
                        newPosition = 'partial';
                    } else if (currentY <= peek + threshold) {
                        newPosition = 'peek';
                    } else {
                        newPosition = 'hidden';
                        setShowLocationList(false);
                    }
                    
                    setListPosition(newPosition);
                    setListDragY(0);
                    setIsDragging(false);
                };
                
                
                const basePositionY = getPositionY();
                const positionY = basePositionY + listDragY;
                const listHeight = Math.max(peekHeight, Math.min(viewportHeight - headerHeight, viewportHeight - positionY));
                
                // Debug logging (remove in production)
                if (import.meta.env.DEV) {
                    console.log('List render:', {
                        showLocationList,
                        visibleLocationsLength: visibleLocations.length,
                        listPosition,
                        positionY,
                        listHeight,
                        viewportHeight
                    });
                }
                
                return (
                    <div 
                        ref={listRef}
                        className={`${styles.mobileLocationList} ${isDragging ? styles.mobileLocationListDragging : ''}`}
                        style={{ 
                            top: `${positionY}px`,
                            height: `${listHeight}px`,
                            bottom: 'auto'
                        }}
                    >
                        <div 
                            className={styles.mobileLocationListDragHandle}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                        <div 
                            className={styles.mobileLocationListHeader}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <h3 className={styles.mobileLocationListTitle}>
                                Обекти в изгледа ({visibleLocations.length})
                            </h3>
                        </div>
                        <div 
                            ref={mobileListContentRef}
                            className={styles.mobileLocationListContent}
                            onTouchStart={(e) => {
                                // Allow scrolling in content, but prevent drag if scrolling
                                if (isDragging) {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <LocationListWeb
                                locations={sortedLocations}
                                selectedPlaceId={selectedPlace?.id}
                                hoveredPlaceId={hoveredPlaceId}
                                onListItemClick={handleMarkerClick}
                                onListItemHover={setHoveredPlaceId}
                                onShareClick={handleShareClick}
                                isMobileView={true}
                                itemRefs={itemRefs}
                            />
                        </div>
                    </div>
                );
            })()}
        </>
    );
}

export default MarosaLocator;