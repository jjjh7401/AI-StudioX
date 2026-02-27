

import React from 'react';
import { Node, ModelNodeData } from '../../types';
import { MODEL_NATIONALITIES, MODEL_FACE_SHAPES, MODEL_HAIR_STYLES, MODEL_HAIR_COLORS } from '../../data/constants';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface ModelNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ModelNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isImageConnected: boolean;
  isCollapsed: boolean;
}

const ModelNode: React.FC<ModelNodeProps> = ({ node, onDataChange, onGenerate, isImageConnected, isCollapsed }) => {
  const data = node.data as ModelNodeData;

  const handleGenerate = () => {
    onGenerate(node.id);
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-500" />
            )}
        </div>
    )
  }

  const renderCreateForm = () => (
    <div className="flex-grow flex flex-col space-y-2 overflow-y-auto pr-1 -mr-2">
        <h4 className="text-sm font-bold text-gray-300">Live portrait</h4>

        {/* Gender */}
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
            <div className="flex items-center gap-4">
                <label className="flex items-center text-sm text-gray-200 cursor-pointer">
                    <input type="radio" name={`gender-${node.id}`} value="Woman" checked={data.gender === 'Woman'} onChange={(e) => onDataChange(node.id, { gender: e.target.value as 'Woman' | 'Man' })} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" />
                    <span className="ml-2">Woman</span>
                </label>
                <label className="flex items-center text-sm text-gray-200 cursor-pointer">
                    <input type="radio" name={`gender-${node.id}`} value="Man" checked={data.gender === 'Man'} onChange={(e) => onDataChange(node.id, { gender: e.target.value as 'Woman' | 'Man' })} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" />
                    <span className="ml-2">Man</span>
                </label>
            </div>
        </div>

        {/* Age */}
        <div>
            <label htmlFor={`age-${node.id}`} className="block text-xs font-medium text-gray-400">Age</label>
            <input type="number" id={`age-${node.id}`} value={data.age} onChange={(e) => onDataChange(node.id, { age: e.target.value })} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm" />
        </div>

        {/* Nationality */}
        <div>
            <label htmlFor={`nationality-${node.id}`} className="block text-xs font-medium text-gray-400">Nationality</label>
            <select id={`nationality-${node.id}`} value={data.nationality} onChange={(e) => onDataChange(node.id, { nationality: e.target.value })} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm appearance-none">
                {MODEL_NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
        </div>
        
        {/* Other Dropdowns */}
        {[
            { label: 'Face Shape', key: 'faceShape', options: MODEL_FACE_SHAPES },
            { label: 'Hair Style', key: 'hairStyle', options: MODEL_HAIR_STYLES },
            { label: 'Hair Color', key: 'hairColor', options: MODEL_HAIR_COLORS }
        ].map(({ label, key, options }) => (
             <div key={key}>
                <label htmlFor={`${key}-${node.id}`} className="block text-xs font-medium text-gray-400">{label}</label>
                <select id={`${key}-${node.id}`} value={data[key as keyof ModelNodeData]} onChange={(e) => onDataChange(node.id, { [key]: e.target.value })} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm appearance-none">
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        ))}

        {/* Additional Prompt */}
        <div>
            <label htmlFor={`add-${node.id}`} className="block text-xs font-medium text-gray-400">Add</label>
            <textarea id={`add-${node.id}`} value={data.additionalPrompt} onChange={(e) => onDataChange(node.id, { additionalPrompt: e.target.value })} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm" placeholder="e.g., skin tone, eye color, clothing..."></textarea>
        </div>
    </div>
  );

  return (
    <div className="w-full h-full flex space-x-3">
        {/* Left Panel */}
        <div className="w-1/2 flex flex-col space-y-3">
            <div className={`flex-grow flex flex-col space-y-3 relative ${isImageConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                {isImageConnected && <div className="absolute inset-0 z-10" title="Form is disabled when an image is connected."></div>}
                {renderCreateForm()}
            </div>
            <div className="mt-auto flex-shrink-0">
                <button onClick={handleGenerate} disabled={data.isLoading} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {data.isLoading ? 'Generating...' : 'Generate Model'}
                </button>
            </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 bg-gray-900 rounded-md flex items-center justify-center border-2 border-dashed border-gray-700">
            {data.isLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            ) : data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" alt="Generated Model" className="w-full h-full object-contain rounded-md" />
            ) : (
                <p className="text-gray-500 text-center text-sm px-4">
                    {isImageConnected 
                        ? 'Connected image will be standardized.' 
                        : 'Your generated model will appear here.'}
                </p>
            )}
        </div>
    </div>
  );
};

export default ModelNode;