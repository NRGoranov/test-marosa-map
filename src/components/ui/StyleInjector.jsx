import React from 'react';

const StyleInjector = () => (
    <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;800&display=swap');
        
        html, body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            position: fixed;
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
        }
        
        body {
            touch-action: none;
        }
        
        #root {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }
        .gm-style-iw {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
        }
        .gm-style-iw-c {
            padding: 0 !important;
            box-shadow: none !important;
            background-color: transparent !important;
        }
        .gm-style-iw-d {
            overflow: visible !important;
        }
        .gm-style-iw-t::after {
            display: none !important;
        }
        .gm-ui-hover-effect {
            display: none !important;
        }
        
        /* Map background color - only for loading state, not tiles */
        .mapSurface {
            background-color: #f5f9f3;
        }
        
        /* Only apply background to map container wrapper, not the actual map tiles */
        .mapSection {
            background-color: #f5f9f3;
        }
        
        /* Remove background from map tiles - let them show through */
        .gm-style,
        .gm-style > div,
        .gm-style > div > div {
            background-color: transparent !important;
        }
        
        /* Only the outer container should have the background */
        .gm-style > div:first-child {
            background-color: transparent !important;
        }
        
        /* --- Styles for Resizable Splitter --- */
        .gutter {
            background-color: #F7F7F7;
            background-repeat: no-repeat;
            background-position: 50%;
        }

        .gutter.gutter-horizontal {
            cursor: col-resize;
            position: relative;
        }
        
        .gutter.gutter-horizontal:hover {
            background-color: #EAEAEA;
        }

        .gutter.gutter-horizontal::after {
            content: '';
            display: block;
            width: 4px;
            height: 40px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #BDBDBD;
            border-radius: 4px;
            opacity: 0.5;
            transition: opacity 0.2s ease-in-out;
        }

        .gutter.gutter-horizontal:hover::after {
            opacity: 1;
        }

        /* --- Styles for Custom Scrollbar --- */
        * {
            scrollbar-width: thin;
            scrollbar-color: #BDBDBD #F7F7F7;
        }


        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #F7F7F7;
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
            background-color: #BDBDBD;
            border-radius: 10px;
            border: 2px solid #F7F7F7;
        }

        ::-webkit-scrollbar-thumb:hover {
            background-color: #888888;
        }

        [data-rsbs-header] {
            box-shadow: none !important;
            border-bottom: none !important;
        }

        [data-rsbs-overlay] {
            --rsbs-overlay-rounded: 36px;
        }

        /* Share Modal Animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
        }
        `}
    </style>
);

export default StyleInjector;