import React, { useState, useRef, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

import SearchResults from './SearchResults';
import Map from '../../map/Map';
import LocationList from '../location-list/LocationList';
import SearchIcon from '../../../assets/icons/SearchIcon';
import MobileShareModal from './MobileShareModal';

const MobileSearchView = ({ onExitSearch, onCitySelect, ...props }) => {
    const sheetRef = useRef();
    const itemRefs = useRef({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ cities: [], locations: [] });
    const [locationToShare, setLocationToShare] = useState(null);

    const {
        isLoaded,
        loadError,
        selectedPlace,
        locations,
        allLocations,
        allCities,
        onMarkerClick,
        onListItemHover,
    } = props;

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
        if (searchTerm) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [searchTerm]);

    useEffect(() => {
        if (!sheetRef.current) return;
        if (selectedPlace) {
            sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.55);
        } else {
            sheetRef.current.snapTo(({ snapPoints }) => snapPoints[0]);
        }
    }, [selectedPlace]);

    useEffect(() => {
        if (selectedPlace && itemRefs.current[selectedPlace.placeId]) {
            if (locations.some(loc => loc.placeId === selectedPlace.placeId)) {
                itemRefs.current[selectedPlace.placeId].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [selectedPlace, locations]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCityClick = (city) => {
        if (onCitySelect) {
            onCitySelect(city);
        }
        setSearchTerm('');
    };

    const handleLocationClick = (location) => {
        onMarkerClick(location);
        setSearchTerm('');
    };

    const handleShareClick = (location, details) => {
        const combinedData = {
            ...location,
            ...details,
            name: details?.name || location.name
        };

        let finalMapsUrl = '';
        const lat = details?.geometry?.location?.lat();
        const lng = details?.geometry?.location?.lng();

        if (lat && lng) {
            finalMapsUrl = `https://www.google.com/maps/dir//${lat},${lng}`;
        } else {
            finalMapsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(combinedData.name)}`;
        }

        const comprehensiveLocationData = {
            ...combinedData,
            mapsUrl: finalMapsUrl,
        };

        setLocationToShare(comprehensiveLocationData);
    }

    const snapPoints = ({ maxHeight }) => [
        63,
        maxHeight * 0.55,
        maxHeight - 110,
    ];

    return (
        <div className="flex flex-col h-screen w-screen bg-white">
            <div className="p-4 border-b border-gray-200 flex-shrink-0 z-20 flex items-center gap-10">
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
                        onClick={searchTerm ? () => setSearchTerm('') : onExitSearch}
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

            <div className="flex-grow relative">
                <div className="w-full h-full">
                    {loadError && <div>Error loading maps.</div>}
                    {!isLoaded && <div className="text-gray-600">Loading Map...</div>}
                    {isLoaded && <Map {...props} locations={allLocations} />}
                </div>

                {!searchTerm && (
                    <BottomSheet
                        open
                        blocking={false}
                        ref={sheetRef}
                        snapPoints={snapPoints}
                        defaultSnap={({ snapPoints }) => snapPoints[0]}
                        header={
                            <div className="flex flex-col items-center justify-center">
                                <h2 className="text-lg font-bold text-gray-800 pt-2">
                                    {locations.length} {locations.length === 1 ? 'намерен обект' : 'намерени обекта'}
                                </h2>
                            </div>
                        }
                    >
                        <div data-rsbs-scroll="true" className="flex-grow overflow-y-auto px-4 pb-4">
                            <LocationList
                                {...props}
                                onListItemClick={onMarkerClick}
                                onListItemHover={onListItemHover}
                                onShareClick={handleShareClick}
                                itemRefs={itemRefs}
                                isMobileView={true}
                            />
                        </div>
                    </BottomSheet>
                )}
            </div>

            <MobileShareModal
                isOpen={!!locationToShare}
                onClose={() => setLocationToShare(null)}
                place={locationToShare}
            />
        </div>
    );
};

export default MobileSearchView;