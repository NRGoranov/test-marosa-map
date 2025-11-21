import React from 'react';

import LocationListItem from './location-list-item/LocationListItem';

const LocationList = (props) => {
    const wrapperClasses = props.isMobileView
        ? "flex flex-col gap-4 min-w-0"
        : "grid grid-cols-2 gap-6 min-w-0";

    return (
        <div className={wrapperClasses}>
            {props.locations.map(location => (
                <LocationListItem
                    ref={props.itemRefs ? (el => (props.itemRefs.current[location.placeId] = el)) : null}
                    key={location.placeId}
                    location={location}
                    onClick={() => props.onListItemClick(location)}
                    onMouseOver={() => props.onListItemHover(location.placeId)}
                    onMouseOut={() => props.onListItemHover(null)}
                    onShareClick={props.onShareClick} 
                    isHovered={props.hoveredPlaceId === location.placeId}
                    isSelected={props.selectedPlaceId === location.placeId}
                    isMobileView={props.isMobileView}
                />
            ))}
        </div>
    );
};

export default LocationList;