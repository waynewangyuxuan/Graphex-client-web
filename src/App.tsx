import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import Dashboard from './pages/Dashboard';
import EntityViewer from './pages/EntityViewer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/entity/:id" element={<EntityViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
