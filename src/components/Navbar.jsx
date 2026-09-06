import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Coffee, Sparkles, Film } from 'lucide-react';
import { fetchHealth } from '../config/api';

const navLinks = [
  { label: 'Features',     href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Video Studio', href: '/studio/video', badge: 'New', isVideo: true },
  { label: '☕ Support',   href: '/support', isSpecial: true },
];

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [status,  setStatus]      = useState('checking');
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
        const howItWorksEl = document.getElementById('how-it-works');
        const featuresEl = document.getElementById('features');
        const scrollPos = window.scrollY + 140;

        if (howItWorksEl && scrollPos >= howItWorksEl.offsetTop) {
          setActiveSection('how-it-works');
        } else if (featuresEl && scrollPos >= featuresEl.offsetTop) {
          setActiveSection('features');
        } else {
          setActiveSection('');
        }
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      e.preventDefault();
      if (pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(targetId);
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(7,5,15,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/favicon.png"
          alt="CleanMark AI"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            objectFit: 'cover',
            boxShadow: '0 4px 18px rgba(99,102,241,0.45)',
          }}
        />
        <div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            CleanMark AI
          </div>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {navLinks.map(link => {
          const isStudio = link.href.startsWith('/studio');
          const isSupport = link.href.startsWith('/support');
          const isHashLink = link.href.startsWith('/#');
          const targetId = isHashLink ? link.href.replace('/#', '') : '';

          let isActive = false;
          if (isStudio || isSupport) {
            isActive = pathname === link.href;
          } else if (pathname === '/' && isHashLink) {
            isActive = activeSection === targetId;
          }

          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: link.isSpecial
                  ? '#fbbf24'
                  : link.isVideo
                  ? (isActive ? '#22d3ee' : '#a5f3fc')
                  : isActive
                  ? '#ffffff'
                  : '#9ca3af',
                background: link.isSpecial
                  ? 'rgba(245, 158, 11, 0.12)'
                  : link.isVideo
                  ? 'rgba(6, 182, 212, 0.1)'
                  : isActive
                  ? 'rgba(255,255,255,0.09)'
                  : 'transparent',
                border: link.isSpecial
                  ? '1px solid rgba(245, 158, 11, 0.3)'
                  : link.isVideo
                  ? '1px solid rgba(6, 182, 212, 0.3)'
                  : isActive
                  ? '1px solid rgba(255,255,255,0.14)'
                  : '1px solid transparent',
                boxShadow: link.isSpecial
                  ? '0 2px 12px rgba(245, 158, 11, 0.2)'
                  : link.isVideo
                  ? '0 2px 12px rgba(6, 182, 212, 0.15)'
                  : isActive
                  ? '0 2px 10px rgba(0,0,0,0.3)'
                  : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: link.isVideo ? 'linear-gradient(135deg, #06b6d4, #6366f1)' : 'rgba(99, 102, 241, 0.25)',
                  border: link.isVideo ? 'none' : '1px solid rgba(99, 102, 241, 0.5)',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  boxShadow: link.isVideo ? '0 0 10px rgba(6, 182, 212, 0.5)' : 'none'
                }}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 12, fontWeight: 500,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: status === 'online' ? '#10b981' : status === 'checking' ? '#f59e0b' : '#ef4444',
            boxShadow: `0 0 8px ${status === 'online' ? '#10b981' : status === 'checking' ? '#f59e0b' : '#ef4444'}`,
          }} />
          <span style={{ color: status === 'online' ? '#a7f3d0' : '#9ca3af' }}>
            {status === 'online' ? 'AI Online' : status === 'checking' ? 'Connecting...' : 'Offline'}
          </span>
        </div>

        <Link to="/studio/video" className="btn-primary btn-sm">
          <Zap size={14} />
          Open Studio
        </Link>
      </div>
    </header>
  );
}
