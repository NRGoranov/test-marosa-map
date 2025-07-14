import React, { useState } from 'react';

import Map from '../../map/Map';
import MobileViewHeader from '../mobile/MobileViewHeader';
import SlideDownMenu from '../../ui/SlideDownMenu';

const MobileView = (props) => {
    const { onEnterSearch, onHomeMarkerClick, onNavigateToBrochure, ...rest } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="h-screen w-screen relative">
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-white shadow-sm">
                <MobileViewHeader
                    onSearchClick={onEnterSearch}
                    onMenuClick={() => setIsMenuOpen(prev => !prev)}
                    isMenuOpen={isMenuOpen}
                />
            </div>

            <div 
                className="h-full w-full"
                onClick={onEnterSearch}
            >
                {props.isLoaded && (
                    <Map
                        {...rest}
                        onMarkerClick={props.onHomeMarkerClick}
                        locations={props.allLocations}
                        showInfoWindow={false}
                    />
                )}
            </div>

            <SlideDownMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                onBrochureClick={onNavigateToBrochure} 
                menuVariant="home" 
            />
        </div>
    );
};

export default MobileView;