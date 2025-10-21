import React from 'react';

import SocialIcon from '../../assets/icons/SocialIcon';
import TikTokIcon from '../../assets/icons/TikTokIcon';
import InstagramIcon from '../../assets/icons/InstagramIcon';
import FacebookIcon from '../../assets/icons/FacebookIcon';
import CloseIcon from '../../assets/icons/CloseIcon';
import SimpleExternalLinkIcon from '../../assets/icons/SimpleExternalLinkIcon';
import DownloadIcon from '../../assets/icons/DownloadIcon';
import ShareIcon from '../../assets/icons/ShareIcon';
import HomeIcon from '../../assets/icons/HomeIcon';
import Divider from '../../assets/Divider';

const MenuSidebar = ({
    onClose,
    onHomeClick,
    onShareClick,
}) => {
    return (
        <div className="w-full h-full bg-white shadow-lg flex flex-col">
            <div className="flex-shrink-0 bg-[#1B4712]">
                <div className="flex justify-between items-center p-4 py-4 max-w-7xl mx-auto w-full" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <h3 className="text-xl font-medium text-white ml-5">
                        Меню
                    </h3>

                    <button onClick={onClose} className="p-5">
                        <CloseIcon />
                    </button>
                </div>
            </div>

            <div className="w-full bg-[#1B4712] h-1"></div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6">
                    <button onClick={onHomeClick} className="h-20 text-lg font-medium text-[#1B4712] hover:text-green-600 inline-flex items-center w-full">
                        <HomeIcon />

                        <span>
                            Начало
                        </span>
                    </button>
                </div>

                <Divider />

                <div className="px-6">
                    <a href="https://marossa.bg/" target="_blank" rel="noopener noreferrer" className="h-20 text-lg font-medium text-[#1B4712] hover:text-green-600 inline-flex items-center w-full">
                        <SimpleExternalLinkIcon className="mr-3 w-5 h-5" />

                        <span>
                            Онлайн Магазин
                        </span>
                    </a>
                </div>

                <Divider />

                <div className="px-6">
                    <a href="/marosabrochure.pdf" download="Мароса_Брошура_2025.pdf" className="h-20 text-lg font-medium text-[#1B4712] hover:text-green-600 inline-flex items-center w-full">
                        <DownloadIcon className="mr-3 w-5 h-5" />

                        <span>
                            Свали Брошура (PDF)
                        </span>
                    </a>
                </div>

                <Divider />

                <div className="px-6">
                    <button onClick={onShareClick} className="h-20 text-lg font-medium text-[#1B4712] hover:text-green-600 inline-flex items-center w-full">
                        <ShareIcon className="mr-3 w-5 h-5" />

                        <span>
                            Сподели Брошурата
                        </span>
                    </button>
                </div>

                <Divider />
            </div>

            <div className="flex-shrink-0 bg-[#1B4712] p-6 mt-auto">
                <p className="text-sm font-medium text-white text-center mb-4">
                    Нашите социални мрежи:
                </p>

                <div className="flex justify-center space-x-6">
                    <SocialIcon href="https://www.tiktok.com/@nedev.bg?_t=ZN-8xUznEkh4Mg" label="TikTok">
                        <TikTokIcon />
                    </SocialIcon>

                    <SocialIcon href="https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag==" label="Instagram">
                        <InstagramIcon />
                    </SocialIcon>

                    <SocialIcon href="https://www.facebook.com/profile.php?id=100066825065618&mibextid=wwXIfr&rdid=DRgwWGKxU6pj0XCp&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AyCVr3drn%2F%3DwwXIfr" label="Facebook">
                        <FacebookIcon />
                    </SocialIcon>
                </div>
            </div>
        </div>
    );
};

export default MenuSidebar;