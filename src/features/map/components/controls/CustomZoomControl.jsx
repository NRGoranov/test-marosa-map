import React from 'react';

import MapButton from './MapButton';

const controlStyles = {
    position: 'absolute',
    right: '20px',
    bottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 5,
};

const CustomZoomControl = ({ map }) => {
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

    return (
        <div style={controlStyles}>
            <MapButton onClick={handleZoomIn} type="in" />
            <MapButton onClick={handleZoomOut} type="out" />
        </div>
    );
};

export default CustomZoomControl;




