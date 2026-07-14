import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { getPromotions, addPromotion, updatePromotion, deletePromotion } from '@/api';
import Modal from '@/components/Modal';
import ImageCropperModal from '@/components/ImageCropperModal';

const ManagePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form Data
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState(0);
    
    // Desktop Image
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [croppedImagePreviewUrl, setCroppedImagePreviewUrl] = useState(null);

    // Mobile Image
    const [mobileImageFile, setMobileImageFile] = useState(null);
    const [mobileImageUrl, setMobileImageUrl] = useState('');
    const [croppedMobilePreviewUrl, setCroppedMobilePreviewUrl] = useState(null);

    // Tablet Image
    const [tabletImageFile, setTabletImageFile] = useState(null);
    const [tabletImageUrl, setTabletImageUrl] = useState('');
    const [croppedTabletPreviewUrl, setCroppedTabletPreviewUrl] = useState(null);

    const [editingId, setEditingId] = useState(null);

    // Cropper State
    const [imageSrc, setImageSrc] = useState(null);
    const [cropType, setCropType] = useState('desktop'); // 'desktop', 'tablet', or 'mobile'

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await getPromotions();
            setPromotions(res.data);
        } catch (err) {
            console.error("Error fetching promotions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageSrc(reader.result);
                setCropType(type);
                if (type === 'desktop') {
                    setImageFile(null);
                } else if (type === 'tablet') {
                    setTabletImageFile(null);
                } else {
                    setMobileImageFile(null);
                }
            };
            e.target.value = null;
        }
    };

    const handleCropComplete = (croppedFile) => {
        const objectUrl = URL.createObjectURL(croppedFile);
        
        if (cropType === 'desktop') {
            setImageFile(croppedFile);
            setCroppedImagePreviewUrl(objectUrl);
            setImageUrl('');
        } else if (cropType === 'tablet') {
            setTabletImageFile(croppedFile);
            setCroppedTabletPreviewUrl(objectUrl);
            setTabletImageUrl('');
        } else {
            setMobileImageFile(croppedFile);
            setCroppedMobilePreviewUrl(objectUrl);
            setMobileImageUrl('');
        }
        
        setImageSrc(null); // Hide cropper
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingId && !imageFile && !imageUrl) {
            alert("Please upload an image or provide an image URL for the Desktop banner.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('link', link);
        formData.append('isActive', isActive);
        formData.append('order', order);
        
        // Desktop Image
        if (imageFile) {
            formData.append('image', imageFile, 'cropped-promotion.jpg');
        } else if (imageUrl) {
            formData.append('imageUrl', imageUrl);
        }

        // Tablet Image
        if (tabletImageFile) {
            formData.append('tabletImage', tabletImageFile, 'cropped-tablet-promotion.jpg');
        } else if (tabletImageUrl) {
            formData.append('tabletImageUrl', tabletImageUrl);
        }

        // Mobile Image
        if (mobileImageFile) {
            formData.append('mobileImage', mobileImageFile, 'cropped-mobile-promotion.jpg');
        } else if (mobileImageUrl) {
            formData.append('mobileImageUrl', mobileImageUrl);
        }

        try {
            if (editingId) {
                await updatePromotion(editingId, formData);
            } else {
                await addPromotion(formData);
            }
            setShowForm(false);
            resetForm();
            fetchPromotions();
        } catch (err) {
            console.error("Error saving promotion:", err);
            alert("Failed to save promotion");
        }
    };

    const handleEdit = (promo) => {
        setEditingId(promo._id);
        setTitle(promo.title);
        setLink(promo.link || '');
        setIsActive(promo.isActive);
        setOrder(promo.order || 0);
        
        setImageFile(null);
        setImageUrl('');
        setCroppedImagePreviewUrl(promo.image || null);

        setMobileImageFile(null);
        setMobileImageUrl('');
        setCroppedMobilePreviewUrl(promo.mobileImage || null);
        
        setTabletImageFile(null);
        setTabletImageUrl('');
        setCroppedTabletPreviewUrl(promo.tabletImage || null);
        
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this promotion?")) {
            try {
                await deletePromotion(id);
                fetchPromotions();
            } catch (err) {
                alert("Failed to delete promotion");
            }
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setLink('');
        setIsActive(true);
        setOrder(0);
        
        setImageFile(null);
        setImageUrl('');
        setCroppedImagePreviewUrl(null);

        setMobileImageFile(null);
        setMobileImageUrl('');
        setCroppedMobilePreviewUrl(null);
        
        setTabletImageFile(null);
        setTabletImageUrl('');
        setCroppedTabletPreviewUrl(null);
        
        setImageSrc(null);
    };

    if (isLoading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Promotions</h1>
                        <p className="text-sm text-gray-500">Add, edit, or remove homepage banners</p>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Add Promotion
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotions.map(promo => (
                        <div key={promo._id} className={`bg-white rounded-xl shadow border p-4 ${!promo.isActive ? 'opacity-50' : ''}`}>
                            <div className="aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                                {!promo.isActive && (
                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">INACTIVE</div>
                                )}
                            </div>
                            {promo.tabletImage && (
                                <div className="text-xs text-blue-600 mb-1 font-semibold">
                                    <i className="fas fa-tablet-alt mr-1"></i> Tablet Image Provided
                                </div>
                            )}
                            {promo.mobileImage && (
                                <div className="text-xs text-green-600 mb-2 font-semibold">
                                    <i className="fas fa-mobile-alt mr-1"></i> Mobile Image Provided
                                </div>
                            )}
                            <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
                            <p className="text-xs text-blue-500 truncate mb-4">{promo.link || 'No Link'}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Order: {promo.order}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(promo)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDelete(promo._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Modal 
                    isOpen={showForm} 
                    onClose={() => { setShowForm(false); resetForm(); }}
                    title={editingId ? "Edit Promotion" : "Add Promotion"}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Title</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Target Link (URL)</label>
                            <input 
                                type="url" 
                                className="w-full p-2 border rounded" 
                                value={link} 
                                onChange={e => setLink(e.target.value)} 
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold mb-1">Order</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded" 
                                    value={order} 
                                    onChange={e => setOrder(e.target.value)} 
                                />
                            </div>
                            <div className="flex-1 flex items-center mt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isActive} 
                                        onChange={e => setIsActive(e.target.checked)} 
                                        className="w-4 h-4"
                                    />
                                    <span className="font-bold">Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Desktop Banner Column */}
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-blue-600 border-b pb-2">Desktop Banner</h3>
                                <label className="block text-sm font-bold mb-1">Upload File</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'desktop')} 
                                    className="w-full p-2 border rounded text-xs" 
                                />
                                
                                <div className="flex items-center my-3">
                                    <hr className="flex-1 border-gray-300" />
                                    <span className="px-3 text-gray-500 font-bold text-sm">OR</span>
                                    <hr className="flex-1 border-gray-300" />
                                </div>

                                <label className="block text-sm font-bold mb-1">Paste URL</label>
                                <input 
                                    type="url" 
                                    className="w-full p-2 border rounded" 
                                    value={imageUrl} 
                                    onChange={e => {
                                        setImageUrl(e.target.value);
                                        setCroppedImagePreviewUrl(e.target.value);
                                        setImageFile(null);
                                    }} 
                                    placeholder="https://example.com/banner.jpg"
                                />

                                {croppedImagePreviewUrl && (
                                    <div className="mt-4 border rounded p-2 bg-gray-50 text-center">
                                        <span className="text-green-600 font-bold text-sm block mb-2">Desktop Preview:</span>
                                        <img 
                                            src={croppedImagePreviewUrl} 
                                            alt="Preview" 
                                            className="w-full h-auto max-h-32 object-contain mx-auto rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tablet Banner Column */}
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-indigo-600 border-b pb-2">Tablet (Optional)</h3>
                                <label className="block text-sm font-bold mb-1">Upload File</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'tablet')} 
                                    className="w-full p-2 border rounded text-xs" 
                                />
                                
                                <div className="flex items-center my-3">
                                    <hr className="flex-1 border-gray-300" />
                                    <span className="px-3 text-gray-500 font-bold text-sm">OR</span>
                                    <hr className="flex-1 border-gray-300" />
                                </div>

                                <label className="block text-sm font-bold mb-1">Paste URL</label>
                                <input 
                                    type="url" 
                                    className="w-full p-2 border rounded" 
                                    value={tabletImageUrl} 
                                    onChange={e => {
                                        setTabletImageUrl(e.target.value);
                                        setCroppedTabletPreviewUrl(e.target.value);
                                        setTabletImageFile(null);
                                    }} 
                                    placeholder="https://..."
                                />

                                {croppedTabletPreviewUrl && (
                                    <div className="mt-4 border rounded p-2 bg-gray-50 text-center">
                                        <span className="text-green-600 font-bold text-sm block mb-2">Tablet Preview:</span>
                                        <img 
                                            src={croppedTabletPreviewUrl} 
                                            alt="Tablet Preview" 
                                            className="w-full h-auto max-h-32 object-contain mx-auto rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Mobile Banner Column */}
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-purple-600 border-b pb-2">Mobile (Optional)</h3>
                                <label className="block text-sm font-bold mb-1">Upload File</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'mobile')} 
                                    className="w-full p-2 border rounded text-xs" 
                                />
                                
                                <div className="flex items-center my-3">
                                    <hr className="flex-1 border-gray-300" />
                                    <span className="px-3 text-gray-500 font-bold text-sm">OR</span>
                                    <hr className="flex-1 border-gray-300" />
                                </div>

                                <label className="block text-sm font-bold mb-1">Paste URL</label>
                                <input 
                                    type="url" 
                                    className="w-full p-2 border rounded" 
                                    value={mobileImageUrl} 
                                    onChange={e => {
                                        setMobileImageUrl(e.target.value);
                                        setCroppedMobilePreviewUrl(e.target.value);
                                        setMobileImageFile(null);
                                    }} 
                                    placeholder="https://..."
                                />

                                {croppedMobilePreviewUrl && (
                                    <div className="mt-4 border rounded p-2 bg-gray-50 text-center">
                                        <span className="text-green-600 font-bold text-sm block mb-2">Mobile Preview:</span>
                                        <img 
                                            src={croppedMobilePreviewUrl} 
                                            alt="Mobile Preview" 
                                            className="w-full h-auto max-h-32 object-contain mx-auto rounded border"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-primary-red text-white px-6 py-2 rounded font-bold">
                                Save Promotion
                            </button>
                        </div>
                    </form>
                </Modal>

                {imageSrc && (
                    <ImageCropperModal
                        isOpen={!!imageSrc}
                        onClose={() => setImageSrc(null)}
                        imageSrc={imageSrc}
                        aspect={cropType === 'desktop' ? (1240 / 220) : cropType === 'tablet' ? (4 / 1) : (16 / 7)}
                        onCropComplete={handleCropComplete}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default ManagePromotions;
