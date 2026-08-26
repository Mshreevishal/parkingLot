import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Slots from './pages/Slots';
import Sessions from './pages/Sessions';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/slots"    element={<Slots />} />
          <Route path="/sessions" element={<Sessions />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
