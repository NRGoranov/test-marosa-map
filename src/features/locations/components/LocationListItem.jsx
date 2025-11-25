import React from 'react';

import StarRating from '../../../assets/StarRating';
import ShareIcon from '../../../assets/icons/ShareIcon';

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
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#7A8E74]">{city}</p>
                    <p className="text-lg font-semibold text-[#0D2F13] truncate">{title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[#1B4712]">
                        <StarRating rating={ratingValue} starSize="text-xs" />
                        <span className="text-sm font-semibold">{ratingValue.toFixed(1)}</span>
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Сподели обекта"
                    className="p-2 rounded-full border border-[#E6F2E2] text-[#1B4712] hover:bg-[#C9F0C2]"
                    onClick={(event) => {
                        event.stopPropagation();
                        onShare(location);
                    }}
                >
                    <ShareIcon className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
};

export default LocationListItem;

