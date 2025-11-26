export const clusterStyles = [
    {
        textColor: '#00562A',
        url: '/cluster-1.png',
        height: 80,
        width: 80,
        textSize: 20,
    },
    {
        textColor: '#00562A',
        url: '/cluster-2.png',
        height: 85,
        width: 85,
        textSize: 21,
    },
    {
        textColor: '#00562A',
        url: '/cluster-3.png',
        height: 90,
        width: 90,
        textSize: 22,
    },
];

export const calculator = (markers) => {
    const count = markers.length;

    if (count >= 16) return { text: count.toString(), index: 3 };
    if (count >= 6) return { text: count.toString(), index: 2 };

    return { text: count.toString(), index: 1 };
};

