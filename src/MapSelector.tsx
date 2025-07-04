import React, { useState } from "react";
import SvgMap from "./SvgMap";

// Example color palette
const COLORS = ["#e0e0e0", "#c0c0c0", "#a0e0a0", "#f0b0b0", "#b0b0f0"];

const MapSelector: React.FC = () => {
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[2]);

  // Handler to toggle tile selection
  const handleTileClick = (id: number) => {
    setSelectedTiles((prev) =>
      prev.includes(id)
        ? prev.filter((tileId) => tileId !== id)
        : [...prev, id]
    );
  };

  // Pass selected state and color to SvgMap
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <span>Select color: </span>
        {COLORS.map((color) => (
          <button
            key={color}
            style={{
              background: color,
              border: selectedColor === color ? "2px solid #333" : "1px solid #ccc",
              width: 32,
              height: 32,
              marginRight: 8,
              cursor: "pointer",
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
      <SvgMap
        selectedTiles={selectedTiles}
        selectedColor={selectedColor}
        onTileClick={handleTileClick}
      />
    </div>
  );
};

export default MapSelector;
