import React from 'react';

import Logo from '../../../assets/icons/Logo';

const buttonBase =
    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors';

const AppHeader = ({ onMenuToggle, onNavigateToBrochure }) => {
    return (
        <header className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Logo className="w-10 h-10" />
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#4A6B40]">Мароса Градина</p>
                    <p className="text-lg font-bold text-[#0D2F13]">Локатор на обекти</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onNavigateToBrochure}
                    className={`${buttonBase} border-[#C9F0C2] text-[#0D2F13] hover:bg-[#EAF6E7]`}
                >
                    Брошура
                </button>
                <button
                    type="button"
                    onClick={onMenuToggle}
                    className={`${buttonBase} border-transparent bg-[#0D2F13] text-white hover:bg-[#12371A]`}
                >
                    Меню
                </button>
            </div>
        </header>
    );
};

export default AppHeader;








