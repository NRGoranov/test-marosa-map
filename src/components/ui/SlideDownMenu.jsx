import React from 'react';
import { useTransition, animated } from '@react-spring/web';

import SocialIcon from '../../assets/icons/SocialIcon';
import TikTokIcon from '../../assets/icons/TikTokIcon';
import InstagramIcon from '../../assets/icons/InstagramIcon';
import FacebookIcon from '../../assets/icons/FacebookIcon';
import ExternalLinkIcon from '../../assets/icons/ExternalLinkIcon';

const SlideDownMenu = ({ isOpen, onClose, onBrochureClick, onHomeClick, menuVariant = 'home' }) => {
    const transitions = useTransition(isOpen, {
        from: { 
            menuOpacity: 0, 
            scale: 0.95, 
            overlayOpacity: 0 
        },
        enter: { 
            menuOpacity: 1, 
            scale: 1, 
            overlayOpacity: 0 
        },
        leave: { 
            menuOpacity: 0, 
            scale: 0.95, 
            overlayOpacity: 0 
        },
        config: {
            tension: 200,
            friction: 25,
            mass: 0.8,
        },
    });

    const headerHeight = '84px';

    return transitions(
        (styles, item) =>
            item && (
                <>
                    <animated.div
                        style={{
                            backgroundColor: styles.overlayOpacity.to(o => `rgba(0, 0, 0, ${o})`)
                        }}
                        className="fixed inset-0 z-10"
                        onClick={onClose}
                    />

                    <animated.div
                        style={{
                            opacity: styles.menuOpacity,
                            transform: styles.scale.to(scale => `scale(${scale})`),
                            top: headerHeight
                        }}
                        className="fixed left-0 right-0 z-50 origin-top"
                    >
                        <div className="relative bg-white rounded-b-4xl shadow-xl overflow-hidden">
                            <div className="h-px w-full bg-gray-300" />

                            <div className="px-6 pt-6 text-center">
                                {menuVariant === 'home' ? (
                                    <button onClick={onBrochureClick} className="block w-full text-center text-xl font-medium text-[#1B4712]">
                                        Брошура
                                    </button>
                                ) : (
                                    <button onClick={onHomeClick} className="block w-full text-center text-xl font-medium text-[#1B4712]">
                                        Начало
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-300 h-px w-full my-6" />

                            <div className="px-6 text-center">
                                <a
                                    href="https://www.nedevbg.com/marosa-gradina"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center bg-[#266819] hover:bg-[#15380e] text-white rounded-full px-6 py-3.5 text-lg font-semibold transition-colors"
                                >
                                    Онлайн магазин <ExternalLinkIcon />
                                </a>
                            </div>

                            <div className="px-6 pb-6 text-center mt-6">
                                <div className="flex justify-center space-x-4">
                                    <SocialIcon href="https://www.tiktok.com/@nedev.bg?_t=ZN-8xUznEkh4Mg" label="TikTok"><TikTokIcon /></SocialIcon>
                                    <SocialIcon href="https://www.instagram.com/marosagradina?igsh=MXhld2tjd2hyaWphag==" label="Instagram"><InstagramIcon /></SocialIcon>
                                    <SocialIcon href="https://www.facebook.com/profile.php?id=100066825065618" label="Facebook"><FacebookIcon /></SocialIcon>
                                </div>
                            </div>
                        </div>
                    </animated.div>
                </>
            )
    );
};

export default SlideDownMenu;