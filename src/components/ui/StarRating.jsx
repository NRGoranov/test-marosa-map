import React from 'react';

const StarRating = ({ rating, starSize = 'text-base' }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating || 0);
    const starElements = [];
    const starChar = '★';

    for (let i = 0; i < totalStars; i++) {
        starElements.push(
            <span key={i} className={`${i < fullStars ? "text-yellow-400" : "text-gray-300"} ${starSize}`}>
                {starChar}
            </span>
        );
    }
    return <div className="flex items-center">{starElements}</div>;
};

export default StarRating;