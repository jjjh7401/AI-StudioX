
import React from 'react';
import { Node, CommentNodeData } from '../../types';

interface CommentNodeProps {
    node: Node;
    onDataChange: (id: string, data: Partial<CommentNodeData>) => void;
    isCollapsed: boolean;
}

const CommentNode: React.FC<CommentNodeProps> = ({ node, onDataChange, isCollapsed }) => {
    const data = node.data as CommentNodeData;
    const scale = data.textScale || 1;
    const fontSize = Math.round(12 * scale); // Base size 12px

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDataChange(node.id, { text: e.target.value });
    };

    if (isCollapsed) {
        return (
            <div className="w-full h-full p-1 text-yellow-900 text-xs font-serif overflow-hidden">
                <p className="whitespace-pre-wrap">{data.text || "Empty"}</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full p-0">
            <textarea
                value={data.text}
                onChange={handleChange}
                className="w-full h-full p-2 bg-transparent text-yellow-900 border-none rounded-b-lg focus:outline-none resize-none font-serif placeholder-yellow-800/50"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
                placeholder="Type your comment..."
            />
        </div>
    );
};

export default CommentNode;
