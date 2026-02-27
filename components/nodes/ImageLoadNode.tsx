import React, { useRef, useCallback } from 'react';
import { Node, ImageLoadNodeData } from '../../types';
import { ArrowUpTrayIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageLoadNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ImageLoadNodeData>) => void;
  isCollapsed: boolean;
}

const ImageLoadNode: React.FC<ImageLoadNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as ImageLoadNodeData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize data: Ensure imageUrls exists. Handle legacy `imageUrl` if present.
  const images = data.imageUrls && data.imageUrls.length > 0 
    ? data.imageUrls 
    : (data.imageUrl ? [data.imageUrl] : []);

  const processFiles = useCallback((fileList: FileList) => {
    const newImages: string[] = [];
    const files = Array.from(fileList).filter(file => file.type.startsWith('image/'));

    if (files.length === 0) {
        return;
    }

    let processedCount = 0;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                newImages.push(e.target.result as string);
            }
            processedCount++;
            
            if (processedCount === files.length) {
                // Merge new images with existing ones
                onDataChange(node.id, { imageUrls: [...images, ...newImages] });
            }
        };
        reader.readAsDataURL(file);
    });
  }, [node.id, onDataChange, images]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // Reset input so the same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      processFiles(e.clipboardData.files);
    }
  };
  
  const removeImage = (indexToRemove: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onDataChange(node.id, { imageUrls: newImages });
  };

  // Calculate grid columns based on number of images
  const getGridClass = () => {
      const count = images.length;
      if (count <= 1) return 'grid-cols-1';
      if (count <= 4) return 'grid-cols-2';
      if (count <= 9) return 'grid-cols-3';
      return 'grid-cols-4';
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1 bg-gray-900">
            {images.length > 0 ? (
                <div className="relative w-full h-full">
                     <img src={images[0]} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm opacity-80" />
                     {images.length > 1 && (
                         <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1 rounded-tl-md">
                             +{images.length - 1}
                         </div>
                     )}
                </div>
            ) : (
                <ArrowUpTrayIcon className="w-6 h-6 text-gray-500" />
            )}
        </div>
    )
  }

  return (
    <div 
      className="w-full h-full flex flex-col outline-none focus:ring-1 focus:ring-indigo-500 rounded-md" 
      onPaste={handlePaste}
      tabIndex={0}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
      
      {images.length > 0 ? (
          <div className="flex-grow overflow-y-auto p-2 space-y-2 custom-scrollbar">
             {/* Grid for images */}
             <div className={`grid ${getGridClass()} gap-2`}>
                 {images.map((url, index) => (
                     <div key={index} className="relative group aspect-square bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
                         <img src={url} crossOrigin="anonymous" alt={`Uploaded ${index}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button 
                                onClick={(e) => removeImage(index, e)}
                                className="p-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors shadow-sm"
                                title="Remove image"
                             >
                                 <TrashIcon className="w-4 h-4" />
                             </button>
                         </div>
                     </div>
                 ))}
                 {/* Add more button */}
                 <div 
                    className="aspect-square rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors bg-gray-800/30 hover:bg-gray-800"
                    onClick={handleContainerClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                 >
                     <ArrowUpTrayIcon className="w-5 h-5" />
                     <span className="text-[10px] mt-1 font-bold">ADD</span>
                 </div>
             </div>
          </div>
      ) : (
          <div
            className="w-full h-full bg-gray-900 rounded-md flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors cursor-pointer m-0"
            onClick={handleContainerClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center text-gray-500 p-4">
                <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold text-sm">Click to upload</p>
                <p className="text-xs">or drag & drop / paste</p>
                <p className="text-[10px] mt-2 text-gray-600">(Multiple supported)</p>
            </div>
          </div>
      )}
    </div>
  );
};

export default ImageLoadNode;