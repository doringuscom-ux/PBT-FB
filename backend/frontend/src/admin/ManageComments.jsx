import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';

const ManageComments = () => {
    const { 
        news, videos, movies, celebs, 
        deleteComment, deleteVideoComment, deleteMovieComment, deleteCelebComment,
        updateComment, updateVideoComment, updateMovieComment, updateCelebComment
    } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'news', 'video', 'movie', 'celeb'

    // Aggregate all comments
    const allComments = [];

    news.forEach(item => {
        if (item.comments) {
            item.comments.forEach(c => allComments.push({ ...c, _id: c._id || c.id, sourceTitle: item.title, sourceType: 'news', sourceId: item._id }));
        }
    });

    videos.forEach(item => {
        if (item.comments) {
            item.comments.forEach(c => allComments.push({ ...c, _id: c._id || c.id, sourceTitle: item.title, sourceType: 'video', sourceId: item._id }));
        }
    });

    movies.forEach(item => {
        if (item.comments) {
            item.comments.forEach(c => allComments.push({ ...c, _id: c._id || c.id, sourceTitle: item.title, sourceType: 'movie', sourceId: item._id }));
        }
    });

    celebs.forEach(item => {
        if (item.comments) {
            item.comments.forEach(c => allComments.push({ ...c, _id: c._id || c.id, sourceTitle: item.name, sourceType: 'celeb', sourceId: item._id }));
        }
    });


    // Sort by likes descending
    const sortedComments = allComments
        .filter(c => {
            const matchesSearch = (c.content || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                                (c.user || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                (c.sourceTitle || '').toLowerCase().includes((searchTerm || '').toLowerCase());
            const matchesType = filterType === 'all' || c.sourceType === filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => (b.likes || 0) - (a.likes || 0));

    const handleDelete = async (comment) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        
        try {
            if (comment.sourceType === 'news') await deleteComment(comment.sourceId, comment._id);
            else if (comment.sourceType === 'video') await deleteVideoComment(comment.sourceId, comment._id);
            else if (comment.sourceType === 'movie') await deleteMovieComment(comment.sourceId, comment._id);
            else if (comment.sourceType === 'celeb') await deleteCelebComment(comment.sourceId, comment._id);
        } catch (err) {
            alert('Error deleting comment');
        }
    };

    const handleUpdateLikes = async (comment, newLikes) => {
        console.log("Updating Likes:", { sourceId: comment.sourceId, commentId: comment._id, newLikes, sourceType: comment.sourceType });
        try {
            const data = { likes: newLikes };
            if (comment.sourceType === 'news') await updateComment(comment.sourceId, comment._id, data);
            else if (comment.sourceType === 'video') await updateVideoComment(comment.sourceId, comment._id, data);
            else if (comment.sourceType === 'movie') await updateMovieComment(comment.sourceId, comment._id, data);
            else if (comment.sourceType === 'celeb') await updateCelebComment(comment.sourceId, comment._id, data);
        } catch (err) {
            console.error('Error updating likes:', err);
            alert('Error updating likes');
        }
    };


    const getTypeColor = (type) => {
        switch(type) {
            case 'news': return 'bg-red-100 text-red-600';
            case 'video': return 'bg-purple-100 text-purple-600';
            case 'movie': return 'bg-blue-100 text-blue-600';
            case 'celeb': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-text-dark">Unified Comment Management</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Sorted by likes (Popularity)</p>
                    </div>
                    
                    <div className="flex flex-wrap w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="text" 
                                placeholder="Search comments, users or topics..." 
                                className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20 bg-white font-semibold text-sm"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Sources</option>
                            <option value="news">News Only</option>
                            <option value="video">Videos Only</option>
                            <option value="movie">Movies Only</option>
                            <option value="celeb">Celebrities Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Comment Details</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Source</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Likes</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedComments.length > 0 ? sortedComments.map((comment, index) => (
                                <tr key={comment._id || `comment-${index}`} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 max-w-md">
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed mb-1 italic">
                                            "{comment.content}"
                                        </p>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                            ID: {comment._id} • {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Date Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded w-fit uppercase ${getTypeColor(comment.sourceType)}`}>
                                                {comment.sourceType}
                                            </span>
                                            <span className="text-xs font-bold text-slate-600 line-clamp-1">{comment.sourceTitle}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {(comment.user || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">{comment.user || 'Anonymous'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleUpdateLikes(comment, (comment.likes || 0) + 1)}
                                                className="hover:scale-125 transition-transform text-primary-red"
                                                title="Increment Likes"
                                            >
                                                <i className="fas fa-heart text-[10px]"></i>
                                            </button>
                                            <input 
                                                type="number" 
                                                value={comment.likes || 0}
                                                onChange={(e) => handleUpdateLikes(comment, parseInt(e.target.value) || 0)}
                                                className="w-16 p-1 border border-slate-100 rounded text-xs font-black text-center focus:ring-2 focus:ring-primary-red/10 outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(comment)}
                                            className="text-slate-300 hover:text-primary-red transition-all p-2 rounded-full hover:bg-primary-red/5"
                                            title="Delete Comment"
                                        >
                                            <i className="fas fa-trash-alt text-sm"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-2xl">
                                                <i className="far fa-comments"></i>
                                            </div>
                                            <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">No comments matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageComments;
