import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { useTransition, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useNavigate } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import MobileViewHeader from "./MobileViewHeader";
import SlideDownMenu from "../../ui/SlideDownMenu";
import ShareIcon from "../../../assets/icons/ShareIcon";
import ChevronLeftIcon from "../../../assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "../../../assets/icons/ChevronRightIcon";


const MobileBrochureView = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [slideDirection, setSlideDirection] = useState(0);
    const pdfContainerRef = useRef(null);
    const [pdfContainerWidth, setPdfContainerWidth] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setPdfContainerWidth(entry.contentRect.width);
            }
        });
        const currentRef = pdfContainerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    const pdfFile = '/marosabrochure.pdf';

    const handleExit = () => navigate('/');
    const handleSearch = () => navigate('/');

    const onDocumentLoadSuccess = ({ numPages }) => {
        setTotalPages(numPages);
    };

    const handleNext = useCallback(() => {
        if (currentPage < totalPages) {
            setSlideDirection(1); 
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    const handlePrevious = useCallback(() => {
        if (currentPage > 1) {
            setSlideDirection(-1);
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);
    
    const bind = useDrag(({ swipe: [swipeX], event }) => {
        event.preventDefault();
        
        if (swipeX < 0) {
            handleNext();
        } 
        else if (swipeX > 0) {
            handlePrevious();
        }
    }, {
        axis: 'x',
        filterTaps: true,
        swipe: {
            threshold: 25,
        }
    });
    
    const pageTransitions = useTransition(currentPage, {
        key: currentPage,
        from: { transform: `translateX(${slideDirection * 100}%)`, opacity: 0 },
        enter: { transform: 'translateX(0%)', opacity: 1 },
        leave: { transform: `translateX(${-slideDirection * 100}%)`, opacity: 0 },
        config: { tension: 270, friction: 30 },
        exitBeforeEnter: true,
    });

    const handleShare = async () => {
        const shareData = {
            title: 'Брошура Мароса',
            text: `Разгледайте страница ${currentPage} от нашата брошура!`,
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.url);
                alert('Успешно копиран линк!');
            }
        } catch (err) {
            console.error("Неуспешно споделяне на страница:", err);
            alert('Неуспешно споделяне.');
        }
    };
    
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    return (
        <div className="flex flex-col h-screen w-screen bg-white">
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <MobileViewHeader 
                    onLogoClick={handleExit} 
                    onMenuClick={() => setIsMenuOpen(prev => !prev)} 
                    isMenuOpen={isMenuOpen} 
                    onSearchClick={handleSearch} 
                />
            </div>
            <div className="flex-shrink-0 w-full bg-gray-200 h-1">
                <div className="bg-[#AFE8A4] h-1 transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex-shrink-0 flex justify-between items-center p-4">
                <span className="bg-[#C9F0C2] text-[#1B4712] font-bold text-sm px-3 py-1 rounded-lg">
                    {currentPage}/{totalPages || '...'}
                </span>
                <button onClick={handleShare} className="flex items-center text-[#1B4712] font-medium text-base">
                    <span className="border-b border-[#1B4712]">Сподели</span>
                    <ShareIcon className="ml-1" />
                </button>
            </div>

            <div className="flex-grow bg-gray-100 overflow-y-auto relative" ref={pdfContainerRef}>
                <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    error="Неуспешно зареден PDF."
                    loading={<div className="text-center text-gray-500 p-10">Зареждане на PDF...</div>}
                    className="w-full h-full"
                >
                    <div {...bind()} className="relative w-full h-full touch-none">
                        {pageTransitions((style, pageNum) => (
                            <animated.div style={style} className="absolute inset-0 flex justify-center items-start p-4">
                                <Page 
                                    key={pageNum}
                                    pageNumber={pageNum}
                                    width={pdfContainerWidth ? pdfContainerWidth - 32 : 0}
                                    devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
                                />
                            </animated.div>
                        ))}
                    </div>
                </Document>
            </div>

            <div className="flex-shrink-0 flex justify-between items-center p-4">
                <button onClick={handlePrevious} disabled={currentPage <= 1} className="p-3 bg-[#EAEAEA] text-[#8F8F8F] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Предишна страница">
                    <ChevronLeftIcon />
                </button>
                <button onClick={handleNext} disabled={currentPage >= totalPages} className="p-3 bg-[#1B4712] text-[#AFE8A4] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Следваща страница">
                    <ChevronRightIcon />
                </button>
            </div>

            <SlideDownMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                onHomeClick={handleExit} 
                menuVariant="brochure" 
            />
        </div>
    );
};

export default MobileBrochureView;