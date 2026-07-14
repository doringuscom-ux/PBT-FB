"use client";
import React from 'react';

const PageSkeleton = () => {
  return (
    <div className="w-full max-w-[1400px] px-4 md:px-6 lg:px-8 xl:px-12 py-8 mx-auto flex flex-col gap-12 animate-pulse mt-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Hero Skeleton */}
        <div className="flex-1 lg:w-[68%] xl:w-[70%]">
          <div className="w-full h-[350px] md:h-[450px] bg-slate-200 rounded-3xl"></div>
          <div className="mt-4 flex gap-4">
            <div className="w-1/4 h-24 bg-slate-200 rounded-xl hidden md:block"></div>
            <div className="w-1/4 h-24 bg-slate-200 rounded-xl hidden md:block"></div>
            <div className="w-1/4 h-24 bg-slate-200 rounded-xl hidden md:block"></div>
            <div className="w-1/4 h-24 bg-slate-200 rounded-xl hidden md:block"></div>
          </div>
        </div>
        
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex lg:w-[32%] xl:w-[30%] flex-col gap-8">
          <div className="w-full h-[250px] bg-slate-200 rounded-3xl"></div>
          <div className="w-full h-[180px] bg-slate-200 rounded-3xl"></div>
        </aside>
      </div>
      
      {/* Below Fold Skeletons */}
      <div className="space-y-8 mt-8">
        <div className="w-48 h-8 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
