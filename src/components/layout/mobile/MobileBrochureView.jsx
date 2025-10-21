import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { useTransition, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Helmet } from 'react-helmet-async';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

import { useMediaQuery } from '../../../hooks/useMediaQuery';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import DesktopBrochure from "../desktop/DesktopBrochure";
import MobileViewHeader from "./MobileViewHeader";
import SlideDownMenu from "../../ui/SlideDownMenu";

import ShareIcon from "../../../assets/icons/ShareIcon";
import ChevronLeftIcon from "../../../assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "../../../assets/icons/ChevronRightIcon";

const MobileBrochureView = () => {
    const navigate = useNavigate();

    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return <DesktopBrochure />;
    }

    const getInitialPage = () => {
        const params = new URLSearchParams(window.location.search);

        const page = parseInt(params.get('page'), 10);

        return isNaN(page) || page < 1 ? 1 : page;
    };

    const [currentPage, setCurrentPage] = useState(getInitialPage());
    const [totalPages, setTotalPages] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [slideDirection, setSlideDirection] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [pageAspectRatio, setPageAspectRatio] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);

    const pdfContainerRef = useRef(null);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;

                setContainerSize({ width, height });
            }
        });
        const currentRef = pdfContainerRef.current;

        if (currentRef) observer.observe(currentRef);

        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        params.set('page', currentPage);

        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }, [currentPage]);

    const pdfFile = '/marosabrochure.pdf';

    const handleExit = () => navigate('/');
    const handleSearch = () => navigate('/search');

    const onDocumentLoadSuccess = async (pdf) => {
        setTotalPages(pdf.numPages);

        if (pdf.numPages > 0) {
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1 });

            setPageAspectRatio(viewport.width / viewport.height);
        }
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
        if (isZoomed) return;

        event.preventDefault();

        if (swipeX < 0) handleNext();

        else if (swipeX > 0) handlePrevious();
    }, {
        axis: 'x',
        filterTaps: true,
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

    const getPageProps = () => {

        if (!pageAspectRatio || containerSize.width === 0 || containerSize.height === 0) {
            return { width: containerSize.width ? containerSize.width - 32 : undefined };
        }

        const padding = 32;

        const availableWidth = containerSize.width - padding;
        const availableHeight = containerSize.height - padding;
        const containerAspectRatio = availableWidth / availableHeight;

        if (pageAspectRatio < containerAspectRatio) {
            return { height: availableHeight };
        }

        return { width: availableWidth };
    };

    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    return (
        <div className="flex flex-col h-screen w-screen bg-white">
            <Helmet>
                <title>{`Мароса Градина - Каталог 2025 (стр. ${currentPage})`}</title>
                <meta property="og:title" content={`Мароса Градина - Каталог 2025 (стр. ${currentPage})`} />
                <meta property="og:description" content={`Разгледайте страница ${currentPage} от нашия нов каталог.`} />
                <meta property="og:image" content="https://marosamap.eu/brochure-preview.jpg" />
                <meta property="og:url" content={`https://marosamap.eu/brochure?page=${currentPage}`} />
            </Helmet>

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

            <div className="flex-grow bg-gray-100 overflow-hidden relative" ref={pdfContainerRef}>
                <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    error="Неуспешно зареден PDF."
                    loading={<div className="text-center text-gray-500 p-10">Зареждане на PDF...</div>}
                    className="w-full h-full"
                >

                    <div {...bind()} className="relative w-full h-full touch-none">
                        {pageTransitions((style, pageNum) => (
                            <animated.div
                                style={style}
                                className="absolute inset-0 flex justify-center items-center p-4 cursor-zoom-in"
                                onClick={() => setIsZoomed(true)}
                            >
                                <Page
                                    key={pageNum}
                                    pageNumber={pageNum}
                                    {...getPageProps()}
                                    devicePixelRatio={Math.min(window.devicePixelRatio || 1, 3)}
                                />
                            </animated.div>
                        ))}
                    </div>
                </Document>
            </div>

            <div className="flex-shrink-0 flex justify-between items-center p-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage <= 1}
                    className="p-3 bg-[#1B4712] text-[#AFE8A4] rounded-lg disabled:bg-[#EAEAEA] disabled:text-[#8F8F8F] disabled:cursor-not-allowed transition-colors"
                    aria-label="Предишна страница"
                >
                    <ChevronLeftIcon />
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages && totalPages > 0}
                    className="p-3 bg-[#1B4712] text-[#AFE8A4] rounded-lg disabled:bg-[#EAEAEA] disabled:text-[#8F8F8F] disabled:cursor-not-allowed transition-colors"
                    aria-label="Следваща страница"
                >
                    <ChevronRightIcon />
                </button>
            </div>

            <SlideDownMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onHomeClick={handleExit}
                menuVariant="brochure"
            />

            {isZoomed && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-85 flex flex-col" style={{ touchAction: 'none' }}>
                    <button
                        className="absolute top-4 right-4 text-white text-5xl z-50"
                        onClick={() => setIsZoomed(false)}
                        aria-label="Close zoomed view"
                    >
                        &times;
                    </button>

                    <div className="flex-grow w-full h-full">
                        <TransformWrapper
                            initialScale={1}
                            minScale={1}
                            maxScale={8}
                            centerOnInit={true}
                            limitToBounds={true}
                            doubleClick={{ disabled: true }}
                        >
                            <TransformComponent
                                wrapperStyle={{ width: '100%', height: '100%' }}
                                contentStyle={{ width: '100%', height: '100%' }}
                            >
                                <div className="flex justify-center items-center w-full h-full">
                                    <Document file={pdfFile}>
                                        <Page
                                            pageNumber={currentPage}
                                            width={window.innerWidth}
                                            devicePixelRatio={Math.min(window.devicePixelRatio || 1, 3)}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                </div>
                            </TransformComponent>
                        </TransformWrapper>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileBrochureView;