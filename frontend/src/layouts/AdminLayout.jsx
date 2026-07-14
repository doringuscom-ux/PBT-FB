"use client";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';


import React from 'react';
import Logo from '../components/Logo';
import { useData } from '../context/DataContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useData();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
      router.push('/admin/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary-red rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role;

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'fas fa-th-large' },
    { name: 'Movies', path: '/admin/movies', icon: 'fas fa-film' },
    { name: 'News', path: '/admin/news', icon: 'fas fa-newspaper' },
    { name: 'Sports News', path: '/admin/sports', icon: 'fas fa-running' },
    { name: 'Celebrities', path: '/admin/celebrities', icon: 'fas fa-star' },
    { name: 'Videos', path: '/admin/videos', icon: 'fas fa-video' },
    { name: 'Comments', path: '/admin/comments', icon: 'fas fa-comments text-primary-red' },
    { name: 'Promotions', path: '/admin/promotions', icon: 'fas fa-bullhorn text-yellow-400' },
    { name: 'Subscribers', path: '/admin/subscribers', icon: 'fas fa-mail-bulk text-amber-500' },
    { name: 'WhatsApp Leads', path: '/admin/whatsapp-leads', icon: 'fab fa-whatsapp text-green-500' },
    { name: 'Promotion Leads', path: '/admin/promotion-leads', icon: 'fas fa-users-viewfinder text-blue-500' },
    { name: 'SEO Manager', path: '/admin/seo', icon: 'fas fa-search-dollar text-cyan-500' },
    { name: 'Redirects', path: '/admin/redirects', icon: 'fas fa-directions text-purple-500' },
  ];

  if (userRole === 'admin') {
    menuItems.push({ name: 'Users', path: '/admin/users', icon: 'fas fa-users-cog' });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="fixed top-4 left-4 z-[60] bg-dark-bg text-white p-2 rounded-lg md:hidden shadow-lg shadow-black/20"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Sidebar */}
      <aside className={`w-64 bg-dark-bg text-white flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <Link href="/" className="no-underline">
            <Logo className="h-16 w-auto" />
          </Link>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 italic">Control Center</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold ${pathname === item.path ? 'bg-primary-red text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              <i className={item.icon}></i>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white transition-colors font-bold"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-text-dark">Admin Control Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-text-gray">Welcome, Admin</span>
            <div className="w-10 h-10 bg-accent-gold rounded-full flex items-center justify-center text-white font-bold">A</div>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-160px)] border border-gray-200">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
