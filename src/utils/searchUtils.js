import { SEARCH_PLACEHOLDER_BG } from './searchConfig';

export { SEARCH_PLACEHOLDER_BG };

/**
 * Normalize text for searching (handles Cyrillic/Latin, removes accents, etc.)
 */
function normalizeText(text, locale = 'bg-BG') {
    if (!text) return '';
    return text.toLocaleLowerCase(locale).trim();
}

/**
 * Calculate relevance score for a match
 * Higher score = better match
 */
function calculateRelevanceScore(text, searchTerm, matchType) {
    const normalizedText = normalizeText(text);
    const normalizedSearch = normalizeText(searchTerm);
    
    // Exact match gets highest score
    if (normalizedText === normalizedSearch) return 100;
    
    // Starts with gets high score
    if (normalizedText.startsWith(normalizedSearch)) return 80;
    
    // Word boundary match (starts a word) gets good score
    const wordBoundaryRegex = new RegExp(`\\b${normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (wordBoundaryRegex.test(normalizedText)) return 60;
    
    // Contains match gets lower score
    if (normalizedText.includes(normalizedSearch)) return 40;
    
    // Fuzzy match (typo tolerance) gets lowest score
    if (fuzzyMatch(normalizedText, normalizedSearch)) return 20;
    
    return 0;
}

/**
 * Simple fuzzy matching for typo tolerance
 */
function fuzzyMatch(text, pattern) {
    if (!text || !pattern) return false;
    
    // If pattern is very short, require exact match
    if (pattern.length <= 2) return text.includes(pattern);
    
    // Allow 1 character difference for longer patterns
    let patternIndex = 0;
    let textIndex = 0;
    let errors = 0;
    const maxErrors = Math.floor(pattern.length * 0.2); // Allow 20% errors
    
    while (textIndex < text.length && patternIndex < pattern.length) {
        if (text[textIndex] === pattern[patternIndex]) {
            patternIndex++;
        } else {
            errors++;
            if (errors > maxErrors) return false;
        }
        textIndex++;
    }
    
    return patternIndex >= pattern.length - Math.floor(pattern.length * 0.2);
}

/**
 * Search locations by multiple fields with relevance scoring
 */
function searchLocation(location, searchTerm, locale) {
    const normalizedSearch = normalizeText(searchTerm, locale);
    if (!normalizedSearch) return { score: 0, matchType: null };
    
    let maxScore = 0;
    let matchType = null;
    
    // Search in displayName.text (primary field)
    if (location.displayName?.text) {
        const score = calculateRelevanceScore(location.displayName.text, searchTerm, 'name');
        if (score > maxScore) {
            maxScore = score;
            matchType = 'name';
        }
    }
    
    // Search in name (fallback)
    if (location.name) {
        const score = calculateRelevanceScore(location.name, searchTerm, 'name');
        if (score > maxScore) {
            maxScore = score;
            matchType = 'name';
        }
    }
    
    // Search in formattedAddress
    if (location.formattedAddress) {
        const score = calculateRelevanceScore(location.formattedAddress, searchTerm, 'address') * 0.7;
        if (score > maxScore) {
            maxScore = score;
            matchType = 'address';
        }
    }
    
    // Search in shortFormattedAddress
    if (location.shortFormattedAddress) {
        const score = calculateRelevanceScore(location.shortFormattedAddress, searchTerm, 'address') * 0.7;
        if (score > maxScore) {
            maxScore = score;
            matchType = 'address';
        }
    }
    
    return { score: maxScore, matchType };
}

/**
 * Enhanced search utility function for filtering locations and cities
 * 
 * Features:
 * - Multi-field search (name, address)
 * - Relevance scoring and ranking
 * - Fuzzy matching for typo tolerance
 * - Better Cyrillic/Latin handling
 * - Word boundary matching
 * 
 * @param {string} searchTerm - The search query
 * @param {Array} allLocations - Array of all locations
 * @param {Array} allCities - Array of all cities
 * @param {Object} options - Search options
 * @param {number} options.maxResults - Maximum number of results per category (default: 20)
 * @returns {Object} Object with matching cities and locations: { cities: [], locations: [] }
 */
export function filterLocationsByQuery(searchTerm, allLocations, allCities, options = {}) {
    if (!searchTerm || searchTerm.trim() === '') {
        return { cities: [], locations: [] };
    }

    const { maxResults = 20 } = options;
    const trimmedSearchTerm = searchTerm.trim();
    const isCyrillic = /[а-яА-Я]/.test(trimmedSearchTerm);
    const locale = isCyrillic ? 'bg-BG' : 'en-US';

    // Filter and score cities
    const cityResults = (allCities || [])
        .map(city => {
            const nameToSearch = isCyrillic ? city.bulgarianName : city.englishName;
            if (!nameToSearch) return null;
            
            const score = calculateRelevanceScore(nameToSearch, trimmedSearchTerm, 'city');
            return score > 0 ? { ...city, _searchScore: score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b._searchScore - a._searchScore)
        .slice(0, maxResults)
        .map(({ _searchScore, ...city }) => city); // Remove score from result

    // Filter and score locations
    const locationResults = (allLocations || [])
        .map(location => {
            const { score, matchType } = searchLocation(location, trimmedSearchTerm, locale);
            return score > 0 ? { ...location, _searchScore: score, _matchType: matchType } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b._searchScore - a._searchScore)
        .slice(0, maxResults)
        .map(({ _searchScore, _matchType, ...location }) => location); // Remove metadata from result

    return {
        cities: cityResults,
        locations: locationResults
    };
}
