import React, { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiMail, FiX } from 'react-icons/fi';
import { FaViber, FaFacebookMessenger } from 'react-icons/fa';

import StarRating from '../../../assets/StarRating';
import { checkIfOpen } from '../../../utils/timeUtils';
import FacebookIcon from '../../../assets/icons/FacebookIcon';
import InstagramIcon from '../../../assets/icons/InstagramIcon';
import TikTokIcon from '../../../assets/icons/TikTokIcon';

const ShareModal = ({ isOpen, onClose, place }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => setIsCopied(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const getMapsUrl = () => {
        if (!place) return '';
        if (place?.mapsUrl) return place.mapsUrl;
        if (place?.place_id) return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        if (place?.position?.lat && place?.position?.lng) {
            return `https://www.google.com/maps?q=${place.position.lat},${place.position.lng}`;
        }
        const name = place?.name || place?.displayName?.text;
        return name ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}` : '';
    };

    const googleMapsUrl = getMapsUrl();

    const handleCopy = useCallback(async () => {
        if (!googleMapsUrl) return;
        try {
            await navigator.clipboard.writeText(googleMapsUrl);
            setIsCopied(true);
        } catch (error) {
            console.error('Clipboard copy failed', error);
        }
    }, [googleMapsUrl]);

    if (!isOpen || !place) {
        return null;
    }

    const encodedUrl = encodeURIComponent(googleMapsUrl);
    
    // Get image URL with multiple fallbacks
    let imageUrl = place.imageUrl;
    if (!imageUrl && place.photos?.[0]?.getUrl) {
        try {
            imageUrl = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 600 });
        } catch (e) {
            console.warn('Failed to get photo URL:', e);
        }
    }
    if (!imageUrl && place.icon) {
        imageUrl = place.icon;
    }
    // Final fallback to default image
    if (!imageUrl) {
        imageUrl = 'https://i.imgur.com/g2a4JAh.png';
    }
    
    const openingHoursInfo = checkIfOpen(place);
    const ratingValue = Number(place.rating) || 5;
    const locationName = place?.name || place?.displayName?.text || 'Мароса Градина';
    const shareText = `Разгледайте: ${locationName}`;

    const shareOptions = [
        {
            name: isCopied ? 'Копирано!' : 'Копирай линка',
            action: handleCopy,
            icon: <FiCopy size={14} />,
            highlight: isCopied,
        },
        {
            name: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(shareText)}`,
            icon: <FacebookIcon className="w-5 h-5 text-[#1B4712]" />,
        },
        {
            name: 'Instagram',
            href: `https://www.instagram.com/direct/inbox/`,
            icon: <InstagramIcon className="w-5 h-5 text-[#1B4712]" />,
            onClick: (e) => {
                // Try Instagram app deep link first (mobile)
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    const appLink = `instagram://direct?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`;
                    window.location.href = appLink;
                    // Fallback to web after a short delay if app doesn't open
                    setTimeout(() => {
                        window.open(`https://www.instagram.com/direct/inbox/`, '_blank');
                    }, 500);
                    e.preventDefault();
                }
            },
        },
        {
            name: 'Messenger',
            href: `https://www.facebook.com/dialog/send?link=${encodedUrl}`,
            icon: <FaFacebookMessenger size={18} className="text-[#1B4712]" />,
        },
        {
            name: 'Viber',
            href: `https://invite.viber.com/?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`,
            icon: <FaViber size={18} className="text-[#1B4712]" />,
        },
        {
            name: 'TikTok',
            href: 'https://www.tiktok.com/@nedev.bg',
            icon: <TikTokIcon className="w-5 h-5 text-[#1B4712]" />,
        },
        {
            name: 'Email',
            href: `mailto:?subject=${encodeURIComponent('Упътване до ' + locationName)}&body=${encodeURIComponent(shareText + '\n\n' + googleMapsUrl)}`,
            icon: <FiMail size={14} />,
        },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 py-4 animate-fadeIn overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.25)] w-full max-w-2xl p-6 space-y-5 animate-scaleIn my-auto"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#1B4712]">Сподели този обект</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Затвори"
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6F2E2] transition-all duration-200 hover:bg-[#EAF6E7] hover:border-[#1B4712] hover:scale-110 active:scale-95"
                    >
                        <FiX size={20} className="transition-transform duration-200 hover:rotate-90" />
                    </button>
                </div>

                <div className="flex gap-4 border-b border-[#E6F2E2] pb-4">
                    <div className="relative group">
                        <img
                            src={imageUrl}
                            alt={locationName}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover flex-shrink-0 border border-[#E6F2E2] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:border-[#C9F0C2] cursor-pointer"
                            loading="lazy"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.target.src = 'https://i.imgur.com/g2a4JAh.png';
                            }}
                        />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#1B4712] font-semibold">{ratingValue.toFixed(1)}</span>
                            <StarRating rating={ratingValue} starSize="text-sm" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1B4712] break-words">{locationName}</h3>
                        <p className="text-sm font-medium">
                            <span className={openingHoursInfo.color}>{openingHoursInfo.statusText}</span>
                            {openingHoursInfo.detailText && (
                                <span className="text-[#7A8E74] ml-2">{openingHoursInfo.detailText}</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {shareOptions.map((option) => {
                        const baseClasses = `group flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-300 ${
                            option.highlight 
                                ? 'border-[#1B4712] bg-[#EAF6E7] scale-105' 
                                : 'border-[#E6F2E2] bg-white hover:border-[#C9F0C2] hover:bg-[#F5FBF3] hover:shadow-md hover:scale-105 active:scale-95'
                        }`;

                        if (option.action) {
                            return (
                                <button key={option.name} type="button" onClick={option.action} className={baseClasses}>
                                    <span className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9F0C2] text-[#1B4712] transition-all duration-300 group-hover:bg-[#B8E8B0] group-hover:scale-110 group-hover:shadow-sm">
                                        <span className="transition-transform duration-300 group-hover:scale-110">
                                            {option.icon}
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold text-[#1B4712] transition-colors duration-300 group-hover:text-[#0D2F13]">{option.name}</span>
                                </button>
                            );
                        }

                        return (
                            <a
                                key={option.name}
                                href={option.href}
                                onClick={option.onClick}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={baseClasses}
                            >
                                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9F0C2] text-[#1B4712] transition-all duration-300 group-hover:bg-[#B8E8B0] group-hover:scale-110 group-hover:shadow-sm">
                                    <span className="transition-transform duration-300 group-hover:scale-110">
                                        {option.icon}
                                    </span>
                                </span>
                                <span className="text-sm font-semibold text-[#1B4712] transition-colors duration-300 group-hover:text-[#0D2F13]">{option.name}</span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;




