import React from "react";

import CityIcon from "../../../assets/icons/CityIcon";
import LocationPinIcon from "../../../assets/icons/LocationPinIcon";
import TopLeftArrowIcon from "../../../assets/icons/TopLeftArrowIcon";

const SearchResults = ({ results, onCityClick, onLocationClick, onExitSearch }) => {
    const { cities, locations } = results;

    const hasResults = cities.length > 0 || locations.length > 0;

return (
        <>
            <div className="flex-grow overflow-y-auto bg-white">
                <div className="flex-grow overflow-y-auto">
                    {cities.length > 0 && (
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Градове</h3>
                            <ul>
                                {cities.map(city => (
                                    <li key={city} onClick={() => onCityClick(city)} className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer group">
                                        <div className="flex items-center">
                                            <CityIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700 group-hover:text-green-600">{city}</span>
                                        </div>
                                        <TopLeftArrowIcon className="w-5 h-5 text-gray-400 transform -rotate-45" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {locations.length > 0 && (
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Обекти</h3>
                            <ul>
                                {locations.map(loc => (
                                    <li key={loc.placeId} onClick={() => onLocationClick(loc)} className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer group">
                                        <div className="flex items-center">
                                            <LocationPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700 group-hover:text-green-600">{loc.name}</span>
                                        </div>
                                        <TopLeftArrowIcon className="w-5 h-5 text-gray-400 transform -rotate-45" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!hasResults && (
                        <div className="p-10 text-center">
                            <p className="text-gray-500">Няма намерени резултати.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SearchResults;