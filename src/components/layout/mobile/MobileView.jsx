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
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);

    const sheetRef = useRef();

    useEffect(() => {
        if (!sheetRef.current) return;
        if (selectedPlace) {
            sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.55);
        } else {
            sheetRef.current.snapTo(({ snapPoints }) => snapPoints[0]);
        }
    }, [selectedPlace]);

    const snapPoints = ({ maxHeight }) => [
        63,
        maxHeight * 0.55,
        maxHeight - 110,
    ];

    const closeBottomSheet = () => {
        if (sheetRef.current) {
            sheetRef.current.snapTo(({ snapPoints }) => snapPoints[0]);
        }
    };

    const handleMenuClick = async () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            await closeBottomSheet();

            setIsMenuOpen(true);
        }
    };

    const handleShareClick = (location, details) => {
        const combinedData = {
            ...location,
            ...details,
            name: location.displayName.text
        };

        let finalMapsUrl = '';
        const lat = details?.geometry?.location?.lat();
        const lng = details?.geometry?.location?.lng();

        if (lat && lng) {
            finalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        } else {
            finalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(combinedData.name)}`;
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
                    onMenuClick={handleMenuClick}
                    isMenuOpen={isMenuOpen}
                />
            </div>

            <div className="h-full w-full relative">
                {isSheetExpanded && (
                    <div
                        className="absolute inset-0 z-10"
                        onClick={closeBottomSheet}
                        aria-label="Close location details"
                    />
                )}
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
                onSnap={({ index }) => setIsSheetExpanded(index > 0)}
                header={
                    <div className="flex items-center justify-center text-lg font-bold text-[#1B4712] p-2">
                        {selectedPlace ? selectedPlace.displayName.text : ''}
                    </div>
                }
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