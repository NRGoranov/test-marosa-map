import React from 'react';
import MapIcon from '../../assets/icons/MapIcon';
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
            />
        </button>
    );
};

export default BackToMapButton;

