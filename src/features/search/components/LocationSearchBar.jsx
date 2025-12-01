import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

import SearchInput from '../../../components/ui/SearchInput';
import { filterLocationsByQuery } from '../../../utils/searchUtils';

/**
 * Highlight search term in text
 */
function highlightText(text, searchTerm) {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
        regex.test(part) ? (
            <mark key={index} className="bg-[#EAF6E7] text-[#0D2F13] font-medium px-0.5 rounded">
                {part}
            </mark>
        ) : (
            part
        )
    );
}

/**
 * Debounce hook
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const LocationSearchBar = ({
    query,
    onQueryChange,
    allLocations,
    allCities,
    onCitySelect,
    onLocationSelect,
    showCloseButton = false,
    onClose,
    compact = false,
    onFocus,
    isMobileSearchOpen = false,
    headerHeight = 80,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
    const resultsRef = useRef(null);
    const debouncedQuery = useDebounce(query, 200); // 200ms debounce
    
    const results = useMemo(() => {
        if (!debouncedQuery) {
            return { locations: [], cities: [] };
        }
        return filterLocationsByQuery(debouncedQuery, allLocations, allCities, { maxResults: 15 });
    }, [debouncedQuery, allLocations, allCities]);

    // Flatten results for keyboard navigation
    const allResults = useMemo(() => {
        const items = [];
        results.cities.forEach((city, index) => {
            items.push({ type: 'city', data: city, index });
        });
        results.locations.forEach((location, index) => {
            items.push({ type: 'location', data: location, index });
        });
        return items;
    }, [results]);

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [query]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (allResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsKeyboardNavigating(true);
            setSelectedIndex(prev => 
                prev < allResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIsKeyboardNavigating(true);
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const selected = allResults[selectedIndex];
            if (selected.type === 'city') {
                onCitySelect(selected.data.bulgarianName);
            } else {
                onLocationSelect(selected.data);
            }
            setSelectedIndex(-1);
        } else if (e.key === 'Escape') {
            if (onClose) {
                onClose();
            } else {
                onQueryChange('');
            }
        } else {
            setIsKeyboardNavigating(false);
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
            const selectedElement = resultsRef.current.querySelector(
                `[data-result-index="${selectedIndex}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    const searchBoxShadow = [
        '0 3px 6px rgba(15, 58, 25, 0.08)',
        '3px 0 5px rgba(15, 58, 25, 0.06)',
        '0 -2px 4px rgba(15, 58, 25, 0.04)'
    ].join(', ');
    const searchBorder = '1.5px solid rgba(179, 187, 177, 0.55)';

    return (
        <div className="relative w-full" style={{ zIndex: 9999, position: 'relative' }}>
            <div
                className={`relative bg-white rounded-full ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
                style={{ boxShadow: searchBoxShadow, border: searchBorder }}
            >
                <SearchInput
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    onFocus={onFocus}
                    onKeyDown={handleKeyDown}
                    className={`w-full pl-10 bg-transparent text-sm text-[#0D2F13] placeholder:text-[#7A8E74] focus:outline-none ${showCloseButton ? 'pr-12' : 'pr-4'}`}
                    iconClassName="pl-2 text-[#1B4712]"
                />
                {query && !showCloseButton && (
                    <button
                        type="button"
                        aria-label="Изчисти търсенето"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8E74]"
                        onClick={() => onQueryChange('')}
                    >
                        &times;
                    </button>
                )}
                {showCloseButton && onClose && (
                    <button
                        type="button"
                        aria-label="Затвори търсенето"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8E74] hover:text-[#0D2F13] text-2xl font-light w-8 h-8 flex items-center justify-center transition-colors"
                        onClick={onClose}
                    >
                        ×
                    </button>
                )}
            </div>

            {(results.cities.length > 0 || results.locations.length > 0) && (
                (isMobileSearchOpen && typeof document !== 'undefined' 
                    ? createPortal(
                        <div 
                            ref={resultsRef}
                            className="fixed inset-0 max-h-none rounded-none border-0 shadow-none mt-0 w-full bg-white overflow-y-auto"
                            style={{ 
                                position: 'fixed',
                                zIndex: 1000,
                                top: `${headerHeight}px`,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }}
                        >
                            {results.cities.length > 0 && (
                                <div className="p-4 border-b border-[#F2F7F0]">
                                    <p className="text-xs font-semibold text-[#7A8E74] uppercase tracking-wide mb-2">
                                        Градове {results.cities.length > 0 && `(${results.cities.length})`}
                                    </p>
                                    <ul className="space-y-1">
                                        {results.cities.map((city, cityIndex) => {
                                            const resultIndex = cityIndex;
                                            const isSelected = selectedIndex === resultIndex;
                                            return (
                                                <li key={city.bulgarianName}>
                                                    <button
                                                        type="button"
                                                        data-result-index={resultIndex}
                                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#0D2F13] ${
                                                            isSelected 
                                                                ? 'bg-[#EAF6E7] border border-[#1B4712]' 
                                                                : 'hover:bg-[#F5FBF3]'
                                                        }`}
                                                        onClick={() => onCitySelect(city.bulgarianName)}
                                                        onMouseEnter={() => !isKeyboardNavigating && setSelectedIndex(resultIndex)}
                                                    >
                                                        {highlightText(city.bulgarianName, debouncedQuery)}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {results.locations.length > 0 && (
                                <div className="p-4">
                                    <p className="text-xs font-semibold text-[#7A8E74] uppercase tracking-wide mb-2">
                                        Обекти {results.locations.length > 0 && `(${results.locations.length})`}
                                    </p>
                                    <ul className="space-y-1">
                                        {results.locations.map((location, locIndex) => {
                                            const resultIndex = results.cities.length + locIndex;
                                            const isSelected = selectedIndex === resultIndex;
                                            const locationName = location.displayName?.text || location.name;
                                            return (
                                                <li key={location.placeId || location.id}>
                                                    <button
                                                        type="button"
                                                        data-result-index={resultIndex}
                                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#0D2F13] ${
                                                            isSelected 
                                                                ? 'bg-[#EAF6E7] border border-[#1B4712]' 
                                                                : 'hover:bg-[#F5FBF3]'
                                                        }`}
                                                        onClick={() => onLocationSelect(location)}
                                                        onMouseEnter={() => !isKeyboardNavigating && setSelectedIndex(resultIndex)}
                                                    >
                                                        <div className="font-medium">
                                                            {highlightText(locationName, debouncedQuery)}
                                                        </div>
                                                        {(location.shortFormattedAddress || location.formattedAddress) && (
                                                            <div className="text-xs text-[#7A8E74] mt-0.5">
                                                                {location.shortFormattedAddress || location.formattedAddress}
                                                            </div>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>,
                        document.body
                    )
                    : <div 
                        ref={resultsRef}
                        className="w-full rounded-2xl bg-white shadow-2xl border border-[#E6F2E2] overflow-y-auto absolute max-h-80 mt-2"
                        style={{ 
                            position: 'absolute', 
                            zIndex: 9999,
                        }}
                    >
                        {results.cities.length > 0 && (
                            <div className="p-3 border-b border-[#F2F7F0]">
                                <p className="text-xs font-semibold text-[#7A8E74] uppercase tracking-wide mb-2">
                                    Градове {results.cities.length > 0 && `(${results.cities.length})`}
                                </p>
                                <ul className="space-y-1">
                                    {results.cities.map((city, cityIndex) => {
                                        const resultIndex = cityIndex;
                                        const isSelected = selectedIndex === resultIndex;
                                        return (
                                            <li key={city.bulgarianName}>
                                                <button
                                                    type="button"
                                                    data-result-index={resultIndex}
                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#0D2F13] ${
                                                        isSelected 
                                                            ? 'bg-[#EAF6E7] border border-[#1B4712]' 
                                                            : 'hover:bg-[#F5FBF3]'
                                                    }`}
                                                    onClick={() => onCitySelect(city.bulgarianName)}
                                                    onMouseEnter={() => !isKeyboardNavigating && setSelectedIndex(resultIndex)}
                                                >
                                                    {highlightText(city.bulgarianName, debouncedQuery)}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {results.locations.length > 0 && (
                            <div className="p-3">
                                <p className="text-xs font-semibold text-[#7A8E74] uppercase tracking-wide mb-2">
                                    Обекти {results.locations.length > 0 && `(${results.locations.length})`}
                                </p>
                                <ul className="space-y-1">
                                    {results.locations.map((location, locIndex) => {
                                        const resultIndex = results.cities.length + locIndex;
                                        const isSelected = selectedIndex === resultIndex;
                                        const locationName = location.displayName?.text || location.name;
                                        return (
                                            <li key={location.placeId || location.id}>
                                                <button
                                                    type="button"
                                                    data-result-index={resultIndex}
                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#0D2F13] ${
                                                        isSelected 
                                                            ? 'bg-[#EAF6E7] border border-[#1B4712]' 
                                                            : 'hover:bg-[#F5FBF3]'
                                                    }`}
                                                    onClick={() => onLocationSelect(location)}
                                                    onMouseEnter={() => !isKeyboardNavigating && setSelectedIndex(resultIndex)}
                                                >
                                                    <div className="font-medium">
                                                        {highlightText(locationName, debouncedQuery)}
                                                    </div>
                                                    {(location.shortFormattedAddress || location.formattedAddress) && (
                                                        <div className="text-xs text-[#7A8E74] mt-0.5">
                                                            {location.shortFormattedAddress || location.formattedAddress}
                                                        </div>
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default LocationSearchBar;



