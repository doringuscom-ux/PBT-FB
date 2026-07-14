import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from './Modal';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ImageCropperModal = ({ isOpen, onClose, imageSrc, onCropComplete, aspect = 21 / 9 }) => {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect));
    };

    const generateCroppedImage = async () => {
        if (!completedCrop || !imgRef.current) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        console.error('Canvas is empty');
                        return;
                    }
                    blob.name = 'cropped_cover.jpg';
                    const file = new File([blob], blob.name, { type: 'image/jpeg' });
                    resolve(file);
                },
                'image/jpeg',
                1
            );
        });
    };

    const handleSave = async () => {
        const croppedFile = await generateCroppedImage();
        if (croppedFile) {
            onCropComplete(croppedFile);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 bg-white rounded-2xl w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black uppercase text-slate-900 mb-4">Crop Cover Image</h2>
                <p className="text-sm text-slate-500 font-bold mb-4">Drag the edges to select the perfect crop for the movie banner.</p>
                <div className="flex justify-center bg-slate-900 rounded-lg overflow-hidden p-4 mb-6 relative min-h-[300px]">
                    {imageSrc ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imageSrc}
                                onLoad={onImageLoad}
                                style={{ maxHeight: '60vh' }}
                            />
                        </ReactCrop>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-400">Loading image...</div>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 border-2 border-slate-200 text-slate-600 font-bold uppercase rounded-xl hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-yellow-400 text-slate-900 font-black uppercase rounded-xl hover:bg-yellow-500 shadow-lg">Save Crop</button>
                </div>
            </div>
        </Modal>
    );
};

export default ImageCropperModal;
