import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EntityViewer from './pages/EntityViewer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/entity/:id" element={<EntityViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
