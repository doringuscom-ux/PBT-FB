import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import SlugMigrator from '../components/SlugMigrator';
import * as api from '../api';

const Dashboard = () => {
  const { movies, news, celebs, videos, user, manualAnnouncements: announcements, addAnnouncement, deleteAnnouncement } = useData();
  const [newAnn, setNewAnn] = useState('');

  const handleAddAnn = async (e) => {
    e.preventDefault();
    if (!newAnn.trim()) return;
    await addAnnouncement(newAnn.trim());
    setNewAnn('');
  };

  const handleRemoveAnn = async (id) => {
    await deleteAnnouncement(id);
  };

  const [subStats, setSubStats] = useState({ total: 0 });

  useEffect(() => {
    const fetchSubStats = async () => {
      try {
        const res = await api.getSubStats();
        setSubStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchSubStats();
  }, []);

  const releasedMoviesCount = movies.filter(m => !m.releaseDate || new Date(m.releaseDate) <= new Date()).length;
  const upcomingMoviesCount = movies.filter(m => m.releaseDate && new Date(m.releaseDate) > new Date()).length;

  const stats = [
    { name: 'Subscribers', count: subStats.total, icon: 'fas fa-users', color: 'bg-teal-600' },
    { name: 'Released Movies', count: releasedMoviesCount, icon: 'fas fa-film', color: 'bg-blue-600' },
    { name: 'Upcoming Movies', count: upcomingMoviesCount, icon: 'fas fa-calendar-alt', color: 'bg-indigo-600' },
    { name: 'News Articles', count: news.length, icon: 'fas fa-newspaper', color: 'bg-red-500' },
    { name: 'Featured Videos', count: videos.length, icon: 'fas fa-video', color: 'bg-purple-500' },
  ];

  // Derive recent activity from actual data
  const formatActivityTime = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const activities = [
    ...movies.slice(-3).map(m => ({ text: `New Movie: ${m.title}`, time: formatActivityTime(m.createdAt), date: m.createdAt })),
    ...news.slice(-3).map(n => ({ text: `News Posted: ${n.title}`, time: formatActivityTime(n.createdAt), date: n.createdAt })),
    ...celebs.slice(-3).map(c => ({ text: `New Celeb: ${c.name}`, time: formatActivityTime(c.createdAt), date: c.createdAt })),
    ...videos.slice(-3).map(v => ({ text: `Video Added: ${v.title}`, time: formatActivityTime(v.createdAt), date: v.createdAt })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-text-dark">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex items-center gap-5">
            <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-inner`}>
              <i className={stat.icon}></i>
            </div>
            <div>
              <p className="text-text-gray text-sm font-bold uppercase tracking-wider">{stat.name}</p>
              <h3 className="text-3xl font-black text-text-dark">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-6 text-text-dark">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
        <QuickActionLink to="/admin/movies" icon="fas fa-film" text="Movies" color="bg-blue-600" />
        <QuickActionLink to="/admin/upcoming" icon="fas fa-calendar-plus" text="Upcoming" color="bg-indigo-600" />
        <QuickActionLink to="/admin/news" icon="fas fa-edit" text="Post News" color="bg-red-600" />
        <QuickActionLink to="/admin/subscribers" icon="fas fa-mail-bulk" text="Newsletter" color="bg-amber-600" />
        <QuickActionLink to="/admin/celebrities" icon="fas fa-user-plus" text="Add Celeb" color="bg-yellow-600" />
        <QuickActionLink to="/admin/videos" icon="fas fa-video" text="Upload Video" color="bg-purple-600" />
        {user?.role === 'admin' && (
          <QuickActionLink to="/admin/users" icon="fas fa-users-cog" text="Users" color="bg-teal-600" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-primary-red uppercase tracking-wider text-xs italic">
            <i className="fas fa-bullhorn animate-bounce"></i> Announcement Bar Manager
          </h3>
          <form onSubmit={handleAddAnn} className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Add new scrolling alert..." 
              className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
              value={newAnn}
              onChange={(e) => setNewAnn(e.target.value)}
            />
            <button type="submit" className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red">Add</button>
          </form>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {announcements.map((ann) => (
              <div key={ann._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm group">
                <span className="text-text-dark flex-1 italic">"{ann.text}"</span>
                <button onClick={() => handleRemoveAnn(ann._id)} className="text-gray-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-history text-primary-red"></i> Recent Activity
          </h3>
          <ul className="space-y-3">
            {activities.length > 0 ? (
              activities.map((act, i) => (
                <ActivityItem key={i} text={act.text} time={act.time} />
              ))
            ) : (
              <ActivityItem text="No recent activity to show" time="-" />
            )}
          </ul>
        </div>
        
        <div className="bg-primary-red/5 border border-primary-red/10 rounded-xl p-6">
          <h3 className="font-bold mb-4 text-primary-red uppercase tracking-widest text-xs">System Status</h3>
          <p className="text-text-dark text-sm leading-relaxed mb-4">
            The system is connected to the production MongoDB database. All changes are persistent and reflected immediately on the live site.
          </p>
          <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            CONNECTED TO BACKEND
          </div>
        </div>

        {/* Slug Migrator Tool */}
        <div className="lg:col-span-2">
            <SlugMigrator />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ text, time }) => (
  <li className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-none last:pb-0">
    <span className="text-text-dark font-medium">{text}</span>
    <span className="text-text-gray text-xs">{time}</span>
  </li>
);

const QuickActionLink = ({ to, icon, text, color }) => (
  <Link to={to} className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
    <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
      <i className={icon}></i>
    </div>
    <span className="font-black text-text-dark text-[10px] uppercase tracking-widest">{text}</span>
  </Link>
);

export default Dashboard;
