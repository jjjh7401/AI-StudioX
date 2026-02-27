import React, { useMemo } from 'react';
import { Node, CameraPresetNodeData } from '../../types';
import { UserIcon } from '@heroicons/react/24/solid';

interface CameraPresetNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<CameraPresetNodeData>) => void;
  isCollapsed: boolean;
}

const FOCAL_LENGTHS = ['8mm', '18mm', '24mm', '35mm', '50mm', '85mm', '135mm', '200mm'];
const ANGLES = ["Bird's Eye", 'Overhead', 'High Angle', 'Eye Level', 'Low Angle', 'Worm Eye'];
const SHOT_SIZES = ['Long Shot', 'Full Shot', 'Knee Shot', 'Medium Shot', 'Bust Shot', 'Close Up', 'Extreme Close Up', 'Macro'];

const CameraPresetNode: React.FC<CameraPresetNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as CameraPresetNodeData;

  const constructPrompt = (direction: string | null, focalLength: string, angle: string, shotSize: string) => {
    let dirText = 'front view, straight-on';
    switch (direction) {
      case 'center': dirText = 'front view, straight-on'; break;
      case 'up': dirText = 'direct front view'; break;
      case 'down': dirText = 'back view, from behind'; break;
      case 'left': dirText = 'left side profile view'; break;
      case 'right': dirText = 'right side profile view'; break;
      case 'nw': dirText = 'front-left three-quarter view'; break;
      case 'ne': dirText = 'front-right three-quarter view'; break;
      case 'sw': dirText = 'back-left three-quarter view'; break;
      case 'se': dirText = 'back-right three-quarter view'; break;
      default: dirText = 'neutral perspective'; break;
    }

    let angleText = 'eye-level straight perspective';
    switch (angle) {
      case "Bird's Eye": angleText = "high bird's eye view"; break;
      case 'Overhead': angleText = "top-down overhead view"; break;
      case 'High Angle': angleText = "high angle looking down"; break;
      case 'Eye Level': angleText = "eye-level straight perspective"; break;
      case 'Low Angle': angleText = "low angle looking up"; break;
      case 'Worm Eye': angleText = "dramatic worm's-eye view from ground level"; break;
    }

    let focalText = 'standard prime lens';
    const mm = parseInt(focalLength);
    if (mm <= 24) focalText = 'ultra-wide-angle lens';
    else if (mm <= 50) focalText = 'standard prime lens';
    else if (mm <= 85) focalText = 'portrait lens';
    else focalText = 'telephoto lens';

    let shotText = 'Full shot';
    switch (shotSize) {
      case 'Long Shot': shotText = 'Wide establishing shot'; break;
      case 'Full Shot': shotText = 'Full-body shot from head to toe'; break;
      case 'Knee Shot': shotText = 'Medium-long shot, framed from the knees up'; break;
      case 'Medium Shot': shotText = 'Medium shot, waist-up composition'; break;
      case 'Bust Shot': shotText = 'Medium close-up, chest-up composition'; break;
      case 'Close Up': shotText = 'Close-up portrait'; break;
      case 'Extreme Close Up': shotText = 'Extreme close-up focusing on specific details'; break;
      case 'Macro': shotText = 'Macro photography with extreme detail'; break;
    }

    return `Professional ${shotSize}, ${angleText} photography, captured with a ${focalLength} ${focalText}. The subject is shown from a ${dirText}.`;
  };

  const handleUpdate = (updates: Partial<CameraPresetNodeData>) => {
    const newData = { ...data, ...updates };
    const prompt = constructPrompt(newData.direction, newData.focalLength, newData.angle, newData.shotSize);
    onDataChange(node.id, { ...updates, prompt });
  };

  const directions = [
    { id: 'nw', icon: '↖' }, { id: 'up', icon: '↑' }, { id: 'ne', icon: '↗' },
    { id: 'left', icon: '←' }, { id: 'center', icon: <UserIcon className="w-5 h-5" /> }, { id: 'right', icon: '→' },
    { id: 'sw', icon: '↙' }, { id: 'down', icon: '↓' }, { id: 'se', icon: '↘' }
  ];

  if (isCollapsed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-[10px] text-gray-400">
        <p className="font-bold text-white text-xs">{data.shotSize}</p>
        <p>{data.angle} @ {data.focalLength}</p>
      </div>
    );
  }

  const selectStyle = "w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer";

  return (
    <div className="flex flex-col h-full space-y-4 py-1">
      {/* D-PAD Section */}
      <div className="bg-slate-900/40 p-4 rounded-2xl flex flex-col items-center border border-slate-700/50 shadow-inner">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {directions.map((dir) => {
            const isActive = data.direction === dir.id;
            return (
              <button
                key={dir.id}
                onClick={() => handleUpdate({ direction: dir.id })}
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-bold transition-all duration-200 ${
                  isActive 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' 
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {dir.icon}
              </button>
            );
          })}
        </div>
        <button 
          onClick={() => handleUpdate({ direction: null })}
          className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 transition-colors"
        >
          Deselect Direction
        </button>
      </div>

      {/* Selects Section */}
      <div className="space-y-4 px-1">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Focal Length</label>
          <div className="relative group">
            <select 
              value={data.focalLength} 
              onChange={(e) => handleUpdate({ focalLength: e.target.value })}
              className={selectStyle}
            >
              {FOCAL_LENGTHS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-tr from-pink-400 to-orange-300 rounded-sm opacity-60 pointer-events-none"></div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Angle</label>
          <div className="relative group">
            <select 
              value={data.angle} 
              onChange={(e) => handleUpdate({ angle: e.target.value })}
              className={selectStyle}
            >
              {ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-tr from-indigo-400 to-sky-300 rounded-sm opacity-60 pointer-events-none"></div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Shot Size</label>
          <div className="relative group">
            <select 
              value={data.shotSize} 
              onChange={(e) => handleUpdate({ shotSize: e.target.value })}
              className={selectStyle}
            >
              {SHOT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-sm opacity-60 pointer-events-none"></div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-3 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
          <p className="text-[10px] font-mono text-indigo-300 line-clamp-3 leading-relaxed">
            {data.prompt}
          </p>
      </div>
    </div>
  );
};

export default CameraPresetNode;