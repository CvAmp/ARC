import { useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import MapSelector from './MapSelector';
import { objectives, zones } from './data/sample';

export default function MapView() {
  const [params, setParams] = useSearchParams();
  const selectedObjs = new Set(params.get('objs')?.split(',').filter(Boolean));
  const selectedZones = new Set(params.get('zones')?.split(',').filter(Boolean));

  const toggle = (set: Set<string>, id: string) => {
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
  };

  const saveImage = async () => {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    const canvas = await html2canvas(mapEl);
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'map.png';
    link.click();
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?objs=${Array.from(selectedObjs).join(',')}&zones=${Array.from(selectedZones).join(',')}`;
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '400px' }}>
        {/* Show interactive SVG map */}
        <MapSelector />
      </div>
      <div className="legend">
        Selected Zones: {selectedZones.size} | Selected Objectives: {selectedObjs.size}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={saveImage}>Save Image</button>
        <button onClick={copyLink} style={{ marginLeft: '10px' }}>Share Link</button>
      </div>
    </div>
  );
}
