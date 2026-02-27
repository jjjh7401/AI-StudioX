
import React from 'react';
import { Node, GroupNodeData } from '../../types';
import { ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface GroupNodeProps {
    node: Node;
    onDataChange: (id: string, data: Partial<GroupNodeData>) => void;
    isCollapsed: boolean;
    onFitGroup?: () => void;
}

const GroupNode: React.FC<GroupNodeProps> = ({ node, onDataChange, isCollapsed, onFitGroup }) => {
    const data = node.data as GroupNodeData;

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDataChange(node.id, { title: e.target.value });
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Header is handled by NodeComponent for drag, we just provide the visual body */}
            {/* If collapsed, we just show the title area effectively */}
            {isCollapsed ? (
                <div className="w-full h-full flex items-center justify-center p-2">
                    <span className="text-blue-200 font-bold truncate text-sm">{data.title || "Group"}</span>
                </div>
            ) : (
                <>
                    <div className="absolute top-0 left-0 right-0 h-10 px-2 flex items-center pointer-events-none justify-between">
                        {/* Title Input positioned over the drag handle area visually */}
                        <input
                            type="text"
                            value={data.title}
                            onChange={handleTitleChange}
                            className="bg-transparent text-blue-200 font-bold text-lg border-none focus:ring-0 focus:outline-none placeholder-blue-500/50 w-auto flex-grow pointer-events-auto"
                            placeholder="Group Name"
                        />
                        {onFitGroup && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFitGroup();
                                }}
                                className="pointer-events-auto p-1 text-blue-300 hover:text-white hover:bg-blue-600/50 rounded ml-2"
                                title="Fit group to nodes"
                            >
                                <ArrowsPointingInIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {/* Content Area - Transparent to show nodes behind, parent NodeComponent provides translucency */}
                    <div className="flex-grow mt-10 rounded-b-xl bg-transparent border-t-0" />
                </>
            )}
        </div>
    );
};

export default GroupNode;
