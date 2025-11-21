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
        allCities,
        onCitySelect,
    } = props;

    return (
        <div className="h-screen w-screen overflow-hidden bg-white">
            <Split
                className="flex h-full"
                sizes={[40, 60]}
                minSize={[400, 600]}
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
                    allLocations={allLocations}
                    allCities={allCities}
                    onCitySelect={onCitySelect}
                />
                <aside className="h-full bg-white">
                    {loadError && <div className="flex h-full items-center justify-center text-[#1B4712]">Error loading maps.</div>}
                    {!isLoaded && (
                        <div className="flex h-full items-center justify-center text-[#7A8E74] bg-white">
                            Loading Map...
                        </div>
                    )}
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
        </div>
    );
};

export default DesktopView;