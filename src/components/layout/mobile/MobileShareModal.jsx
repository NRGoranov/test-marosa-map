import React, { useState, useEffect, useCallback } from 'react';
import { FiCopy, FiMail, FiX } from 'react-icons/fi';
import { FaViber, FaFacebookMessenger, FaStar } from 'react-icons/fa';

import StarRating from '../../ui/StarRating';
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

    const googleMapsUrl = place?.mapsUrl || '';

    const handleCopy = useCallback(() => {
        console.log('Attempting to copy URL:', googleMapsUrl);

        if (!googleMapsUrl) {
            console.error('Copy failed: URL is empty.');
            return;
        }

        navigator.clipboard.writeText(googleMapsUrl)
            .then(() => {
                setIsCopied(true);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Не може да се копира линка.');
            });
    }, [googleMapsUrl]);

    if (!isOpen || !place) {
        return null;
    }

    const imageUrl = place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 400 }) || place.icon;

    const encodedUrl = encodeURIComponent(googleMapsUrl);

    const openingHoursInfo = checkIfOpen(place);

    const shareOptions = [
        { name: 'Copy Link', icon: <FiCopy size={22} />, action: handleCopy, isLink: false },
        { name: 'Messenger', icon: <FaFacebookMessenger size={22} />, href: `fb-messenger://share/?link=${encodedUrl}`, isLink: true },
        { name: 'Viber', icon: <FaViber size={22} />, href: `viber://forward?text=${encodedUrl}`, isLink: true },
        { name: 'Email', icon: <FiMail size={22} />, href: `mailto:?subject=Упътване до ${encodeURIComponent(place.name)}&body=Координатите на даденната точка: ${encodedUrl}`, isLink: true }
    ];

    const ShareButton = ({ option }) => {
        const buttonClasses = "flex items-center p-4 w-full h-14 gap-2 bg-white border border-gray-200 rounded-tl-xl rounded-tr-[36px] rounded-br-xl rounded-bl-xl hover:bg-gray-50 transition-colors";

        if (option.isLink) {
            return (
                <a href={option.href} className={buttonClasses} target="_blank" rel="noopener noreferrer">
                    <div className="text-green-800 text-[13px]">{option.icon}</div>
                    <span className="font-medium text-gray-800 text-[14px]">{option.name}</span>
                </a>
            );
        }

        return (
            <button onClick={option.action} className={buttonClasses}>
                <div className="text-green-800">{option.icon}</div>
                <span className="font-medium text-gray-800 text-[14px]">{isCopied && option.action === handleCopy ? 'Copied!' : option.name}</span>
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
                            alt={place.name}
                            className="w-18 h-18 rounded-2xl object-cover bg-gray-100"
                        />
                    )}
                    <div>
                        <h3 className="font-bold text-base text-[#00562A]">{place.name}</h3>

                        <div className="flex items-center gap-1">
                            <span className="font-medium text-xs text-[#8F8F8F] leading-[15px]">{place.rating?.toFixed(1)}</span>
                            <StarRating rating={place.rating} starSize="text-sm" />
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