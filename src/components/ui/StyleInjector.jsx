import React from 'react';

const StyleInjector = () => (
    <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;800&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
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
            scrollbar-color: #6D7F69 #F9FFFA;
        }

        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        ::-webkit-scrollbar-track {
            background: #F9FFFA;
            border-radius: 12px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #6D7F69 0%, #7A8E74 100%);
            border-radius: 12px;
            border: 2px solid #F9FFFA;
            transition: all 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #1B4712 0%, #266819 100%);
            border: 2px solid #EAF6E7;
        }

        ::-webkit-scrollbar-thumb:active {
            background: linear-gradient(180deg, #15380E 0%, #1B4712 100%);
        }

        /* Horizontal scrollbar */
        ::-webkit-scrollbar:horizontal {
            height: 10px;
        }

        [data-rsbs-header] {
            box-shadow: none !important;
            border-bottom: none !important;
        }

        [data-rsbs-overlay] {
            --rsbs-overlay-rounded: 36px;
        }
        `}
    </style>
);

export default StyleInjector;