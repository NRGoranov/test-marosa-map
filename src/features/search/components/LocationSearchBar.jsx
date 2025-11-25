import React from 'react';

import SearchInput from '../../../components/ui/SearchInput';
import { filterLocationsByQuery } from '../../../utils/searchUtils';

const LocationSearchBar = ({
    query,
    onQueryChange,
    allLocations,
    allCities,
    onCitySelect,
    onLocationSelect,
}) => {
    const results = query
        ? filterLocationsByQuery(query, allLocations, allCities)
        : { locations: [], cities: [] };

    return (
        <div className="relative w-full">
            <div className="relative bg-white rounded-full shadow-lg px-4 py-3">
                <SearchInput
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    className="w-full pl-10 pr-4 bg-transparent text-sm text-[#0D2F13] placeholder:text-[#7A8E74] focus:outline-none"
                    iconClassName="pl-2 text-[#1B4712]"
                />
                {query && (
                    <button
                        type="button"
                        aria-label="Изчисти търсенето"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8E74]"
                        onClick={() => onQueryChange('')}
                    >
                        &times;
                    </button>
                )}
            </div>

            {(results.cities.length > 0 || results.locations.length > 0) && (
                <div className="absolute z-30 w-full mt-2 rounded-2xl bg-white shadow-2xl border border-[#E6F2E2] max-h-80 overflow-y-auto">
                    {results.cities.length > 0 && (
                        <div className="p-3 border-b border-[#F2F7F0]">
                            <p className="text-xs font-semibold text-[#7A8E74] uppercase tracking-wide mb-2">Градове</p>
                            <ul className="space-y-1">
                                {results.cities.map((city) => (
                                    <li key={city.bulgarianName}>
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5FBF3] text-[#0D2F13]"
                                            onClick={() => onCitySelect(city.bulgarianName)}
                                        >
                                            {city.bulgarianName}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.locations.length > 0 && (
                        <div className="p-3">
                            <p className="text-xs font-semibold text-[#7A8E74] uppercase tracking-wide mb-2">Обекти</p>
                            <ul className="space-y-1">
                                {results.locations.map((location) => (
                                    <li key={location.placeId || location.id}>
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5FBF3] text-[#0D2F13]"
                                            onClick={() => onLocationSelect(location)}
                                        >
                                            {location.displayName?.text || location.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationSearchBar;

