import React from 'react';
import { BsFileText } from 'react-icons/bs';

import SocialIcon from '../../../assets/icons/SocialIcon';
import TikTokIcon from '../../../assets/icons/TikTokIcon';
import InstagramIcon from '../../../assets/icons/InstagramIcon';
import FacebookIcon from '../../../assets/icons/FacebookIcon';

const Footer = () => {
    return (
        <footer className="flex justify-between items-center w-full">

            <a 
                href="/brochure" 
                className="flex items-center text-sm text-[#1B4712] hover:text-[#15380e] transition-colors group"
            >
                <span className="mr-1 text-gray-600 group-hover:text-[#1B4712]">Разгледайте нашата</span>
                <span className="font-bold underline decoration-1 underline-offset-2">Брошура</span>
                <BsFileText className="ml-2 w-4 h-4" />
            </a>

            <div className="flex space-x-3">
                <SocialIcon href="https://www.tiktok.com/@nedev.bg?_t=ZN-8xUznEkh4Mg" label="TikTok"><TikTokIcon /></SocialIcon>
                <SocialIcon href="https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag==" label="Instagram"><InstagramIcon /></SocialIcon>
                <SocialIcon href="https://www.facebook.com/profile.php?id=100066825065618&mibextid=wwXIfr&rdid=DRgwWGKxU6pj0XCp&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AyCVr3drn%2F%3Fmibextid%3DwwXIfr" label="Facebook"><FacebookIcon /></SocialIcon>
            </div>
            
        </footer>
    );
};

export default Footer;