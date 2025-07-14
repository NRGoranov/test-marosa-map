import React from 'react';

import Logo from '../../../assets/icons/Logo';
import SearchIcon from '../../../assets/icons/SearchIcon';
import BurgerMenuIcon from '../../../assets/icons/BurgerMenuIcon';

const MobileViewHeader = ({ onSearchClick, onMenuClick, onLogoClick, isMenuOpen }) => {
    const buttonBaseStyles = "p-1.5 rounded-lg border-1 transition-colors";
    const activeBorder = "border-[#1B4712]";
    const inactiveBorder = "border-[#AFE8A4]";

    const LogoWrapper = onLogoClick ? 'button' : 'div';

    return (
        <header className="flex justify-between items-center">
            <LogoWrapper 
                onClick={onLogoClick} 
                className="w-28"
                aria-label={onLogoClick ? "Go to homepage" : undefined}
            >
                <Logo />
            </LogoWrapper>

            <div className="flex items-center space-x-3">
                <button onClick={onSearchClick} aria-label="Search locations" className="p-2">
                    <SearchIcon />
                </button>
                <button
                    onClick={onMenuClick}
                    aria-label="Open menu"
                    className={`${buttonBaseStyles} ${isMenuOpen ? activeBorder : inactiveBorder}`}
                >
                    <BurgerMenuIcon />
                </button>
            </div>
        </header>
    );
};

export default MobileViewHeader;