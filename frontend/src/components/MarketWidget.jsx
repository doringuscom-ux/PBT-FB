"use client";
import React, { useState, useEffect } from 'react';
import { getWidgets } from '../api';

const MarketWidget = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMarket = async () => {
        try {
            const res = await getWidgets();
            if (res.data.market) {
                setData(res.data.market);
            }
        } catch (err) {
            console.error('Market Fetch Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarket();
        const interval = setInterval(fetchMarket, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="hidden md:block relative overflow-hidden rounded-2xl skeleton min-h-[140px] lg:min-h-[180px] w-full border border-white/5 shadow-2xl">
            <div className="p-4 space-y-4">
                <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse"></div>
                <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse"></div>
            </div>
        </div>
    );
    if (!data) return null;

    return (
        <div className="hidden md:block relative overflow-hidden rounded-2xl shadow-xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 min-h-[140px] lg:min-h-[180px]">
            {/* Header */}
            <div className="px-3 py-2 lg:px-4 lg:py-3 border-b border-white/5 bg-white/5 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-1.5 lg:gap-2">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                    <h3 className="text-white font-black text-[9px] lg:text-[11px] tracking-widest uppercase italic">Market Status</h3>
                </div>
                <span className="text-[7px] lg:text-[8px] text-white/30 font-bold uppercase tracking-widest">Verified</span>
            </div>
            
            {/* Content */}
            <div className="p-3 space-y-2 relative z-10">
                {data.map((item, index) => (
                    <div key={index} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 p-2 lg:p-3 rounded-xl border border-white/5 transition-all duration-500">
                        {/* Status Indicating Gradient */}
                        <div className={`absolute -right-10 -top-10 w-20 h-20 lg:w-24 lg:h-24 blur-3xl opacity-10 transition-transform duration-1000 group-hover:scale-150 ${item.up ? 'bg-green-500' : 'bg-red-500'}`}></div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 lg:gap-2 mb-0.5">
                                    <span className="text-[6px] lg:text-[7px] font-black bg-white/10 px-1 py-0.5 rounded text-white/50">{item.exchange}</span>
                                    <h4 className="text-[8px] lg:text-[9px] font-black text-white/70 uppercase tracking-tighter">{item.name}</h4>
                                </div>
                                <div className="text-lg lg:text-xl font-black text-white tracking-tighter tabular-nums drop-shadow-lg leading-none">
                                    {item.price}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-1 font-black text-[10px] lg:text-xs ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                                    <i className={`fas ${item.up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[8px] lg:text-[10px]`}></i>
                                    {item.change}
                                </div>
                                <div className="text-[7px] lg:text-[8px] font-bold text-white/20 uppercase mt-0.5 tracking-tighter">
                                    {item.high} | {item.low}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 flex justify-between items-center opacity-30">
                <span className="text-[7px] text-white font-bold uppercase tracking-widest">Finance Data</span>
                <i className="fas fa-shield-check text-green-400 text-[8px]"></i>
            </div>

            {/* Polish Effects */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
};

export default MarketWidget;
