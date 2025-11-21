import { SEARCH_PLACEHOLDER_BG } from './searchConfig';

export { SEARCH_PLACEHOLDER_BG };

/**
 * Shared search utility function for filtering locations and cities
 * 
 * This function matches the mobile search behavior:
 * - Searches cities by bulgarianName or englishName
 * - Searches locations by displayName.text
 * 
 * @param {string} searchTerm - The search query
 * @param {Array} allLocations - Array of all locations
 * @param {Array} allCities - Array of all cities
 * @returns {Object} Object with matching cities and locations: { cities: [], locations: [] }
 */
export function filterLocationsByQuery(searchTerm, allLocations, allCities) {
    if (!searchTerm || searchTerm.trim() === '') {
        return { cities: [], locations: [] };
    }

    const trimmedSearchTerm = searchTerm.trim();
    const isCyrillic = /[а-яА-Я]/.test(trimmedSearchTerm);
    const lowerCaseSearchTerm = trimmedSearchTerm.toLocaleLowerCase(isCyrillic ? 'bg-BG' : 'en-US');

    // Filter cities by name
    const matchingCities = (allCities || []).filter(city => {
        const nameToSearch = isCyrillic ? city.bulgarianName : city.englishName;
        if (!nameToSearch) return false;
        return nameToSearch.toLocaleLowerCase(isCyrillic ? 'bg-BG' : 'en-US').includes(lowerCaseSearchTerm);
    });

    // Filter locations by displayName.text
    // Prioritize matches that start with the search term
    const startsWithMatches = (allLocations || []).filter(loc => {
        const locationName = loc.displayName?.text;
        if (!locationName) return false;
        return locationName.toLocaleLowerCase('bg-BG').startsWith(lowerCaseSearchTerm);
    });

    // Include matches that contain the search term but don't start with it
    const includesMatches = (allLocations || []).filter(loc => {
        const locationName = loc.displayName?.text;
        if (!locationName) return false;
        const lowerName = locationName.toLocaleLowerCase('bg-BG');
        return lowerName.includes(lowerCaseSearchTerm) && !lowerName.startsWith(lowerCaseSearchTerm);
    });

    // Combine location matches (startsWith matches first, then includes matches)
    const matchingLocations = [...startsWithMatches, ...includesMatches];

    return {
        cities: matchingCities,
        locations: matchingLocations
    };
}

