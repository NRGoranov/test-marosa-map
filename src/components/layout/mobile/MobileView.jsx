import React, { useState, useRef, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

import Map from '../../map/Map';
import MobileViewHeader from '../mobile/MobileViewHeader';
import SlideDownMenu from '../../ui/SlideDownMenu';
import LocationList from '../location-list/LocationList';

const MobileView = (props) => {
    const {
        onEnterSearch,
        onNavigateToBrochure,
        onMarkerClick,
        selectedPlace,
        onCloseInfoWindow,
        ...rest
    } = props;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const sheetRef = useRef();

    useEffect(() => {
        if (!sheetRef.current) return;
        if (selectedPlace) {
            sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.55);
        } else {
            sheetRef.current.snapTo(({ snapPoints }) => snapPoints[0]);
        }
    }, [selectedPlace]);

    const snapPoints = ({ minHeight, maxHeight }) => [
        63,
        maxHeight * 0.55,
        maxHeight - 110,
    ];

    return (
        <div className="h-screen w-screen relative">
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-white shadow-sm">
                <MobileViewHeader
                    onSearchClick={onEnterSearch}
                    onMenuClick={() => setIsMenuOpen(prev => !prev)}
                    isMenuOpen={isMenuOpen}
                />
            </div>

            <div className="h-full w-full">
                {props.isLoaded && (
                    <Map
                        {...rest}
                        onMarkerClick={onMarkerClick}
                        selectedPlace={selectedPlace}
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

            <BottomSheet
                open
                blocking={false}
                ref={sheetRef}
                snapPoints={snapPoints}
                defaultSnap={({ snapPoints }) => snapPoints[0]}
                header={
                    <div className="flex items-center justify-center text-lg font-bold text-[#1B4712] p-2">
                        {selectedPlace ? selectedPlace.name : 'Информация за обект'}
                    </div>
                }

                onDismiss={onCloseInfoWindow}
            >
                <div data-rsbs-scroll="true" className="flex-grow overflow-y-auto px-4 pb-4">
                    <LocationList
                        {...props}
                        locations={selectedPlace ? [selectedPlace] : []}
                        onListItemClick={onMarkerClick}
                        isMobileView={true}
                    />
                </div>
            </BottomSheet>
        </div>
    );
};

export default MobileView;