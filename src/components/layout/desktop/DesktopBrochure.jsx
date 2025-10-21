import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HTMLFlipBook from 'react-pageflip';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useTransition, animated } from '@react-spring/web';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import DesktopBrochureHeader from "./DesktopBrochureHeader";
import PageThumbnailSidebar from "../../ui/PageThumbnailSidebar";
import MenuSidebar from "../../ui/MenuSidebar";

import ChevronLeftIcon from "../../../assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "../../../assets/icons/ChevronRightIcon";

const PdfPage = React.forwardRef(({ pageNumber, width, totalPages, onPageClick }, ref) => {
    const density = (pageNumber === 1 || pageNumber === totalPages) ? 'hard' : 'soft';

    return (
        <div ref={ref} data-density={density} onClick={() => onPageClick(pageNumber)} className="bg-white">
            <Page
                pageNumber={pageNumber}
                width={width}
                devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2.5)}
            />
        </div>
    );
});
PdfPage.displayName = 'PdfPage';

const DesktopBrochure = () => {
    const navigate = useNavigate();

    const pdfFile = '/marosabrochure.pdf';

    const getInitialPage = () => {
        const params = new URLSearchParams(window.location.search);

        const page = parseInt(params.get('page'), 10);

        return isNaN(page) || page < 1 ? 0 : page - 1;
    };

    const [currentPage, setCurrentPage] = useState(getInitialPage());
    const [totalPages, setTotalPages] = useState(0);
    const [containerWidth, setContainerWidth] = useState(1000);
    const [pageAspectRatio, setPageAspectRatio] = useState(null);
    const [availableHeight, setAvailableHeight] = useState(window.innerHeight);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedPage, setZoomedPage] = useState(1);
    const [sidebarContent, setSidebarContent] = useState(null);

    const flipBookRef = useRef(null);
    const pdfContainerRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        const calculateHeight = () => {
            const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 0;

            const verticalPadding = 80;

            const calculatedHeight = window.innerHeight - headerHeight - verticalPadding;

            setAvailableHeight(calculatedHeight > 0 ? calculatedHeight : 300);
        };
        calculateHeight();

        window.addEventListener('resize', calculateHeight);

        return () => window.removeEventListener('resize', calculateHeight);
    }, [sidebarContent]);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            setTimeout(() => {
                if (pdfContainerRef.current) {
                    setContainerWidth(pdfContainerRef.current.clientWidth);
                }
            }, 350);
        });
        const currentRef = pdfContainerRef.current;

        if (currentRef) observer.observe(currentRef);

        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [sidebarContent]);

    const onDocumentLoadSuccess = async (pdf) => {
        setTotalPages(pdf.numPages);

        if (pdf.numPages > 0) {
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1 });

            setPageAspectRatio(viewport.width / viewport.height);

            if (pdfContainerRef.current) {
                setContainerWidth(pdfContainerRef.current.clientWidth);
            }
        }
    };

    const handleNext = useCallback(() => {
        flipBookRef.current?.pageFlip().flipNext();
    }, []);

    const handlePrevious = useCallback(() => {
        flipBookRef.current?.pageFlip().flipPrev();
    }, []);

    const handleOnFlip = (e) => {
        const newPage = e.data;

        setCurrentPage(newPage);

        const params = new URLSearchParams(window.location.search);

        params.set('page', newPage + 1);

        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };

    const handlePageClick = (pageNumber) => {
        setZoomedPage(pageNumber);

        setIsZoomed(true);
    };

    const handlePageSelect = (pageNumber) => {
        flipBookRef.current?.pageFlip().turnToPage(pageNumber - 1);

        setSidebarContent(null);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Брошура Мароса',
            text: `Разгледайте страница ${currentPage + 1} от нашата брошура!`,
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
        } finally {
            setSidebarContent(null);
        }
    };

    const effectiveContainerWidth = containerWidth > 0 ? containerWidth : 1000;

    let pageDisplayWidth = 0;
    let pageDisplayHeight = 0;

    if (pageAspectRatio && availableHeight > 0 && effectiveContainerWidth > 0) {
        const maxWidthBasedOnContainer = (effectiveContainerWidth * 0.9) / 2;
        const maxHeightBasedOnContainerWidth = maxWidthBasedOnContainer / pageAspectRatio;
        const maxHeightBasedOnAvailableHeight = availableHeight * 0.95;

        if (maxHeightBasedOnContainerWidth <= maxHeightBasedOnAvailableHeight) {
            pageDisplayWidth = maxWidthBasedOnContainer;
            pageDisplayHeight = pageDisplayWidth / pageAspectRatio;
        } else {
            pageDisplayHeight = maxHeightBasedOnAvailableHeight;
            pageDisplayWidth = pageDisplayHeight * pageAspectRatio;
        }
    } else {
        pageDisplayWidth = Math.min((effectiveContainerWidth * 0.9) / 2, 500);
        pageDisplayHeight = pageDisplayWidth / (pageAspectRatio || 1 / 1.414);
    }
    pageDisplayWidth = Math.max(pageDisplayWidth, 100);
    pageDisplayHeight = Math.max(pageDisplayHeight, 141);

    const getPageLabel = () => {
        if (totalPages === 0) return '.../...';

        const current = currentPage + 1;

        if (current === 1) return `1 / ${totalPages}`;

        if (current >= totalPages) return `${totalPages} / ${totalPages}`;

        const start = (current % 2 === 0) ? current : current - 1;

        const end = Math.min(start + 1, totalPages);

        return `${start}-${end} / ${totalPages}`;
    };

    const getVisiblePage = () => {
        if (totalPages === 0) return 0;

        if (currentPage === 0) return 1;

        return Math.min(currentPage + 1, totalPages);
    }

    const progress = totalPages > 0 ? (getVisiblePage() / totalPages) * 100 : 0;
    const isPrevDisabled = currentPage === 0;
    const isNextDisabled = currentPage >= totalPages - (totalPages % 2 === 0 ? 2 : 1);

    const sidebarWidth = 384;

    const sidebarTransitions = useTransition(sidebarContent, {
        from: { width: '0px', opacity: 0 },
        enter: { width: `${sidebarWidth}px`, opacity: 1 },
        leave: { width: '0px', opacity: 0 },
        config: { duration: 300 }
    });

    const rightArrowStyle = {
        right: sidebarContent ? `${sidebarWidth + 16}px` : '16px',
        transition: 'right 0.3s ease-in-out'
    };

    return (
        <div className="flex w-full min-h-screen">
            <div className="flex-1 flex flex-col min-h-screen relative bg-gray-100 overflow-hidden">
                <Helmet>
                    <title>{`Мароса Градина - Каталог 2025 (стр. ${getPageLabel()})`}</title>
                </Helmet>

                <div ref={headerRef} className="flex-shrink-0">
                    <DesktopBrochureHeader
                        onLogoClick={() => navigate('/')}
                        onMenuClick={() => setSidebarContent(prev => prev === 'menu' ? null : 'menu')}
                        pageLabel={getPageLabel()}
                        onPageLabelClick={() => setSidebarContent(prev => prev === 'pages' ? null : 'pages')}
                    />
                </div>

                <div className="w-full bg-gray-300 h-1 flex-shrink-0">
                    <div
                        className="bg-[#AFE8A4] h-1 transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex-grow w-full overflow-hidden relative flex justify-center items-center py-4 px-4" ref={pdfContainerRef}>

                    <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        error={<div className="text-center text-red-500 p-10">Неуспешно зареждане на PDF.</div>}
                        loading={<div className="text-center text-gray-500 p-10">Зареждане на PDF...</div>}
                    >
                        {totalPages > 0 && pageAspectRatio && pageDisplayWidth > 0 && pageDisplayHeight > 0 && (
                            <HTMLFlipBook
                                ref={flipBookRef}
                                width={pageDisplayWidth}
                                height={pageDisplayHeight}
                                onFlip={handleOnFlip}
                                startPage={getInitialPage()}
                                className="shadow-lg mx-auto"
                                showCover={true}
                                mobileScrollSupport={false}
                                usePortrait={false}
                                showPageCorners={true}
                                disableFlipByClick={true}
                                minWidth={pageDisplayWidth}
                                minHeight={pageDisplayHeight}
                                maxWidth={pageDisplayWidth}
                                maxHeight={pageDisplayHeight}
                                maxShadowOpacity={0.5}
                                flippingTime={600}
                                key={`${pageDisplayWidth}-${pageDisplayHeight}`}
                            >
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <PdfPage
                                        key={pageNumber}
                                        pageNumber={pageNumber}
                                        width={pageDisplayWidth}
                                        totalPages={totalPages}
                                        onPageClick={handlePageClick}
                                    />
                                ))}
                            </HTMLFlipBook>
                        )}
                    </Document>
                </div>

                <button
                    onClick={handlePrevious}
                    disabled={isPrevDisabled}
                    className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-[#1B4712] text-white rounded-md shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-30 transition-all hover:bg-opacity-90"
                    aria-label="Предишна страница"
                >
                    <ChevronLeftIcon />
                </button>

                <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    style={rightArrowStyle}
                    className="fixed top-1/2 -translate-y-1/2 p-3 bg-[#1B4712] text-white rounded-md shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-30 transition-all hover:bg-opacity-90"
                    aria-label="Следваща страница"
                >
                    <ChevronRightIcon />
                </button>

                {isZoomed && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-85 flex flex-col" style={{ touchAction: 'none' }}>
                        <button className="absolute top-4 right-4 text-white text-5xl z-[60]" onClick={() => setIsZoomed(false)} aria-label="Close zoomed view">
                            &times;
                        </button>
                        
                        <div className="flex-grow w-full h-full flex justify-center items-center p-4">
                            <TransformWrapper
                                initialScale={1} minScale={0.5} maxScale={8} centerOnInit={true}
                                limitToBounds={true} doubleClick={{ disabled: true }}
                                wheel={{ step: 0.2 }} pinch={{ step: 5 }}
                                panning={{ velocityDisabled: false }}
                            >
                                <TransformComponent
                                    wrapperStyle={{ width: '100%', height: '100%' }}
                                    contentStyle={{ width: 'auto', height: 'auto', display: 'flex', justifyContent: 'center' }}
                                >
                                    <Document file={pdfFile}>
                                        <Page
                                            pageNumber={zoomedPage}
                                            height={window.innerHeight * 0.9}
                                            devicePixelRatio={Math.min(window.devicePixelRatio || 1, 3)}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                </TransformComponent>
                            </TransformWrapper>
                        </div>
                    </div>
                )}
            </div>

            {sidebarTransitions((style, item) =>
                item && (
                    <animated.div style={style} className="flex-shrink-0 h-screen overflow-hidden bg-white shadow-lg z-40">
                        {item === 'pages' ? (
                            <PageThumbnailSidebar
                                onClose={() => setSidebarContent(null)}
                                totalPages={totalPages}
                                onPageSelect={handlePageSelect}
                                pdfFile={pdfFile}
                                currentPage={currentPage + 1}
                            />
                        ) : (
                            <MenuSidebar
                                onClose={() => setSidebarContent(null)}
                                onHomeClick={() => navigate('/')}
                                onShareClick={handleShare}
                            />
                        )}
                    </animated.div>
                )
            )}
        </div>
    );
};

export default DesktopBrochure;