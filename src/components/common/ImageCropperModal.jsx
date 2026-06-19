import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'

// Utility untuk memotong canvas berdasarkan pixel area
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}

export default function ImageCropperModal({ imageSrc, onComplete, onCancel, aspect = undefined }) {
  const [currentAspect, setCurrentAspect] = useState(aspect)
  const [originalAspect, setOriginalAspect] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleApply = async () => {
    if (!croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels)
      onComplete(croppedBase64)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 sm:p-6 p-0">
      <div className="flex justify-between items-center p-4 bg-black/50 text-white z-10 backdrop-blur-sm sm:rounded-t-2xl sm:mx-auto sm:max-w-2xl w-full">
        <h3 className="font-semibold">Sesuaikan Gambar</h3>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1 sm:max-w-2xl sm:mx-auto w-full">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={currentAspect === undefined ? originalAspect : currentAspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          onMediaLoaded={(mediaSize) => setOriginalAspect(mediaSize.width / mediaSize.height)}
          showGrid={true}
        />
      </div>

      <div className="bg-black/80 text-white p-6 sm:pb-6 pb-10 backdrop-blur-sm z-10 sm:rounded-b-2xl sm:mx-auto sm:max-w-2xl w-full flex flex-col gap-4">
        
        {/* Aspect Ratio Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x justify-center">
          {[
            { label: 'Asli', value: undefined },
            { label: 'Persegi 1:1', value: 1 },
            { label: 'Potret', value: 3/4 },
            { label: 'Lanskap', value: 4/3 },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => setCurrentAspect(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-colors snap-start ${currentAspect === opt.value ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="flex-1 accent-brand-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 transition-colors">
            Batal
          </button>
          <button 
            onClick={handleApply} 
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Memproses...' : <><Check size={18} /> Terapkan Crop</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
