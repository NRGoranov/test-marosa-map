import React from 'react';

import { checkIfOpen } from '../../utils/timeUtils';
//import StarRating from '../ui/StarRating';
import DirectionsIcon from '../../assets/icons/DirectionsIcon';

const CustomInfoWindowCard = ({ location, onClose }) => {
    if (!location) return null;

    const status = checkIfOpen(location);
    const photoUrl = location.imageUrl || 'https://i.imgur.com/g2a4JAh.png';
    const mapsUrl = location.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.displayName.text)}&query_place_id=${location.placeId}`;

    return (
        <div className="bg-white rounded-2xl flex items-center p-3 space-x-3 relative font-montserrat" style={{ width: '450px' }}>
            <button onClick={onClose} className="absolute top-2 -right-0.5 text-gray-400 hover:text-gray-700 focus:outline-none" aria-label="Close" >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
            <div className="flex-shrink-0">
                <img src={photoUrl} alt={location.displayName.text} className="w-20 h-20 rounded-lg object-cover" />
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-800 leading-tight pr-8">{location.displayName.text}</h3>
                
                {/*
                {location.rating && (
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-medium text-gray-600">{location.rating.toFixed(1)}</span>
                        <StarRating rating={location.rating} starSize="text-sm" />
                    </div>
                )}
                */}

                <div className="text-sm mt-1 flex items-baseline gap-x-2">
                    <span className={`font-semibold ${status.color}`}>
                        {status.statusText}
                    </span>
                    <span className="text-gray-500 font-medium">
                        {status.detailText}
                    </span>
                </div>
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors" aria-label="Get directions">
                <DirectionsIcon />
            </a>
        </div>
    );
};

export default CustomInfoWindowCard;