import React from 'react';

const BrochureLinkIcon = ({
    size = 20,
    stroke = 'currentColor',
    strokeWidth = 1.5,
    className = '',
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M7 3H17C18.1046 3 19 3.89543 19 5V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V5C5 3.89543 5.89543 3 7 3Z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
        />
        <path
            d="M15 3V7.5C15 8.05228 14.5523 8.5 14 8.5H9"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="9" cy="12" r="0.9" fill={stroke} />
        <circle cx="9" cy="16" r="0.9" fill={stroke} />
        <path
            d="M11.5 12H16"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
        />
        <path
            d="M11.5 16H16"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
        />
    </svg>
);

export default BrochureLinkIcon;

