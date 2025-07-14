import React from "react";

const LocationPermissionModal = ({ isOpen, onAllow, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
                <h2 className="text-xl font-bold text-gray-800">
                    Allow “Marosa” to access your location
                </h2>
                <p className="mt-2 text-gray-600">
                    “Marosa” wants to use your location to find stores near you
                </p>

                <div className="mt-6 flex flex-col space-y-3">
                    <button
                        onClick={onAllow}
                        className="w-full bg-[#1B4712] text-white rounded-full py-3 font-semibold transition-colors hover:bg-[#15380e]"
                    >
                        Allow
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-white text-[#1B4712] border border-[#1B4712] rounded-full py-3 font-semibold transition-colors hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;