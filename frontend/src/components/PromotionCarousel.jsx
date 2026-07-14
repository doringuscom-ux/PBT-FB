"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPromotions } from '@/api';

const PromotionCarousel = () => {
    const [promotions, setPromotions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 because of clone
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const carouselRef = useRef(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await getPromotions();
                setPromotions(res.data);
            } catch (err) {
                console.error("Failed to fetch promotions", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (promotions.length > 1) {
            const interval = setInterval(() => {
                handleNext();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [promotions.length, currentIndex]);

    const handleNext = () => {
        if (currentIndex >= promotions.length + 1) return; // Prevent fast double clicking
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex <= 0) return; // Prevent fast double clicking
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    };

    // Replace onTransitionEnd with a reliable setTimeout
    useEffect(() => {
        if (promotions.length <= 1) return;

        let timer;
        if (currentIndex === promotions.length + 1) {
            timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(1);
            }, 700);
        } else if (currentIndex === 0) {
            timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(promotions.length);
            }, 700);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [currentIndex, promotions.length]);

    const scrollTo = (index) => {
        setIsTransitioning(true);
        setCurrentIndex(index + 1);
    };

    const extendedPromotions = promotions.length > 1
        ? [promotions[promotions.length - 1], ...promotions, promotions[0]]
        : promotions;

    if (isLoading || promotions.length === 0) return null;

    return (
        <>
            <style>{`
            .promo-aspect-box { aspect-ratio: 16 / 7; }
            @media (min-width: 768px) {
                .promo-aspect-box { aspect-ratio: 4 / 1; }
            }
            @media (min-width: 1024px) {
                .promo-aspect-box { aspect-ratio: 1240 / 220; }
            }
        `}</style>
            <div
                className="relative w-full overflow-hidden group py-2 md:py-4 mb-4"
            >
                {/* Dummy element to dictate perfect height based on 80% width */}
                <div className="w-[80%] mx-auto promo-aspect-box opacity-0 pointer-events-none"></div>

                {/* Carousel Track - Absolute positioned slides */}
                <div className="absolute inset-0 flex items-center justify-center py-2 md:py-4">
                    {extendedPromotions.map((promo, idx) => {
                        let offset = promotions.length === 1 ? 0 : idx - currentIndex;

                        // Handle infinite loop visual positioning
                        if (promotions.length > 1) {
                            if (currentIndex === 0 && idx === promotions.length) {
                                offset = -1;
                            } else if (currentIndex === promotions.length + 1 && idx === 1) {
                                offset = 1;
                            }
                        }

                        // Handle active state accurately even during clone jumps
                        const isActive = offset === 0;
                        const isVisualActive = isActive ||
                            (currentIndex === 0 && idx === promotions.length) ||
                            (currentIndex === promotions.length + 1 && idx === 1);

                        return (
                            <div
                                key={`${promo._id || idx}-${idx}`}
                                className="absolute top-2 bottom-2 md:top-4 md:bottom-4 left-0 right-0 mx-auto w-[80%] px-0.5 md:px-1 flex-shrink-0"
                                style={{
                                    transform: `translateX(${offset * 100}%)`,
                                    transitionDuration: isTransitioning ? '700ms' : '0ms',
                                    zIndex: isActive ? 20 : 10,
                                }}
                            >
                                {/* Inner container with rounded corners and conditional scaling */}
                                <div
                                    className={`w-full h-full relative rounded-xl overflow-hidden transition-all duration-700 ease-out ${isVisualActive ? 'scale-100 opacity-100 shadow-xl' : 'scale-[0.99] opacity-70'}`}
                                >
                                    {promo.link ? (
                                        <Link href={promo.link} className="block w-full h-full">
                                            <picture>
                                                {promo.mobileImage && <source media="(max-width: 639px)" srcSet={promo.mobileImage} />}
                                                {promo.tabletImage && <source media="(max-width: 1023px)" srcSet={promo.tabletImage} />}
                                                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                                            </picture>
                                        </Link>
                                    ) : (
                                        <picture>
                                            {promo.mobileImage && <source media="(max-width: 639px)" srcSet={promo.mobileImage} />}
                                            {promo.tabletImage && <source media="(max-width: 1023px)" srcSet={promo.tabletImage} />}
                                            <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                                        </picture>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Arrows */}
                {promotions.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-black/60 hover:bg-black/80 text-white rounded-r-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10 flex items-center justify-center"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-black/60 hover:bg-black/80 text-white rounded-l-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10 flex items-center justify-center"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Dots indicator - moved up to overlay inside the image bottom */}
                        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {promotions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollTo(idx)}
                                    className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${(currentIndex === idx + 1 || (currentIndex === 0 && idx === promotions.length - 1) || (currentIndex === promotions.length + 1 && idx === 0)) ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/60 hover:bg-white/90'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default PromotionCarousel;
