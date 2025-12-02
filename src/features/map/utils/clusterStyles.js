// Smaller cluster pins by default, no numbers shown until hover/long-press
export const clusterStyles = [
    {
        textColor: 'transparent', // Hide text by default
        url: '/cluster-1.png',
        height: 40,
        width: 40,
        textSize: 0, // No text shown
    },
    {
        textColor: 'transparent',
        url: '/cluster-2.png',
        height: 45,
        width: 45,
        textSize: 0,
    },
    {
        textColor: 'transparent',
        url: '/cluster-3.png',
        height: 50,
        width: 50,
        textSize: 0,
    },
];

// Hovered cluster styles (show numbers)
export const clusterStylesHovered = [
    {
        textColor: '#00562A',
        url: '/cluster-1.png',
        height: 40,
        width: 40,
        textSize: 14,
    },
    {
        textColor: '#00562A',
        url: '/cluster-2.png',
        height: 45,
        width: 45,
        textSize: 15,
    },
    {
        textColor: '#00562A',
        url: '/cluster-3.png',
        height: 50,
        width: 50,
        textSize: 16,
    },
];

export const calculator = (markers) => {
    const count = markers.length;

    if (count >= 16) return { text: count.toString(), index: 2 };
    if (count >= 6) return { text: count.toString(), index: 1 };

    return { text: count.toString(), index: 0 };
};

