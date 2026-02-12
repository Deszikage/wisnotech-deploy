import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/courses', label: 'Courses' },
    { to: '/blog', label: 'Blog' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass" data-testid="navbar">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="navbar-logo">
          {/* <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-amber-400 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div> */}
          <img 
  src="/BRAND LOGO.png" 
  alt="Wisnotech Logo" 
  className="w-10 h-10 object-contain rounded-lg" 
/>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            WISNOTECH
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive(l.to) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                data-testid="nav-dashboard-link"
                className="px-5 py-2 text-sm font-medium text-white bg-white/10 rounded-full hover:bg-white/15 transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                data-testid="nav-logout-btn"
                className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-white transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login-link"
                className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
              >
                Log In
              </Link>
              <Link
                to="/register"
                data-testid="nav-register-link"
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                Register Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-300"
          data-testid="mobile-menu-toggle"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-6 py-4 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm ${
                    isActive(l.to) ? 'bg-white/10 text-white' : 'text-slate-400'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {user ? (
                  <>
                    <Link
                      to={user.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-white bg-blue-600/20 rounded-lg"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="block w-full text-left px-4 py-3 text-sm text-slate-400"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-slate-300">Log In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold bg-blue-600 text-white rounded-lg text-center">Register Now</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
