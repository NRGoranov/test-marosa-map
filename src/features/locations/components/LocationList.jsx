import React from 'react';

import LocationListItem from './LocationListItem';

const LocationList = ({
    locations,
    selectedPlaceId,
    hoveredPlaceId,
    onSelect,
    onHover,
    onShare,
}) => {
    if (!locations || locations.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[#D5E7D0] px-4 py-8 text-center text-[#7A8E74]">
                Няма обекти в този изглед. Приближете картата или потърсете друг град.
            </div>
        );
    }

    return (
        <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {locations.map((location) => (
                <LocationListItem
                    key={location.placeId || location.id}
                    location={location}
                    isSelected={selectedPlaceId === (location.id || location.placeId)}
                    isHovered={hoveredPlaceId === location.placeId}
                    onSelect={onSelect}
                    onHover={onHover}
                    onShare={onShare}
                />
            ))}
        </ul>
    );
};

export default LocationList;

