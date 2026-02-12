import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-amber-400 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'Outfit' }}>WISNOTECH</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering Nigeria's digital future with professional skills, creative solutions, and world-class training programs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Outfit' }}>Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/courses', label: 'Courses' },
                { to: '/blog', label: 'Blog' },
                { to: '/register', label: 'Register' },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="block text-sm text-slate-400 hover:text-blue-400 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Outfit' }}>Our Courses</h4>
            <div className="space-y-2.5">
              {['Web Development', 'App Development', 'UI/UX & Graphics', 'Digital Marketing', 'Video Editing', 'Content Creation'].map((c) => (
                <Link key={c} to="/courses" className="block text-sm text-slate-400 hover:text-blue-400 transition-colors">{c}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Outfit' }}>Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">No. 7 Forest Guard Street, Uromi, Edo State, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="mailto:contact@wisnotech.com" className="text-sm text-slate-400 hover:text-blue-400">contact@wisnotech.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="tel:+2349153541297" className="text-sm text-slate-400 hover:text-blue-400">+234 915 354 1297</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} WISNOTECH. All rights reserved.</p>
          <a
            href="https://wa.me/2349153541297"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-medium hover:bg-green-600/30 transition-all"
            data-testid="footer-whatsapp"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
