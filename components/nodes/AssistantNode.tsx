import React, { useState } from 'react';
import { Node, AssistantNodeData } from '../../types';
import { Cog6ToothIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { SYSTEM_PROMPTS } from '../../data/systemPrompts';


interface AssistantNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<AssistantNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isCollapsed: boolean;
}

const AssistantNode: React.FC<AssistantNodeProps> = ({ node, onDataChange, onGenerate, isCollapsed }) => {
  const data = node.data as AssistantNodeData;
  const [isSystemPromptVisible, setIsSystemPromptVisible] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDataChange(node.id, { prompt: e.target.value });
  };
  
  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDataChange(node.id, { systemPrompt: e.target.value });
  };

  const handleGenerate = () => {
    onGenerate(node.id);
  };

  const currentPresetKey = Object.keys(SYSTEM_PROMPTS).find(key => SYSTEM_PROMPTS[key] === data.systemPrompt) || '';

  if (isCollapsed) {
    return (
        <div className="w-full h-full text-gray-300 text-xs overflow-hidden">
            <p className="whitespace-pre-wrap break-all">{data.response || "No response"}</p>
        </div>
    )
  }

  return (
      <div className="flex flex-col h-full space-y-2">
         {/* TOP ROW: System Prompt Toggle */}
         <div className="flex justify-end -mb-1">
            <button 
                onClick={() => setIsSystemPromptVisible(!isSystemPromptVisible)} 
                className="flex items-center text-xs text-gray-400 hover:text-white"
                title="Toggle System Prompt"
            >
                <Cog6ToothIcon className="w-4 h-4 mr-1"/>
                System Prompt
                {isSystemPromptVisible ? <ChevronUpIcon className="w-3 h-3 ml-1" /> : <ChevronDownIcon className="w-3 h-3 ml-1" />}
            </button>
        </div>

        {/* System Prompt Textarea (collapsible) */}
        {isSystemPromptVisible && (
            <div className="space-y-2">
                <select
                    onChange={(e) => {
                        const key = e.target.value;
                        if(SYSTEM_PROMPTS[key]) {
                            onDataChange(node.id, { systemPrompt: SYSTEM_PROMPTS[key] });
                        }
                    }}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={currentPresetKey}
                >
                    <option value="" disabled>Custom / Select Preset</option>
                    {Object.keys(SYSTEM_PROMPTS).map((key) => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </select>
                <textarea
                    value={data.systemPrompt}
                    onChange={handleSystemPromptChange}
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-300 text-xs resize-y"
                    rows={5}
                    placeholder="Enter system prompt (optional)..."
                />
            </div>
        )}

        <p className="text-sm text-gray-400 -mb-1">Response:</p>
        <div className="flex-grow bg-gray-900 p-2 rounded-md min-h-0 border border-gray-700 overflow-y-auto">
          {data.isLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
          ) : (
              <p className="text-gray-200 whitespace-pre-wrap">{data.response || "Awaiting generation..."}</p>
          )}
        </div>
        
        <textarea
          value={data.prompt}
          onChange={handlePromptChange}
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 resize-none"
          placeholder="Enter your prompt here..."
          rows={3}
        />

        <button
          onClick={handleGenerate}
          disabled={data.isLoading}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {data.isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
  );
};

export default AssistantNode;