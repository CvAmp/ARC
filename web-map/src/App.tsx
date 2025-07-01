import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapView from './MapView';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
}
