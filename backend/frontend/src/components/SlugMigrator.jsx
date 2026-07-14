import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { slugify } from '../utils/slugify';

const SlugMigrator = () => {
    const { news, movies, videos, celebs, updateNews, updateMovie, updateVideo, updateCeleb } = useData();
    const [isMigrating, setIsMigrating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState([]);

    const migrate = async () => {
        setIsMigrating(true);
        setResults([]);
        
        const tasks = [
            { items: news, type: 'News', updateFn: updateNews, getSlug: (i) => `${slugify(i.category)}/${slugify(i.title)}` },
            { items: movies, type: 'Movie', updateFn: updateMovie, getSlug: (i) => `${slugify(i.industry)}/${slugify(i.title)}` },
            { items: videos, type: 'Video', updateFn: updateVideo, getSlug: (i) => `${slugify(i.category)}/${slugify(i.title)}` },
            { items: celebs, type: 'Celeb', updateFn: updateCeleb, getSlug: (i) => `${slugify(i.industry)}/${slugify(i.name)}` },
        ];

        let totalToMigrate = 0;
        const migrationQueue = [];

        tasks.forEach(task => {
            task.items.forEach(item => {
                const currentSlug = item.slug || '';
                // Only migrate if slug is empty, doesn't have a slash, or is just an ID
                if (!currentSlug || !currentSlug.includes('/') || currentSlug === item._id) {
                    migrationQueue.push({ ...task, item });
                }
            });
        });

        totalToMigrate = migrationQueue.length;
        setProgress({ current: 0, total: totalToMigrate });

        if (totalToMigrate === 0) {
            alert("All slugs are already nested! No migration needed.");
            setIsMigrating(false);
            return;
        }

        const newResults = [];
        for (let i = 0; i < migrationQueue.length; i++) {
            const { type, updateFn, getSlug, item } = migrationQueue[i];
            const newSlug = getSlug(item);
            
            if (newSlug !== item.slug) {
                const res = await updateFn(item._id, { slug: newSlug });
                newResults.push({
                    id: item._id,
                    title: item.title || item.name,
                    type,
                    oldSlug: item.slug || 'None',
                    newSlug,
                    success: res.success
                });
            }
            
            setProgress(prev => ({ ...prev, current: i + 1 }));
            setResults([...newResults]);
        }

        setIsMigrating(false);
        alert(`Migration complete! ${newResults.length} items updated.`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Nested Slug Migrator</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Convert all flat URLs to Category/Name format</p>
                </div>
                <button 
                    onClick={migrate} 
                    disabled={isMigrating}
                    className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${isMigrating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-red text-white hover:bg-secondary-red animate-pulse'}`}
                >
                    {isMigrating ? 'Migrating...' : '🚀 Start Migration'}
                </button>
            </div>

            {isMigrating && (
                <div className="mb-8">
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                        <span className="text-slate-400">Processing Items...</span>
                        <span className="text-primary-red">{progress.current} / {progress.total}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div 
                            className="h-full bg-primary-red transition-all duration-300 shadow-[0_0_10px_rgba(230,57,70,0.5)]" 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {results.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-[10px] font-black uppercase tracking-widest">
                        <thead className="bg-slate-50 text-slate-400">
                            <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Old URL</th>
                                <th className="px-4 py-3">New URL</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {results.map((res, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-400">{res.type}</td>
                                    <td className="px-4 py-3 text-slate-900 truncate max-w-[150px]">{res.title}</td>
                                    <td className="px-4 py-3 text-slate-400 line-through truncate max-w-[150px]">{res.oldSlug}</td>
                                    <td className="px-4 py-3 text-primary-red italic truncate max-w-[150px]">{res.newSlug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] ${res.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {res.success ? 'Success' : 'Failed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {!isMigrating && results.length === 0 && (
                <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                    <i className="fas fa-magic text-slate-200 text-4xl mb-4"></i>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Click the button above to fix all legacy URLs in one go!</p>
                </div>
            )}
        </div>
    );
};

export default SlugMigrator;
