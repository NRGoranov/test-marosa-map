// Clean and light cluster styles using SVG
const createClusterIcon = (color, size) => {
    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" fill-opacity="0.9" stroke="white" stroke-width="2"/>
        </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Light, clean cluster styles
export const clusterStyles = [
    {
        textColor: '#1B4712',
        url: createClusterIcon('#F0F9ED', 40),
        height: 40,
        width: 40,
        textSize: 12,
    },
    {
        textColor: '#1B4712',
        url: createClusterIcon('#E8F5E3', 45),
        height: 45,
        width: 45,
        textSize: 13,
    },
    {
        textColor: '#1B4712',
        url: createClusterIcon('#D4EDC8', 50),
        height: 50,
        width: 50,
        textSize: 14,
    },
    {
        textColor: '#1B4712',
        url: createClusterIcon('#C9F0C2', 55),
        height: 55,
        width: 55,
        textSize: 15,
    },
    {
        textColor: '#1B4712',
        url: createClusterIcon('#B8E8A8', 60),
        height: 60,
        width: 60,
        textSize: 16,
    },
];

// Calculator function to determine which cluster style to use based on marker count
export const calculator = (markers, numStyles) => {
    let index = 0;
    const count = markers.length;
    
    // Progressive sizing: 1-5, 6-10, 11-25, 26-50, 50+
    if (count > 50) {
        index = 4;
    } else if (count > 25) {
        index = 3;
    } else if (count > 10) {
        index = 2;
    } else if (count > 5) {
        index = 1;
    }
    
    return {
        text: '', // Hide text by default, will show on hover
        index: index,
        title: '', // Remove title to prevent tooltip
    };
};
