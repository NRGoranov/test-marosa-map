import React from 'react';

const MapIcon = ({ className }) => (
    <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Left panel - bent towards viewer (slightly wider at top, creating perspective) */}
        {/* Top edge angles forward, bottom edge angles back */}
        <path 
            d="M2 3L1.8 3.1L5 1.8L5.2 1.7L2 3Z" 
            fill="white" 
        />
        <path 
            d="M1.8 3.1L1.6 17.2L4.8 16L5 1.8L1.8 3.1Z" 
            fill="white" 
        />
        {/* Middle panel - flat, backmost (narrower, ~2px wide) */}
        <path 
            d="M6.5 4L8.3 3.7L8.3 16.8L6.5 17.1L6.5 4Z" 
            fill="white" 
        />
        {/* Right panel - flat, frontmost (narrower, ~6px wide with spacing) */}
        <path 
            d="M12.2 1.8L12.2 16.4L17.8 15.1L17.8 0.5L12.2 1.8Z" 
            fill="white" 
        />
    </svg>
);

export default MapIcon;
