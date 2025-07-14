import React, { useState, useEffect } from "react";
import Split from "react-split";

import LeftPanel from "./LeftPanel";
import Map from "../../map/Map";

const DesktopView = (props) => {
    const {
        map,
        onLoad,
        locations,
        allLocations,
        selectedPlace,
        placeDetails,
        allPlaceDetails,
        onMarkerClick,
        onCloseInfoWindow,
        currentUserPosition,
        hoveredPlaceId,
        onListItemHover,
        onMarkerHover,
        onIdle,
        isInitialLoading,
        loadError,
        isLoaded,
        showInfoWindow,
    } = props;

    const [splitSizes, setSplitSizes] = useState([41, 59]);

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;

            if (screenWidth < 1536) {
                setSplitSizes([55, 45]);
            } else if (screenWidth < 1920) {
                setSplitSizes([48, 52]);
            } else if (screenWidth < 2200) {
                setSplitSizes([41, 59]);
            } else if (screenWidth < 2300) {
                setSplitSizes([35, 65]);
            } else if (screenWidth < 2560) {
                setSplitSizes([31, 69]);
            } else if (screenWidth < 3840) {
                setSplitSizes([31, 69]);
            } else {
                setSplitSizes([25, 75]);
            }
        };
        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <Split
            className="flex h-screen"
            sizes={splitSizes}
            minSize={[480, 800]}
            expandToMin={false}
            gutterSize={0}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
        >
            <LeftPanel
                locations={locations}
                allPlaceDetails={allPlaceDetails}
                isInitialLoading={isInitialLoading}
                onListItemClick={onMarkerClick}
                onListItemHover={onListItemHover}
                selectedPlaceId={selectedPlace?.placeId}
                hoveredPlaceId={hoveredPlaceId}
                isMobileView={false}
            />

            <aside className="h-full bg-gray-200 flex items-center justify-center">
                {loadError && <div>Error loading maps.</div>}
                {!isLoaded && <div className="text-gray-600">Loading Map...</div>}
                {isLoaded && (
                    <Map
                        map={map}
                        onLoad={onLoad}
                        locations={allLocations}
                        selectedPlace={selectedPlace}
                        placeDetails={placeDetails}
                        allPlaceDetails={allPlaceDetails}
                        onMarkerClick={onMarkerClick}
                        onCloseInfoWindow={onCloseInfoWindow}
                        currentUserPosition={currentUserPosition}
                        hoveredPlaceId={hoveredPlaceId}
                        onMarkerHover={onMarkerHover}
                        onIdle={onIdle}
                        showInfoWindow={showInfoWindow}
                    />
                )}
            </aside>
        </Split>
    );
};

export default DesktopView;