import React from 'react';

import { checkIfOpen } from '../../utils/timeUtils';
import DirectionsIcon from '../../assets/icons/DirectionsIcon';
import ShareLocationIcon from '../../assets/icons/ShareLocationIcon';

const CustomInfoWindowCard = ({ location, onClose, onShareClick }) => {
    if (!location) return null;

    const status = checkIfOpen(location);
    const photoUrl = location.imageUrl || 'https://i.imgur.com/g2a4JAh.png';
    const mapsUrl = location.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.displayName.text)}&query_place_id=${location.placeId}`;

    return (
        <div className="bg-white rounded-2  xl rounded-tr-[60px] flex items-center p-4 space-x-3 relative font-montserrat border border-gray-200 shadow-lg" style={{ width: '450px' }}>
            <div className="flex-shrink-0">
                <img src={photoUrl} alt={location.displayName.text} className="w-20 h-20 rounded-lg object-cover" />
            </div>
            <div className="flex-grow pr-24">
                <h3 className="text-lg font-bold text-gray-800 leading-tight">{location.displayName.text}</h3>
                
                <div className="text-sm mt-1 flex items-baseline gap-x-2">
                    <span className={`font-semibold ${status.color}`}>
                        {status.statusText}
                    </span>
                    <span className="text-gray-500 font-medium">
                        {status.detailText}
                    </span>
                </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex gap-2">
                {onShareClick && (
                    <button
                        onClick={() => onShareClick(location)}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all hover:scale-105"
                        aria-label="Share location"
                    >
                        <ShareLocationIcon className="w-5 h-5 text-[#1B4712]" />
                    </button>
                )}
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#C9F0C2] flex items-center justify-center shadow-sm hover:bg-[#b3e6ac] transition-all hover:scale-105"
                    aria-label="Get directions"
                >
                    <DirectionsIcon fill="#1B4712" className="w-5 h-5" />
                </a>
            </div>
        </div>
    );
};

export default CustomInfoWindowCard;