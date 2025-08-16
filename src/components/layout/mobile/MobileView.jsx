import React, { useState, useRef, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

import Map from '../../map/Map';
import MobileViewHeader from '../mobile/MobileViewHeader';
import SlideDownMenu from '../../ui/SlideDownMenu';
import LocationList from '../location-list/LocationList';
import MobileShareModal from './MobileShareModal';

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
    const [locationToShare, setLocationToShare] = useState(null);
    //const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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

    const handleShareClick = (location, details) => {
        const combinedData = {
            ...location,
            ...details,
            name: details?.name || location.name
        };

        let finalMapsUrl = '';

        const lat = details?.geometry?.location?.lat();
        const lng = details?.geometry?.location?.lng();

        if (lat && lng) {
            // Added the missing "/" after "/dir//"
            finalMapsUrl = `https://www.google.com/maps/dir//${lat},${lng}`;
        } else {
            // Added the missing "/" after "/dir//"
            finalMapsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(combinedData.name)}`;
        }

        const comprehensiveLocationData = {
            ...combinedData,
            mapsUrl: finalMapsUrl
        };

        setLocationToShare(comprehensiveLocationData);
    };

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
                        onShareClick={handleShareClick}
                        isMobileView={true}
                    />
                </div>
            </BottomSheet>

            <MobileShareModal
                isOpen={!!locationToShare}
                onClose={() => setLocationToShare(null)}
                place={locationToShare}
            />
        </div>
    );
};

export default MobileView;