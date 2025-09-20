import React, { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

// Create a cropped image blob using pixel crop area from react-easy-crop
async function getCroppedBlob(imageSrc, areaPixels) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const { width, height, x, y } = areaPixels;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(
    image,
    x, y, width, height, // source rect
    0, 0, width, height  // destination rect
  );
  return await new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas empty')), 'image/jpeg', 0.9);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', e => reject(e));
    img.setAttribute('crossOrigin', 'anonymous'); // for cross origin issues
    img.src = url;
  });
}

export default function AvatarCropModal({ file, onCancel, onCropped }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(() => URL.createObjectURL(file));
  const [working, setWorking] = useState(false);
  const [previewThumb, setPreviewThumb] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // Generate small preview whenever crop changes (debounced minimal by promise chain)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!croppedAreaPixels) return;
      try {
        const blob = await getCroppedBlob(previewUrl, croppedAreaPixels);
        if (cancelled) return;
        setPreviewThumb(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
      } catch (_) { /* ignore preview errors */ }
    })();
    return () => { cancelled = true; };
  }, [croppedAreaPixels, previewUrl]);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setWorking(true);
    try {
      const blob = await getCroppedBlob(previewUrl, croppedAreaPixels);
      const croppedFile = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCropped(croppedFile);
    } catch (e) {
      console.error('Crop failed', e);
      onCropped(file); // fallback original
    } finally {
      setWorking(false);
      URL.revokeObjectURL(previewUrl);
      if (previewThumb) URL.revokeObjectURL(previewThumb);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Crop Avatar</h2>
        <div className="relative w-full h-[55vh] min-h-[320px] max-h-[600px] bg-gray-900 rounded-md overflow-hidden">
          <Cropper
            image={previewUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            restrictPosition={true}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10 text-right">{zoom.toFixed(2)}x</span>
        </div>
        {previewThumb && (
          <div className="flex items-center gap-4 border rounded-md p-3 bg-gray-50">
            <div className="w-16 h-16 rounded-full overflow-hidden border shadow-inner">
              <img src={previewThumb} alt="preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-gray-600">Preview</p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
          <button
            disabled={working}
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {working ? 'Uploading...' : 'Use Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
