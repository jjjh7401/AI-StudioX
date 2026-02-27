import React from 'react';
import { Node, StoryboardNodeData } from '../../types';
import { generateConsistentImage } from '../../services/geminiService';
import { ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface StoryboardNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<StoryboardNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isCollapsed: boolean;
}

const StoryboardNode: React.FC<StoryboardNodeProps> = ({ node, onDataChange, onGenerate, isCollapsed }) => {
    const data = node.data as StoryboardNodeData;

    const handleDescriptionChange = (sceneId: string, newDescription: string) => {
        const newScenes = data.scenes.map(scene => 
            scene.id === sceneId ? { ...scene, koreanDescription: newDescription } : scene
        );
        onDataChange(node.id, { scenes: newScenes });
    };

    const handleRegenerateScene = async (sceneIndex: number) => {
        if (sceneIndex === 0) return; // Cannot regenerate the key visual
        
        const currentScene = data.scenes[sceneIndex];
        const previousScene = data.scenes[sceneIndex - 1];

        if (!previousScene.imageUrl || !currentScene.englishPrompt) {
            alert("Previous scene's image or current scene's prompt is missing.");
            return;
        }

        // Set loading state for this scene
        let newScenes = data.scenes.map((s, i) => i === sceneIndex ? { ...s, isLoading: true } : s);
        onDataChange(node.id, { scenes: newScenes });
        
        try {
            const newImageUrl = await generateConsistentImage(currentScene.englishPrompt, [previousScene.imageUrl], data.aspectRatio);
            
            if (newImageUrl) {
                newScenes = newScenes.map((s, i) => i === sceneIndex ? { ...s, imageUrl: newImageUrl, isLoading: false } : s);
            } else {
                // Handle error case
                newScenes = newScenes.map((s, i) => i === sceneIndex ? { ...s, isLoading: false } : s);
            }
            onDataChange(node.id, { scenes: newScenes });
        } catch (error) {
            console.error(`Failed to regenerate scene ${sceneIndex + 1}`, error);
            newScenes = newScenes.map((s, i) => i === sceneIndex ? { ...s, isLoading: false } : s);
            onDataChange(node.id, { scenes: newScenes });
        }
    };
    
    if (isCollapsed) {
        return (
            <div className="w-full h-full flex items-center justify-center gap-1 p-1">
                {data.scenes.map(scene => (
                    <div key={scene.id} className="w-1/5 h-full bg-gray-900 rounded-sm flex items-center justify-center overflow-hidden">
                        {scene.imageUrl ? (
                             <img src={scene.imageUrl} crossOrigin="anonymous" alt="" className="w-full h-full object-cover" />
                        ) : (
                            <PhotoIcon className="w-4 h-4 text-gray-600" />
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col space-y-2 text-white">
            <div className="flex-grow flex flex-col space-y-4 overflow-y-auto pr-2 -mr-3">
                {data.scenes.map((scene, index) => (
                    <div key={scene.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {index + 1}
                            </div>
                        </div>

                        <div className="w-48 h-28 flex-shrink-0 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center">
                             {scene.isLoading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                            ) : scene.imageUrl ? (
                                <img src={scene.imageUrl} crossOrigin="anonymous" alt={`Scene ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <PhotoIcon className="w-10 h-10 text-gray-600" />
                            )}
                        </div>

                        <div className="flex-grow flex flex-col space-y-2">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-semibold text-gray-400">장면 설명 (한글)</label>
                                    {index > 0 && (
                                        <button
                                            onClick={() => handleRegenerateScene(index)}
                                            disabled={scene.isLoading}
                                            className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-wait"
                                            title="Regenerate this scene"
                                        >
                                            <ArrowPathIcon className={`w-4 h-4 ${scene.isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={scene.koreanDescription}
                                    onChange={(e) => handleDescriptionChange(scene.id, e.target.value)}
                                    className="w-full p-1.5 bg-gray-800 border border-gray-600 rounded-md text-xs text-gray-300 resize-y focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                    rows={4}
                                    placeholder={`#${index + 1} 장면 설명...`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">AI 영상 프롬프트 (영문)</label>
                                 <textarea
                                    value={scene.englishPrompt}
                                    readOnly
                                    className="w-full p-1.5 bg-gray-900 border border-gray-700 rounded-md text-xs text-gray-400 resize-y focus:outline-none cursor-default"
                                    rows={4}
                                    placeholder="AI generated prompt..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-shrink-0 pt-2 space-y-3">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-semibold text-gray-400">Aspect Ratio</label>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-700 p-1">
                        <button 
                            onClick={() => onDataChange(node.id, { aspectRatio: '16:9' })}
                            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${data.aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                        >
                            16:9
                        </button>
                        <button 
                            onClick={() => onDataChange(node.id, { aspectRatio: '9:16' })}
                             className={`px-4 py-1.5 text-xs rounded-md transition-colors ${data.aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                        >
                            9:16
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => onGenerate(node.id)}
                    disabled={data.isLoading}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {data.isLoading ? 'Generating Storyboard...' : 'Generate Storyboard'}
                </button>
            </div>
        </div>
    );
};

export default StoryboardNode;