import React from 'react';

const FacebookShareIcon = ({ className }) => {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="14" fill="#C9F0C2"/>
        <path d="M17.6494 14.9297L18.0847 12.0631H15.3614V10.2037C15.3614 9.41927 15.7412 8.65419 16.9609 8.65419H18.1998V6.21371C18.1998 6.21371 17.076 6.02002 16.002 6.02002C13.7582 6.02002 12.293 7.39328 12.293 9.87831V12.0631H9.7998V14.9297H12.293V21.8599C12.7935 21.9393 13.3056 21.98 13.8272 21.98C14.3488 21.98 14.8609 21.9393 15.3614 21.8599V14.9297H17.6494Z" fill="#1B4712"/>
    </svg>
  );
};

export default FacebookShareIcon;