import React, { useState, useRef, useEffect } from 'react';
import { NodeType } from '../types';
import { 
  FilmIcon, 
  PhotoIcon, 
  ChatBubbleLeftRightIcon, 
  Bars3BottomLeftIcon, 
  PencilSquareIcon, 
  ArrowUpTrayIcon, 
  CameraIcon, 
  RectangleStackIcon, 
  UserCircleIcon, 
  ClipboardDocumentListIcon, 
  QueueListIcon, 
  ListBulletIcon, 
  ChevronDownIcon, 
  SparklesIcon,
  LinkIcon,
  EyeIcon,
  Squares2X2Icon, 
  RectangleGroupIcon, 
  CubeTransparentIcon,
  FolderIcon,
  BeakerIcon,
  TableCellsIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';

interface ToolbarProps {
  onAddNode: (type: NodeType) => void;
  isGenerating: boolean;
  onOpenPlayground: () => void;
}

const TShirtIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 7.5l-3.5-2.5-3.5 2.5m7 0V4.5a1.5 1.5 0 00-1.5-1.5h-7A1.5 1.5 0 003.5 4.5v3m14 0v10.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013.5 18V7.5m14 0h-14" />
    </svg>
);

const StoryboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M8 9h8m-8 6h8M4 4h1m-1 4h1m-1 4h1m16-12h-1m1 4h-1m1 4h-1m1 4h-1" />
    </svg>
);


const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, isGenerating, onOpenPlayground }) => {
  const [isCustomMenuOpen, setIsCustomMenuOpen] = useState(false);
  const customMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (customMenuRef.current && !customMenuRef.current.contains(event.target as Node)) {
              setIsCustomMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  const buttonClasses = "flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-indigo-600 rounded-lg text-white font-semibold transition-all duration-200 ease-in-out shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap";
  const dropdownItemClasses = "flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-indigo-600 transition-colors w-full text-left";

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl flex gap-3 justify-center">
      
      <button 
        onClick={onOpenPlayground} 
        className={`${buttonClasses} bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ring-1 ring-emerald-500/50`}
        disabled={isGenerating}
      >
        <BeakerIcon className="w-5 h-5" />
        Playground
      </button>

      <div className="relative" ref={customMenuRef}>
         <button 
            onClick={() => setIsCustomMenuOpen(!isCustomMenuOpen)}
            className={`${buttonClasses} bg-indigo-700 hover:bg-indigo-600 ring-1 ring-indigo-500/50`}
            disabled={isGenerating}
         >
            <SparklesIcon className="w-5 h-5" />
            Custom Node
            <ChevronDownIcon className="w-4 h-4 ml-1" />
         </button>

         {isCustomMenuOpen && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col z-50">
                <button onClick={() => { onAddNode(NodeType.ImageModify); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <SparklesIcon className="w-5 h-5" /> Image Modify
                </button>
                <button onClick={() => { onAddNode(NodeType.OutfitDetail); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <TShirtIcon /> Outfit Detail
                </button>
                <button onClick={() => { onAddNode(NodeType.GridExtractor); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <ScissorsIcon className="w-5 h-5" /> Grid Extractor
                </button>
                <button onClick={() => { onAddNode(NodeType.SelectImage); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <PhotoIcon className="w-5 h-5" /> Select Image
                </button>
                <button onClick={() => { onAddNode(NodeType.GridShot); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <TableCellsIcon className="w-5 h-5" /> Grid Shot
                </button>
                <button onClick={() => { onAddNode(NodeType.Model); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <UserCircleIcon className="w-5 h-5" /> Model
                </button>
                <button onClick={() => { onAddNode(NodeType.Vton); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <TShirtIcon /> V-TON
                </button>
                <button onClick={() => { onAddNode(NodeType.Script); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <ClipboardDocumentListIcon className="w-5 h-5" /> Script
                </button>
                <button onClick={() => { onAddNode(NodeType.Storyboard); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <StoryboardIcon /> Storyboard
                </button>
                <button onClick={() => { onAddNode(NodeType.CameraPreset); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <CameraIcon className="w-5 h-5" /> Camera Preset
                </button>
                <button onClick={() => { onAddNode(NodeType.Camera); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <CameraIcon className="w-5 h-5" /> Camera Logic
                </button>
                <button onClick={() => { onAddNode(NodeType.Array); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <QueueListIcon className="w-5 h-5" /> Array
                </button>
                <button onClick={() => { onAddNode(NodeType.List); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <ListBulletIcon className="w-5 h-5" /> List
                </button>
                <button onClick={() => { onAddNode(NodeType.PromptConcatenator); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <LinkIcon className="w-5 h-5" /> Prompt Concatenator
                </button>
                <button onClick={() => { onAddNode(NodeType.Composite); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <Squares2X2Icon className="w-5 h-5" /> Composite
                </button>
                <button onClick={() => { onAddNode(NodeType.Stitch); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <RectangleGroupIcon className="w-5 h-5" /> Stitch
                </button>
                <button onClick={() => { onAddNode(NodeType.VideoStitch); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <RectangleGroupIcon className="w-5 h-5" /> Video Stitch
                </button>
                <button onClick={() => { onAddNode(NodeType.RMBG); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <CubeTransparentIcon className="w-5 h-5" /> RMBG
                </button>
                <button onClick={() => { onAddNode(NodeType.Group); setIsCustomMenuOpen(false); }} className={dropdownItemClasses}>
                    <FolderIcon className="w-5 h-5" /> Group
                </button>
            </div>
         )}
      </div>

      <button onClick={() => onAddNode(NodeType.ImageLoad)} className={buttonClasses} disabled={isGenerating}>
        <ArrowUpTrayIcon className="w-5 h-5" /> Load Image
      </button>
      <button onClick={() => onAddNode(NodeType.VideoLoad)} className={buttonClasses} disabled={isGenerating}>
        <ArrowUpTrayIcon className="w-5 h-5" /> Load Video
      </button>
      <button onClick={() => onAddNode(NodeType.Text)} className={buttonClasses} disabled={isGenerating}>
        <Bars3BottomLeftIcon className="w-5 h-5" /> Text
      </button>
      <button onClick={() => onAddNode(NodeType.Preset)} className={buttonClasses} disabled={isGenerating}>
        <RectangleStackIcon className="w-5 h-5" /> Preset
      </button>
      <button onClick={() => onAddNode(NodeType.Assistant)} className={buttonClasses} disabled={isGenerating}>
        <ChatBubbleLeftRightIcon className="w-5 h-5" /> Assistant
      </button>
      <button onClick={() => onAddNode(NodeType.Image)} className={buttonClasses} disabled={isGenerating}>
        <PhotoIcon className="w-5 h-5" /> Image
      </button>
      <button onClick={() => onAddNode(NodeType.ImagePreview)} className={buttonClasses} disabled={isGenerating} title="Image Preview (Nano Banana)">
        <EyeIcon className="w-5 h-5" /> Preview
      </button>
      <button onClick={() => onAddNode(NodeType.ImageEdit)} className={buttonClasses} disabled={isGenerating}>
        <PencilSquareIcon className="w-5 h-5" /> Image Edit
      </button>
      <button onClick={() => onAddNode(NodeType.Video)} className={buttonClasses} disabled={isGenerating}>
        <FilmIcon className="w-5 h-5" /> Video
      </button>
    </div>
  );
};

export default Toolbar;
