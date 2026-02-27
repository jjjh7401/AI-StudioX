
import React from 'react';
import { Point, ConnectorType } from '../types';

interface ConnectionComponentProps {
  id: string;
  from: Point;
  to: Point;
  type: ConnectorType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ConnectionComponent: React.FC<ConnectionComponentProps> = ({ id, from, to, type, isSelected, onSelect }) => {
  const pathData = `M ${from.x} ${from.y} C ${from.x + 75} ${from.y}, ${to.x - 75} ${to.y}, ${to.x} ${to.y}`;
  
  const getColor = () => {
    switch (type) {
      case ConnectorType.Text: return isSelected ? '#7dd3fc' : '#38bdf8'; // sky-300 / sky-400
      case ConnectorType.Image: return isSelected ? '#f0abfc' : '#d946ef'; // fuchsia-300 / fuchsia-500
      case ConnectorType.Video: return isSelected ? '#fbbf24' : '#f59e0b'; // amber-300 / amber-500
      case ConnectorType.Array: return isSelected ? '#86efac' : '#22c55e'; // green-300 / green-500
      default: return isSelected ? '#9CA3AF' : '#6B7280'; // gray-400 / gray-500
    }
  }

  return (
    <g onClick={() => onSelect(id)} style={{ cursor: 'pointer' }}>
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
      />
      <path
        d={pathData}
        stroke={getColor()}
        strokeWidth={isSelected ? "5" : "3"}
        fill="none"
        strokeLinecap="round"
        style={{ transition: 'stroke-width 0.15s ease-in-out', pointerEvents: 'none' }}
      />
    </g>
  );
};

export default React.memo(ConnectionComponent);
