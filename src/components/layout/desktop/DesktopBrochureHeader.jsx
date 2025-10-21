import React from "react";

import Logo from "../../../assets/icons/Logo";
import BurgerMenuIcon from "../../../assets/icons/BurgerMenuIcon";

const DesktopBrochureHeader = ({ 
    onLogoClick, 
    onMenuClick, 
    pageLabel, 
    onPageLabelClick 
}) => {
    return (
        <header className="flex-shrink-0 w-full bg-white shadow-sm py-4 px-8 border-b border-gray-200">
            <div className="flex justify-between items-center w-full">
                <div className="w-40 cursor-pointer" onClick={onLogoClick}>
                    <Logo />
                </div>

                <button onClick={onPageLabelClick} className="hover:opacity-80 transition-opacity" aria-label="Open page thumbnails">
                    <span className="bg-[#C9F0C2] text-[#1B4712] font-bold text-sm px-3 py-2 rounded-lg">
                        {pageLabel}
                    </span>
                </button>

                <div className="w-40 flex justify-end">
                    <button onClick={onMenuClick} className="text-[#00562A] hover:opacity-80 flex flex-col items-center" aria-label="Toggle menu">
                        <div className="w-10 h-10 border-2 border-[#1B4712] rounded-lg flex justify-center items-center">
                            <BurgerMenuIcon />
                        </div>

                        <span className="mt-1 font-medium text-sm">Меню</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DesktopBrochureHeader;