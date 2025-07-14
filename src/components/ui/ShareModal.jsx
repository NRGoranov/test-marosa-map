import React from "react";

import CopyIcon from "../../assets/icons/CopyIcon";
import EmailIcon from "../../assets/icons/EmailIcon";
import FacebookShareIcon from "../../assets/icons/FacebookShareIcon";
import ViberIcon from "../../assets/icons/ViberIcon";
import MessengerIcon from "../../assets/icons/MessengerIcon";

const ShareModal = ({ isOpen, onClose, location, details, mapUrl }) => {
    if (!isOpen) return null;

    const shareText = `Вижте местоположението на ${details?.name || location.name}`;

    const shareOptions = [
        { name: 'CopyLink', icon: CopyIcon, action: () => { navigator.clipboard.writeText(mapUrl); alert('Линкът е копиран!'); onClose(); } },
        { name: 'Facebook', icon: FacebookShareIcon, action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mapUrl)}`, '_blank') },
        { name: 'Messenger', icon: MessengerIcon, action: () => window.open(`fb-messenger://share?link=${encodeURIComponent(mapUrl)}`, '_blank') },
        { name: 'Viber', icon: ViberIcon, action: () => window.open(`viber://forward?text=${encodeURIComponent(shareText + ' ' + mapUrl)}`, '_blank') },
        { name: 'Email', icon: EmailIcon, action: () => window.location.href = `mailto:?subject=${encodeURIComponent(details?.name || location.name)}&body=${encodeURIComponent(shareText + ' ' + mapUrl)}` },
    ];

    const photoUrl = details?.photos ? details.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 }) : 'https://i.imgur.com/g2a4JAh.png';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[999] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-montserrat font-semibold text-[28px] leading-none text-[#1B4712]">Сподели този обект</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex items-center bg-gray-50 p-3 rounded-lg mb-6">
                    <img src={photoUrl} alt={details?.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="ml-4 text-left">
                        <h3 className="font-bold text-gray-800">{details?.name}</h3>
                        <p className="text-sm text-gray-500">{details?.opening_hours?.isOpen() ? 'Отворено' : 'Затворено'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    {shareOptions.map(option => (
                        <button 
                            key={option.name} 
                            onClick={option.action}
                            className="box-border flex flex-row items-center justify-center p-4 gap-2.5 w-full h-14 bg-white border border-[#EAEAEA] rounded-[12px_36px_12px_12px] text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                        >
                            <option.icon className={option.name === 'Viber' || option.name === 'Messenger' || option.name === 'Facebook' || option.name === 'CopyLink' ? 'w-7 h-7' : 'w-5 h-5'} />
                            {option.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;