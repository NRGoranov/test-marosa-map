import React from 'react';

const SocialIcon = ({ href, label, children }) => (
    <a href={href} aria-label={label} className="text-[#1B4712] transition-opacity duration-300 hover:opacity-80">
        <div className="w-10 h-10 rounded-full bg-[#C9F0C2] flex items-center justify-center">
            {children}
        </div>
    </a>
);

export default SocialIcon;