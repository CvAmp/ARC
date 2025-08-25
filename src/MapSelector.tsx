import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import SvgMap from "./SvgMap";

// --- Zoomable/Pannable SVG Map Wrapper ---
interface ZoomablePanSvgMapProps extends React.ComponentProps<typeof SvgMap> {
  onResetZoom?: (resetFn: () => void) => void;
}

const ZoomablePanSvgMap: React.FC<ZoomablePanSvgMapProps> = (props) => {
  // Extract onResetZoom from props
  const { onResetZoom, ...svgMapProps } = props;
  
  // Responsive SVG sizing: fill parent, viewBox always [0,0,1600,1600]
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState<[number, number, number, number]>([0, 0, 8192, 8192]);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  // Reset zoom function
  const resetZoom = () => {
    setViewBox([0, 0, 8192, 8192]);
  };

  // Expose reset function to parent
  React.useEffect(() => {
    if (onResetZoom) {
      onResetZoom(resetZoom);
    }
  }, [onResetZoom]);

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!svgRef.current) return;
      
      const panAmount = viewBox[2] * 0.1; // Pan 10% of current view
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setViewBox(([x, y, w, h]) => [x, y - panAmount, w, h]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setViewBox(([x, y, w, h]) => [x, y + panAmount, w, h]);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setViewBox(([x, y, w, h]) => [x - panAmount, y, w, h]);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setViewBox(([x, y, w, h]) => [x + panAmount, y, w, h]);
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomFactor = 0.9;
            const centerX = viewBox[0] + viewBox[2] / 2;
            const centerY = viewBox[1] + viewBox[3] / 2;
            setViewBox(([x, y, w, h]) => {
              const newW = w * zoomFactor;
              const newH = h * zoomFactor;
              if (newW < 500 || newH < 500) return [x, y, w, h];
              return [centerX - newW / 2, centerY - newH / 2, newW, newH];
            });
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomFactor = 1.1;
            const centerX = viewBox[0] + viewBox[2] / 2;
            const centerY = viewBox[1] + viewBox[3] / 2;
            setViewBox(([x, y, w, h]) => {
              const newW = w * zoomFactor;
              const newH = h * zoomFactor;
              if (newW > 16384 || newH > 16384) return [x, y, w, h];
              return [centerX - newW / 2, centerY - newH / 2, newW, newH];
            });
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewBox, resetZoom]);

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
      
      setViewBox(([x, y, w, h]) => {
        const newX = x - dx;
        const newY = y - dy;
        
        // Apply some loose bounds to prevent panning too far
        const maxOffset = Math.max(w, h) * 0.5; // Allow panning half a view beyond edges
        const minX = -maxOffset;
        const minY = -maxOffset;
        const maxX = 8192 + maxOffset - w;
        const maxY = 8192 + maxOffset - h;
        
        return [
          Math.max(minX, Math.min(maxX, newX)),
          Math.max(minY, Math.min(maxY, newY)),
          w,
          h,
        ];
      });
      
      setDrag({ x: e.clientX, y: e.clientY });
    }
  };
  const onMouseUp = () => setDrag(null);

  // Manually handle wheel event to ensure preventDefault works
  React.useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      // Consume wheel events so the page doesn't scroll and handle zoom/pan correctly
      e.preventDefault();
      e.stopPropagation();
      
      if (!svgRef.current) return;
      
      // Mouse position relative to the SVG
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Determine zoom factor (scroll up -> zoom in, scroll down -> zoom out)
      const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
      
      setViewBox(([x, y, w, h]) => {
        // Clamp new width/height to min/max zoom
        const minZoom = 500;  // Minimum zoom level (more zoomed in)
        const maxZoom = 16384; // Maximum zoom level (more zoomed out)
        const rawW = w * zoomFactor;
        const rawH = h * zoomFactor;
        const newW = Math.min(Math.max(rawW, minZoom), maxZoom);
        const newH = Math.min(Math.max(rawH, minZoom), maxZoom);
        
        // World coordinates of the mouse before zoom
        const worldX = x + (mouseX / rect.width) * w;
        const worldY = y + (mouseY / rect.height) * h;
        
        // Position the new viewBox so that the mouse stays anchored
        let newX = worldX - (mouseX / rect.width) * newW;
        let newY = worldY - (mouseY / rect.height) * newH;
        
        // Apply the same loose bounds used for panning to prevent drift
        const maxOffset = Math.max(newW, newH) * 0.5;
        const minX = -maxOffset;
        const minY = -maxOffset;
        const maxX = 8192 + maxOffset - newW;
        const maxY = 8192 + maxOffset - newH;
        newX = Math.min(Math.max(newX, minX), maxX);
        newY = Math.min(Math.max(newY, minY), maxY);
        
        return [newX, newY, newW, newH];
      });
    };

    // Add the event listener with passive: false to allow preventDefault
    containerElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      containerElement.removeEventListener('wheel', handleWheel);
    };
  }, [viewBox, setViewBox]);

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
      
      setViewBox(([x, y, w, h]) => {
        const newX = x - dx;
        const newY = y - dy;
        
        // Apply same bounds as mouse move
        const maxOffset = Math.max(w, h) * 0.5;
        const minX = -maxOffset;
        const minY = -maxOffset;
        const maxX = 8192 + maxOffset - w;
        const maxY = 8192 + maxOffset - h;
        
        return [
          Math.max(minX, Math.min(maxX, newX)),
          Math.max(minY, Math.min(maxY, newY)),
          w,
          h,
        ];
      });
      
      setDrag({ x: touch.clientX, y: touch.clientY });
    }
  };

  const onTouchEnd = () => setDrag(null);

  return (
    <div
      ref={containerRef}
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
        touchAction: 'none', // Prevent default touch behaviors like scrolling
      }}
    >
      {/* Help overlay */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: 4,
        fontSize: '11px',
        zIndex: 10,
        pointerEvents: 'none',
        lineHeight: '1.3',
        maxWidth: '200px'
      }}>
        <div><strong>Controls:</strong></div>
        <div>Scroll: zoom</div>
        <div>Drag: pan</div>
        <div>Arrow keys: pan</div>
        <div>Ctrl/Cmd + +/-: zoom</div>
        <div>Ctrl/Cmd + 0: reset</div>
      </div>
      <svg
        ref={svgRef}
        viewBox={viewBox.join(' ')}
        width="100%"
        height="100%"
        style={{ display: 'block', background: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <SvgMap {...svgMapProps} />
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

  // Max selections allowed per color/label across tiles, gates, and shrines
  const MAX_PER_COLOR = 50;
  
  // Ref to store the reset zoom function
  const resetZoomRef = useRef<(() => void) | null>(null);

  // Calculate color counts (tiles + gates + shrines)
  const colorCounts = COLORS.reduce((acc, color) => {
    const tileCount = Object.values(tileColors).filter(tileColor => tileColor === color).length;
    const gateCount = Object.values(gateColors).filter(gateColor => gateColor === color).length;
    const shrineCount = Object.values(shrineColors).filter(shrineColor => shrineColor === color).length;
    acc[color] = tileCount + gateCount + shrineCount;
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
  gates: gateColors,
  shrines: shrineColors,
      labels: colorLabels,
      timestamp: new Date().toISOString(),
  totalTiles: Object.keys(tileColors).length,
  totalGates: Object.keys(gateColors).length,
  totalShrines: Object.keys(shrineColors).length,
  version: '1.1'
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

            // Import gates if they exist
            if (data.gates && typeof data.gates === 'object') {
              const validGates: { [id: string]: string } = {};
              Object.entries<string>(data.gates).forEach(([id, color]) => {
                if (typeof id === 'string' && typeof color === 'string' && COLORS.includes(color)) {
                  validGates[id] = color;
                }
              });
              setGateColors(validGates);
            }

            // Import shrines if they exist
            if (data.shrines && typeof data.shrines === 'object') {
              const validShrines: { [id: string]: string } = {};
              Object.entries<string>(data.shrines).forEach(([id, color]) => {
                if (typeof id === 'string' && typeof color === 'string' && COLORS.includes(color)) {
                  validShrines[id] = color;
                }
              });
              setShrineColors(validShrines);
            }
            
            const tilesCount = Object.keys(validTiles).length;
            const gatesCount = data.gates ? Object.keys(data.gates).length : 0;
            const shrinesCount = data.shrines ? Object.keys(data.shrines).length : 0;
            alert(`Imported: tiles ${tilesCount}${data.gates ? `, gates ${gatesCount}` : ''}${data.shrines ? `, shrines ${shrinesCount}` : ''}.`);
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

        // Import gates if they exist
        if (data.gates && typeof data.gates === 'object') {
          const validGates: { [id: string]: string } = {};
          Object.entries<string>(data.gates).forEach(([id, color]) => {
            if (typeof id === 'string' && typeof color === 'string' && COLORS.includes(color)) {
              validGates[id] = color;
            }
          });
          setGateColors(validGates);
        }

        // Import shrines if they exist
        if (data.shrines && typeof data.shrines === 'object') {
          const validShrines: { [id: string]: string } = {};
          Object.entries<string>(data.shrines).forEach(([id, color]) => {
            if (typeof id === 'string' && typeof color === 'string' && COLORS.includes(color)) {
              validShrines[id] = color;
            }
          });
          setShrineColors(validShrines);
        }
        
        const tilesCount = Object.keys(validTiles).length;
        const gatesCount = data.gates ? Object.keys(data.gates).length : 0;
        const shrinesCount = data.shrines ? Object.keys(data.shrines).length : 0;
        alert(`Imported from clipboard: tiles ${tilesCount}${data.gates ? `, gates ${gatesCount}` : ''}${data.shrines ? `, shrines ${shrinesCount}` : ''}.`);
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
  gates: gateColors,
  shrines: shrineColors,
      labels: colorLabels,
      timestamp: new Date().toISOString(),
      totalTiles: Object.keys(tileColors).length,
  totalGates: Object.keys(gateColors).length,
  totalShrines: Object.keys(shrineColors).length,
  version: '1.1'
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
      // Enforce max per color across tiles + gates + shrines
      const currentTileCount = Object.values(prev).filter((c) => c === selectedColor).length;
      const currentGateCount = Object.values(gateColors).filter((c) => c === selectedColor).length;
      const currentShrineCount = Object.values(shrineColors).filter((c) => c === selectedColor).length;
      const totalForColor = currentTileCount + currentGateCount + currentShrineCount;
      if (totalForColor >= MAX_PER_COLOR) {
        alert(`Max ${MAX_PER_COLOR} selections reached for this color/label.`);
        return prev;
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
      // Enforce max per color across tiles + gates + shrines
      const currentTileCount = Object.values(tileColors).filter((c) => c === selectedColor).length;
      const currentGateCount = Object.values(prev).filter((c) => c === selectedColor).length;
      const currentShrineCount = Object.values(shrineColors).filter((c) => c === selectedColor).length;
      const totalForColor = currentTileCount + currentGateCount + currentShrineCount;
      if (totalForColor >= MAX_PER_COLOR) {
        alert(`Max ${MAX_PER_COLOR} selections reached for this color/label.`);
        return prev;
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
      // Enforce max per color across tiles + gates + shrines
      const currentTileCount = Object.values(tileColors).filter((c) => c === selectedColor).length;
      const currentGateCount = Object.values(gateColors).filter((c) => c === selectedColor).length;
      const currentShrineCount = Object.values(prev).filter((c) => c === selectedColor).length;
      const totalForColor = currentTileCount + currentGateCount + currentShrineCount;
      if (totalForColor >= MAX_PER_COLOR) {
        alert(`Max ${MAX_PER_COLOR} selections reached for this color/label.`);
        return prev;
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
          
          <button
            onClick={() => resetZoomRef.current?.()}
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
              marginLeft: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#138496'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#17a2b8'}
          >
            Reset Zoom
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
            colorLabels={colorLabels}
            onTileClick={handleTileClick}
            selectedGates={selectedGates}
            gateColors={gateColors}
            onGateClick={handleGateClick}
            selectedShrines={selectedShrines}
            shrineColors={shrineColors}
            onShrineClick={handleShrineClick}
            onResetZoom={(resetFn) => { resetZoomRef.current = resetFn; }}
          />
        </div>
      </div>
      
      {/* Credits Banner */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'rgba(35, 39, 47, 0.95)',
        color: '#fff',
        padding: '6px 16px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 1000,
        border: 'none',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        textAlign: 'center',
        lineHeight: '1.2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '10px', opacity: 0.8 }}>
          Credits:
        </span>
        <span>Josh Strunk aka Cvamp</span>
        <span>•</span>
        <span>Wan</span>
        <span>•</span>
        <span style={{ fontSize: '9px', opacity: 0.6 }}>
          World 35
        </span>
      </div>
    </div>
  );
};

export default MapSelector;