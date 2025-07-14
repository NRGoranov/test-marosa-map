import React from 'react';

const CopyIcon = ({ className }) => {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="14" fill="#C9F0C2"/>
      <g clipPath="url(#clip0_471_2973)">
        <path d="M8 5.75049H17V7.25049H8V17.7505H6.5V7.25049C6.5 6.42174 7.17125 5.75049 8 5.75049Z" fill="#1B4712"/>
        <path d="M11 8.75049H19.25C20.0787 8.75049 20.75 9.42174 20.75 10.2505V20.7505C20.75 21.5792 20.0787 22.2505 19.25 22.2505H11C10.1712 22.2505 9.5 21.5792 9.5 20.7505V10.2505C9.5 9.42174 10.1712 8.75049 11 8.75049Z" fill="#1B4712"/>
      </g>
      <defs>
        <clipPath id="clip0_471_2973">
          <rect width="18" height="18" fill="white" transform="translate(5 5)"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default CopyIcon;