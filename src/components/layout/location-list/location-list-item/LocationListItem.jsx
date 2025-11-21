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
                className="bg-white rounded-[36px] shadow-[0_18px_60px_rgba(0,0,0,0.12)] p-4 cursor-pointer"
                onClick={onClick}
            >
                <div className="relative rounded-[32px] overflow-hidden">
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
            className={`group relative rounded-3xl bg-white border border-[#E4F1DF] shadow-[0_20px_60px_rgba(27,71,18,0.08)] transition-all duration-300 overflow-hidden ${
                !isMobileView && (isSelected || isHovered) ? 'ring-2 ring-[#1B4712]/30 shadow-[0_25px_80px_rgba(27,71,18,0.15)] translate-y-[-4px]' : 'hover:shadow-[0_25px_80px_rgba(27,71,18,0.12)] hover:-translate-y-1'
            }`}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            {/* Image Section */}
            <div
                onClick={onClick}
                className="relative w-full h-[220px] overflow-hidden cursor-pointer"
            >
                <img
                    src={photoUrl}
                    alt={location.displayName?.text}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {onShareClick && (
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110"
                            aria-label="Share location"
                        >
                            <ShareLocationIcon className="w-5 h-5 text-[#1B4712]" />
                        </button>
                    )}
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[#1B4712] flex items-center justify-center shadow-lg hover:bg-[#15380E] transition-all hover:scale-110"
                        aria-label="Get directions"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <DirectionsIcon fill="#AFE8A4" className="w-5 h-5" />
                    </a>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white p-6 space-y-4 min-w-0 overflow-hidden">
                {/* Store Name */}
                <h3
                    onClick={onClick}
                    className="font-bold text-2xl text-[#1B4712] font-['Montserrat',sans-serif] leading-tight cursor-pointer break-words line-clamp-2"
                >
                    {location.displayName?.text}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-[#1B4712]">{ratingValue.toFixed(1)}</span>
                    <StarRating rating={ratingValue} starSize="text-base" />
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-base">
                    <span className={`font-semibold ${status.isOpen ? 'text-[#1B4712]' : 'text-[#9C2E18]'}`}>
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

export default LocationListItem;