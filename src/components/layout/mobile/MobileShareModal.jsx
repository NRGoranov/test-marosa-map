import React, { useState, useEffect, useCallback } from 'react';
import { FiCopy, FiMail, FiX } from 'react-icons/fi';
import { FaViber, FaFacebookMessenger, FaWhatsapp, FaTwitter, FaFacebook } from 'react-icons/fa';

import StarRating from '../../../assets/StarRating';
import { checkIfOpen } from '../../../utils/timeUtils';

const MobileShareModal = ({ isOpen, onClose, place }) => {
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
        // First check if mapsUrl is already provided
        if (place?.mapsUrl && place.mapsUrl.trim() !== '') {
            return place.mapsUrl;
        }
        
        // Try to construct from place data
        if (place?.place_id) {
            return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
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
                return `https://www.google.com/maps?q=${lat},${lng}`;
            }
        }
        
        // Try position (for locations from API)
        if (place?.position?.lat && place?.position?.lng) {
            return `https://www.google.com/maps?q=${place.position.lat},${place.position.lng}`;
        }
        
        // Try lat/lng directly
        if (place?.lat && place?.lng) {
            return `https://www.google.com/maps?q=${place.lat},${place.lng}`;
        }
        
        // Fallback to name search
        const name = place?.name || place?.displayName?.text || '';
        if (name) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
        }
        
        return '';
    };

    const googleMapsUrl = getMapsUrl();

    const handleCopy = useCallback(() => {
        console.log('Attempting to copy URL:', googleMapsUrl);

        if (!googleMapsUrl) {
            console.error('Copy failed: URL is empty.');
            alert('Няма линк за копиране.');
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(googleMapsUrl)
                .then(() => {
                    setIsCopied(true);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    alert('Не може да се копира линка.');
                });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = googleMapsUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setIsCopied(true);
                document.body.removeChild(textArea);
            } catch (err) {
                console.error('Could not copy text: ', err);
                alert('Не може да се копира линка.');
                document.body.removeChild(textArea);
            }
        }
    }, [googleMapsUrl]);

    const handleNativeShare = useCallback(async () => {
        if (!googleMapsUrl) {
            alert('Няма линк за споделяне.');
            return;
        }

        const shareData = {
            title: place?.name || 'Мароса Градина',
            text: `Разгледайте: ${place?.name || 'Мароса Градина'}`,
            url: googleMapsUrl,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                onClose();
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback to copy if Web Share API not available
            handleCopy();
        }
    }, [googleMapsUrl, place, handleCopy, onClose]);

    if (!isOpen || !place) {
        return null;
    }

    const imageUrl = place.photos?.[0]?.getUrl?.({ maxWidth: 400, maxHeight: 400 }) || place.icon || place.imageUrl;
    const encodedUrl = googleMapsUrl ? encodeURIComponent(googleMapsUrl) : '';
    const locationName = place?.name || place?.displayName?.text || 'Мароса Градина';
    const shareText = `Разгледайте: ${locationName}`;
    const openingHoursInfo = checkIfOpen(place);

    // Build share options array
    const shareOptions = [];
    
    // Add native share if available (only on mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
        shareOptions.push({
            name: 'Share', 
            icon: <FiCopy size={22} />, 
            action: handleNativeShare, 
            isLink: false
        });
    }
    
    // Always add copy link
    shareOptions.push({
        name: isCopied ? 'Copied!' : 'Copy Link', 
        icon: <FiCopy size={22} />, 
        action: handleCopy, 
        isLink: false
    });
    
    // Add WhatsApp
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'WhatsApp', 
            icon: <FaWhatsapp size={22} />, 
            href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`,
            isLink: true 
        });
    }
    
    // Add Facebook
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Facebook', 
            icon: <FaFacebook size={22} />, 
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            isLink: true 
        });
    }
    
    // Add Messenger
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Messenger', 
            icon: <FaFacebookMessenger size={22} />, 
            href: `fb-messenger://share/?link=${encodedUrl}`,
            fallbackHref: `https://www.facebook.com/dialog/send?link=${encodedUrl}`,
            isLink: true 
        });
    }
    
    // Add X/Twitter
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'X (Twitter)', 
            icon: <FaTwitter size={22} />, 
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`,
            isLink: true 
        });
    }
    
    // Add Viber
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Viber', 
            icon: <FaViber size={22} />, 
            href: `viber://forward?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`,
            fallbackHref: `https://invite.viber.com/?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`,
            isLink: true 
        });
    }
    
    // Add Email
    if (googleMapsUrl) {
        shareOptions.push({
            name: 'Email', 
            icon: <FiMail size={22} />, 
            href: `mailto:?subject=${encodeURIComponent('Упътване до ' + locationName)}&body=${encodeURIComponent('Координатите на даденната точка: ' + googleMapsUrl)}`,
            isLink: true 
        });
    }

    const ShareButton = ({ option }) => {
        const buttonClasses = "flex items-center p-4 w-full h-14 gap-2 bg-white border border-gray-200 rounded-tl-xl rounded-tr-[36px] rounded-br-xl rounded-bl-xl hover:bg-gray-50 transition-colors";

        if (option.isLink) {
            const handleLinkClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!option.href) {
                    return;
                }

                // Mailto links work directly
                if (option.href.startsWith('mailto:')) {
                    window.location.href = option.href;
                    return;
                }

                // Deep links (viber://, fb-messenger://)
                if (option.href.startsWith('viber://') || option.href.startsWith('fb-messenger://')) {
                    // Try deep link directly first
                    const link = document.createElement('a');
                    link.href = option.href;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Fallback to web version after timeout if app not installed
                    const fallbackTimer = setTimeout(() => {
                        if (option.fallbackHref) {
                            window.open(option.fallbackHref, '_blank', 'noopener,noreferrer');
                        }
                    }, 500);

                    // Clear fallback if app opens successfully (user navigates away)
                    window.addEventListener('blur', () => {
                        clearTimeout(fallbackTimer);
                    }, { once: true });
                } else if (option.href.startsWith('http')) {
                    // Regular web links
                    window.open(option.href, '_blank', 'noopener,noreferrer');
                }
            };

            return (
                <button onClick={handleLinkClick} className={buttonClasses}>
                    <div className="text-green-800 text-[13px]">{option.icon}</div>
                    <span className="font-medium text-gray-800 text-[14px]">{option.name}</span>
                </button>
            );
        }

        return (
            <button onClick={option.action} className={buttonClasses}>
                <div className="text-green-800">{option.icon}</div>
                <span className="font-medium text-gray-800 text-[14px]">{option.name}</span>
            </button>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl sm:rounded-xl shadow-lg p-5 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#00562A]">Сподели този обект</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-4 py-2">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={locationName}
                            className="w-18 h-18 rounded-2xl object-cover bg-gray-100"
                        />
                    )}
                    <div>
                        <h3 className="font-bold text-base text-[#00562A]">{locationName}</h3>

                        <div className="flex items-center gap-1">
                            <span className="font-medium text-xs text-[#8F8F8F] leading-[15px]">{(place.rating || 5).toFixed(1)}</span>
                            <StarRating rating={place.rating || 5} starSize="text-sm" />
                        </div>

                        <p className="text-sm font-medium mt-1">
                            <span className={openingHoursInfo.color}>{openingHoursInfo.statusText}</span>
                            {openingHoursInfo.detailText && (
                                <span className="text-gray-500 ml-2">{openingHoursInfo.detailText}</span>
                            )}
                        </p>
                    </div>
                </div>

                <hr className="my-4 border-gray-200" />

                <div className="grid grid-cols-2 gap-3">
                    {shareOptions.map((option) => (
                        <ShareButton key={option.name} option={option} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MobileShareModal;