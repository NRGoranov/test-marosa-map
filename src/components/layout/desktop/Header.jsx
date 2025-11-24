import React from 'react';
import { FiExternalLink } from 'react-icons/fi';

import Logo from '../../../assets/icons/Logo';

const Header = () => {
    return (
        <header className="flex items-start justify-between w-full"> 
            <a href="/" aria-label="Homepage" className="flex-shrink-0">
                <div className="w-40 lg:w-52 cursor-pointer">
                    <Logo />
                </div>
            </a>

            <a
                href="https://marossa.bg/shop/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0" 
            >
                <div className="relative inline-flex items-center gap-2 pl-6 pr-2 py-2 border border-transparent text-sm font-bold rounded-full text-white bg-[#1B4712] hover:bg-[#15380E] focus:outline-none transition-colors">
                    <span>
                        Онлайн магазин
                    </span>

                    <div className="w-8 h-8 bg-[#4F7A42] rounded-full flex items-center justify-center">
                        <FiExternalLink className="w-4 h-4" />
                    </div>
                </div>
            </a>
        </header>
    );
};

export default Header;