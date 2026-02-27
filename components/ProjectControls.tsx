
import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { FolderIcon, ArrowDownTrayIcon, TrashIcon, XMarkIcon, FolderOpenIcon, ArrowUpOnSquareIcon, Bars3Icon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface ProjectControlsProps {
    onSave: () => void;
    onLoad: () => void;
    isSaveModalOpen: boolean;
    onCloseSaveModal: () => void;
    onSaveProject: (name: string) => void;
    isLoadModalOpen: boolean;
    onCloseLoadModal: () => void;
    projects: Project[];
    onLoadProject: (id: string) => void;
    onDeleteProject: (id: string) => void;
    onExportProject: (id: string) => void;
    onImportProject: (project: Project) => void;
    isSaving: boolean;
    onExportCurrentProject: () => void;
    isExportModalOpen: boolean;
    onCloseExportModal: () => void;
    onConfirmExport: (name: string) => void;
    onExportPlayground: () => void; // New prop
}

const SaveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, isSaving }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Save Project</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                        <input
                            type="text"
                            id="projectName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="My Awesome Creation"
                            autoFocus
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">Cancel</button>
                            <button type="submit" disabled={!name.trim() || isSaving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ExportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onExport: (name: string) => void;
    isSaving: boolean;
}> = ({ isOpen, onClose, onExport, isSaving }) => {
    const [name, setName] = useState('My Cosmos Project');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onExport(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Export Current Project</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="exportProjectName" className="block text-sm font-medium text-gray-400 mb-2">File Name</label>
                        <input
                            type="text"
                            id="exportProjectName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="my-project"
                            autoFocus
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">Cancel</button>
                            <button type="submit" disabled={!name.trim() || isSaving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isSaving ? 'Exporting...' : 'Export'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const LoadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onExport: (id: string) => void;
}> = ({ isOpen, onClose, projects, onLoad, onDelete, onExport }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col" style={{maxHeight: '80vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Load Project</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {projects.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No saved projects found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {projects.map(project => (
                                <li key={project.id} className="bg-gray-900/70 p-4 rounded-lg flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                                    <div>
                                        <p className="font-bold text-white">{project.name}</p>
                                        <p className="text-xs text-gray-400">Saved on: {new Date(project.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => onLoad(project.id)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors">
                                            <FolderOpenIcon className="w-4 h-4" /> Load
                                        </button>
                                        <button onClick={() => onExport(project.id)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-full transition-colors" title="Export Project">
                                            <ArrowUpOnSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDelete(project.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Delete Project">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProjectControls: React.FC<ProjectControlsProps> = (props) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const project = JSON.parse(content);
                    props.onImportProject(project);
                } catch (error) {
                    console.error("Failed to import project:", error);
                    alert("Failed to import project. The file may be corrupted or in the wrong format.");
                }
            };
            reader.readAsText(file);
        }
         // Reset file input to allow importing the same file again
        if(event.target) {
            event.target.value = '';
        }
    };
    
    return (
        <>
            <input 
                type="file"
                ref={importInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />
            <div className="absolute top-4 left-4 z-10" ref={menuRef}>
                 <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/80 rounded-xl shadow-2xl text-white font-semibold transition-all duration-200 ease-in-out text-sm"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                >
                    <Bars3Icon className="w-5 h-5" />
                    <span>MENU</span>
                </button>

                <div className={`absolute top-full mt-2 w-56 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-200 ease-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <ul className="text-white text-sm font-semibold divide-y divide-gray-700/50">
                        <li>
                            <button onClick={() => { props.onSave(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 transition-colors text-left">
                                <ArrowDownTrayIcon className="w-5 h-5" /> Save
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onLoad(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 transition-colors text-left">
                                <FolderIcon className="w-5 h-5" /> Project
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { handleImportClick(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 transition-colors text-left">
                                <FolderOpenIcon className="w-5 h-5" /> Import
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onExportCurrentProject(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 transition-colors text-left">
                                <ArrowUpOnSquareIcon className="w-5 h-5" /> Export Project
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onExportPlayground(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-900/30 hover:bg-emerald-600 text-emerald-100 transition-colors text-left">
                                <RocketLaunchIcon className="w-5 h-5" /> Playground Export
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <SaveModal 
                isOpen={props.isSaveModalOpen}
                onClose={props.onCloseSaveModal}
                onSave={props.onSaveProject}
                isSaving={props.isSaving}
            />
            <ExportModal
                isOpen={props.isExportModalOpen}
                onClose={props.onCloseExportModal}
                onExport={props.onConfirmExport}
                isSaving={props.isSaving}
            />
            <LoadModal
                isOpen={props.isLoadModalOpen}
                onClose={props.onCloseLoadModal}
                projects={props.projects}
                onLoad={props.onLoadProject}
                onDelete={props.onDeleteProject}
                onExport={props.onExportProject}
            />
        </>
    );
};

export default ProjectControls;
