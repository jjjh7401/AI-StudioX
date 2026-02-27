
import React from 'react';
import { CursorArrowRaysIcon, HandRaisedIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Tool } from '../types';

interface ToolsPanelProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ activeTool, setActiveTool }) => {
    const tools = [
        { id: 'select', name: 'Selection tool', icon: CursorArrowRaysIcon, shortcut: 'V' },
        { id: 'pan', name: 'Hand tool', icon: HandRaisedIcon, shortcut: 'H' },
        { id: 'comment', name: 'Comments', icon: ChatBubbleLeftRightIcon, shortcut: 'C' },
    ];

    return (
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10 p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col gap-2">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as Tool)}
                    className={`p-3 rounded-lg transition-colors duration-200 ${
                        activeTool === tool.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-transparent hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'
                    }`}
                    title={`${tool.name} (${tool.shortcut})`}
                >
                    <tool.icon className="w-6 h-6" />
                </button>
            ))}
        </div>
    );
};

export default ToolsPanel;
