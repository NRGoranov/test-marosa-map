import React from "react";

const LocationPermissionModal = ({ isOpen, onAllow, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed top-0 left-4 z-50 w-auto max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white rounded-b-xl rounded-t-none p-6 text-left shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-x border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap pr-8">
                    Allow “Marosa” to access your location
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    “Marosa” wants to use your location to find <br /> stores near you
                </p>

                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="bg-white text-[#1B4712] border border-[#1B4712] rounded-full py-2.5 w-40 font-bold transition-colors hover:bg-gray-50 text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAllow}
                        className="bg-[#1B4712] text-white rounded-full py-2.5 w-40 font-bold transition-colors hover:bg-[#15380e] text-base"
                    >
                        Allow
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;