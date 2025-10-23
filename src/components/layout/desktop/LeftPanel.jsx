import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt as CityIcon } from 'react-icons/fa'; 

import Header from './Header';
import Footer from './Footer';
import LocationList from '../location-list/LocationList';
import DesktopShareModal from './DesktopShareModal';

import SearchIcon from '../../../assets/icons/SearchIcon';

const LeftPanel = (props) => {
    const [locationToShare, setLocationToShare] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ locations: [] });
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    const searchContainerRef = useRef(null);
    const allLocationsRef = useRef(props.allLocations);

    useEffect(() => {
        allLocationsRef.current = props.allLocations;
    }, [props.allLocations]);

    useEffect(() => {
        setSearchResults({ locations: [] });

        if (selectedSuggestion) {
           return; 
        }

        const currentSearchTerm = searchTerm.trim(); 

        if (currentSearchTerm === '') {
            return;
        }

        const currentAllLocations = allLocationsRef.current;

        if (!currentAllLocations) {
            return;
        }

        const lowerCaseSearchTerm = currentSearchTerm.toLocaleLowerCase('bg-BG'); 

        const matchingLocations = currentAllLocations.filter(loc => {
            return loc.displayName?.text && loc.displayName.text.toLocaleLowerCase('bg-BG').startsWith(lowerCaseSearchTerm);
        });

        setSearchResults({ locations: matchingLocations });
    }, [searchTerm, selectedSuggestion]); 

    useEffect(() => {
        function handleClickOutside(event) {
            if (event.target.closest('.search-dropdown')) {
                return;
            }

            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchTerm('');

                setSearchResults({ locations: [] }); 

                setSelectedSuggestion(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);

        setSelectedSuggestion(null); 
    };

    const handleSuggestionClick = (item) => {
        const name = item.displayName.text;

        setSearchTerm(name); 

        setSelectedSuggestion({ type: 'location', data: item }); 
    };

    const handleSearch = (event) => {
        event.preventDefault();
        
        if (selectedSuggestion) {
            if (selectedSuggestion.type === 'location') {
                props.onListItemClick && props.onListItemClick(selectedSuggestion.data);
            }
        }
        else if (searchTerm.trim() !== '' && searchResults.locations.length > 0) {
            props.onListItemClick && props.onListItemClick(searchResults.locations[0]);
        }
 
        setSearchResults({ locations: [] }); 

        setSelectedSuggestion(null); 
    };

    const handleShareClick = (location) => {
        const name = location.displayName?.text;

        const lat = location.geometry?.location?.lat();

        const lng = location.geometry?.location?.lng();

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
    }

    const renderResultsText = (count) => {
        if (count === 0) {
            return <span className="font-light text-gray-500">Няма намерени резултати</span>;
        }

        return (
            <>
                <span className="font-bold text-gray-800">
                    {count}
                </span>

                <span className="font-light text-gray-500">
                    {count === 1 ? ' намерен резултат' : ' намерени резултата'}
                </span>
            </>
        );
    };

    const hasSearchResults = searchResults.locations.length > 0;

    return (
        <div className="w-full md:w-1/3 flex flex-col h-screen bg-white shadow-lg z-10 p-8">
            <div className="flex-shrink-0">
                <Header />

                <div className="w-fit mt-10">
                    <main>
                        <p className="text-[#4CAF50] font-medium mb-10">
                            Градинарят знае най-добре
                        </p>

                        <h2 className="text-3xl sm:text-4xl font-medium text-[#1B4712] leading-relaxed mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Мароса вече е по-близо до теб. Търси ни в  {' '}

                            <span className="bg-[#C9F0C2] rounded-full px-6 py-1">
                                цялата страна
                            </span>
                        </h2>
                    </main>

                    <section className="mt-8" ref={searchContainerRef}>
                        <form onSubmit={handleSearch} className="flex items-center space-x-4">
                            
                            <div className="relative flex-grow">

                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>

                                <input
                                    type="text"
                                    name="search"
                                    id="search"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="Търси обекти..." 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    autoComplete="off"
                                />

                                {searchTerm && hasSearchResults && !selectedSuggestion && (
                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-80 overflow-y-auto search-dropdown">
                                        <div className="divide-y divide-gray-100">
                                            {searchResults.locations.length > 0 && (
                                                <div className="p-2">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase px-3 pt-1 pb-1">
                                                        Обекти
                                                    </h4>

                                                    <ul>
                                                        {searchResults.locations.map((loc) => (
                                                            <li
                                                                key={loc.place_id || loc.displayName.text}
                                                                className="p-3 hover:bg-green-50 cursor-pointer rounded-md text-gray-800 flex items-center"
                                                                onMouseDown={() => handleSuggestionClick(loc)}
                                                            >
                                                                <CityIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />

                                                                <span>
                                                                    {loc.displayName.text}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-[#1B4712] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4712]"
                            >
                                Търси
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto mt-8 pt-2 pr-2 -mr-4">
                <p className="text-lg">
                    {renderResultsText(props.locations ? props.locations.length : 0)}
                </p>

                <div className="mt-4 p-1">
                    {props.isInitialLoading ? (
                        <p className="text-gray-500">Loading location details...</p>
                    ) : (
                        <LocationList
                            {...props}
                            onShareClick={handleShareClick}
                        />
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 pt-8 mt-auto">
                <Footer />
            </div>

            <DesktopShareModal
                isOpen={!!locationToShare}
                onClose={() => setLocationToShare(null)}
                place={locationToShare}
            />
        </div>
    );
};

export default LeftPanel;