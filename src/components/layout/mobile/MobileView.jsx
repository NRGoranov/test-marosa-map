import React, { useState, useRef, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

import Map from '../../map/Map';
import MobileViewHeader from '../mobile/MobileViewHeader';
import SlideDownMenu from '../../ui/SlideDownMenu';
import LocationList from '../location-list/LocationList';
import MobileShareModal from './MobileShareModal';
import SearchResults from './SearchResults';
import SearchIcon from '../../../assets/icons/SearchIcon';

const MobileView = (props) => {
    const {
        onNavigateToBrochure,
        onMarkerClick,
        selectedPlace,
        onCloseInfoWindow,
        allLocations,
        allCities,
        onCitySelect,
        locations,
        onMapClick,
        ...rest
    } = props;

    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ cities: [], locations: [] });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [locationToShare, setLocationToShare] = useState(null);
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);

    const sheetRef = useRef();

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults({ cities: [], locations: [] });

            return;
        }
        const isCyrillic = /[а-яА-Я]/.test(searchTerm);

        const lowerCaseSearchTerm = searchTerm.toLocaleLowerCase(isCyrillic ? 'bg-BG' : 'en-US');

        const matchingCities = allCities.filter(city => {
            const nameToSearch = isCyrillic ? city.bulgarianName : city.englishName;

            return nameToSearch.toLocaleLowerCase(isCyrillic ? 'bg-BG' : 'en-US').includes(lowerCaseSearchTerm);
        });

        const startsWithMatches = allLocations.filter(loc =>
            loc.displayName?.text && loc.displayName.text.toLocaleLowerCase('bg-BG').startsWith(lowerCaseSearchTerm)
        );

        const includesMatches = allLocations.filter(loc =>
            loc.displayName?.text &&
            loc.displayName.text.toLocaleLowerCase('bg-BG').includes(lowerCaseSearchTerm) &&
            !loc.displayName.text.toLocaleLowerCase('bg-BG').startsWith(lowerCaseSearchTerm)
        );

        const matchingLocations = [...startsWithMatches, ...includesMatches];

        setSearchResults({ cities: matchingCities, locations: matchingLocations });
    }, [searchTerm, allLocations, allCities]);

    useEffect(() => {
        if (!sheetRef.current) return;

        if (selectedPlace) {
            sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.55);
        } else {
            sheetRef.current.snapTo(({ snapPoints }) => snapPoints[0]);
        }
    }, [selectedPlace]);

    useEffect(() => {
        if (searchTerm) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [searchTerm]); 

    const handleMarkerClickAndExitSearch = (place) => {
        onMarkerClick(place);

        setIsSearching(false);
    };

    const handleMapClickWrapper = (event) => {
        if (isSearching) {
            setIsSearching(false);
        }
        if (onMapClick) {
            onMapClick(event);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCityClick = (city) => {
        if (onCitySelect) {
            onCitySelect(city);
        }
        setSearchTerm('');

        setIsSearching(false);
    };

    const handleLocationClick = (location) => {
        onMarkerClick(location);
        setSearchTerm('');
        setIsSearching(false);
    };

    const toggleSearchMode = () => {
        setIsSearching(prev => !prev);
    };

    const snapPoints = ({ maxHeight }) => [63, maxHeight * 0.55, maxHeight - 110];

    const closeBottomSheet = () => {
        if (sheetRef.current) {
            sheetRef.current.snapTo(({ snapPoints }) => snapPoints[0]);
        }
    };

    const handleMenuClick = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            closeBottomSheet();

            setIsMenuOpen(true);
        }
    };

    const handleShareClick = (location, details) => {
        const name = location.displayName?.text;

        let finalMapsUrl = '';

        const lat = details?.geometry?.location?.lat();
        const lng = details?.geometry?.location?.lng();

        if (lat && lng) {
            finalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        } else {
            finalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
        }

        const comprehensiveLocationData = {
            ...location,
            ...details,
            name,
            displayName: { text: name },
            rating: 5,
            mapsUrl: finalMapsUrl
        };

        setLocationToShare(comprehensiveLocationData);
    };

    const renderHeader = () => {
        if (isSearching) {
            return (
                <div className="p-4 border-b border-gray-200 flex-shrink-0 z-20 flex items-center gap-10 bg-white">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoFocus={true}
                            placeholder="Търси обекти..."
                            className="w-full bg-gray-100 rounded-full pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1B4712]"
                        />

                        <button
                            onClick={searchTerm ? () => setSearchTerm('') : toggleSearchMode}
                            onMouseDown={(e) => e.preventDefault()}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {searchTerm && (
                            <SearchResults
                                results={searchResults}
                                onCityClick={handleCityClick}
                                onLocationClick={handleLocationClick}
                            />
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 bg-white shadow-sm">
                <MobileViewHeader
                    onSearchClick={toggleSearchMode}
                    onMenuClick={handleMenuClick}
                    isMenuOpen={isMenuOpen}
                />
            </div>
        );
    };

    return (
        <div className="h-screen w-screen relative">
            <div className="absolute top-0 left-0 right-0 z-20">
                {renderHeader()}
            </div>

            <div className="h-full w-full relative">
                {isSheetExpanded && (
                    <div
                        className="absolute inset-0 z-10"
                        onClick={closeBottomSheet}
                        aria-label="Close location details"
                    />
                )}
                {props.isLoaded && (
                    <Map
                        {...rest}
                        onMarkerClick={handleMarkerClickAndExitSearch}
                        onMapClick={handleMapClickWrapper}
                        selectedPlace={selectedPlace}
                        locations={allLocations}
                        showInfoWindow={false}
                    />
                )}
            </div>

            <SlideDownMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onBrochureClick={onNavigateToBrochure}
                menuVariant="home"
            />

            {!isSearching && (
                <BottomSheet
                    open
                    blocking={false}
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    defaultSnap={({ snapPoints }) => snapPoints[0]}
                    onSnap={({ index }) => setIsSheetExpanded(index > 0)}
                    header={
                        <div className="flex items-center justify-center text-lg font-bold text-[#1B4712] p-2">
                            {selectedPlace
                                ? selectedPlace.displayName.text
                                : `${locations.length} ${locations.length === 1 ? 'намерен обект' : 'намерени обекта'}`
                            }
                        </div>
                    }
                >
                    <div data-rsbs-scroll="true" className="flex-grow overflow-y-auto px-4 pb-4">
                        <LocationList
                            {...props}
                            locations={selectedPlace ? [selectedPlace] : locations}
                            onListItemClick={onMarkerClick}
                            onShareClick={handleShareClick}
                            isMobileView={true}
                        />
                    </div>
                </BottomSheet>
            )}

            <MobileShareModal
                isOpen={!!locationToShare}
                onClose={() => setLocationToShare(null)}
                place={locationToShare}
            />
        </div>
    );
};

export default MobileView;