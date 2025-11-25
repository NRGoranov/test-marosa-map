import React, { useState } from 'react';

const getAriaLabel = (type, isFullscreen) => {
    if (type === 'fullscreen') {
        return isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
    }
    return `Zoom ${type}`;
};

const getIcon = (type, isFullscreen, iconStyle) => {
    switch (type) {
        case 'in':
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ ...iconStyle, strokeWidth: '3' }}>
                    <line x1="10" y1="3" x2="10" y2="17" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                </svg>
            );
        case 'out':
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ ...iconStyle, strokeWidth: '3' }}>
                    <line x1="3" y1="10" x2="17" y2="10" />
                </svg>
            );
        case 'fullscreen':
            return isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" style={iconStyle} fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" style={iconStyle} fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M3 9V3h6M21 15v6h-6" />
                </svg>
            );
        default:
            return null;
    }
};

const MapButton = ({ onClick, type, isFullscreen = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    const style = {
        backgroundColor: isHovered ? '#f0f9f0' : '#ffffff',
        border: 'none',
        borderRadius: '12px',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        transition: 'background-color 0.2s ease-in-out',
    };

    const iconStyle = {
        stroke: '#0A4A28',
        strokeWidth: '2',
    };

    return (
        <button
            style={style}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={getAriaLabel(type, isFullscreen)}
        >
            {getIcon(type, isFullscreen, iconStyle)}
        </button>
    );
};

export default MapButton;

