import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col paper-bg">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-sand-200 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-6 text-center text-sand-400 text-sm">
        <p>Graphex — Transform documents into knowledge</p>
      </div>
    </footer>
  );
}
