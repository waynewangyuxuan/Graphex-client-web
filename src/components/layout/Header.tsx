import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Library', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Settings', path: '/settings' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="header-strip sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-terra-500 to-terra-600 text-white flex items-center justify-center rounded-md shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-sand-800">Graphex</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-terra-600 bg-terra-500/10 border border-terra-500/20'
                    : 'text-sand-600 hover:text-sand-800 hover:bg-sand-200/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-4">
          <button className="text-sand-400 hover:text-sand-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sand-300 to-sand-400 flex items-center justify-center text-sand-700 text-sm font-medium border border-sand-300">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
