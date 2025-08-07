import React, { useState } from "react";
import html2canvas from "html2canvas";
import SvgMap from "./SvgMap";

// --- Static SVG Map Wrapper ---
interface StaticSvgMapProps extends React.ComponentProps<typeof SvgMap> {}

const StaticSvgMap: React.FC<StaticSvgMapProps> = (props) => {
  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 80px)', // Increased height, reduced top margin
        minHeight: 600, // Increased minimum height
        maxHeight: '100vh',
        userSelect: 'none',
        background: '#faf9f6',
        borderRadius: 8,
        border: '1px solid #bbb',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 2vw', // Small side margins for different resolutions
        padding: '1vh 0', // Small vertical padding
      }}
    >
      <svg
        viewBox="0 0 8192 8192" // Fixed viewBox showing entire map
        width="100%"
        height="100%"
        style={{ display: 'block', background: 'none' }}
      >
        <SvgMap {...props} />
      </svg>
    </div>
  );
};

// Rich color palette with named colors
const COLORS = [
  "#DC143C", "#DAA520", "#008080", "#808000", "#8B4513", "#483D8B", "#CD5C5C", "#8FBC8F", "#FF8C00", "#4682B4", "#8B008B", "#CD853F"
];

const MapSelector: React.FC = () => {
  // tileColors: { [tileId: number]: color }
  const [tileColors, setTileColors] = useState<{ [id: number]: string }>({});
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[2]);
  const [colorLabels, setColorLabels] = useState<{ [color: string]: string }>({});
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  
  // States for gates and shrines
  const [gateColors, setGateColors] = useState<{ [id: string]: string }>({});
  const [shrineColors, setShrineColors] = useState<{ [id: string]: string }>({});

  // Calculate color counts
  const colorCounts = COLORS.reduce((acc, color) => {
    acc[color] = Object.values(tileColors).filter(tileColor => tileColor === color).length;
    return acc;
  }, {} as { [color: string]: number });

  // Reset all selections
  const resetSelections = () => {
    setTileColors({});
    setColorLabels({});
    setGateColors({});
    setShrineColors({});
  };

  // Export functionality
  const exportAsImage = async (format: 'png' | 'jpg' = 'png') => {
    try {
      // Simply capture the entire document body (the whole screen as it appears)
      const canvas = await html2canvas(document.body, {
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
      labels: colorLabels,
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
            
            // Import labels if they exist
            if (data.labels && typeof data.labels === 'object') {
              const validLabels: { [color: string]: string } = {};
              Object.entries(data.labels).forEach(([color, label]) => {
                if (typeof color === 'string' && typeof label === 'string' && COLORS.includes(color)) {
                  validLabels[color] = label;
                }
              });
              setColorLabels(validLabels);
            }
            
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
        
        // Import labels if they exist
        if (data.labels && typeof data.labels === 'object') {
          const validLabels: { [color: string]: string } = {};
          Object.entries(data.labels).forEach(([color, label]) => {
            if (typeof color === 'string' && typeof label === 'string' && COLORS.includes(color)) {
              validLabels[color] = label;
            }
          });
          setColorLabels(validLabels);
        }
        
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
      labels: colorLabels,
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

  // Handle label editing
  const handleLabelEdit = (color: string, label: string) => {
    setColorLabels(prev => ({
      ...prev,
      [color]: label
    }));
  };

  const handleLabelKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingLabel(null);
    }
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

  // Handler for gate clicks
  const handleGateClick = (id: string) => {
    setGateColors((prev) => {
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

  // Handler for shrine clicks  
  const handleShrineClick = (id: string) => {
    setShrineColors((prev) => {
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
  const selectedGates = Object.keys(gateColors);
  const selectedShrines = Object.keys(shrineColors);

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
                <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80 }}>
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
                  
                  {/* Label input/display */}
                  {editingLabel === color ? (
                    <input
                      type="text"
                      value={colorLabels[color] || ''}
                      onChange={(e) => handleLabelEdit(color, e.target.value)}
                      onBlur={() => setEditingLabel(null)}
                      onKeyPress={handleLabelKeyPress}
                      autoFocus
                      style={{
                        width: '80px',
                        fontSize: '12px',
                        padding: '2px 4px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        textAlign: 'center',
                        background: '#fff',
                        color: '#000',
                      }}
                      placeholder="Label"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingLabel(color)}
                      style={{
                        fontSize: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        minHeight: '18px',
                        width: '80px',
                        padding: '3px 4px',
                        borderRadius: '3px',
                        background: colorLabels[color] ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                        border: '1px solid transparent',
                        transition: 'background 0.2s',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={colorLabels[color] || 'Click to add label'}
                    >
                      {colorLabels[color] || 'Label'}
                    </div>
                  )}
                  
                  {colorCounts[color] > 0 && (
                    <span style={{ 
                      fontSize: '11px', 
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
        top: 60, // Reduced from 72px
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 60px)', // Reduced top offset
        zIndex: 1,
        background: '#23272f',
        // Add data attribute for export targeting
      }}>
        <div data-export-target style={{ width: '100%', height: '100%' }}>
          <StaticSvgMap
            selectedTiles={selectedTiles}
            selectedColor={selectedColor}
            tileColors={tileColors}
            colorLabels={colorLabels}
            onTileClick={handleTileClick}
            selectedGates={selectedGates}
            gateColors={gateColors}
            onGateClick={handleGateClick}
            selectedShrines={selectedShrines}
            shrineColors={shrineColors}
            onShrineClick={handleShrineClick}
          />
        </div>
      </div>
      
      {/* Credits Section */}
      <div style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        background: 'rgba(35, 39, 47, 0.95)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 1000,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        textAlign: 'right',
        lineHeight: '1.3',
        maxWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>
          Credits
        </div>
        <div style={{ marginBottom: '1px' }}>
          Josh Strunk aka Cvamp
        </div>
        <div style={{ marginBottom: '1px' }}>
          Wan
        </div>
        <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>
          World 35
        </div>
      </div>
    </div>
  );
};

export default MapSelector;