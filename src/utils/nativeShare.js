import { isMobileDevice } from './mobileUtils';

/**
 * Attempts to open a deep link and falls back to web URL if app is not installed
 * @param {string} deepLink - The deep link URL scheme
 * @param {string} fallbackUrl - The web URL to open if deep link fails
 * @param {number} timeout - Timeout in ms before falling back (default: 500)
 */
const tryDeepLink = (deepLink, fallbackUrl, timeout = 500) => {
    if (!isMobileDevice()) {
        window.open(fallbackUrl, '_blank');
        return;
    }

    // Try to open the deep link
    const startTime = Date.now();
    window.location.href = deepLink;

    // Fallback after timeout if app didn't open
    setTimeout(() => {
        const elapsed = Date.now() - startTime;
        // If page is still visible after timeout, app likely didn't open
        if (elapsed >= timeout - 100) {
            window.open(fallbackUrl, '_blank');
        }
    }, timeout);
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
export const shareToFacebook = (url, text = '') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
    if (!isMobileDevice()) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
        return;
    }

    // Try Messenger share first (better for direct sharing)
    const messengerLink = `fb-messenger://share?link=${encodedUrl}`;
    const messengerFallback = `https://www.facebook.com/dialog/send?link=${encodedUrl}`;
    
    tryDeepLink(messengerLink, messengerFallback);
    
    // Also try Facebook app share dialog
    setTimeout(() => {
        const fbLink = `fb://facewebmodal/f?href=${encodedUrl}`;
        const fbFallback = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        tryDeepLink(fbLink, fbFallback, 300);
    }, 100);
};

/**
 * Messenger native share
 * @param {string} url - URL to share
 */
export const shareToMessenger = (url) => {
    const encodedUrl = encodeURIComponent(url);
    
    if (!isMobileDevice()) {
        window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}`, '_blank');
        return;
    }

    const deepLink = `fb-messenger://share/?link=${encodedUrl}`;
    const fallback = `https://www.messenger.com/t/?link=${encodedUrl}`;
    
    tryDeepLink(deepLink, fallback);
};

/**
 * Viber native share
 * @param {string} url - URL to share
 * @param {string} text - Text to share
 */
export const shareToViber = (url, text = '') => {
    const encodedText = encodeURIComponent(text ? `${text} ${url}` : url);
    
    if (!isMobileDevice()) {
        window.open(`https://invite.viber.com/?text=${encodedText}`, '_blank');
        return;
    }

    // Try forward scheme first
    const forwardLink = `viber://forward?text=${encodedText}`;
    const fallback = `https://invite.viber.com/?text=${encodedText}`;
    
    tryDeepLink(forwardLink, fallback);
};

/**
 * Instagram native share
 * Note: Instagram doesn't support link-only sharing via deep link
 * Best approach: Copy link and open Instagram
 * @param {string} url - URL to share
 * @param {string} text - Text to share
 */
export const shareToInstagram = async (url, text = '') => {
    const shareText = text ? `${text} ${url}` : url;
    
    if (!isMobileDevice()) {
        window.open('https://www.instagram.com/', '_blank');
        return;
    }

    // Copy link to clipboard first
    try {
        await navigator.clipboard.writeText(shareText);
    } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
    }

    // Try Instagram share scheme (limited support)
    const shareLink = `instagram://share?text=${encodeURIComponent(shareText)}`;
    const cameraLink = `instagram://camera`;
    const fallback = 'https://www.instagram.com/';
    
    // Try share first, then camera, then fallback
    tryDeepLink(shareLink, cameraLink, 300);
    setTimeout(() => {
        tryDeepLink(cameraLink, fallback, 300);
    }, 400);
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
 * Workaround: Copy link and open TikTok
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

    // Try to open TikTok app
    const deepLink = 'tiktok://';
    const fallback = 'https://www.tiktok.com/';
    
    tryDeepLink(deepLink, fallback);
};

