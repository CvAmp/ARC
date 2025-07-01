import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import { objectives, zones } from './data/sample';
import { useSearchParams } from 'react-router-dom';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

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

  const handleObjClick = (id: string) => {
    toggle(selectedObjs, id);
    setParams({
      objs: Array.from(selectedObjs).join(','),
      zones: Array.from(selectedZones).join(','),
    });
  };

  const handleZoneClick = (id: string) => {
    toggle(selectedZones, id);
    setParams({
      objs: Array.from(selectedObjs).join(','),
      zones: Array.from(selectedZones).join(','),
    });
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
      <div id="map">
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Territories">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Resources">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name="Objectives">
              <LayerGroup>
                {objectives.map((o) => (
                  <Marker key={o.id} position={o.position} eventHandlers={{ click: () => handleObjClick(o.id) }}>
                    <Popup>{o.name}</Popup>
                  </Marker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Zones">
              <LayerGroup>
                {zones.map((z) => (
                  <Polygon key={z.id} pathOptions={{ color: selectedZones.has(z.id) ? 'red' : 'blue' }}
                    positions={z.polygon}
                    eventHandlers={{ click: () => handleZoneClick(z.id) }}>
                    <Popup>{z.name}</Popup>
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
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
