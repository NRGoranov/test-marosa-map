import React from 'react';

const ExternalLinkIcon = ({
    size = 16,
    stroke = 'currentColor',
    strokeWidth = 1.5,
    className = '',
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M4.66602 11.3327L11.3327 4.66602"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M4.66602 4.66602H11.3327V11.3327"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default ExternalLinkIcon;