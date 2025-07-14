import React from 'react';

import MapButton from './MapButton';

const CustomZoomControl = ({ map, onToggleFullscreen, isFullscreen }) => {
    const handleZoomIn = () => {
        if (map) {
            const currentZoom = map.getZoom();
            map.setZoom(currentZoom + 1);
        }
    };

    const handleZoomOut = () => {
        if (map) {
            const currentZoom = map.getZoom();
            map.setZoom(currentZoom - 1);
        }
    };

    const containerStyle = {
        position: 'absolute',
        right: '20px',
        top: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 5,
    };

    return (
        <div style={containerStyle}>
            <MapButton onClick={handleZoomIn} type="in" />
            <MapButton onClick={handleZoomOut} type="out" />
            <MapButton onClick={onToggleFullscreen} type="fullscreen" isFullscreen={isFullscreen} />
        </div>
    );
};

export default CustomZoomControl;