import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import UserAuthModal from './UserAuthModal';

const CommentSection = ({ itemId, comments = [], onAdd, onLike, onReport, onUpdate, onDelete }) => {
  const { user } = useData();
  const [newComment, setNewComment] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Sort comments by likes (descending)
  const sortedComments = [...comments].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (window.confirm('Login First to join the discussion! Would you like to sign in now?')) {
        setShowAuthModal(true);
      }
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const result = await onAdd(itemId, {
      user: user.username,
      content: newComment
    });
    
    if (result?.success) {
      setNewComment('');
    } else {
      console.error("Post Comment Fail:", result?.error);
      alert(result?.error || 'Failed to post comment');
    }

    setIsSubmitting(false);
  };

  const handleLike = (commentId) => {
    if (!user) {
      if (window.confirm('Login First to like this comment! Would you like to sign in now?')) {
        setShowAuthModal(true);
      }
      return;
    }
    onLike(itemId, commentId);
  };

  const handleEditInit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    const result = await onUpdate(itemId, commentId, { content: editContent });
    if (result?.success !== false) {
      setEditingId(null);
      setEditContent('');
    } else {
      alert(result?.error || 'Failed to update comment');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const result = await onDelete(itemId, commentId);
      if (result?.success === false) {
        alert(result?.error || 'Failed to delete comment');
      }
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-white md:text-slate-900 uppercase tracking-tighter">
          Discussions <span className="text-primary-red ml-2 bg-primary-red/5 px-2 py-0.5 rounded text-sm">{comments.length}</span>
        </h3>
        {!user && (
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-[9px] font-black uppercase tracking-widest text-primary-red hover:underline"
          >
            Sign in to join
          </button>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6 group">
        <div className="relative bg-slate-50 rounded-xl p-0.5 transition-all focus-within:ring-2 focus-within:ring-primary-red/5 focus-within:bg-white border border-slate-100 group-focus-within:border-primary-red/20 shadow-sm">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-20 p-4 bg-transparent outline-none text-slate-700 font-semibold resize-none text-sm placeholder:text-slate-300 placeholder:italic"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center p-2 border-t border-slate-100 bg-white/50 rounded-b-lg">
             <div className="flex items-center gap-2 px-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live discussion</span>
             </div>
             <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-primary-red hover:shadow-lg transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment, index) => (
            <div key={comment._id || `comment-${index}`} className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm hover:shadow-md transition-all group lg:p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] shadow-inner">
                    {(comment.user || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs tracking-tight leading-none mb-1">{comment.user}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLike(comment._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                      comment.isLiked 
                        ? 'bg-primary-red text-white shadow-md shadow-primary-red/20' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <i className={`${comment.isLiked ? 'fas' : 'far'} fa-heart`}></i>
                    <span>{comment.likes || 0}</span>
                  </button>
                  
                  {onReport && (
                    <button 
                      onClick={() => onReport(itemId, comment._id)}
                      className="text-slate-200 hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-flag text-[10px]"></i>
                    </button>
                  )}
                </div>
              </div>
              {editingId === comment._id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm text-slate-700 font-semibold resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
                    <button onClick={() => handleUpdate(comment._id)} className="bg-slate-900 text-white px-4 py-1.5 rounded text-[9px] font-black uppercase">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 font-medium text-sm leading-relaxed pl-10.5">
                  {comment.content}
                </p>
              )}

              {(user && (user.username === comment.user || user.role === 'admin' || user.role === 'sub-admin')) && editingId !== comment._id && (
                <div className="flex items-center gap-3 mt-3 ml-10.5 border-t border-slate-50 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {user.username === comment.user && (
                    <button onClick={() => handleEditInit(comment)} className="text-[8px] font-black uppercase text-slate-400 hover:text-primary-red">Edit</button>
                  )}
                  <button onClick={() => handleDelete(comment._id)} className="text-[8px] font-black uppercase text-slate-400 hover:text-primary-red">Delete</button>
                </div>
              )}
            </div>
          ))
        ) : null}
      </div>

      <UserAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default CommentSection;
