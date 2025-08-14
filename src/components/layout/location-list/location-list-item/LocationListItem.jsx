import React, { useState } from 'react';

import { checkIfOpen } from '../../../../utils/timeUtils';

import StarRating from '../../../ui/StarRating';
import DirectionsIcon from '../../../../assets/icons/DirectionsIcon';
import ShareLocationIcon from '../../../../assets/icons/ShareLocationIcon';


const LocationListItem = React.forwardRef(({
    location,
    details,
    onClick,
    onMouseOver,
    onMouseOut,
    isSelected,
    isHovered,
    isMobileView
}, ref) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const status = details ? checkIfOpen(details) : { statusText: "Зарежда се...", detailText: "", color: "text-gray-500" };
    const photoUrl = location.imageUrl
        ? location.imageUrl
        : (details?.photos ? details.photos[0].getUrl({ maxWidth: 680, maxHeight: 518 }) : 'https://i.imgur.com/g2a4JAh.png');
    const mapsUrl = location.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(details?.name)}`;

    const handleShare = (e) => {
        e.stopPropagation();
        setIsShareModalOpen(true);
    };

    const cardWrapperClassName = `p-1 rounded-[26px_82px_26px_26px] transition-all duration-200 ${!isMobileView && (isSelected || isHovered) ? 'ring-2 ring-offset-2 ring-[#1B4712]' : ''
        }`;

    return (
        <>
            <div
                ref={ref}
                className={`w-[340px] ${cardWrapperClassName}`}
                onMouseOver={!isMobileView ? onMouseOver : undefined}
                onMouseOut={!isMobileView ? onMouseOut : undefined}
            >
                <div className="flex flex-col gap-5">
                    <div
                        onClick={onClick}
                        className="w-full h-[259px] bg-cover bg-center rounded-[24px_80px_24px_24px] cursor-pointer"
                        style={{ backgroundImage: `url(${photoUrl})` }}
                    ></div>

                    <div className="flex flex-col gap-2 px-2 pb-2">
                        <div className="flex justify-between items-start gap-2">
                            <h3 onClick={onClick} className="font-montserrat font-semibold text-2xl leading-[29px] text-[#1B4712] flex-grow cursor-pointer break-words">
                                {location.name || details?.name}
                            </h3>

                            <div className="flex items-center space-x-2 flex-shrink-0">
                                {isMobileView && (
                                    <button
                                        onClick={handleShare}
                                        className="flex justify-center items-center w-9 h-9 bg-[#C9F0C2] rounded-[9px] hover:opacity-80 transition-opacity"
                                        aria-label="Share location"
                                    >
                                        <ShareLocationIcon className="w-5 h-5 text-[#1B4712]" />
                                    </button>
                                )}

                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex justify-center items-center w-9 h-9 bg-[#C9F0C2] rounded-[9px] hover:opacity-80 transition-opacity"
                                    aria-label="Get directions"
                                >
                                    <DirectionsIcon />
                                </a>
                            </div>
                        </div>

                        {details?.rating && (
                            <div className="flex items-center gap-2">
                                <span className="font-montserrat font-medium text-sm text-[#8F8F8F]">
                                    {details.rating.toFixed(1)}
                                </span>
                                <StarRating rating={details.rating} starSize="text-sm" />
                            </div>
                        )}

                        <div className="flex items-baseline gap-x-2 flex-wrap">
                            <span className={`font-montserrat font-semibold text-base ${status.color}`}>
                                {status.statusText}
                            </span>
                            <span className="font-montserrat font-medium text-base text-[#8F8F8F]">
                                {status.detailText}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default LocationListItem;