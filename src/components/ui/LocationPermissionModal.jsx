const LocationPermissionModal = ({ isOpen, onAllow, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 px-4"
            onClick={onCancel}
        >
            <div 
                className="bg-white rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.25)] w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-[#1B4712] mb-3 text-center">
                Allow “Marosa” to access your location
                </h2>
                
                <p className="text-base text-[#7A8E74] mb-6 text-center">
                “Marosa” wants to use your location to find stores near you
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onAllow}
                        className="bg-[#1B4712] text-white rounded-full py-4 px-6 font-semibold transition-colors hover:bg-[#15380e] text-base w-full"
                    >
                        Allow
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white text-[#1B4712] border border-[#1B4712] rounded-full py-4 px-6 font-semibold transition-colors hover:bg-[#F2F6EF] text-base w-full"
                    >
                        Cancle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;