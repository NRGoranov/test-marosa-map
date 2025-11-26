import { useState, useCallback, useRef, useMemo } from 'react';
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
import Logo from '../assets/icons/Logo';
import SocialIcon from '../assets/icons/SocialIcon';
import TikTokIcon from '../assets/icons/TikTokIcon';
import InstagramIcon from '../assets/icons/InstagramIcon';
import FacebookIcon from '../assets/icons/FacebookIcon';
import BurgerMenuIcon from '../assets/icons/BurgerMenuIcon';
import ExternalLinkIcon from '../assets/icons/ExternalLinkIcon';
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

    const isDesktop = useMediaQuery('(min-width: 1024px)');

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
            return;
        }

        if (searchResults.cities.length > 0) {
            handleCitySelect(searchResults.cities[0].bulgarianName);
            setSearchQuery('');
        }
    }, [searchQuery, searchResults, handleMarkerClick, handleCitySelect]);

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
                <div className={styles.decorTop} aria-hidden="true" />
                <div className={styles.decorBottom} aria-hidden="true" />
                <div className={styles.decorTopRight} aria-hidden="true" />
                <div className={styles.decorMidRight} aria-hidden="true" />

                <section className={styles.heroSection}>
                    <div className={styles.heroBackdrop} aria-hidden="true" />
                    <div className={styles.heroBackdropTopRight} aria-hidden="true" />
                    <div className={styles.heroLogo}>
                        <Logo />
                    </div>
                    <a
                        href="https://marossa.bg/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.shopButton}
                    >
                        Онлайн магазин
                    </a>
                    <div className={styles.heroInner}>
                        <div className={styles.heroTopRail}>
                            <div className={styles.headerActions}>
                                {!isDesktop && (
                                    <button
                                        type="button"
                                        className={`${styles.menuButtonMobile} ${isMenuOpen ? styles.menuButtonActive : ''}`}
                                        onClick={handleMenuToggle}
                                        aria-label="Отвори менюто"
                                    >
                                        <BurgerMenuIcon />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.heroBody}>
                            <p className={styles.heroEyebrow}>Градинарят знае най-добре</p>
                            <h1 className={styles.heroTitle}>
                                Lorem ipsum dolor sit amet <span className={styles.heroHighlight}>consectiur</span>
                            </h1>
                            <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
                                <div className={styles.searchInput}>
                                    <LocationSearchBar
                                        query={searchQuery}
                                        onQueryChange={setSearchQuery}
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

                        <div className={styles.heroFooter}>
                            <div className={styles.footerAccent} aria-hidden="true" />
                            <div className={styles.footerRow}>
                                <button
                                    type="button"
                                    className={styles.brochureHint}
                                    onClick={() => navigate('/brochure')}
                                >
                                    Разгледайте нашата <span>Брошура</span>
                                    <ExternalLinkIcon className={styles.brochureIcon} />
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

                <section className={styles.mapSection} aria-label="Интерактивна карта">
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
                                showInfoWindow={isDesktop}
                                onShareClick={handleShareClick}
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
        </>
    );
}

export default MarosaLocator;