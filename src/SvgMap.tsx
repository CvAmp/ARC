import React from 'react';

type SvgMapProps = {
  selectedTiles: number[];
  selectedColor: string;
  tileColors: { [id: number]: string };
  colorLabels: { [color: string]: string };
  onTileClick: (id: number) => void;
};

// Array of map tile data (add more as needed)
const tilePaths = [
  {
    id: 1,
    d: "M100,100 L200,100 L200,200 L100,200 Z",
    defaultFill: "#e0e0e0"
  },
  {
    id: 2,
    d: "M200,100 L300,100 L300,200 L200,200 Z",
    defaultFill: "#e0e0e0"
  },
  {
    id: 3,
    d: "M300,100 L400,100 L400,200 L300,200 Z",
    defaultFill: "#e0e0e0"
  },
  {
    id: 4,
    d: "M100,200 L200,200 L200,300 L100,300 Z",
    defaultFill: "#e0e0e0"
  },
  {
    id: 5,
    d: "M200,200 L300,200 L300,300 L200,300 Z",
    defaultFill: "#e0e0e0"
  }
];

const SvgMap: React.FC<SvgMapProps> = ({
  selectedTiles,
  selectedColor,
  tileColors,
  colorLabels,
  onTileClick
}) => {

  const getTileLabel = (id: number) => {
    const color = tileColors[id];
    return color ? colorLabels[color] : '';
  };

  return (
    <svg viewBox="0 0 1600 1600" width="100%" height="100%">
      {tilePaths.map((tile) => {
        const fill = tileColors[tile.id] || tile.defaultFill;
        const isSelected = selectedTiles.includes(tile.id);
        const label = getTileLabel(tile.id);
        
        return (
          <g key={tile.id}>
            <path
              d={tile.d}
              fill={fill}
              stroke={isSelected ? '#fff' : '#333'}
              strokeWidth={isSelected ? 3 : 2}
              style={{ cursor: 'pointer', transition: 'stroke 0.2s, stroke-width 0.2s' }}
              onClick={() => onTileClick(tile.id)}
            />
            {label && (
              <text
                x="800"
                y="800"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                stroke="#000000"
                strokeWidth="0.5"
                style={{
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default SvgMap;