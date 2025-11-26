import React from 'react';

import StarRating from '../../../assets/StarRating';
import ShareLocationIcon from '../../../assets/icons/ShareLocationIcon';
import DirectionsIcon from '../../../assets/icons/DirectionsIcon';

const LocationListItem = ({
    location,
    isSelected,
    isHovered,
    onSelect,
    onHover,
    onShare,
}) => {
    if (!location) {
        return null;
    }

    const title = location.displayName?.text || location.name;
    const city = location.shortFormattedAddress || location.formattedAddress;
    const ratingValue = Number(location.rating) || 5;
    const photoUrl = location.imageUrl || 'https://i.imgur.com/g2a4JAh.png';
    const mapsUrl = location.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title)}&query_place_id=${location.placeId}`;

    return (
        <li
            className={`rounded-2xl border px-4 py-3 transition-all duration-200 cursor-pointer ${
                isSelected
                    ? 'border-[#1B4712] bg-[#EAF6E7] shadow-inner'
                    : 'border-[#E6F2E2] hover:border-[#C9F0C2] bg-white'
            } ${isHovered ? 'shadow-[0_12px_30px_rgba(0,0,0,0.08)]' : ''}`}
            onClick={() => onSelect(location)}
            onMouseEnter={() => onHover(location.placeId)}
            onMouseLeave={() => onHover(null)}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <img 
                        src={photoUrl} 
                        alt={title} 
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#7A8E74]">{city}</p>
                    <p className="text-lg font-semibold text-[#0D2F13] truncate">{title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[#1B4712]">
                        <StarRating rating={ratingValue} starSize="text-xs" />
                        <span className="text-sm font-semibold">{ratingValue.toFixed(1)}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="p-2 rounded-full bg-[#C9F0C2] text-[#1B4712] hover:bg-[#b3e6ac] transition-all flex items-center justify-center"
                        aria-label="Насоки"
                    >
                        <DirectionsIcon className="w-4 h-4" />
                    </a>
                    <button
                        type="button"
                        aria-label="Сподели обекта"
                        className="p-2 rounded-full border border-[#E6F2E2] text-[#1B4712] hover:bg-[#C9F0C2] transition-all"
                        onClick={(event) => {
                            event.stopPropagation();
                            onShare(location);
                        }}
                    >
                        <ShareLocationIcon className="w-4 h-4 text-[#1B4712]" />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default LocationListItem;




