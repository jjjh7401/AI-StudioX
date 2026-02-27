

import React, { useState, useMemo } from 'react';
import { Node, PresetNodeData } from '../../types';
import { PRESET_LIBRARY, Preset } from '../../data/presets';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface PresetNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<PresetNodeData>) => void;
  isCollapsed: boolean;
}

const PresetNode: React.FC<PresetNodeProps> = ({ node, onDataChange, isCollapsed }) => {
    const data = node.data as PresetNodeData;
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const promptToNameMap = useMemo(() => {
        const map = new Map<string, string>();
        PRESET_LIBRARY.forEach(category => {
            category.presets.forEach(preset => {
                map.set(preset.prompt, preset.name);
            });
        });
        return map;
    }, []);

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };

    const handlePresetToggle = (preset: Preset) => {
        const presetPrompt = preset.prompt;
        const isSelected = data.selectedPrompts.includes(presetPrompt);
        
        let newSelectedPrompts: string[];
        if (isSelected) {
            newSelectedPrompts = data.selectedPrompts.filter(p => p !== presetPrompt);
        } else {
            newSelectedPrompts = [...data.selectedPrompts, presetPrompt];
        }

        onDataChange(node.id, {
            selectedPrompts: newSelectedPrompts,
            text: newSelectedPrompts.join(', ')
        });
    };

    const handleRemovePreset = (presetPrompt: string) => {
        const newSelectedPrompts = data.selectedPrompts.filter(p => p !== presetPrompt);
        onDataChange(node.id, {
            selectedPrompts: newSelectedPrompts,
            text: newSelectedPrompts.join(', ')
        });
    };

    const handleReset = () => {
        onDataChange(node.id, {
            selectedPrompts: [],
            text: ''
        });
    };

    if (isCollapsed) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                <p>{data.selectedPrompts.length} preset{data.selectedPrompts.length !== 1 && 's'} selected.</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col text-white">
            <h3 className="text-lg font-bold text-gray-200 mb-2 flex-shrink-0">Preset Library</h3>
            
            <div className="flex-shrink-0 pb-2 border-b border-gray-700">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-gray-400">Prompts</label>
                    <button onClick={handleReset} className="text-xs text-gray-500 hover:text-white transition-colors">Reset</button>
                </div>
                <div className="bg-gray-900/70 p-2 rounded-md min-h-[50px] max-h-[100px] overflow-y-auto flex flex-wrap gap-2 content-start">
                    {data.selectedPrompts.length > 0 ? (
                        data.selectedPrompts.map(prompt => (
                            <div key={prompt} className="bg-slate-600 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 h-fit">
                                <span title={prompt}>{promptToNameMap.get(prompt) || 'Unknown'}</span>
                                <button onClick={() => handleRemovePreset(prompt)} className="text-slate-400 hover:text-white">
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-gray-500 p-2 w-full text-center">Select presets from the categories below.</span>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto mt-2 -mr-3 pr-3 space-y-2">
                {PRESET_LIBRARY.map(category => (
                    <div key={category.name}>
                        <button 
                            onClick={() => toggleCategory(category.name)}
                            className="w-full text-left flex justify-between items-center text-slate-300 hover:text-white mb-2"
                        >
                            <span className="font-semibold text-sm">{category.name}</span>
                            {expandedCategories[category.name] ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                        {expandedCategories[category.name] && (
                            <div className="flex flex-wrap gap-2">
                                {category.presets.map(preset => {
                                    const isSelected = data.selectedPrompts.includes(preset.prompt);
                                    return (
                                        <button 
                                            key={preset.name}
                                            onClick={() => handlePresetToggle(preset)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border ${
                                                isSelected 
                                                ? 'bg-green-500 border-green-400 text-white shadow-md' 
                                                : 'bg-slate-600 border-slate-500 hover:bg-slate-500 hover:border-slate-400 text-slate-300'
                                            }`}
                                            title={preset.prompt}
                                        >
                                            {preset.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PresetNode;