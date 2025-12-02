import { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiMail, FiX } from 'react-icons/fi';
import { FaViber, FaFacebookMessenger } from 'react-icons/fa';
import MapIcon from '@mui/icons-material/Map';

import StarRating from '../../../assets/StarRating';
import { checkIfOpen } from '../../../utils/timeUtils';
import FacebookIcon from '../../../assets/icons/FacebookIcon';
import InstagramIcon from '../../../assets/icons/InstagramIcon';
import TikTokIcon from '../../../assets/icons/TikTokIcon';
import { isMobileDevice } from '../../../utils/mobileUtils';
import { 
    isWebShareAvailable, 
    tryWebShare,
    shareToFacebook, 
    shareToMessenger, 
    shareToViber, 
    shareToInstagram, 
    shareToEmail, 
    shareToTikTok 
} from '../../../utils/nativeShare';

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

    // Handle native sharing for mobile devices
    const handleNativeShare = useCallback(async (platform) => {
        if (!googleMapsUrl) return;
        
        const locationName = place?.name || place?.displayName?.text || 'Мароса Градина';
        const shareText = `Разгледайте: ${locationName}`;
        const shareData = {
            title: locationName,
            text: shareText,
            url: googleMapsUrl,
        };

        // Try Web Share API first if available (universal fallback)
        if (isWebShareAvailable() && isMobileDevice()) {
            const shared = await tryWebShare(shareData, () => {
                // Fallback to platform-specific deep links
                switch (platform) {
                    case 'facebook':
                        shareToFacebook(googleMapsUrl, shareText);
                        break;
                    case 'messenger':
                        shareToMessenger(googleMapsUrl);
                        break;
                    case 'viber':
                        shareToViber(googleMapsUrl, shareText);
                        break;
                    case 'instagram':
                        shareToInstagram(googleMapsUrl, shareText);
                        break;
                    case 'email':
                        shareToEmail(googleMapsUrl, `Упътване до ${locationName}`, shareText);
                        break;
                    case 'tiktok':
                        shareToTikTok(googleMapsUrl);
                        break;
                }
            });
            if (shared) return;
        }

        // Platform-specific native sharing
        switch (platform) {
            case 'facebook':
                shareToFacebook(googleMapsUrl, shareText);
                break;
            case 'messenger':
                shareToMessenger(googleMapsUrl);
                break;
            case 'viber':
                shareToViber(googleMapsUrl, shareText);
                break;
            case 'instagram':
                shareToInstagram(googleMapsUrl, shareText);
                break;
            case 'email':
                shareToEmail(googleMapsUrl, `Упътване до ${locationName}`, shareText);
                break;
            case 'tiktok':
                shareToTikTok(googleMapsUrl);
                break;
        }
    }, [googleMapsUrl, place]);

    if (!isOpen || !place) {
        return null;
    }

    const encodedUrl = encodeURIComponent(googleMapsUrl);
    
    // Get image URL with multiple fallbacks - prioritize shop images over map icon
    let imageUrl = null;
    
    // Try all possible shop image sources in priority order
    if (place.image && typeof place.image === 'string' && place.image.trim() !== '') {
        imageUrl = place.image;
    } else if (place.imageUrl && typeof place.imageUrl === 'string' && place.imageUrl.trim() !== '') {
        imageUrl = place.imageUrl;
    } else if (place.coverPhoto && typeof place.coverPhoto === 'string' && place.coverPhoto.trim() !== '') {
        imageUrl = place.coverPhoto;
    } else if (place.gallery && Array.isArray(place.gallery) && place.gallery.length > 0 && place.gallery[0]) {
        const galleryImg = place.gallery[0];
        if (typeof galleryImg === 'string' && galleryImg.trim() !== '') {
            imageUrl = galleryImg;
        }
    } else if (place.photos && Array.isArray(place.photos) && place.photos.length > 0) {
        if (place.photos[0]?.getUrl) {
            try {
                imageUrl = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 600 });
            } catch (e) {
                console.warn('Failed to get photo URL:', e);
            }
        } else if (typeof place.photos[0] === 'string' && place.photos[0].trim() !== '') {
            imageUrl = place.photos[0];
        }
    }
    
    // Use map icon ONLY if no shop images exist
    // Check if we have a valid image URL that's not the default fallback
    const hasShopImage = !!imageUrl && 
                        typeof imageUrl === 'string' &&
                        imageUrl.trim() !== '' &&
                        imageUrl !== 'https://i.imgur.com/g2a4JAh.png' &&
                        !imageUrl.startsWith('data:image/svg');
    
    // Debug logging
    if (import.meta.env.DEV) {
        console.log('ShareModal image detection:', {
            hasShopImage,
            imageUrl,
            placeImage: place.image,
            placeImageUrl: place.imageUrl,
            placeCoverPhoto: place.coverPhoto,
            placeGallery: place.gallery,
            placePhotos: place.photos
        });
    }
    
    const openingHoursInfo = checkIfOpen(place);
    const ratingValue = Number(place.rating) || 5;
    const locationName = place?.name || place?.displayName?.text || 'Мароса Градина';
    const shareText = `Разгледайте: ${locationName}`;

    const shareOptions = [
        {
            name: isCopied ? 'Копирано!' : 'Копирай линка',
            action: handleCopy,
            icon: <FiCopy size={18} />,
            highlight: isCopied,
        },
        {
            name: 'Facebook',
            action: () => handleNativeShare('facebook'),
            icon: <FacebookIcon className="w-5 h-5 text-[#1B4712]" />,
            // Fallback href for desktop
            href: isMobileDevice() ? undefined : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'Messenger',
            action: () => handleNativeShare('messenger'),
            icon: <FaFacebookMessenger size={18} className="text-[#1B4712]" />,
            // Fallback href for desktop
            href: isMobileDevice() ? undefined : `https://www.facebook.com/dialog/send?link=${encodedUrl}`,
        },
        {
            name: 'Instagram',
            action: () => handleNativeShare('instagram'),
            icon: <InstagramIcon className="w-5 h-5 text-[#1B4712]" />,
            // Fallback href for desktop
            href: isMobileDevice() ? undefined : 'https://www.instagram.com/',
        },
        {
            name: 'Viber',
            action: () => handleNativeShare('viber'),
            icon: <FaViber size={18} className="text-[#1B4712]" />,
            // Fallback href for desktop
            href: isMobileDevice() ? undefined : `https://invite.viber.com/?text=${encodeURIComponent(shareText + ' ' + googleMapsUrl)}`,
        },
        {
            name: 'TikTok',
            action: () => handleNativeShare('tiktok'),
            icon: <TikTokIcon className="w-5 h-5 text-[#1B4712]" />,
            // Fallback href for desktop
            href: isMobileDevice() ? undefined : 'https://www.tiktok.com/@nedev.bg',
        },
        {
            name: 'Email',
            action: () => handleNativeShare('email'),
            icon: <FiMail size={18} />,
            // mailto works on both mobile and desktop
            href: `mailto:?subject=${encodeURIComponent('Упътване до ' + locationName)}&body=${encodeURIComponent(shareText + '\n\n' + googleMapsUrl)}`,
        },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 py-4 animate-fadeIn overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white rounded-tl-[48px] rounded-tr-[80px] rounded-br-[48px] rounded-bl-[48px] sm:rounded-[32px] sm:rounded-tr-[100px] shadow-[0_30px_90px_rgba(0,0,0,0.25)] w-full max-w-2xl p-8 space-y-6 animate-scaleIn my-auto"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1B4712] whitespace-nowrap">Сподели този обект</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Затвори"
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6F2E2] transition-all duration-200 hover:bg-[#EAF6E7] hover:border-[#1B4712] hover:scale-110 active:scale-95 flex-shrink-0"
                        style={{ marginTop: '0.125rem', marginLeft: '0.5rem' }}
                    >
                        <FiX size={20} className="transition-transform duration-200 hover:rotate-90" />
                    </button>
                </div>

                <div className="flex gap-4 border-b border-[#E6F2E2] pb-5">
                    <div className="relative group">
                        {hasShopImage && imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={locationName}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover flex-shrink-0 border border-[#E6F2E2] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:border-[#C9F0C2] cursor-pointer"
                                loading="lazy"
                                onError={(e) => {
                                    // Fallback to map icon if image fails to load
                                    console.warn('Image failed to load:', imageUrl);
                                    e.target.style.display = 'none';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) {
                                        fallback.style.display = 'flex';
                                    }
                                }}
                                onLoad={() => {
                                    // Hide map icon when image loads successfully
                                    const mapIconDiv = document.querySelector('.share-modal-map-icon-fallback');
                                    if (mapIconDiv) {
                                        mapIconDiv.style.display = 'none';
                                    }
                                }}
                            />
                        ) : null}
                        <div 
                            className="share-modal-map-icon-fallback w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#E6F2E2] bg-[#F5FBF3] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:border-[#C9F0C2] cursor-pointer" 
                            style={{ display: (hasShopImage && imageUrl) ? 'none' : 'flex' }}
                        >
                            <MapIcon className="w-12 h-12 sm:w-14 sm:h-14 text-[#1B4712]" />
                        </div>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {shareOptions.map((option) => {
                        const baseClasses = `group flex items-center gap-3 rounded-xl rounded-tr-[40px] border px-3 py-2 text-left transition-all duration-300 ${
                            option.highlight 
                                ? 'border-[#1B4712] bg-[#EAF6E7] scale-105' 
                                : 'border-[#E6F2E2] bg-white hover:border-[#C9F0C2] hover:bg-[#F5FBF3] hover:shadow-md hover:scale-105 active:scale-95'
                        }`;

                        // If action is provided, use button; otherwise use anchor with href
                        if (option.action) {
                            return (
                                <button 
                                    key={option.name} 
                                    type="button" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        option.action();
                                    }}
                                    className={baseClasses}
                                >
                                    <span className="w-10 h-10 aspect-square rounded-full flex items-center justify-center bg-[#C9F0C2] text-[#1B4712] transition-all duration-300 group-hover:bg-[#B8E8B0] group-hover:scale-110 group-hover:shadow-sm flex-shrink-0">
                                        <span className="transition-transform duration-300 group-hover:scale-110">
                                            {option.icon}
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold text-[#1B4712] transition-colors duration-300 group-hover:text-[#0D2F13]">{option.name}</span>
                                </button>
                            );
                        }

                        // Fallback to anchor tag for desktop or when no action
                        return (
                            <a
                                key={option.name}
                                href={option.href}
                                onClick={(e) => {
                                    if (option.onClick) {
                                        option.onClick(e);
                                    }
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={baseClasses}
                            >
                                <span className="w-10 h-10 aspect-square rounded-full flex items-center justify-center bg-[#C9F0C2] text-[#1B4712] transition-all duration-300 group-hover:bg-[#B8E8B0] group-hover:scale-110 group-hover:shadow-sm flex-shrink-0">
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




