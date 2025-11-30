import React from 'react';
import MapIcon from '@mui/icons-material/Map';
import styles from './BackToMapButton.module.css';

const BackToMapButton = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            className={styles.backToMapButton}
            style={{ zIndex: 10000, position: 'fixed' }}
            aria-label="Върни се към картата"
        >
            <span className={styles.buttonText}>Карта</span>
            <MapIcon 
                className={styles.mapIcon}
                style={{ fontSize: 20, color: 'white' }}
            />
        </button>
    );
};

export default BackToMapButton;

