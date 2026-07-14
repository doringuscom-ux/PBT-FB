import React, { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser, blockUser, updateUserPassword, updateUser } from '../api';
import { Navigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useData } from '../context/DataContext';

const ManageUsers = () => {
    const { user } = useData();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    
    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    // User Details State
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    // Editing State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ id: '', username: '', fullName: '', email: '', phone: '', role: '', employeeId: '' });

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });
    
    const userRole = user?.role;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await createUser({ username, password, email, fullName, phone, employeeId, role: 'sub-admin' });
            setUsername('');
            setPassword('');
            setEmail('');
            setFullName('');
            setPhone('');
            setEmployeeId('');
            setShowForm(false);
            fetchUsers();
            alert('Sub-Admin created successfully');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create user';
            setError(msg);
            alert('Error: ' + msg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (err) {
                const msg = err.response?.data?.message || 'Failed to delete user';
                setError(msg);
                alert('Error: ' + msg);
            }
        }
    };

    const handleBlockToggle = async (id) => {
        try {
            await blockUser(id);
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to toggle block status';
            setError(msg);
            alert('Error: ' + msg);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!newPassword) return;
        try {
            await updateUserPassword(selectedUserId, newPassword);
            setShowPasswordModal(false);
            setNewPassword('');
            setSelectedUserId(null);
            alert('Password updated successfully');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password';
            setError(msg);
            alert('Error: ' + msg);
        }
    };

    const handleEditClick = (u) => {
        setEditData({
            id: u._id,
            username: u.username,
            fullName: u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
            role: u.role,
            employeeId: u.employeeId || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await updateUser(editData.id, editData);
            setShowEditModal(false);
            fetchUsers();
            alert('User updated successfully');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update user';
            setError(msg);
            alert('Error: ' + msg);
        }
    };

    if (userRole !== 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Users Database...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-text-dark">Admin & User Control</h2>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64 flex gap-2">
                            <div className="relative flex-1">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search users or email..." 
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-semibold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20 bg-white font-bold text-xs uppercase"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admins</option>
                                <option value="sub-admin">Sub-Admins</option>
                                <option value="user">Users</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => setShowForm(true)}
                            className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-red/20"
                        >
                            <i className="fas fa-user-plus"></i> <span className="hidden sm:inline">Add Admin</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {/* Edit User Modal */}
            <Modal 
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)} 
                title="Edit User Profile"
            >
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Full Name</label>
                            <input 
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                                value={editData.fullName}
                                onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email Address</label>
                            <input 
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Phone Number</label>
                            <input 
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                                value={editData.phone}
                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Access Role</label>
                            <select 
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20 bg-white"
                                value={editData.role}
                                onChange={(e) => setEditData({...editData, role: e.target.value})}
                            >
                                <option value="user">User</option>
                                <option value="sub-admin">Sub-Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Employee ID</label>
                            <input 
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                                value={editData.employeeId}
                                onChange={(e) => setEditData({...editData, employeeId: e.target.value})}
                                placeholder="Mandatory for sub-admins"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                        <button type="submit" className="flex-1 bg-primary-red text-white font-bold py-3 rounded-xl hover:bg-secondary-red transition-all shadow-lg shadow-primary-red/20">
                            Save Changes
                        </button>
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Sub-Admin Modal */}
            <Modal 
                isOpen={showForm} 
                onClose={() => setShowForm(false)} 
                title="Create New Sub-Admin"
            >
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Username</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Full Name</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            placeholder="Enter full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email Address</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Phone Number</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            placeholder="e.g. +91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Employee ID (Mandatory)</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            placeholder="e.g. EMP-2024-001"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Password</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                            Create Account
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* User Details Modal */}
            <Modal 
                isOpen={showDetailsModal} 
                onClose={() => setShowDetailsModal(false)} 
                title="User Profile Details"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary-red/10 text-primary-red flex items-center justify-center text-2xl font-black">
                                {(selectedUser.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-dark">{selectedUser.fullName || selectedUser.username}</h3>
                                <p className="text-sm text-gray-500 font-medium">@{selectedUser.username}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                <p className="font-bold text-slate-700">{selectedUser.email || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                <p className="font-bold text-slate-700">{selectedUser.phone || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role / Designation</p>
                                <p className="font-bold text-slate-700 capitalize">{selectedUser.role}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</p>
                                <p className="font-bold text-primary-red">{selectedUser.employeeId || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                                <p className={`font-bold ${selectedUser.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                                    {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</p>
                                <p className="font-bold text-slate-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Password Reset Modal */}
            <Modal 
                isOpen={showPasswordModal} 
                onClose={() => setShowPasswordModal(false)} 
                title="Reset User Password"
            >
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4">
                        <p className="text-xs font-bold text-amber-700 flex items-center gap-2 uppercase tracking-wide">
                            <i className="fas fa-shield-alt"></i> Security Alert
                        </p>
                        <p className="text-xs text-amber-600 mt-1">This will instantly overwrite the user's password. They must use the new credentials for their next login.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">New Password</label>
                        <input 
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20"
                            type="password"
                            placeholder="Enter new complex password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-primary-red text-white font-bold py-3 rounded-xl hover:bg-secondary-red transition-colors shadow-lg shadow-primary-red/20">
                            Update Credentials
                        </button>
                        <button type="button" onClick={() => setShowPasswordModal(false)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map((u, index) => (
                    <div key={u._id || `user-${index}`} className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group ${u.isBlocked ? 'opacity-60 bg-slate-50' : ''}`}>
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black ${u.isBlocked ? 'bg-gray-200 text-gray-400' : 'bg-primary-red/10 text-primary-red'}`}>
                                {(u.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 font-bold text-lg text-text-dark">
                                    {u.username}
                                    {u.isBlocked && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Blocked</span>}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${u.role === 'admin' ? 'bg-accent-gold text-white' : 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider line-clamp-1">{u.email}</span>
                                </div>
                            </div>
                        </div>

                        {u.role !== 'admin' && (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button 
                                    onClick={() => handleEditClick(u)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    title="Edit User Profile"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => { setSelectedUser(u); setShowDetailsModal(true); }}
                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                                    title="View Full Details"
                                >
                                    Info
                                </button>
                                <button 
                                    onClick={() => handleBlockToggle(u._id)}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
                                    title={u.isBlocked ? 'Unlock User' : 'Revoke Access'}
                                >
                                    {u.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button 
                                    onClick={() => { setSelectedUserId(u._id); setShowPasswordModal(true); }}
                                    className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    title="Reset Password"
                                >
                                    Pass
                                </button>
                                <button 
                                    onClick={() => handleDelete(u._id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete Account Permanently"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageUsers;
