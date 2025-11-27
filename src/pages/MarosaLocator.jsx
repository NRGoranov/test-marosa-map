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
import LocationList from '../features/locations/components/LocationList';
import LocationListWeb from '../components/layout/location-list/LocationList';
import CustomInfoWindowCard from '../features/map/components/CustomInfoWindowCard';
import Logo from '../assets/icons/Logo';
import SocialIcon from '../assets/icons/SocialIcon';
import TikTokIcon from '../assets/icons/TikTokIcon';
import InstagramIcon from '../assets/icons/InstagramIcon';
import FacebookIcon from '../assets/icons/FacebookIcon';
import BurgerMenuIcon from '../assets/icons/BurgerMenuIcon';
import BrochureLinkIcon from '../assets/icons/BrochureLinkIcon';
import SearchIcon from '../assets/icons/SearchIcon';
import { filterLocationsByQuery } from '../utils/searchUtils';
import { FIREBASE_API_KEY } from '../firebase';
import styles from './MarosaLocator.module.css';

// Libraries array must be constant to prevent reload warnings
const GOOGLE_MAPS_LIBRARIES = ['places'];

function MarosaLocator() {
    // Get API key from environment variable, fallback to Firebase key in development
    const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const isDevelopment = import.meta.env.DEV;
    
    // Use env key if available, otherwise use Firebase key in development only
    // Note: Firebase and Google Maps can share the same API key from the same Google Cloud project
    const googleMapsApiKey = envApiKey && envApiKey.trim().length > 0 
        ? envApiKey 
        : (isDevelopment ? FIREBASE_API_KEY : '');
    
    const hasApiKey = googleMapsApiKey && googleMapsApiKey.trim().length > 0;

    // Load Google Maps API
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    // Log errors for debugging (only show warnings in production if key is missing)
    useEffect(() => {
        if (loadError) {
            console.error('Google Maps API Load Error:', loadError);
            if (!envApiKey && !isDevelopment) {
                console.error('VITE_GOOGLE_MAPS_API_KEY environment variable is not set');
            }
        }
    }, [loadError, envApiKey, isDevelopment]);

    const navigate = useNavigate();

    const { locations, allCities } = useLocationsData();
    
    // Filter locations with valid positions to prevent clustering errors
    const validLocations = useMemo(() => {
        if (!locations || locations.length === 0) return [];
        return locations.filter(loc => {
            // Check if position exists and has valid lat/lng
            if (!loc.position) return false;
            const { lat, lng } = loc.position;
            return (
                typeof lat === 'number' && 
                !isNaN(lat) && 
                typeof lng === 'number' && 
                !isNaN(lng) &&
                lat >= -90 && lat <= 90 &&
                lng >= -180 && lng <= 180
            );
        });
    }, [locations]);
    
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
    const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    
    const headerHeight = 80;
    const peekHeight = 120;
    
    // Update viewport height on resize
    useEffect(() => {
        const handleResize = () => {
            setViewportHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = useMediaQuery('(min-width: 1125px)');

    const markerClickRef = useRef(false);

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
            // Immediately show at least the clicked location
            setVisibleLocations([place]);
            
            if (map) {
                map.panTo(place.position);
                map.setZoom(14);
                
                // Update visible locations based on current bounds after map moves
                setTimeout(() => {
                    const bounds = map.getBounds();
                    if (bounds && validLocations) {
                        const visible = validLocations.filter(location => {
                            if (!location.position) return false;
                            return bounds.contains(location.position);
                        });
                        if (visible.length > 0) {
                            setVisibleLocations(visible);
                        }
                    }
                }, 300);
            }
            
            setSelectedPlace(place);
            setHasMapInteracted(true);
            setShowLocationList(true);
            setListPosition('peek');
            setListDragY(0);
            
            if (import.meta.env.DEV) {
                console.log('Marker clicked:', {
                    place,
                    showLocationList: true,
                    listPosition: 'peek'
                });
            }
        }
        
        // Reset the ref after a short delay to allow proper click detection
        setTimeout(() => {
            markerClickRef.current = false;
        }, 100);
    }, [map, selectedPlace, validLocations]);

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
            imageUrl: imageUrl
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
        if (!map || !validLocations || validLocations.length === 0) return;

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

        // Filter locations within viewport bounds
        const visible = validLocations.filter(location => {
            if (!location.position) return false;
            return bounds.contains(location.position);
        });

        setVisibleLocations(visible);

        // Show location list if zoomed in enough (zoom > 11) and there are visible locations
        // Only show if map has been interacted with (not just initial load)
        if (hasMapInteracted && zoom > 11 && visible.length > 0) {
            setShowLocationList(true);
            setListPosition('peek');
            setListDragY(0);
        } else if (zoom <= 11 || !hasMapInteracted) {
            setShowLocationList(false);
        }
    }, [map, validLocations, hasMapInteracted]);

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

            <div className={`${styles.shell} ${isDesktop && showLocationList && visibleLocations && visibleLocations.length > 0 ? styles.shellWithShops : ''}`}>
                {!isDesktop && (
                    <header className={`${styles.heroHeader} ${hasMapInteracted ? styles.heroHeaderFixed : ''}`}>
                        <div className={styles.heroHeaderInner}>
                            <div className={styles.heroHeaderLogo}>
                                <Logo />
                            </div>
                        {hasMapInteracted && !isDesktop && (
                            <div className={`${styles.headerSearchFullWidth} ${isSearchOpen ? styles.active : ''}`}>
                                <LocationSearchBar
                                    query={searchQuery}
                                    onQueryChange={setSearchQuery}
                                    allLocations={locations}
                                    allCities={allCities}
                                    onCitySelect={(cityName) => {
                                        handleCitySelect(cityName);
                                        setIsSearchOpen(false);
                                    }}
                                    onLocationSelect={(location) => {
                                        handleLocationSearchSelect(location);
                                        setIsSearchOpen(false);
                                    }}
                                    showCloseButton={true}
                                    onClose={() => setIsSearchOpen(false)}
                                    compact={true}
                                    onFocus={() => setIsSearchOpen(true)}
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
                                    onClick={() => setIsSearchOpen(true)}
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

                        <section className={styles.heroSection}>
                            <div className={styles.heroBackdrop} aria-hidden="true" />
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
                        {isDesktop && showLocationList && visibleLocations && visibleLocations.length > 0 ? (
                            <div className={styles.heroInnerContent}>
                                <h3 className={styles.heroTitleCompact}>
                                    Мароса вече е по-близо до теб.<br />Търси ни в<span className={styles.heroHighlight}>цялата страна</span>
                                </h3>
                                <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
                                    <div className={styles.searchInput}>
                                        <LocationSearchBar
                                            query={searchQuery}
                                            onQueryChange={(value) => {
                                                setSearchQuery(value);
                                                if (!hasMapInteracted && value) {
                                                    setHasMapInteracted(true);
                                                    setIsSearchOpen(true);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (!hasMapInteracted) {
                                                    setHasMapInteracted(true);
                                                    setIsSearchOpen(true);
                                                    setShowLocationList(false);
                                                }
                                            }}
                                            allLocations={locations}
                                            allCities={allCities}
                                            onCitySelect={handleCitySelect}
                                            onLocationSelect={handleLocationSearchSelect}
                                        />
                                    </div>
                                    <button type="submit" className={styles.searchButton}>
                                        Търси
                                    </button>
                                </form>
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
                            </div>
                        ) : (
                            <div className={`${styles.heroBody} ${isDesktop && showLocationList ? styles.heroBodyCompact : ''}`}>
                                {(!isDesktop || !showLocationList) && (
                                    <p className={styles.heroEyebrow}>Градинарят знае най-добре</p>
                                )}
                                <h3 className={`${styles.heroTitle} ${isDesktop && showLocationList ? styles.heroTitleCompact : ''}`}>
                                    Мароса вече е по-близо до теб.<br />Търси ни в<span className={styles.heroHighlight}>цялата страна</span>
                                </h3>
                                <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
                                    <div className={styles.searchInput}>
                                        <LocationSearchBar
                                            query={searchQuery}
                                            onQueryChange={(value) => {
                                                setSearchQuery(value);
                                                if (!hasMapInteracted && value) {
                                                    setHasMapInteracted(true);
                                                    setIsSearchOpen(true);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (!hasMapInteracted) {
                                                    setHasMapInteracted(true);
                                                    setIsSearchOpen(true);
                                                    setShowLocationList(false);
                                                }
                                            }}
                                            allLocations={locations}
                                            allCities={allCities}
                                            onCitySelect={handleCitySelect}
                                            onLocationSelect={handleLocationSearchSelect}
                                        />
                                    </div>
                                    <button type="submit" className={styles.searchButton}>
                                        Търси
                                    </button>
                                </form>
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
                    className={`${styles.mapSection} ${!isDesktop && hasMapInteracted ? 'hasMapInteracted' : ''}`}
                    aria-label="Интерактивна карта"
                >
                    {isLoaded && !loadError && hasApiKey && typeof window !== 'undefined' && window.google && window.google.maps ? (
                        <div className={styles.mapSurface}>
                            <MapCanvas
                                map={map}
                                onLoad={onMapLoad}
                                locations={validLocations}
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
                            {!hasApiKey ? (
                                <div>
                                    <p>Грешка в конфигурацията</p>
                                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                                        Google Maps API ключът не е конфигуриран
                                    </p>
                                </div>
                            ) : loadError ? (
                                <div>
                                    <p>Проблем при зареждане на картата</p>
                                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                                        Проверете конфигурацията на API ключа в Google Cloud Console
                                    </p>
                                </div>
                            ) : (
                                'Зареждане на картата...'
                            )}
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

            {!isDesktop && selectedPlace && (
                <div 
                    className={styles.mobileShopCard}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedPlace(null);
                        }
                    }}
                >
                    <div className={styles.mobileShopCardContent}>
                        <button
                            type="button"
                            onClick={() => setSelectedPlace(null)}
                            className={styles.mobileShopCardClose}
                            aria-label="Затвори"
                        >
                            ×
                        </button>
                        <CustomInfoWindowCard
                            location={selectedPlace}
                            onClose={() => setSelectedPlace(null)}
                            onShareClick={handleShareClick}
                        />
                    </div>
                </div>
            )}

            {!isDesktop && showLocationList && visibleLocations && visibleLocations.length > 0 && (() => {
                const vh = viewportHeight;
                const partialHeightCalc = vh * 0.5;
                
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
                            className={styles.mobileLocationListContent}
                            onTouchStart={(e) => {
                                // Allow scrolling in content, but prevent drag if scrolling
                                if (isDragging) {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <LocationList
                                locations={visibleLocations}
                                selectedPlaceId={selectedPlace?.id}
                                hoveredPlaceId={hoveredPlaceId}
                                onSelect={handleMarkerClick}
                                onHover={setHoveredPlaceId}
                                onShare={handleShareClick}
                            />
                        </div>
                    </div>
                );
            })()}
        </>
    );
}

export default MarosaLocator;