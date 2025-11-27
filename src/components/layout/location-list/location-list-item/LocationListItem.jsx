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
                <div className="relative rounded-2xl rounded-tr-[40px] overflow-hidden">
                    <img
                        src={photoUrl}
                        alt={location.displayName?.text}
                        className="w-full h-[220px] object-cover rounded-2xl rounded-tr-[40px]"
                        loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 z-10">
                        {onShareClick && (
                            <button
                                onClick={handleShare}
                                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md"
                                aria-label="Share location"
                            >
                                <ShareLocationIcon className="w-5 h-5 text-[#00562A]" />
                            </button>
                        )}
                    </div>
                    <div className="absolute bottom-4 right-4 z-10">
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#00562A] flex items-center justify-center shadow-md"
                            aria-label="Get directions"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <DirectionsIcon fill="#AFE8A4" />
                        </a>
                    </div>
                </div>
                <div className="mt-5 space-y-3">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-[20px] font-semibold leading-snug text-[#00562A]">
                            {location.displayName?.text}
                        </h3>
                        <div className="flex items-center gap-1 text-[#00562A]">
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
            className={`group relative bg-white transition-all duration-300 ease-out overflow-visible flex flex-col ${
                !isMobileView ? 'rounded-tl-[24px] rounded-tr-[80px] rounded-br-[24px] rounded-bl-[24px] w-[380px] h-[408px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]' : ''
            }`}
            style={{ gap: '20px', paddingLeft: !isMobileView ? '20px' : '0', paddingRight: !isMobileView ? '20px' : '0', paddingBottom: !isMobileView ? '20px' : '0', paddingTop: !isMobileView ? '0' : '0', boxSizing: 'border-box' }}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            {/* Image Section */}
            <div
                onClick={onClick}
                className={`relative overflow-hidden cursor-pointer rounded-tl-[24px] rounded-tr-[80px] rounded-br-[24px] rounded-bl-[24px] ${
                    !isMobileView ? 'w-[340px] h-[259px]' : ''
                }`}
            >
                <img
                    src={photoUrl}
                    alt={location.displayName?.text}
                    className="w-full h-full object-cover rounded-tl-[24px] rounded-tr-[80px] rounded-br-[24px] rounded-bl-[24px]"
                    loading="lazy"
                />
                {/* Action Buttons - Share on left, Directions on right */}
                <div className="absolute bottom-2 left-2 z-10">
                    {onShareClick && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShare(e);
                            }}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all hover:scale-105"
                            aria-label="Share location"
                        >
                            <ShareLocationIcon className="w-3.5 h-3.5 text-[#00562A]" />
                        </button>
                    )}
                </div>
                <div className="absolute bottom-2 right-2 z-10">
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-[#C9F0C2] flex items-center justify-center shadow-sm hover:bg-[#b3e6ac] transition-all hover:scale-105"
                        aria-label="Get directions"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <DirectionsIcon fill="#00562A" className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* Content Section */}
            <div className={`bg-white min-w-0 overflow-visible ${!isMobileView ? 'w-[340px]' : ''} flex flex-col`} style={{ gap: '8px', padding: !isMobileView ? '0' : undefined, flex: '1 1 auto' }}>
                {/* Store Name */}
                <h3
                    onClick={onClick}
                    className="font-bold text-[18px] text-[#00562A] font-['Montserrat',sans-serif] leading-tight cursor-pointer break-words line-clamp-2"
                >
                    {location.displayName?.text}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-[#00562A]">{ratingValue.toFixed(1)}</span>
                    <StarRating rating={ratingValue} starSize="text-xs" />
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${status.isOpen ? 'text-[#00562A]' : 'text-[#9C2E18]'}`}>
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

