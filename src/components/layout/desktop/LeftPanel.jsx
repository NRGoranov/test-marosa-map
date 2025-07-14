import React from 'react';

import Header from './Header';
import Footer from './Footer';
import SearchIcon from '../../../assets/icons/SearchIcon';
import LocationList from '../location-list/LocationList';

const LeftPanel = (props) => {
    const handleSearch = (event) => event.preventDefault();

    const renderResultsText = (count) => {
        if (count === 0) {
            return <span className="font-light text-gray-500">Няма намерени резултати</span>;
        }

        return (
            <>
                <span className="font-bold text-gray-800">{count}</span>
                <span className="font-light text-gray-500"> {count === 1 ? 'намерен резултат' : 'намерени резултата'}</span>
            </>
        );
    };

    return (
        <div className="w-full md:w-1/3 flex flex-col h-screen bg-white shadow-lg z-10 p-8">
            <div className="flex-shrink-0">
                <Header />
                <div className="w-fit mt-10">
                    <main>
                        <p className="text-[#4CAF50] font-medium mb-10">Градинарят знае най-добре</p>
                        <h2 className="text-3xl sm:text-4xl font-medium text-[#1B4712] leading-relaxed mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Мароса вече е по-близо до теб. Търси ни в  {' '}
                            <span className="bg-[#C9F0C2] rounded-full px-6 py-1">цялата страна</span>
                        </h2>
                    </main>
                    <section className="mt-8">
                        <form onSubmit={handleSearch} className="flex items-center space-x-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    id="search"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="Потърси Мароса обекти..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-[#1B4712] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4712]"
                            >
                                Търси
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto mt-8 pt-2 pr-2 -mr-4">
                <p className="text-lg">
                    {renderResultsText(props.locations ? props.locations.length : 0)}
                </p>

                <div className="mt-4 p-1">
                    {props.isInitialLoading ? (
                        <p className="text-gray-500">Loading location details...</p>
                    ) : (
                        <LocationList {...props} />
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 pt-8 mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default LeftPanel;