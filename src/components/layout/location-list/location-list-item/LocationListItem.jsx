import React, { useState } from 'react';

import { checkIfOpen } from '../../../../utils/timeUtils';
import StarRating from '../../../../assets/StarRating';
import DirectionsIcon from '../../../../assets/icons/DirectionsIcon';
import ShareLocationIcon from '../../../../assets/icons/ShareLocationIcon';

const LocationListItem = React.forwardRef(({
    location,
    onClick,
    onMouseOver,
    onMouseOut,
    onShareClick,
    isSelected,
    isHovered,
    isMobileView
}, ref) => {
    const status = checkIfOpen(location);
    const photoUrl = location.imageUrl || (location.photos ? location.photos[0].getUrl({ maxWidth: 680, maxHeight: 518 }) : 'https://i.imgur.com/g2a4JAh.png');
    const locationName = location.displayName?.text || location.name || '';
    const mapsUrl = location.mapsUrl || (locationName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}${location.placeId ? `&query_place_id=${location.placeId}` : ''}` : '#');
    
    const handleShare = (e) => {
        e.stopPropagation();
        onShareClick(location);
    };

    const showShareButton = typeof onShareClick === 'function';
    const ratingValue = Number(location.rating) || 5;

    if (isMobileView) {
        return (
            <article
                ref={ref}
                className="bg-white rounded-2xl rounded-tr-[80px] shadow-[0_18px_60px_rgba(0,0,0,0.12)] p-4 cursor-pointer"
                onClick={onClick}
            >
                <div className="relative rounded-2xl rounded-tr-[80px] overflow-hidden">
                    <img
                        src={photoUrl}
                        alt={location.displayName?.text}
                        className="w-full h-[220px] object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-x-4 bottom-4 flex justify-end gap-3">
                        {onShareClick && (
                            <button
                                onClick={handleShare}
                                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md"
                                aria-label="Share location"
                            >
                                <ShareLocationIcon className="w-5 h-5 text-[#1B4712]" />
                            </button>
                        )}
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#1B4712] flex items-center justify-center shadow-md"
                            aria-label="Get directions"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <DirectionsIcon fill="#AFE8A4" />
                        </a>
                    </div>
                </div>
                <div className="mt-5 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-[20px] font-semibold leading-snug text-[#1B4712]">
                            {location.displayName?.text}
                        </h3>
                        <div className="flex items-center gap-1 text-[#1B4712]">
                            <span className="text-sm font-semibold">5.0</span>
                            <StarRating rating={5} starSize="text-xs" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className={`font-semibold ${status.color}`}>
                            {status.statusText}
                        </span>
                        {status.detailText && (
                            <span className="text-[#7A8E74]">{status.detailText}</span>
                        )}
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article
            ref={ref}
            className={`group relative rounded-2xl rounded-tr-[80px] bg-white transition-all duration-500 ease-out overflow-hidden ${
                !isMobileView && (isSelected || isHovered) ? 'border border-gray-200 shadow-lg' : 'border border-transparent'
            }`}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            {/* Image Section */}
            <div
                onClick={onClick}
                className="relative w-full h-[180px] overflow-hidden cursor-pointer rounded-t-2xl rounded-tr-[80px] rounded-b-2xl"
            >
                <img
                    src={photoUrl}
                    alt={location.displayName?.text}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
                {/* Action Buttons - Under Image */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    {onShareClick && (
                        <button
                            onClick={handleShare}
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
                        onClick={(event) => event.stopPropagation()}
                    >
                        <DirectionsIcon fill="#1B4712" className="w-5 h-5" />
                    </a>
                </div>
            </div>

            {/* Content Section */}
            <div className={`bg-white px-6 pt-5 pb-6 space-y-3 min-w-0 overflow-hidden rounded-b-2xl`}>
                {/* Store Name */}
                <h3
                    onClick={onClick}
                    className="font-bold text-[18px] text-[#1B4712] font-['Montserrat',sans-serif] leading-tight cursor-pointer break-words line-clamp-2"
                >
                    {location.displayName?.text}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-[#1B4712]">{ratingValue.toFixed(1)}</span>
                    <StarRating rating={ratingValue} starSize="text-xs" />
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${status.isOpen ? 'text-[#1B4712]' : 'text-[#9C2E18]'}`}>
                        {status.statusText}
                    </span>
                    {status.detailText && (
                        <span className="text-[#7A8E74]">{status.detailText}</span>
                    )}
                </div>
            </div>
        </article>
    );
});

LocationListItem.displayName = 'LocationListItem';

export default LocationListItem;

