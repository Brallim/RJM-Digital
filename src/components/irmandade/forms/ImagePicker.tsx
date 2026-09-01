import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface ImagePickerProps {
  value?: string;
  onChange: (fileOrUrl: string) => void;
  onClear: () => void;
  label?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, onClear, label }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview URL
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
    }
  };

  return (
    <div className="flex flex-col mb-4">
      {label && <label className="text-xs font-bold text-gray-700 mb-2">{label}</label>}
      
      {value ? (
        <div className="relative self-start">
          <img src={value} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-[#8b5cf6] shadow-sm" />
          <button 
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 bg-purple-50 text-[#8b5cf6] border border-purple-100 rounded-xl py-3 flex flex-col items-center justify-center space-y-1 active:bg-purple-100"
          >
            <Camera size={20} />
            <span className="text-[10px] font-bold">Câmera</span>
          </button>
          
          <button 
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl py-3 flex flex-col items-center justify-center space-y-1 active:bg-gray-100"
          >
            <ImageIcon size={20} />
            <span className="text-[10px] font-bold">Galeria</span>
          </button>
        </div>
      )}
      
      {/* Hidden inputs */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
};
