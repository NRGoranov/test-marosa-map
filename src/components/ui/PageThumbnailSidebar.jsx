import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import CloseIcon from '../../assets/icons/CloseIcon';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const PageThumbnailSidebar = ({
    onClose,
    totalPages,
    onPageSelect,
    pdfFile,
    currentPage,
}) => {
    const [pageAspectRatio, setPageAspectRatio] = useState(null);

    const onDocumentLoadSuccess = async (pdf) => {
        if (pdf.numPages > 0) {
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1 });

            setPageAspectRatio(viewport.width / viewport.height);
        }
    };

    const handleSelect = (pageNumber) => {
        onPageSelect(pageNumber);
    };

    const getPagePairs = () => {
        const pairs = [];

        if (totalPages >= 1) {
            pairs.push([1]);
        }

        for (let i = 2; i <= totalPages; i += 2) {
            if (i + 1 <= totalPages) {
                pairs.push([i, i + 1]);
            } else {
                pairs.push([i]);
            }
        }

        return pairs;
    };

    const thumbnailWidth = 150;
    const spreadWidth = thumbnailWidth * 2 + 4;

    return (
        <div className="w-full h-full bg-white flex flex-col">
            <div className="flex-shrink-0 bg-[#1B4712]">
                <div className="flex justify-between items-center p-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <h3 className="text-xl font-medium text-white ml-5">
                        Виж всички страници
                    </h3>

                    <button onClick={onClose} className="p-5">
                        <CloseIcon />
                    </button>
                </div>
            </div>

            <div className="w-full bg-[#1B4712] h-1"></div>

            <div className="flex-1 overflow-y-auto pt-6 pb-6">
                <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="text-center p-6 text-gray-500">Зареждане...</div>}
                >
                    {totalPages > 0 && pageAspectRatio && (
                        <div className="flex flex-col items-center">
                            {getPagePairs().map((pair, index) => {
                                const isActive = pair.includes(currentPage);

                                return (
                                    <React.Fragment key={index}>
                                        <div
                                            style={{ width: pair.length === 2 ? `${spreadWidth}px` : `${thumbnailWidth}px` }}
                                            className={`relative rounded overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg ${isActive ? 'ring-2 ring-offset-2 ring-[#266819]' : 'shadow-md'}`}
                                            onClick={() => handleSelect(pair[0])}
                                        >
                                            <div className="flex bg-white">
                                                {pair.map((pageNumberInPair) => (
                                                    <Page
                                                        key={pageNumberInPair}
                                                        pageNumber={pageNumberInPair}
                                                        width={thumbnailWidth}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                        className="flex-shrink-0"
                                                    />
                                                ))}
                                            </div>
                                            
                                            <p className="absolute bottom-1 right-1 text-xs font-semibold bg-[#266819] text-white px-1.5 py-0.5 rounded">
                                                {pair.length === 2 ? `${pair[0]}-${pair[1]}` : `${pair[0]}`}
                                            </p>
                                        </div>

                                        {index < getPagePairs().length - 1 && (
                                            <div className="w-full my-4">
                                                <div className="border-t border-[#1B4712] opacity-50"></div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    )}
                </Document>
            </div>
        </div>
    );
};

export default PageThumbnailSidebar;