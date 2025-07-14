import React from 'react';

const TopLeftArrowIcon = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M17 17l-10-10"/>
        <path d="M7 17V7h10"/>
    </svg>
);

export default TopLeftArrowIcon;