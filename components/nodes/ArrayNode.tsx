
import React from 'react';
import { Node, ArrayNodeData } from '../../types';

interface ArrayNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ArrayNodeData>) => void;
  isCollapsed: boolean;
}

const ArrayNode: React.FC<ArrayNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as ArrayNodeData;

  const handleSeparatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSeparator = e.target.value;
      const inputText = data.text || "";
      let items: string[] = [];

      if (newSeparator && inputText) {
          if (newSeparator === '*') {
              items = inputText.split('*').map(s => s.trim()).filter(s => s.length > 0);
          } else if (newSeparator === '\\n') {
              items = inputText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
          } else {
              items = inputText.split(newSeparator).map(s => s.trim()).filter(s => s.length > 0);
          }
      } else if (inputText) {
           items = [inputText].filter(s => s.length > 0);
      }
      
      onDataChange(node.id, { separator: newSeparator, items: items });
  };

  if (isCollapsed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-900 text-gray-300 text-xs">
        <p className="font-bold">Array</p>
        <p>{data.items.length} items</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Split text by:</label>
        <input
          type="text"
          value={data.separator}
          onChange={handleSeparatorChange}
          className="flex-grow p-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:ring-1 focus:ring-green-500 outline-none"
          placeholder="e.g., \n or *"
        />
      </div>
      
      <div className="flex-grow bg-gray-900 border border-gray-700 rounded-md overflow-hidden flex flex-col">
        <div className="bg-gray-800 p-1 px-2 border-b border-gray-700">
             <span className="text-[10px] text-gray-400 uppercase font-bold">Parsed Items ({data.items.length})</span>
        </div>
        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
             {data.items.map((item, idx) => (
                 <div key={idx} className="text-xs text-gray-300 bg-gray-800/50 p-1.5 rounded border border-gray-700/50 truncate">
                     <span className="text-green-500 font-mono mr-2">[{idx}]</span>
                     {item.substring(0, 50)}{item.length > 50 ? '...' : ''}
                 </div>
             ))}
             {data.items.length === 0 && (
                 <p className="text-xs text-gray-600 text-center py-4">No text split yet.</p>
             )}
        </div>
      </div>
    </div>
  );
};

export default ArrayNode;
