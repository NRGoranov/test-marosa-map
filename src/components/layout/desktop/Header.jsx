import React from 'react';
import { FiExternalLink } from 'react-icons/fi'; // Import the icon
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
                <div className="relative inline-flex items-center space-x-2 px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-[#266819] hover:opacity-90 focus:outline-none">
                    <span>
                        Онлайн магазин
                    </span>

                    <FiExternalLink className="w-4 h-4" />
                </div>
            </a>
        </header>
    );
};

export default Header;