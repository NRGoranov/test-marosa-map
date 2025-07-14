import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMediaQuery } from '../../../hooks/useMediaQuery';


const MobileRouteGuard = ({ children }) => {
    const isMobile = useMediaQuery('(max-width: 767px)');

    if (!isMobile) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default MobileRouteGuard;