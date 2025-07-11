import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LeafletMapProps = {
  selectedTiles: number[];
  selectedColor: string;
  tileColors: { [id: number]: string };
  colorLabels: { [color: string]: string };
  onTileClick: (id: number) => void;
  selectedGates?: string[];
  gateColors?: { [id: string]: string };
  onGateClick?: (id: string) => void;
  selectedShrines?: string[];
  shrineColors?: { [id: string]: string };
  onShrineClick?: (id: string) => void;
  width?: number;
  height?: number;
};

// Array of map tile data from map_ARC.svg (first 10 tiles with updated coordinates)
const tilePaths = [
  {
    id: 1,
    d: 'M4148.15,3644.2c2.2,9.95-.78,21.64,0,32,.07,9.57,2.06,45.79-4,51.15-2.15-1.83-11.6-1.21-14.66-1.39s-6.7-.1-9.34.89c-4.11,1.53-2.64,1.18-2.65,4.66,2.06,30.95-9.2,27.49,20.87,30.81,6.7.99,9.52-.54,9.34,7.67-.07,3.33.42,12.86-2.77,14.91-2.72,1.76-12.15.39-15.91.19-17.22-2.87-7.37,19.93-14.2,29.73-45.5-3.58-17.72,6.96-30.36,29.76-4.76-1.63-12.45-.99-18.03-1.35-2.33-7.32.34-16.84-3.15-23.74-5.59-10.32-26.87-2.92-36.86-2.77,1.67,9.23-.22,18.13-1.83,27.31-8.93-2.08-21.29-.72-30.59-.28-16.63.44-33.24-1.55-49.83-1.87,4.29-20.63,1.3-42.03.84-62.98,0-4.4-2.12-13.94,2.67-16.39,15.37-3.92,30.48,7.31,26.22-17.62,4.84-28.35-8.12-17.04-27.48-19.89,2.2-15.81-1.62-33.55,2.23-49.17,3-3.07,20.27-1.48,24.37-1.42,14.52.18,29.58-.32,43.99.44,27.35.27,14.59-5.67,18.22-24.91-1.28-52.17,7.73-40.33-28.82-44.04-5.69-30,6.03-15.02,25.27-21.17,9.27-1.31-.07-18.69,5.74-28.5,5.88,1.92,16.18-2.13,20.84,2.26.42,33.46-2.96,25.79,28.48,26.68.49,7.3.16,18.08,4.04,25.24s17.54,1.13,24.37,3.62c5.92,9.09-.51,26.39,10.81,31.93,5.62,1.47,12.75-1.66,18.53-.95.36-1.58-.4-2.27,3.63-.83l.02.02Z',
    defaultFill: '#8b6034',
  },
  // Add more tiles as needed...
];

// Array of shrine data from map_ARC.svg
const shrines = [
  { id: "shrine1", d: "M4202.66,3028.23c11.21,14.23-.96,38.51-13.44,48.79-6.3,5.5-14.95,9.65-22.94,6.34-8.98-3.57-16.29-10.71-21.47-19.13-6.8-12.11-11.02-27.58-.47-38.07,15.05-14.23,44.7-13.73,58.21,1.95l.1.13Z", name: "Shrine of the Guardian" },
  { id: "shrine2", d: "M2923.24,4435.51c11.21,14.23-.96,38.51-13.44,48.79-6.3,5.5-14.95,9.65-22.94,6.34-8.98-3.57-16.29-10.71-21.47-19.13-6.8-12.11-11.02-27.58-.47-38.07,15.05-14.23,44.7-13.73,58.21,1.95l.1.13Z", name: "Shrine of the Guardian" },
  // Add more shrines as needed...
];

// Array of gate data from map_ARC.svg
const gates = [
  { id: "gate1", x: 4273, y: 3434, width: 82, height: 23.33 },
  { id: "gate2", x: 4571, y: 3613.67, width: 82, height: 23.33 },
  // Add more gates as needed...
];

const LeafletMap: React.FC<LeafletMapProps> = ({
  selectedTiles,
  tileColors,
  colorLabels,
  onTileClick,
  selectedGates = [],
  gateColors = {},
  onGateClick,
  selectedShrines = [],
  shrineColors = {},
  onShrineClick,
  width = 800,
  height = 600
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.Layer }>({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple, // Use simple coordinate system for SVG coordinates
      minZoom: -2,
      maxZoom: 4,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Set the bounds based on your SVG coordinate system
    // You'll need to adjust these based on your actual SVG dimensions
    const bounds = L.latLngBounds([0, 0], [7000, 7000]);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    // Add tile layers (territories)
    tilePaths.forEach((tile) => {
      const color = tileColors[tile.id] || tile.defaultFill;
      const isSelected = selectedTiles.includes(tile.id);
      
      // Convert SVG path to Leaflet polygon
      // This is a simplified conversion - you might need a more sophisticated parser
      const coordinates = parseSVGPath(tile.d);
      
      if (coordinates.length > 0) {
        const polygon = L.polygon(coordinates, {
          fillColor: color,
          fillOpacity: 0.7,
          color: isSelected ? '#333' : '#000',
          weight: isSelected ? 3 : 1
        });

        polygon.on('click', () => {
          onTileClick(tile.id);
        });

        // Add label if needed
        const label = getTileLabel(tile.id);
        if (label) {
          const center = polygon.getBounds().getCenter();
          L.marker(center, {
            icon: L.divIcon({
              className: 'tile-label',
              html: `<div style="color: white; font-weight: bold; text-align: center;">${label}</div>`,
              iconSize: [60, 20]
            })
          }).addTo(map);
        }

        polygon.addTo(map);
        layersRef.current[`tile-${tile.id}`] = polygon;
      }
    });

    // Add gates
    gates.forEach((gate) => {
      const color = gateColors[gate.id] || '#ff6b6b';
      const isSelected = selectedGates.includes(gate.id);

      // Convert SVG coordinates to Leaflet coordinates
      const latLng = svgToLeafletCoords([gate.x, gate.y]);
      
      const rectangle = L.rectangle(
        [latLng, [latLng[0] + gate.height, latLng[1] + gate.width]], 
        {
          fillColor: color,
          fillOpacity: 0.8,
          color: isSelected ? '#333' : '#000',
          weight: isSelected ? 3 : 1
        }
      );

      rectangle.on('click', () => {
        if (onGateClick) onGateClick(gate.id);
      });

      rectangle.addTo(map);
      layersRef.current[`gate-${gate.id}`] = rectangle;
    });

    // Add shrines
    shrines.forEach((shrine) => {
      const color = shrineColors[shrine.id] || '#9c27b0';
      const isSelected = selectedShrines.includes(shrine.id);
      
      const coordinates = parseSVGPath(shrine.d);
      
      if (coordinates.length > 0) {
        const polygon = L.polygon(coordinates, {
          fillColor: color,
          fillOpacity: 0.8,
          color: isSelected ? '#333' : '#000',
          weight: isSelected ? 3 : 1
        });

        polygon.on('click', () => {
          if (onShrineClick) onShrineClick(shrine.id);
        });

        polygon.addTo(map);
        layersRef.current[`shrine-${shrine.id}`] = polygon;
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update layers when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update tile colors and selection
    tilePaths.forEach((tile) => {
      const layer = layersRef.current[`tile-${tile.id}`] as L.Polygon;
      if (layer) {
        const color = tileColors[tile.id] || tile.defaultFill;
        const isSelected = selectedTiles.includes(tile.id);
        
        layer.setStyle({
          fillColor: color,
          color: isSelected ? '#333' : '#000',
          weight: isSelected ? 3 : 1
        });
      }
    });

    // Update gate colors and selection
    gates.forEach((gate) => {
      const layer = layersRef.current[`gate-${gate.id}`] as L.Rectangle;
      if (layer) {
        const color = gateColors[gate.id] || '#ff6b6b';
        const isSelected = selectedGates.includes(gate.id);
        
        layer.setStyle({
          fillColor: color,
          color: isSelected ? '#333' : '#000',
          weight: isSelected ? 3 : 1
        });
      }
    });

    // Update shrine colors and selection
    shrines.forEach((shrine) => {
      const layer = layersRef.current[`shrine-${shrine.id}`] as L.Polygon;
      if (layer) {
        const color = shrineColors[shrine.id] || '#9c27b0';
        const isSelected = selectedShrines.includes(shrine.id);
        
        layer.setStyle({
          fillColor: color,
          color: isSelected ? '#333' : '#000',
          weight: isSelected ? 3 : 1
        });
      }
    });
  }, [selectedTiles, tileColors, selectedGates, gateColors, selectedShrines, shrineColors]);

  const getTileLabel = (id: number) => {
    const tileColor = tileColors[id];
    if (tileColor && colorLabels[tileColor] && colorLabels[tileColor].trim() !== '') {
      return colorLabels[tileColor];
    }
    return null;
  };

  // Helper function to convert SVG coordinates to Leaflet coordinates
  const svgToLeafletCoords = (svgCoords: [number, number]): [number, number] => {
    // Flip Y coordinate since SVG has origin at top-left, Leaflet at bottom-left
    return [7000 - svgCoords[1], svgCoords[0]];
  };

  // Simplified SVG path parser - this is basic and might need enhancement
  const parseSVGPath = (pathData: string): [number, number][] => {
    const coordinates: [number, number][] = [];
    
    // This is a very basic parser - you might want to use a proper SVG path parser library
    // For now, let's extract just the M (moveTo) coordinates as a starting point
    const moveToRegex = /M([0-9.,-]+)/g;
    let match;
    
    while ((match = moveToRegex.exec(pathData)) !== null) {
      const coords = match[1].split(',');
      if (coords.length >= 2) {
        const x = parseFloat(coords[0]);
        const y = parseFloat(coords[1]);
        coordinates.push(svgToLeafletCoords([x, y]));
      }
    }
    
    // For a proper implementation, you'd parse the entire path
    // For now, we'll create a simple rectangle around the starting point
    if (coordinates.length > 0) {
      const [lat, lng] = coordinates[0];
      return [
        [lat, lng],
        [lat + 50, lng],
        [lat + 50, lng + 50],
        [lat, lng + 50]
      ];
    }
    
    return [];
  };

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          border: '1px solid #ccc'
        }} 
      />
      <style>{`
        .tile-label {
          background: none !important;
          border: none !important;
        }
        .leaflet-container {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default LeafletMap;
