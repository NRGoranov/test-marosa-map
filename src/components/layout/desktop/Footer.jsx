import React from 'react';
import { Link } from 'react-router-dom';

import SocialIcon from '../../../assets/icons/SocialIcon';
import TikTokIcon from '../../../assets/icons/TikTokIcon';
import InstagramIcon from '../../../assets/icons/InstagramIcon';
import FacebookIcon from '../../../assets/icons/FacebookIcon';
import BrochureIcon from '../../../assets/icons/DesktopBrochureIcon';

const Footer = () => {
    return (
        <footer className="flex justify-between items-center">

            {/* Променен клас от text-sm на text-base */}
            <p className="text-base text-[#1B4712] flex items-center space-x-2">
                <span>Разгледайте нашата</span>

                <Link
                    to="/brochure"
                    className="font-bold text-[#00562A] bg-[#C9F0C2] py-2 px-4 rounded-2xl border border-[#00562A] hover:bg-[#b8e8b1] transition-colors duration-200 flex items-center space-x-2"
                >
                    <BrochureIcon className="h-5 w-5 text-[#00562A]" /> 
                    <span>Брошура</span>
                </Link>
            </p>

            <div className="flex space-x-4">
                <SocialIcon href="https://www.tiktok.com/@nedev.bg?_t=ZN-8xUznEkh4Mg" label="TikTok">
                    <TikTokIcon />
                </SocialIcon>

                <SocialIcon href="https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag==" label="Instagram">
                    <InstagramIcon />
                </SocialIcon>

                <SocialIcon href="https://www.facebook.com/profile.php?id=100066825065618&mibextid=wwXIfr&rdid=DRgwWGKxU6pj0XCp&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AyCVr3drn%2F%3Fmibextid%3DwwXIfr" label="Facebook">
                    <FacebookIcon />
                </SocialIcon>
            </div>
        </footer>
    );
};

export default Footer;