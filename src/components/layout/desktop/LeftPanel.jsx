import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt as CityIcon } from 'react-icons/fa'; 

import Header from './Header';
import Footer from './Footer';
import LocationList from '../location-list/LocationList';

import SearchInput from '../../ui/SearchInput';

import { filterLocationsByQuery } from '../../../utils/searchUtils';

const LeftPanel = (props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ cities: [], locations: [] });
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    const searchContainerRef = useRef(null);
    const allLocationsRef = useRef(props.allLocations);
    const allCitiesRef = useRef(props.allCities);

    useEffect(() => {
        allLocationsRef.current = props.allLocations;
    }, [props.allLocations]);

    useEffect(() => {
        allCitiesRef.current = props.allCities;
    }, [props.allCities]);

    useEffect(() => {
        setSearchResults({ cities: [], locations: [] });

        if (selectedSuggestion) {
           return; 
        }

        const currentSearchTerm = searchTerm.trim(); 

        if (currentSearchTerm === '') {
            return;
        }

        const currentAllLocations = allLocationsRef.current;
        const currentAllCities = allCitiesRef.current;

        if (!currentAllLocations || !currentAllCities) {
            return;
        }

        // Use shared search function to filter both cities and locations
        const results = filterLocationsByQuery(currentSearchTerm, currentAllLocations, currentAllCities);
        setSearchResults(results);
    }, [searchTerm, selectedSuggestion]); 

    useEffect(() => {
        function handleClickOutside(event) {
            if (event.target.closest('.search-dropdown')) {
                return;
            }

            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchTerm('');

                setSearchResults({ cities: [], locations: [] }); 

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

    const handleSuggestionClick = (item, type) => {
        if (type === 'city') {
            // Handle city click - trigger city select if callback exists
            if (props.onCitySelect) {
                props.onCitySelect(item.bulgarianName);
            }
            setSearchTerm('');
            setSearchResults({ cities: [], locations: [] });
            setSelectedSuggestion(null);
        } else {
            // Handle location click
            const name = item.displayName.text;

            setSearchTerm(name); 

            setSelectedSuggestion({ type: 'location', data: item }); 
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        
        if (selectedSuggestion) {
            if (selectedSuggestion.type === 'location') {
                props.onListItemClick && props.onListItemClick(selectedSuggestion.data);
            }
        }
        else if (searchTerm.trim() !== '' && (searchResults.cities.length > 0 || searchResults.locations.length > 0)) {
            // Prefer locations over cities when submitting
            if (searchResults.locations.length > 0) {
                props.onListItemClick && props.onListItemClick(searchResults.locations[0]);
            } else if (searchResults.cities.length > 0 && props.onCitySelect) {
                props.onCitySelect(searchResults.cities[0].bulgarianName);
            }
        }
 
        setSearchResults({ cities: [], locations: [] }); 

        setSelectedSuggestion(null); 
    };



    const renderResultsText = (count) => {
        if (count === 0) {
            return <span>Няма намерени резултати</span>;
        }

        return (
            <>
                <span className="font-semibold text-gray-700">
                    {count}
                </span>

                <span className="text-gray-600">
                    {count === 1 ? ' намерен резултат' : ' намерени резултата'}
                </span>
            </>
        );
    };

    const hasSearchResults = searchResults.cities.length > 0 || searchResults.locations.length > 0;

    return (
        <div className="w-full md:w-1/3 flex flex-col h-screen bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-10 px-8 pt-8 pb-6 relative left-panel-container">
            <div className="flex-shrink-0 mb-6">
                <Header />

                <div className="w-full">
                    <main>
                        <p className="text-[#7A8E74] text-sm font-medium mb-4">
                            Градинарят знае най-добре
                        </p>

                        <h2 className="text-[40px] font-medium text-[#1B4712] leading-tight mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Lorem ipsum dolor sit <br />
                            amet <span className="bg-[#C9F0C2] rounded-full px-6 py-1 inline-block">consectiur</span>
                        </h2>
                    </main>

                    <section className="mb-8" ref={searchContainerRef}>
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <div className="relative flex-grow">
                                <SearchInput
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="block w-full pl-14 pr-4 py-4 border border-gray-200 rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4712]/20 focus:border-[#1B4712] text-base bg-white shadow-sm"
                                    iconClassName="pl-6"
                                    placeholder="Потърси Мароса обекти..."
                                />

                                {searchTerm && hasSearchResults && !selectedSuggestion && (
                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-80 overflow-y-auto search-dropdown">
                                        <div className="divide-y divide-gray-100">
                                            {searchResults.cities.length > 0 && (
                                                <div className="p-2">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase px-3 pt-1 pb-1">
                                                        Градове
                                                    </h4>

                                                    <ul>
                                                        {searchResults.cities.map((city) => (
                                                            <li
                                                                key={city.englishName}
                                                                className="p-3 hover:bg-green-50 cursor-pointer rounded-xl text-gray-800 flex items-center"
                                                                onMouseDown={() => handleSuggestionClick(city, 'city')}
                                                            >
                                                                <CityIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />

                                                                <span>
                                                                    {city.bulgarianName}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {searchResults.locations.length > 0 && (
                                                <div className="p-2">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase px-3 pt-1 pb-1">
                                                        Обекти
                                                    </h4>

                                                    <ul>
                                                        {searchResults.locations.map((loc) => (
                                                            <li
                                                                key={loc.place_id || loc.displayName.text}
                                                                className="p-3 hover:bg-green-50 cursor-pointer rounded-xl text-gray-800 flex items-center"
                                                                onMouseDown={() => handleSuggestionClick(loc, 'location')}
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
                                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-[#004D25] hover:bg-[#003d1e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4712] transition-colors shadow-md"
                            >
                                Търси
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            {/* Results Count Header */}
            <div className="flex-shrink-0 mt-4 mb-2">
                <div className="flex justify-start">
                    <p className="text-sm text-gray-700">
                        {renderResultsText(props.locations ? props.locations.length : 0)}
                    </p>
                </div>
            </div>

            {/* Scrollable Card List */}
            <div className="flex-1 overflow-y-auto left-panel-scroll relative min-h-0 no-scrollbar">
                <div>
                    {props.isInitialLoading ? (
                        <p className="text-gray-500">Loading location details...</p>
                    ) : (
                        <LocationList
                            {...props}
                            onShareClick={props.onShareClick}
                        />
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 pt-6 mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default LeftPanel;