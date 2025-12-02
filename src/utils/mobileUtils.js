/**
 * Detects if the current device is a mobile device (iOS or Android)
 * @returns {boolean} True if device is iOS or Android
 */
export const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Detects if the current device is iOS
 * @returns {boolean} True if device is iOS
 */
export const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * Detects if the current device is Android
 * @returns {boolean} True if device is Android
 */
export const isAndroid = () => {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
};


