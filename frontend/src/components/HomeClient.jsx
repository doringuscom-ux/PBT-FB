"use client";
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

import Hero from '@/components/Hero';
import PromotionCarousel from '@/components/PromotionCarousel';
import MovieSlider from '@/components/MovieSlider';
import MovieCalendar from '@/components/MovieCalendar';
import NewsGrid from '@/components/NewsGrid';
import CelebGrid from '@/components/CelebGrid';
import SidebarVideos from '@/components/SidebarVideos';
import CompactNewsSlider from '@/components/CompactNewsSlider';
import CompactMoviesSlider from '@/components/CompactMoviesSlider';
import CompactTrailersSlider from '@/components/CompactTrailersSlider';
import CompactCelebSlider from '@/components/CompactCelebSlider';
import CompactSongsSlider from '@/components/CompactSongsSlider';

export default function HomeClient() {
  return (
    <MainLayout>
      <PromotionCarousel />


      <main className="page-container pb-2 lg:pb-4 pt-0">
        <h1 className="sr-only">Pbtadka - Latest News, Movies, & Celebrity Updates</h1>

        <div className="space-y-8 lg:space-y-12">




          {/* Hero and Sidebar Row (Moved below Celebrities) */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-10 xl:gap-12 items-stretch lg:px-24 xl:px-48 my-8">
            {/* Left Column (Hero) */}
            <div className="flex-1 lg:w-[65%] xl:w-[66%] min-w-0 flex flex-col">
              <Hero />
            </div>

            {/* Right Column (Sidebar) */}
            <aside className="hidden lg:block lg:w-[35%] xl:w-[34%] relative">
              <div className="absolute inset-0">
                <SidebarVideos />
              </div>
            </aside>
          </div>



          {/* Compact Sliders Row */}
          <div className="flex flex-col">
            <MovieCalendar />
            <CompactTrailersSlider />
            <CompactMoviesSlider />
            <CompactNewsSlider />
            <CompactCelebSlider />

            <div className="space-y-12">
              <NewsGrid />
              <CompactSongsSlider />
              <CelebGrid />
            </div>

          </div>




          {/* Full Width Sections Below Hero/Widgets Row */}
        </div>
      </main>
    </MainLayout>
  );
}
