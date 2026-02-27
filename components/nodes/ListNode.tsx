
import React from 'react';
import { Node, ListNodeData } from '../../types';

interface ListNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ListNodeData>) => void;
  isCollapsed: boolean;
}

const ListNode: React.FC<ListNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as ListNodeData;

  const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newIndex = parseInt(e.target.value, 10);
      if (!isNaN(newIndex)) {
          const currentArray = data.arrayInput || [];
          const newOutput = currentArray[newIndex] || "";
          onDataChange(node.id, { index: newIndex, output: newOutput });
      }
  };

  if (isCollapsed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gray-900 text-gray-300 text-xs overflow-hidden">
         <p className="font-bold text-green-400">#{data.index}</p>
         <p className="truncate w-full text-center">{data.output || "Empty"}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-2">
        <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-400">Item Index:</label>
            <input
                type="number"
                value={data.index}
                onChange={handleIndexChange}
                className="w-16 p-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:ring-1 focus:ring-green-500 outline-none"
                min="0"
            />
        </div>
        <div className="flex-grow p-2 bg-gray-900 border border-gray-700 rounded-md overflow-y-auto text-sm text-gray-200 custom-scrollbar">
            {data.output ? (
                <p className="whitespace-pre-wrap">{data.output}</p>
            ) : (
                <p className="text-gray-600 italic">No data at index {data.index}</p>
            )}
        </div>
    </div>
  );
};

export default ListNode;
