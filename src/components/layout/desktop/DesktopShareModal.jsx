import React, { useState, useEffect, useCallback } from 'react';
import { FiCopy, FiMail, FiX } from 'react-icons/fi';
import { FaViber, FaFacebookMessenger, FaWhatsapp, FaTwitter, FaFacebook } from 'react-icons/fa';

import StarRating from '../../../assets/StarRating';
import { checkIfOpen } from '../../../utils/timeUtils';
import FacebookIcon from '../../../assets/icons/FacebookIcon';
import InstagramIcon from '../../../assets/icons/InstagramIcon';

const DesktopShareModal = ({ isOpen, onClose, place }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        let timerId;

        if (!isOpen) {
            timerId = setTimeout(() => setIsCopied(false), 300);
        }

        return () => clearTimeout(timerId);
    }, [isOpen]);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);

            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    // Construct the maps URL from various possible sources
    const getMapsUrl = () => {
        console.log('Getting maps URL from place:', place);
        
        // First check if mapsUrl is already provided
        if (place?.mapsUrl && place.mapsUrl.trim() !== '') {
            console.log('Using provided mapsUrl:', place.mapsUrl);
            return place.mapsUrl;
        }
        
        // Try to construct from place data
        if (place?.place_id) {
            const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
            console.log('Constructed URL from place_id:', url);
            return url;
        }
        
        // Try geometry location
        if (place?.geometry?.location) {
            let lat, lng;
            if (typeof place.geometry.location.lat === 'function') {
                lat = place.geometry.location.lat();
                lng = place.geometry.location.lng();
            } else {
                lat = place.geometry.location.lat;
                lng = place.geometry.location.lng;
            }
            if (lat && lng) {
                const url = `https://www.google.com/maps?q=${lat},${lng}`;
                console.log('Constructed URL from coordinates:', url);
                return url;
            }
        }
        
        // Try position (for locations from API)
        if (place?.position?.lat && place?.position?.lng) {
            const url = `https://www.google.com/maps?q=${place.position.lat},${place.position.lng}`;
            console.log('Constructed URL from position:', url);
            return url;
        }
        
        // Try lat/lng directly
        if (place?.lat && place?.lng) {
            const url = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
            console.log('Constructed URL from lat/lng:', url);
            return url;
        }
        
        // Fallback to name search
        const name = place?.name || place?.displayName?.text || '';
        if (name) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
            console.log('Constructed URL from name:', url);
            return url;
        }
        
        console.error('Could not construct maps URL from place data');
        return '';
    };

    const googleMapsUrl = getMapsUrl();
    
    // Log the URL for debugging
    useEffect(() => {
        if (isOpen && place) {
            console.log('DesktopShareModal opened with URL:', googleMapsUrl);
            console.log('Place object:', place);
        }
    }, [isOpen, place, googleMapsUrl]);

    const handleCopy = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const urlToCopy = googleMapsUrl;
        
        if (!urlToCopy || urlToCopy.trim() === '') {
            console.error('Copy failed: URL is empty.', { googleMapsUrl, place });
            alert('Няма линк за копиране.');
            return;
        }

        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(urlToCopy);
                
                // Verify the copy by reading back from clipboard
                try {
                    const clipboardText = await navigator.clipboard.readText();
                    if (clipboardText === urlToCopy) {
                        setIsCopied(true);
                        console.log('Successfully copied and verified:', urlToCopy);
                    } else {
                        console.warn('Copy verification failed. Expected:', urlToCopy, 'Got:', clipboardText);
                        // Still set as copied since write succeeded
                        setIsCopied(true);
                    }
                } catch (readErr) {
                    // If we can't read, assume copy worked (some browsers don't allow reading)
                    console.log('Cannot verify copy (read permission denied), assuming success');
                    setIsCopied(true);
                }
            } catch (err) {
                console.error('Clipboard write failed:', err);
                // Fallback to old method
                fallbackCopy(urlToCopy);
            }
        } else {
            // Fallback for older browsers
            fallbackCopy(urlToCopy);
        }
    }, [googleMapsUrl, place]);

    const fallbackCopy = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                // Try to verify by checking selection
                const selectedText = window.getSelection().toString();
                if (selectedText === text || successful) {
                    setIsCopied(true);
                    console.log('Successfully copied via fallback method:', text);
                } else {
                    alert('Не може да се копира линка. Моля, копирайте ръчно: ' + text);
                }
            } else {
                alert('Не може да се копира линка. Моля, копирайте ръчно: ' + text);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            alert('Не може да се копира линка. Моля, копирайте ръчно: ' + text);
        } finally {
            document.body.removeChild(textArea);
            window.getSelection().removeAllRanges();
        }
    };

    if (!isOpen || !place) {
        return null;
    }

    const encodedUrl = googleMapsUrl ? encodeURIComponent(googleMapsUrl) : '';
    const imageUrl = place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 400 }) || place.icon || place.imageUrl;
    const openingHoursInfo = checkIfOpen(place);
    const ratingValue = Number(place.rating) || 5;

    const locationName = place?.name || place?.displayName?.text || 'Мароса Градина';
    const shareText = `Разгледайте: ${locationName}`;

    const shareOptions = [];
    
    // Always add copy button
    shareOptions.push({
        name: isCopied ? 'Копирано!' : 'Копирай линка', 
        icon: <FiCopy size={20} />, 
        action: handleCopy,
        isCopied: isCopied 
    });
    
    // Add WhatsApp if URL exists (use web version on desktop)
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'WhatsApp', 
            icon: <FaWhatsapp size={20} />, 
            href: `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`
        });
    }
    
    // Add Facebook if URL exists
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Facebook', 
            icon: <FacebookIcon className="w-5 h-5 text-[#1B4712]" />, 
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(shareText)}`
        });
    }
    
    // Add Messenger if URL exists (use web version on desktop)
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Messenger', 
            icon: <FaFacebookMessenger size={20} />, 
            href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=123456789`
        });
    }
    
    // Add X/Twitter if URL exists
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'X (Twitter)', 
            icon: <FaTwitter size={20} />, 
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`
        });
    }
    
    // Add Viber if URL exists (use web version on desktop)
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Viber', 
            icon: <FaViber size={20} />, 
            href: `https://invite.viber.com/?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`
        });
    }
    
    // Add Email if URL exists
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Email', 
            icon: <FiMail size={20} />, 
            href: `mailto:?subject=${encodeURIComponent('Упътване до ' + locationName)}&body=${encodeURIComponent(shareText + '\n\n' + googleMapsUrl)}`
        });
    }
    
    // Always add Instagram (static link)
    shareOptions.push({
        name: 'Instagram', 
        icon: <InstagramIcon className="w-5 h-5 text-[#1B4712]" />, 
        href: 'https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag=='
    });

    const ShareOptionCard = ({ option }) => {
        const isCopyButton = option.isCopied !== undefined;
        const baseClasses = `group flex items-center gap-3 rounded-3xl border px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left transition-all duration-300 hover:shadow-[0_15px_40px_rgba(27,71,18,0.12)] hover:-translate-y-1 cursor-pointer ${
            isCopyButton && option.isCopied 
                ? 'border-[#1B4712] bg-[#EAF6E7]' 
                : 'border-[#E6F2E2] bg-white hover:border-[#C9F0C2]'
        }`;
        const iconClasses = `w-10 h-10 rounded-2xl flex items-center justify-center text-[#1B4712] transition-all duration-300 group-hover:scale-110 ${
            isCopyButton && option.isCopied 
                ? 'bg-[#C9F0C2]' 
                : 'bg-[#EAF6E7] group-hover:bg-[#C9F0C2]'
        }`;
        const textClasses = `text-sm font-semibold transition-colors duration-300 ${
            isCopyButton && option.isCopied 
                ? 'text-[#1B4712]' 
                : 'text-[#1B4712] group-hover:text-[#15380E]'
        }`;

        if (option.action) {
            return (
                <button onClick={option.action} className={baseClasses}>
                    <span className={iconClasses}>
                        {option.icon}
                    </span>
                    <span className={textClasses}>{option.name}</span>
                </button>
            );
        }

        const handleLinkClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!option.href || option.href === '#') {
                console.warn('Share option has no valid href:', option.name);
                return;
            }

            // Mailto links work directly
            if (option.href.startsWith('mailto:')) {
                window.location.href = option.href;
                return;
            }

            // All other links (HTTP/HTTPS) - open in new tab on desktop
            if (option.href.startsWith('http')) {
                window.open(option.href, '_blank', 'noopener,noreferrer');
            }
        };

        return (
            <a
                href={option.href || '#'}
                onClick={handleLinkClick}
                target="_blank"
                rel="noopener noreferrer"
                className={baseClasses}
            >
                <span className={iconClasses}>
                    {option.icon}
                </span>
                <span className="text-sm font-semibold text-[#1B4712] transition-colors duration-300 group-hover:text-[#15380E]">{option.name}</span>
            </a>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.25)] w-full max-w-md p-6 space-y-5"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-[#6D7F69]">Share</p>
                        <h2 className="text-2xl font-semibold text-[#1B4712]">Сподели този обект</h2>
                    </div>
                    <button onClick={onClose} className="text-[#1B4712] hover:opacity-70 transition-opacity">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex gap-4 rounded-[28px] border border-[#E6F2E2] bg-[#F9FFFA] p-4">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={place.name || place.displayName?.text}
                            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                            loading="lazy"
                        />
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-[#1B4712] break-words">{place.name || place.displayName?.text}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#1B4712] font-semibold">{ratingValue.toFixed(1)}</span>
                            <StarRating rating={ratingValue} starSize="text-sm" />
                        </div>
                        <p className="text-sm font-medium">
                            <span className={openingHoursInfo.color}>{openingHoursInfo.statusText}</span>
                            {openingHoursInfo.detailText && (
                                <span className="text-[#7A8E74] ml-2">{openingHoursInfo.detailText}</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {shareOptions.map((option) => (
                        <ShareOptionCard key={option.name} option={option} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesktopShareModal;