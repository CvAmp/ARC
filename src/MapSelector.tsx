import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import SvgMap from "./SvgMap";

// --- Zoomable/Pannable SVG Map Wrapper ---
const ZoomablePanSvgMap: React.FC<React.ComponentProps<typeof SvgMap>> = (props) => {
  // Responsive SVG sizing: fill parent, viewBox always [0,0,1600,1600]
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState<[number, number, number, number]>([0, 0, 1600, 1600]);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  // Mouse/touch pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (svgRef.current) {
      setDrag({ x: e.clientX, y: e.clientY });
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (drag && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const dx = ((e.clientX - drag.x) / rect.width) * viewBox[2];
      const dy = ((e.clientY - drag.y) / rect.height) * viewBox[3];
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

  // Improved zoom handler that zooms toward mouse position
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!svgRef.current) return;
    
    // Zoom factor - smaller values for smoother zooming
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    
    // Get the center of the current view for consistent zooming
    const centerX = viewBox[0] + viewBox[2] / 2;
    const centerY = viewBox[1] + viewBox[3] / 2;
    
    setViewBox(([x, y, w, h]) => {
      const newW = w * zoomFactor;
      const newH = h * zoomFactor;
      
      // Calculate new position to keep center point stationary
      const newX = centerX - newW / 2;
      const newY = centerY - newH / 2;
      
      // Constrain zoom levels
      const minZoom = 100; // Minimum view size
      const maxZoom = 3200; // Maximum view size (2x zoom out from original)
      
      if (newW < minZoom || newH < minZoom || newW > maxZoom || newH > maxZoom) {
        return [x, y, w, h]; // Don't change if out of bounds
      }
      
      return [newX, newY, newW, newH];
    });
  };

  // Touch handlers for mobile support
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDrag({ x: touch.clientX, y: touch.clientY });
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (drag && e.touches.length === 1 && svgRef.current) {
      const touch = e.touches[0];
      const rect = svgRef.current.getBoundingClientRect();
      const dx = ((touch.clientX - drag.x) / rect.width) * viewBox[2];
      const dy = ((touch.clientY - drag.y) / rect.height) * viewBox[3];
      setViewBox([
        viewBox[0] - dx,
        viewBox[1] - dy,
        viewBox[2],
        viewBox[3],
      ]);
      setDrag({ x: touch.clientX, y: touch.clientY });
    }
  };

  const onTouchEnd = () => setDrag(null);

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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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

    // Create a temporary container with map and legend
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
      position: absolute;
      top: -20000px;
      left: -20000px;
      width: 1200px;
      height: auto;
      background: ${format === 'jpg' ? '#ffffff' : 'transparent'};
      font-family: system-ui, Arial, sans-serif;
      z-index: 9999;
    `;

    // Clone the map container
    const mapClone = mapContainer.cloneNode(true) as HTMLElement;
    mapClone.style.cssText = `
      width: 1200px;
      height: 800px;
      margin: 0;
      border: none;
      display: block;
    `;

    // Create legend
    const legend = document.createElement('div');
    legend.style.cssText = `
      padding: 20px;
      background: ${format === 'jpg' ? '#ffffff' : 'rgba(255,255,255,0.98)'};
      border: 2px solid #333;
      border-top: 3px solid #333;
      display: block;
      width: 1200px;
      box-sizing: border-box;
    `;

    // Add title to legend
    const legendTitle = document.createElement('div');
    legendTitle.textContent = 'Color Selection';
    legendTitle.style.cssText = `
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
    `;
    legend.appendChild(legendTitle);

    // Create color palette container (matching the toolbar design)
    const colorPalette = document.createElement('div');
    colorPalette.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    `;

    // Add all colors with their counts (just like in the toolbar)
    COLORS.forEach((color) => {
      const colorContainer = document.createElement('div');
      colorContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      `;

      // Color circle (matching the toolbar design)
      const colorCircle = document.createElement('div');
      colorCircle.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${color};
        border: ${colorCounts[color] > 0 ? '2.5px solid #333' : '1px solid #888'};
        border-radius: 50%;
        box-shadow: ${colorCounts[color] > 0 ? '0 0 6px rgba(0,0,0,0.4)' : 'none'};
      `;

      // Count label (matching the toolbar design)
      const countLabel = document.createElement('div');
      if (colorCounts[color] > 0) {
        countLabel.textContent = colorCounts[color].toString();
        countLabel.style.cssText = `
          font-size: 12px;
          color: #333;
          font-weight: bold;
          background: rgba(255,255,255,0.9);
          padding: 2px 6px;
          border-radius: 8px;
          min-width: 16px;
          text-align: center;
          border: 1px solid #333;
        `;
      } else {
        countLabel.textContent = '0';
        countLabel.style.cssText = `
          font-size: 12px;
          color: #999;
          font-weight: normal;
          background: rgba(240,240,240,0.8);
          padding: 2px 6px;
          border-radius: 8px;
          min-width: 16px;
          text-align: center;
          border: 1px solid #ccc;
        `;
      }

      colorContainer.appendChild(colorCircle);
      colorContainer.appendChild(countLabel);
      colorPalette.appendChild(colorContainer);
    });

    legend.appendChild(colorPalette);

    // Add total count
    const totalSelected = Object.keys(tileColors).length;
    const totalItem = document.createElement('div');
    totalItem.style.cssText = `
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
      padding: 8px;
      background: ${format === 'jpg' ? '#f8f9fa' : 'rgba(248,249,250,0.9)'};
      border-radius: 6px;
      border: 1px solid #333;
    `;
    totalItem.textContent = `Total: ${totalSelected} region${totalSelected !== 1 ? 's' : ''} selected`;
    legend.appendChild(totalItem);

    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.textContent = `Generated: ${new Date().toLocaleString()}`;
    timestamp.style.cssText = `
      text-align: center;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    `;
    legend.appendChild(timestamp);

    // Assemble export container
    exportContainer.appendChild(mapClone);
    exportContainer.appendChild(legend);
    document.body.appendChild(exportContainer);
    
    // Force a layout recalculation
    exportContainer.offsetHeight;
    
    try {
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: format === 'jpg' ? '#ffffff' : null,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: 1200,
        logging: false,
        removeContainer: false,
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
    } finally {
      // Clean up temporary container
      document.body.removeChild(exportContainer);
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