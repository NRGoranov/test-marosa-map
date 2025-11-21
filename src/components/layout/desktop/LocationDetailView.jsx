import React from 'react';

//import StarRating from '../../ui/StarRating';
import { checkIfOpen } from '../../../utils/timeUtils';
import DirectionsIcon from '../../../assets/icons/DirectionsIcon';

const LocationDetailView = ({ location, onClose }) => {
    if (!location) {
        return <div className="p-4 text-center">Loading details...</div>;
    }

    const status = checkIfOpen(location);
    const photoUrl = location.imageUrl || 'https://i.imgur.com/g2a4JAh.png';
    const locationName = location.displayName?.text || location.name || '';
    const mapsUrl = location.mapsUrl || (locationName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}${location.placeId ? `&query_place_id=${location.placeId}` : ''}` : '#');

    return (
        <div className="p-12.5">
            <div className="relative mb-5">
                <img src={photoUrl} alt={location.displayName.text} className="w-full h-[259px] bg-cover bg-center rounded-[24px_80px_24px_24px] cursor-pointer" />

            </div>
            
            <div className="flex flex-col gap-2 px-2 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-montserrat font-semibold text-2xl leading-[29px] text-[#1B4712] flex-grow cursor-pointer break-words">
                        {location.displayName.text}
                    </h3>
                    <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex justify-center items-center w-9 h-9 bg-[#C9F0C2] rounded-lg hover:opacity-80 transition-opacity"
                        aria-label="Get directions"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DirectionsIcon />
                    </a>
                </div>

                {/*
                {placeDetails.rating && (
                    <div className="flex items-center gap-2">
                        <span className="font-montserrat font-medium text-sm text-[#8F8F8F]">
                            {placeDetails.rating.toFixed(1)}
                        </span>
                        <StarRating rating={placeDetails.rating} starSize="text-sm" />
                    </div>
                )} 
                */}
                
                <div className="flex items-baseline gap-x-2 flex-wrap text-base">
                    <span className={`font-semibold ${status.color}`}>
                        {status.statusText}
                    </span>
                    <span className="font-medium text-gray-500">
                        {status.detailText}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailView;