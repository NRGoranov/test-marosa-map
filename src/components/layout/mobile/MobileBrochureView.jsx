import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Helmet } from 'react-helmet-async';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import MobileViewHeader from "./MobileViewHeader";
import SlideDownMenu from "../../ui/SlideDownMenu";
import ShareIcon from "../../../assets/icons/ShareIcon";
import ChevronLeftIcon from "../../../assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "../../../assets/icons/ChevronRightIcon";
import BackToMapButton from "../../ui/BackToMapButton";

const MobileBrochureView = () => {
    const navigate = useNavigate();

    const getInitialPage = () => {
        const params = new URLSearchParams(window.location.search);

        const page = parseInt(params.get('page'), 10);

        return isNaN(page) || page < 1 ? 1 : page;
    };

    const [currentPage, setCurrentPage] = useState(getInitialPage());
    const [totalPages, setTotalPages] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [pageAspectRatio, setPageAspectRatio] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [pageImages, setPageImages] = useState([]);
    const [isLoadingPages, setIsLoadingPages] = useState(true);

    const pdfContainerRef = useRef(null);
    const flipBookRef = useRef(null);

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
        setIsLoadingPages(true);

        if (pdf.numPages > 0) {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            setPageAspectRatio(viewport.width / viewport.height);

            // Convert all PDF pages to images for react-pageflip
            const images = [];
            const scale = Math.min(window.devicePixelRatio || 2, 3);
            const renderPromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                renderPromises.push(
                    pdf.getPage(i).then(async (page) => {
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        await page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise;

                        return canvas.toDataURL('image/png');
                    })
                );
            }

            const renderedImages = await Promise.all(renderPromises);
            setPageImages(renderedImages);
            setIsLoadingPages(false);
        }
    };

    const handleFlip = useCallback((e) => {
        const newPage = e.data + 1; // react-pageflip uses 0-based index
        setCurrentPage(newPage);
    }, []);

    const handleNext = useCallback(() => {
        if (flipBookRef.current && currentPage < totalPages) {
            flipBookRef.current.pageFlip().flipNext();
        }
    }, [currentPage, totalPages]);

    const handlePrevious = useCallback(() => {
        if (flipBookRef.current && currentPage > 1) {
            flipBookRef.current.pageFlip().flipPrev();
        }
    }, [currentPage]);

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

    const getFlipBookSize = () => {
        if (!pageAspectRatio || containerSize.width === 0 || containerSize.height === 0) {
            return { width: containerSize.width || 400, height: containerSize.height || 600 };
        }

        const padding = 32;
        const availableWidth = containerSize.width - padding;
        const availableHeight = containerSize.height - padding;
        const containerAspectRatio = availableWidth / availableHeight;

        if (pageAspectRatio < containerAspectRatio) {
            return { width: availableHeight * pageAspectRatio, height: availableHeight };
        }

        return { width: availableWidth, height: availableWidth / pageAspectRatio };
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

            <div className="flex-grow bg-gray-100 overflow-hidden relative flex items-center justify-center" ref={pdfContainerRef}>
                {isLoadingPages ? (
                    <div className="text-center text-gray-500 p-10">Зареждане на PDF...</div>
                ) : pageImages.length > 0 ? (
                    <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        error="Неуспешно зареден PDF."
                        className="w-full h-full flex items-center justify-center"
                    >
                        <div className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
                            <HTMLFlipBook
                                ref={flipBookRef}
                                width={getFlipBookSize().width}
                                height={getFlipBookSize().height}
                                size="stretch"
                                minWidth={300}
                                maxWidth={800}
                                minHeight={400}
                                maxHeight={1200}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={true}
                                onFlip={handleFlip}
                                className="cursor-pointer"
                                style={{ margin: '0 auto' }}
                            >
                                {pageImages.map((imageSrc, index) => (
                                    <div
                                        key={index}
                                        className="page"
                                        style={{
                                            backgroundColor: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '10px',
                                        }}
                                        onClick={() => setIsZoomed(true)}
                                    >
                                        <img
                                            src={imageSrc}
                                            alt={`Page ${index + 1}`}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </div>
                                ))}
                            </HTMLFlipBook>
                        </div>
                    </Document>
                ) : (
                    <div className="text-center text-gray-500 p-10">Грешка при зареждане на PDF.</div>
                )}
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

            {(isMenuOpen || isZoomed) && (
                <BackToMapButton
                    onClick={() => {
                        setIsMenuOpen(false);
                        setIsZoomed(false);
                        handleExit();
                    }}
                />
            )}
        </div>
    );
};

export default MobileBrochureView;