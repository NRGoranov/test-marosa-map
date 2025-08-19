import React, { useState, useEffect, useCallback } from 'react';
import { FiCopy, FiMail, FiX } from 'react-icons/fi';
import { FaViber, FaFacebookMessenger } from 'react-icons/fa';

const MobileShareModal = ({ isOpen, onClose, place }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setIsCopied(false), 300);
        }
    }, [isOpen]);

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
                alert('Не може да се копира линка. Проверете конзолата за грешки.');
            });
    }, [googleMapsUrl]);

    if (!isOpen || !place) {
        return null;
    }

    const encodedUrl = encodeURIComponent(googleMapsUrl);

    const shareOptions = [
        {
            name: 'Копирай линка',
            icon: <FiCopy size={24} />,
            action: handleCopy,
            isLink: false
        },
        {
            name: 'Messenger',
            icon: <FaFacebookMessenger size={24} />,
            href: `fb-messenger://share/?link=${encodedUrl}`,
            isLink: true
        },
        {
            name: 'Viber',
            icon: <FaViber size={24} />,
            href: `viber://forward?text=${encodedUrl}`,
            isLink: true
        },
        {
            name: 'Email',
            icon: <FiMail size={24} />,
            href: `mailto:?subject=Упътване до ${encodeURIComponent(place.name)}&body=Координатите на даденната точка: ${encodedUrl}`,
            isLink: true
        }
    ];

    const ShareButton = ({ option }) => {
        if (option.isLink) {
            return (
                <a href={option.href} className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg text-center" target="_blank" rel="noopener noreferrer">
                    <div className="text-green-800 mb-2">{option.icon}</div>
                    <span className="text-sm font-medium">{option.name}</span>
                </a>
            );
        }

        return (
            <button onClick={option.action} className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg text-center">
                <div className="text-green-800 mb-2">{option.icon}</div>
                <span className="text-sm font-medium">{isCopied ? 'Копирано!' : option.name}</span>
            </button>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-lg p-6 m-4 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Сподели този обект</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {shareOptions.map((option) => (
                        <ShareButton key={option.name} option={option} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MobileShareModal;