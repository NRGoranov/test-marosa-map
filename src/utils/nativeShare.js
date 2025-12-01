import { isMobileDevice } from './mobileUtils';

/**
 * Shows a confirmation dialog asking user if they want to open the app
 * @param {string} appName - Name of the app
 * @returns {Promise<boolean>} True if user wants to open app, false otherwise
 */
const confirmOpenApp = (appName) => {
    return new Promise((resolve) => {
        const userConfirmed = window.confirm(`Отвори ли приложението ${appName}?`);
        resolve(userConfirmed);
    });
};

/**
 * Attempts to open a deep link after user confirmation
 * @param {string} deepLink - The deep link URL scheme
 * @param {string} fallbackUrl - The web URL to open if user declines or app not installed
 * @param {string} appName - Name of the app for confirmation dialog
 */
const tryDeepLink = async (deepLink, fallbackUrl, appName) => {
    if (!isMobileDevice()) {
        window.open(fallbackUrl, '_blank');
        return;
    }

    // Ask user if they want to open the app
    const userWantsApp = await confirmOpenApp(appName);
    
    if (userWantsApp) {
        // User confirmed - try to open the app
        window.location.href = deepLink;
    } else {
        // User declined - open browser
        window.open(fallbackUrl, '_blank');
    }
};

/**
 * Checks if Web Share API is available
 * @returns {boolean}
 */
export const isWebShareAvailable = () => {
    return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Uses Web Share API if available, otherwise falls back to deep links
 * @param {Object} shareData - { title, text, url }
 * @param {Function} fallbackFn - Function to call if Web Share fails
 */
export const tryWebShare = async (shareData, fallbackFn) => {
    if (isWebShareAvailable()) {
        try {
            await navigator.share(shareData);
            return true;
        } catch (error) {
            // User cancelled or share failed
            if (error.name !== 'AbortError') {
                fallbackFn();
            }
            return false;
        }
    } else {
        fallbackFn();
        return false;
    }
};

/**
 * Facebook native share
 * @param {string} url - URL to share
 * @param {string} text - Text to share
 */
export const shareToFacebook = async (url, text = '') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
    if (!isMobileDevice()) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
        return;
    }

    // Try Facebook app share dialog
    const fbLink = `fb://facewebmodal/f?href=${encodedUrl}`;
    const fbFallback = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    await tryDeepLink(fbLink, fbFallback, 'Facebook');
};

/**
 * Messenger native share
 * @param {string} url - URL to share
 */
export const shareToMessenger = async (url) => {
    const encodedUrl = encodeURIComponent(url);
    
    if (!isMobileDevice()) {
        window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}`, '_blank');
        return;
    }

    const deepLink = `fb-messenger://share/?link=${encodedUrl}`;
    const fallback = `https://www.messenger.com/t/?link=${encodedUrl}`;
    
    await tryDeepLink(deepLink, fallback, 'Messenger');
};

/**
 * Viber native share
 * @param {string} url - URL to share
 * @param {string} text - Text to share
 */
export const shareToViber = async (url, text = '') => {
    const encodedText = encodeURIComponent(text ? `${text} ${url}` : url);
    
    if (!isMobileDevice()) {
        window.open(`https://invite.viber.com/?text=${encodedText}`, '_blank');
        return;
    }

    // Try forward scheme first
    const forwardLink = `viber://forward?text=${encodedText}`;
    const fallback = `https://invite.viber.com/?text=${encodedText}`;
    
    await tryDeepLink(forwardLink, fallback, 'Viber');
};

/**
 * Instagram native share
 * Opens Instagram direct messages where user can paste and send the link
 * @param {string} url - URL to share
 * @param {string} text - Text to share
 */
export const shareToInstagram = async (url, text = '') => {
    const shareText = text ? `${text} ${url}` : url;
    
    if (!isMobileDevice()) {
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
        return;
    }

    // Copy link to clipboard first
    try {
        await navigator.clipboard.writeText(shareText);
    } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
    }

    // Open Instagram direct messages
    const directLink = `instagram://direct-inbox`;
    const fallback = 'https://www.instagram.com/direct/inbox/';
    
    await tryDeepLink(directLink, fallback, 'Instagram');
};

/**
 * Email native share
 * @param {string} url - URL to share
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 */
export const shareToEmail = (url, subject = '', body = '') => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body ? `${body}\n\n${url}` : url);
    
    // mailto works on both mobile and desktop
    window.location.href = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
};

/**
 * TikTok native share
 * Note: TikTok has no public deep-link API for sharing
 * Workaround: Copy link and open TikTok (user can paste in messages)
 * @param {string} url - URL to share
 */
export const shareToTikTok = async (url) => {
    if (!isMobileDevice()) {
        window.open('https://www.tiktok.com/', '_blank');
        return;
    }

    // Copy link to clipboard first
    try {
        await navigator.clipboard.writeText(url);
    } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
    }

    // Try to open TikTok app (user can paste link in messages)
    const deepLink = 'tiktok://';
    const fallback = 'https://www.tiktok.com/';
    
    await tryDeepLink(deepLink, fallback, 'TikTok');
};

