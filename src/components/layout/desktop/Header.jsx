import React from 'react';

import Logo from '../../../assets/icons/Logo';

const Header = () => {
    return (
        <header>
            <a href="/" aria-label="Homepage">
                <div className="w-52 cursor-pointer">
                    <Logo />
                </div>
            </a>
        </header>
    );
};

export default Header;