
import React from 'react';
import { Node, PromptConcatenatorNodeData } from '../../types';
import { LinkIcon } from '@heroicons/react/24/outline';

interface PromptConcatenatorNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<PromptConcatenatorNodeData>) => void;
  isCollapsed: boolean;
}

const PromptConcatenatorNode: React.FC<PromptConcatenatorNodeProps> = ({ node, onDataChange, isCollapsed }) => {
    const data = node.data as PromptConcatenatorNodeData;

    const handleSeparatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDataChange(node.id, { separator: e.target.value });
    };

    if (isCollapsed) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-300">
                 <LinkIcon className="w-6 h-6" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-2">
             <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Separator:</label>
                <input
                  type="text"
                  value={data.separator}
                  onChange={handleSeparatorChange}
                  className="w-full p-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="\n, space, etc (Default: \n)"
                />
             </div>
             <div className="flex-grow flex flex-col">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Output</label>
                <textarea
                    value={data.concatenatedText}
                    readOnly
                    className="flex-grow w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-gray-300 text-xs resize-none focus:outline-none custom-scrollbar"
                    placeholder="Concatenated prompt will appear here..."
                />
             </div>
        </div>
    );
}
export default PromptConcatenatorNode;
