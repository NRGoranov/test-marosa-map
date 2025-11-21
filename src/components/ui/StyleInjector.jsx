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

        /* --- Styles for Custom Scrollbar (Global) --- */
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

        /* --- Custom Scrollbar for Left Panel (Location Cards) --- */
        .left-panel-scroll {
            /* Firefox */
            scrollbar-width: thin;
            scrollbar-color: #266819 #E4F1DF;
        }

        /* Webkit scrollbar for left panel - Desktop */
        .left-panel-scroll::-webkit-scrollbar {
            width: 9px;
            height: 9px;
        }

        /* Webkit scrollbar for left panel - Mobile */
        @media (max-width: 768px) {
            .left-panel-scroll::-webkit-scrollbar {
                width: 5px;
                height: 5px;
            }
        }

        /* Hide scrollbar buttons/arrows completely - all possible selectors */
        .left-panel-scroll::-webkit-scrollbar-button {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        /* Hide scrollbar buttons individually (top, bottom, left, right) */
        .left-panel-scroll::-webkit-scrollbar-button:single-button {
            display: none !important;
        }

        .left-panel-scroll::-webkit-scrollbar-button:double-button {
            display: none !important;
        }

        .left-panel-scroll::-webkit-scrollbar-button:start:decrement,
        .left-panel-scroll::-webkit-scrollbar-button:end:increment {
            display: none !important;
        }

        /* Track - very light green/grey, almost invisible, matches card background */
        .left-panel-scroll::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 0;
            margin: 0;
            border: none;
        }

        /* Thumb - slim green pill matching brand color */
        .left-panel-scroll::-webkit-scrollbar-thumb {
            background: #266819;
            border-radius: 9999px;
            border: 1px solid #1B4712;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
            transition: background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            min-height: 40px;
        }

        /* Corner - hide scrollbar corner where buttons meet */
        .left-panel-scroll::-webkit-scrollbar-corner {
            background: transparent;
        }

        /* Thumb hover - slightly darker */
        .left-panel-scroll::-webkit-scrollbar-thumb:hover {
            background: #1B4712;
            border-color: #15380E;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.12);
        }

        /* Thumb active/dragging - darkest green */
        .left-panel-scroll::-webkit-scrollbar-thumb:active {
            background: #15380E;
            border-color: #0F2A0A;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        [data-rsbs-header] {
            box-shadow: none !important;
            border-bottom: none !important;
        }

        [data-rsbs-overlay] {
            --rsbs-overlay-rounded: 36px;
        }

        /* --- Left Panel Boundary Shadow --- */
        .left-panel-container::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 1px;
            background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.08));
            pointer-events: none;
            z-index: 20;
        }

        /* --- Smooth Top Gradient Fade for Scroll Area --- */
        .left-panel-scroll::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 9px;
            height: 40px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 35%, rgba(255, 255, 255, 0) 100%);
            pointer-events: none;
            z-index: 10;
        }

        /* --- Smooth Bottom Gradient Fade for Scroll Area --- */
        .left-panel-scroll::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 9px;
            height: 40px;
            background: linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 35%, rgba(255, 255, 255, 0) 100%);
            pointer-events: none;
            z-index: 10;
        }
        `}
    </style>
);

export default StyleInjector;