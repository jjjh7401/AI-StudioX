
import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { 
    FolderIcon, 
    ArrowDownTrayIcon, 
    TrashIcon, 
    XMarkIcon, 
    FolderOpenIcon, 
    ArrowUpOnSquareIcon, 
    Bars3Icon, 
    RocketLaunchIcon,
    PlusIcon,
    FilmIcon
} from '@heroicons/react/24/outline';

interface ProjectControlsProps {
    onSave: () => void;
    onLoad: () => void;
    onMakeProject: () => void;
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
    onExportPlayground: () => void;
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={onClose}>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={onClose}>
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
    onNewProject: () => void;
}> = ({ isOpen, onClose, projects, onLoad, onDelete, onExport, onNewProject }) => {

    if (!isOpen) return null;

    // Sort projects by date (newest first)
    const sortedProjects = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1a1d24] rounded-[32px] shadow-2xl w-full max-w-5xl border border-gray-800 flex flex-col overflow-hidden" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-[32px] font-bold text-white mb-2">저장된 작업</h2>
                        <p className="text-gray-400 text-lg">이어서 작업할 프로젝트를 선택하세요.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onNewProject}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-lg"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>새 프로젝트</span>
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                <div className="p-8 pt-4 flex-grow overflow-y-auto custom-scrollbar">
                    {sortedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <FolderOpenIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-xl">저장된 프로젝트가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedProjects.map((project, index) => (
                                <div key={project.id} className="bg-[#242933] rounded-[24px] border border-gray-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col">
                                    <div className="aspect-video bg-[#1a1d24] flex items-center justify-center relative">
                                        <FilmIcon className="w-16 h-16 text-gray-700" />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-2 py-1 bg-indigo-600 text-[10px] font-bold text-white rounded uppercase">편집 중</span>
                                            <span className="px-2 py-1 bg-gray-800 text-[10px] font-bold text-gray-300 rounded uppercase">{project.aspectRatio || '16:9'}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 truncate max-w-[180px]">{project.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(project.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 오후 {new Date(project.createdAt).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: false })}
                                                </p>
                                            </div>
                                            {index === 0 && (
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-800/50 px-2 py-1 rounded">최근 저장</span>
                                            )}
                                        </div>
                                        <div className="mt-auto flex gap-3">
                                            <button 
                                                onClick={() => onLoad(project.id)} 
                                                className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition-all"
                                            >
                                                불러오기
                                            </button>
                                            <button 
                                                onClick={() => onDelete(project.id)} 
                                                className="p-3 bg-gray-700 hover:bg-red-500/20 hover:text-red-500 rounded-xl text-gray-400 transition-all"
                                            >
                                                <TrashIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
            <div className="flex items-center gap-3" ref={menuRef}>
                 <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="flex items-center gap-2 px-6 py-3 bg-[#242933] hover:bg-gray-700 rounded-xl shadow-lg text-white font-bold transition-all text-sm border border-gray-700/50"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                >
                    <Bars3Icon className="w-5 h-5" />
                    <span>MENU</span>
                </button>

                <button 
                    onClick={props.onLoad}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg text-white font-bold transition-all text-sm"
                >
                    <FolderIcon className="w-5 h-5" />
                    <span>Project</span>
                </button>

                <div className={`absolute top-full right-0 mt-2 w-64 bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-200 ease-out z-50 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <ul className="text-white text-sm font-bold divide-y divide-gray-800">
                        <li>
                            <button onClick={() => { props.onMakeProject(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left">
                                <PlusIcon className="w-5 h-5" /> Make Project
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onSave(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left">
                                <ArrowDownTrayIcon className="w-5 h-5" /> Save Project
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onLoad(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left">
                                <FolderIcon className="w-5 h-5" /> Project
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { handleImportClick(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left">
                                <FolderOpenIcon className="w-5 h-5" /> Import
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onExportCurrentProject(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left">
                                <ArrowUpOnSquareIcon className="w-5 h-5" /> Export Project
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { props.onExportPlayground(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 bg-emerald-900/20 hover:bg-emerald-600/40 text-emerald-400 transition-colors text-left">
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
                onNewProject={props.onMakeProject}
            />
        </>
    );
};

export default ProjectControls;
