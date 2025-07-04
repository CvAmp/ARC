import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import SvgMap from "./SvgMap";

// --- Zoomable/Pannable SVG Map Wrapper ---
const ZoomablePanSvgMap: React.FC<React.ComponentProps<typeof SvgMap>> = (props) => {
  // Responsive SVG sizing: fill parent, viewBox always [0,0,1600,1600]
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState<[number, number, number, number]>([0, 0, 1600, 1600]);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  // Optionally, you could allow initial zoom to fit parent, but for now always show full map

  // Mouse/touch pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (svgRef.current) {
      setDrag({ x: e.clientX, y: e.clientY });
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (drag && svgRef.current) {
      const dx = ((e.clientX - drag.x) * viewBox[2]) / svgRef.current.clientWidth;
      const dy = ((e.clientY - drag.y) * viewBox[3]) / svgRef.current.clientHeight;
      setViewBox([
        viewBox[0] - dx,
        viewBox[1] - dy,
        viewBox[2],
        viewBox[3],
      ]);
      setDrag({ x: e.clientX, y: e.clientY });
    }
  };
  const onMouseUp = () => setDrag(null);

  // Zoom handler
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 0.9 : 1.1;
    setViewBox(([x, y, w, h]) => {
      const mx = x + w / 2;
      const my = y + h / 2;
      const newW = w * scale;
      const newH = h * scale;
      return [mx - newW / 2, my - newH / 2, newW, newH];
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 120px)', // fill most of viewport, minus header/color picker
        minHeight: 400,
        maxHeight: '100vh',
        cursor: drag ? 'grabbing' : 'grab',
        userSelect: 'none',
        background: '#faf9f6',
        borderRadius: 8,
        border: '1px solid #bbb',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseLeave={onMouseUp}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox.join(' ')}
        width="100%"
        height="100%"
        style={{ display: 'block', background: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
      >
        <SvgMap {...props} />
      </svg>
    </div>
  );
};

// Expanded color palette (12 varied colors)
const COLORS = [
  "#e0e0e0", "#c0c0c0", "#a0e0a0", "#f0b0b0", "#b0b0f0", "#ffe066", "#ff8c42", "#6ec6ff", "#ff6f91", "#7fffd4", "#bada55", "#8d5524"
];

const MapSelector: React.FC = () => {
  // tileColors: { [tileId: number]: color }
  const [tileColors, setTileColors] = useState<{ [id: number]: string }>({});
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[2]);

  // Calculate color counts
  const colorCounts = COLORS.reduce((acc, color) => {
    acc[color] = Object.values(tileColors).filter(tileColor => tileColor === color).length;
    return acc;
  }, {} as { [color: string]: number });

  // Reset all selections
  const resetSelections = () => {
    setTileColors({});
  };

  // Export functionality
  const exportAsImage = async (format: 'png' | 'jpg' = 'png') => {
    const mapContainer = document.querySelector('[data-export-target]') as HTMLElement;
    if (!mapContainer) {
      alert('Map not found for export');
      return;
    }

    try {
      const canvas = await html2canvas(mapContainer, {
        backgroundColor: format === 'jpg' ? '#ffffff' : null,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `map-selection.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  // Copy current selection as shareable data
  const copySelectionData = async () => {
    const selectionData = {
      tiles: tileColors,
      timestamp: new Date().toISOString(),
      totalTiles: Object.keys(tileColors).length
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectionData, null, 2));
      alert('Selection data copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy selection data.');
    }
  };

  // Import selection data from JSON
  const importSelectionData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.tiles && typeof data.tiles === 'object') {
            // Convert string keys back to numbers and validate colors
            const validTiles: { [id: number]: string } = {};
            Object.entries(data.tiles).forEach(([key, color]) => {
              const tileId = parseInt(key);
              if (!isNaN(tileId) && typeof color === 'string' && COLORS.includes(color)) {
                validTiles[tileId] = color;
              }
            });
            setTileColors(validTiles);
            alert(`Successfully imported ${Object.keys(validTiles).length} tile selections!`);
          } else {
            alert('Invalid file format. Please select a valid selection data file.');
          }
        } catch (error) {
          console.error('Import failed:', error);
          alert('Failed to import selection data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Import from clipboard
  const importFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const data = JSON.parse(clipboardText);
      
      if (data.tiles && typeof data.tiles === 'object') {
        // Convert string keys back to numbers and validate colors
        const validTiles: { [id: number]: string } = {};
        Object.entries(data.tiles).forEach(([key, color]) => {
          const tileId = parseInt(key);
          if (!isNaN(tileId) && typeof color === 'string' && COLORS.includes(color)) {
            validTiles[tileId] = color;
          }
        });
        setTileColors(validTiles);
        alert(`Successfully imported ${Object.keys(validTiles).length} tile selections from clipboard!`);
      } else {
        alert('Invalid clipboard data. Please copy valid selection data first.');
      }
    } catch (error) {
      console.error('Clipboard import failed:', error);
      alert('Failed to import from clipboard. Please check the data format.');
    }
  };

  // Save selection data as JSON file
  const saveSelectionData = () => {
    const selectionData = {
      tiles: tileColors,
      timestamp: new Date().toISOString(),
      totalTiles: Object.keys(tileColors).length,
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(selectionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `map-selection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Handler to set color for a tile (multi-color selection)
  const handleTileClick = (id: number) => {
    setTileColors((prev) => {
      // If already this color, remove color (deselect)
      if (prev[id] === selectedColor) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      // Otherwise, set to selectedColor
      return { ...prev, [id]: selectedColor };
    });
  };

  // For highlighting: which tiles are currently selected (any color)
  const selectedTiles = Object.keys(tileColors).map(Number);

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden', position: 'fixed', top: 0, left: 0, background: '#23272f' }}>
      <div style={{
        margin: 0,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 2,
        background: 'rgba(35,39,47,0.97)',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, color: '#fff' }}>Select color:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLORS.map((color) => (
                <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <button
                    style={{
                      background: color,
                      border: selectedColor === color ? "2.5px solid #fff" : "1px solid #888",
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      margin: 0,
                      cursor: "pointer",
                      outline: 'none',
                      boxShadow: selectedColor === color ? '0 0 6px #fff' : undefined,
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                    aria-label={color}
                    onClick={() => setSelectedColor(color)}
                  />
                  {colorCounts[color] > 0 && (
                    <span style={{ 
                      fontSize: '10px', 
                      color: '#fff', 
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '1px 4px',
                      borderRadius: '8px',
                      minWidth: '16px',
                      textAlign: 'center'
                    }}>
                      {colorCounts[color]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={resetSelections}
            style={{
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#c82333'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dc3545'}
          >
            Reset All
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => exportAsImage('png')}
              style={{
                background: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#218838'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#28a745'}
            >
              Save PNG
            </button>
            
            <button
              onClick={() => exportAsImage('jpg')}
              style={{
                background: '#17a2b8',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#138496'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#17a2b8'}
            >
              Save JPG
            </button>
            
            <button
              onClick={saveSelectionData}
              style={{
                background: '#6f42c1',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5a32a3'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6f42c1'}
            >
              Save Data
            </button>
            
            <button
              onClick={importSelectionData}
              style={{
                background: '#fd7e14',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e8590c'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fd7e14'}
            >
              Load Data
            </button>
            
            <button
              onClick={copySelectionData}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
            >
              Copy JSON Data
            </button>
            
            <button
              onClick={importFromClipboard}
              style={{
                background: '#20c997',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1ba085'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#20c997'}
            >
              Paste JSON Data
            </button>
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute',
        top: 72,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 72px)',
        zIndex: 1,
        background: '#23272f',
        // Add data attribute for export targeting
      }}>
        <div data-export-target style={{ width: '100%', height: '100%' }}>
          <ZoomablePanSvgMap
            selectedTiles={selectedTiles}
            selectedColor={selectedColor}
            tileColors={tileColors}
            onTileClick={handleTileClick}
          />
        </div>
      </div>
    </div>
  );
};

export default MapSelector;