import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { fetchHealth } from '../config/api';

const TAUPE_BG    = 'rgba(36, 32, 28, 0.92)';
const SAND_GOLD   = '#c29c6d';
const SAND_LIGHT  = '#dfc8a5';
const LINEN_WHITE = '#f5eee6';
const MUTED_TEAL  = '#4d6f75';

const navLinks = [
  { label: 'Capabilities', href: '/#features' },
  { label: 'Architecture', href: '/#how-it-works' },
  { label: 'Video Studio', href: '/studio/video', badge: 'Studio', isVideo: true },
  { label: 'Support',      href: '/support', isSpecial: true },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [status,   setStatus]     = useState('checking');
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    fetchHealth().then(h => setStatus(h.status));
    const id = setInterval(() => fetchHealth().then(h => setStatus(h.status)), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (pathname === '/') {
        const howEl  = document.getElementById('how-it-works');
        const featEl = document.getElementById('features');
        const sp = window.scrollY + 140;
        if (howEl && sp >= howEl.offsetTop)        setActiveSection('how-it-works');
        else if (featEl && sp >= featEl.offsetTop) setActiveSection('features');
        else                                        setActiveSection('');
      } else { setActiveSection(''); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      e.preventDefault();
      if (pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
      } else {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 32px', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(36, 32, 28, 0.96)' : TAUPE_BG,
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderBottom: '1px solid rgba(194, 156, 109, 0.22)',
      boxShadow: scrolled ? '0 10px 30px rgba(15, 12, 10, 0.5)' : 'none',
      transition: 'all 0.35s ease',
    }}>

      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid rgba(194, 156, 109, 0.45)',
          background: 'linear-gradient(135deg, rgba(194, 156, 109, 0.25), rgba(77, 111, 117, 0.2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(194, 156, 109, 0.25)',
        }}>
          <img src="/favicon.png" alt="CleanMark AI"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 17,
            color: LINEN_WHITE, letterSpacing: '-0.02em',
          }}>
            CleanMark{' '}
            <span style={{ color: SAND_GOLD }}>AI</span>
          </span>
          
        </div>
      </Link>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {navLinks.map(link => {
          const isStudio  = link.href.startsWith('/studio');
          const isSupport = link.href.startsWith('/support');
          const isHash    = link.href.startsWith('/#');
          const tid       = isHash ? link.href.replace('/#', '') : '';
          let isActive = false;
          if (isStudio || isSupport) isActive = pathname === link.href;
          else if (pathname === '/' && isHash) isActive = activeSection === tid;

          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => {
                if (isStudio) window.dispatchEvent(new CustomEvent('resetVideoStudio'));
                handleNavClick(e, link.href);
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.02em',
                textDecoration: 'none',
                color: link.isVideo   ? (isActive ? SAND_LIGHT : SAND_GOLD)
                     : isActive        ? LINEN_WHITE
                     :                  'rgba(245, 238, 230, 0.7)',
                background: link.isVideo   ? 'rgba(194, 156, 109, 0.15)'
                          : isActive       ? 'rgba(194, 156, 109, 0.12)'
                          : 'transparent',
                border: link.isVideo   ? '1px solid rgba(194, 156, 109, 0.4)'
                      : isActive       ? '1px solid rgba(194, 156, 109, 0.28)'
                      : '1px solid transparent',
                transition: 'all 0.22s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '1.5px 7px',
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #c29c6d, #dfc8a5)',
                  color: '#24201c', textTransform: 'uppercase', letterSpacing: '0.06em',
                  boxShadow: '0 2px 6px rgba(194, 156, 109, 0.3)',
                }}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right: Engine Status + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(77, 111, 117, 0.16)',
          border: '1px solid rgba(77, 111, 117, 0.38)',
          fontSize: 12, fontWeight: 600,
          fontFamily: 'Outfit, sans-serif', color: LINEN_WHITE,
          boxShadow: '0 2px 8px rgba(15, 12, 10, 0.3)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: status === 'online' ? MUTED_TEAL : status === 'checking' ? SAND_GOLD : '#d46565',
            boxShadow: `0 0 10px ${status === 'online' ? MUTED_TEAL : status === 'checking' ? SAND_GOLD : '#d46565'}`,
            flexShrink: 0,
          }} />
          <span>{status === 'online' ? 'Engine Ready' : status === 'checking' ? 'Connecting...' : 'Offline'}</span>
        </div>

        <Link
          to="/studio/video"
          className="btn-primary btn-sm"
          onClick={() => window.dispatchEvent(new CustomEvent('resetVideoStudio'))}
        >
          <Zap size={13} />
          Open Studio
        </Link>
      </div>
    </header>
  );
}
