import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Video, ShieldCheck, Cpu,
  Download, ArrowRight, CheckCircle2,
  Layers, Upload, Sliders, Zap, Play, Volume2, Shield, Eye
} from 'lucide-react';

/* 05 Dusk Sand Official 5-Color System */
const DS = {
  taupeDeep:  '#24201c', /* Deep background base */
  taupe:      '#2c2825', /* Primary dark surface & contrast base */
  taupeCard:  '#322d29', /* Card surface */
  sandGold:   '#c29c6d', /* Accent rules, badges, and primary buttons */
  sandLight:  '#dfc8a5', /* Dune light highlight */
  sandTan:    '#af926e', /* Secondary architectural tones */
  linenWhite: '#f5eee6', /* Crisp text and headers */
  linenSoft:  '#ded6cb', /* Soft readable secondary text */
  linenMuted: '#a89f93', /* Tertiary captions */
  mutedTeal:  '#4d6f75', /* Signature architectural arch accent */
  tealLight:  '#6b9097', /* Teal highlight */
  border:     'rgba(194, 156, 109, 0.28)',
};

/* --------------------------------------------------------------------------
   Travertine Pedestal Feature Card
   -------------------------------------------------------------------------- */
function FeatureCard({ index, icon: Icon, title, desc, tag, isTeal }) {
  const [hov, setHov] = useState(false);
  const accent = isTeal ? DS.mutedTeal : DS.sandGold;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="stone-pedestal"
      style={{
        position: 'relative',
        borderRadius: 22,
        padding: '36px 30px',
        background: hov
          ? 'linear-gradient(165deg, rgba(58, 52, 47, 0.95) 0%, rgba(42, 37, 33, 0.98) 100%)'
          : 'linear-gradient(165deg, rgba(50, 45, 41, 0.85) 0%, rgba(36, 32, 28, 0.95) 100%)',
        border: `1px solid ${hov ? 'rgba(194, 156, 109, 0.6)' : 'rgba(194, 156, 109, 0.28)'}`,
        boxShadow: hov
          ? '0 24px 50px -10px rgba(194, 156, 109, 0.25), 0 0 20px rgba(77, 111, 117, 0.15), inset 0 1px 0 rgba(245, 238, 230, 0.2)'
          : '0 16px 40px -10px rgba(15, 12, 10, 0.6), inset 0 1px 0 rgba(245, 238, 230, 0.12)',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s ease',
      }} />

      {/* Index & Category Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.15em',
            color: DS.sandGold,
          }}>
            {String(index).padStart(2, '0')}
          </span>
          <span style={{ width: 22, height: 1, background: 'rgba(194, 156, 109, 0.45)' }} />
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif',
            color: isTeal ? DS.tealLight : DS.sandTan,
          }}>
            {tag}
          </span>
        </div>

        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: isTeal
            ? 'linear-gradient(135deg, rgba(77, 111, 117, 0.25), rgba(77, 111, 117, 0.1))'
            : 'linear-gradient(135deg, rgba(194, 156, 109, 0.22), rgba(194, 156, 109, 0.08))',
          border: `1px solid ${isTeal ? 'rgba(77, 111, 117, 0.4)' : 'rgba(194, 156, 109, 0.35)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: hov ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}>
          <Icon size={22} color={accent} />
        </div>
      </div>

      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontWeight: 700,
        fontSize: 24,
        color: DS.linenWhite,
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        marginBottom: 12,
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: 14.5,
        color: DS.linenSoft,
        lineHeight: 1.7,
        fontFamily: 'DM Sans, sans-serif',
        margin: 0,
      }}>
        {desc}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Step Card (Architectural Sequence)
   -------------------------------------------------------------------------- */
function StepCard({ num, icon: Icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        borderRadius: 22,
        padding: '34px 28px',
        background: hov
          ? 'linear-gradient(165deg, rgba(58, 52, 47, 0.95) 0%, rgba(40, 35, 31, 0.98) 100%)'
          : 'linear-gradient(165deg, rgba(50, 45, 41, 0.85) 0%, rgba(36, 32, 28, 0.95) 100%)',
        border: `1px solid ${hov ? 'rgba(194, 156, 109, 0.55)' : 'rgba(194, 156, 109, 0.28)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: hov
          ? '0 20px 45px -10px rgba(194, 156, 109, 0.22), inset 0 1px 0 rgba(245, 238, 230, 0.16)'
          : '0 12px 32px -10px rgba(15, 12, 10, 0.5), inset 0 1px 0 rgba(245, 238, 230, 0.1)',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(194, 156, 109, 0.22), rgba(77, 111, 117, 0.15))',
          border: '1px solid rgba(194, 156, 109, 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: hov ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}>
          <Icon size={20} color={DS.sandGold} />
        </div>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 36,
          fontWeight: 700,
          color: DS.sandGold,
          lineHeight: 1,
        }}>
          {String(num).padStart(2, '0')}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
        fontSize: 17,
        color: DS.linenWhite,
        marginBottom: 8,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 13.5,
        color: DS.linenSoft,
        lineHeight: 1.65,
        fontFamily: 'DM Sans, sans-serif',
        margin: 0,
      }}>
        {desc}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Main Landing Page
   -------------------------------------------------------------------------- */
export default function LandingPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      index: 1,
      icon: Cpu,
      title: 'Zero-Blur Math Engine',
      desc: 'Closed-form mathematical unblending extracts the authentic uncompressed RGB signal with zero neural hallucination or pixel smearing.',
      tag: 'Precision',
      isTeal: false,
    },
    {
      index: 2,
      icon: ShieldCheck,
      title: '100% In-Browser Privacy',
      desc: 'Decoding, matrix computation, and MP4 muxing execute directly on your local hardware via WebAssembly. Zero network uploads.',
      tag: 'Air-Gapped',
      isTeal: true,
    },
    {
      index: 3,
      icon: Zap,
      title: 'Hardware Accelerated',
      desc: 'Direct WebCodecs GPU pipelines offload video rendering to your device silicon for buttery high-resolution playback and export.',
      tag: 'Silicon',
      isTeal: false,
    },
    {
      index: 4,
      icon: Volume2,
      title: 'Lossless Audio Passthrough',
      desc: 'Full AAC audio demuxing and remuxing preserving original pitch, sync, multi-channel sound, and pristine bitrate.',
      tag: 'Acoustics',
      isTeal: true,
    },
    {
      index: 5,
      icon: Layers,
      title: 'Veo & Gemini Presets',
      desc: 'Calibrated corner alpha matrices optimized specifically for transparent video watermarks in all standard aspect ratios.',
      tag: 'Presets',
      isTeal: false,
    },
    {
      index: 6,
      icon: Sliders,
      title: 'Live Interactive Canvas',
      desc: 'Drag the removal bounding box, calibrate strength, and inspect cleaned video frames side-by-side in real time.',
      tag: 'Inspector',
      isTeal: true,
    },
  ];

  const steps = [
    { icon: Upload,   title: 'Drop Video File',      desc: 'Select any MP4, MOV or WebM. Instant client-side ingestion with zero server upload.' },
    { icon: Sliders,  title: 'Calibrate Preset',     desc: 'Choose 9:16 or 16:9 corner position and fine-tune removal strength with live preview.' },
    { icon: Sparkles, title: 'Execute Math Engine',   desc: 'GPU-accelerated alpha inversion processes frames at native speed with full audio.' },
    { icon: Download, title: 'Download Clean MP4',   desc: 'Clean native H.264 MP4 downloads directly to your device ready to share.' },
  ];

  return (
    <div style={{
      backgroundColor: DS.taupeDeep,
      minHeight: '100vh',
      color: DS.linenWhite,
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* --------------------------------------------------------------------
          ARCHITECTURAL HERO SECTION
          Clean transition from Warm Dark Taupe into Warm Dune Sand & Muted Teal
          (No background photos!)
          -------------------------------------------------------------------- */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #24201c 0%, #2c2825 45%, #24201c 100%)',
      }}>

        {/* Ambient Warm Dune Sand & Rich Muted Slate Teal / Green Architectural Glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Top-left Warm Dune Sand golden ambient wash */}
          <div style={{
            position: 'absolute', top: -100, left: '10%',
            width: 700, height: 500,
            background: 'radial-gradient(ellipse, rgba(194, 156, 109, 0.2) 0%, rgba(194, 156, 109, 0.05) 50%, transparent 70%)',
            filter: 'blur(70px)',
          }} />

          {/* Right Muted Slate Teal / Architectural Green Archway Glow (Matching the Reference Archway) */}
          <div style={{
            position: 'absolute', top: 20, right: '6%',
            width: 620, height: 620,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(77, 111, 117, 0.36) 0%, rgba(55, 88, 94, 0.2) 45%, rgba(36, 60, 65, 0.06) 65%, transparent 80%)',
            filter: 'blur(50px)',
          }} />

          {/* Lower left ambient green touch */}
          <div style={{
            position: 'absolute', bottom: -60, left: '6%',
            width: 450, height: 450,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(77, 111, 117, 0.24) 0%, transparent 65%)',
            filter: 'blur(55px)',
          }} />
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(46px, 7.5vw, 92px)',
          fontWeight: 700,
          lineHeight: 1.06,
          textAlign: 'center',
          color: DS.linenWhite,
          maxWidth: 920,
          marginBottom: 16,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.75s 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
          letterSpacing: '-0.02em',
        }}>
          Mathematical Precision.<br />
          <span style={{
            fontStyle: 'italic',
            color: DS.sandGold,
          }}>
            Zero Blur. Absolute Fidelity.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(15px, 2.2vw, 19px)',
          color: DS.linenSoft,
          textAlign: 'center',
          maxWidth: 680,
          lineHeight: 1.75,
          marginBottom: 44,
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 400,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.75s 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          Closed-form mathematical unblending removes semi-transparent watermarks from Veo &amp; Gemini AI video — 
          running 100% locally in your browser with full audio preservation.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.75s 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: 48,
        }}>
          <Link
            to="/studio/video"
            className="btn-primary"
            style={{ fontSize: 14.5, padding: '14px 36px', borderRadius: 14 }}
            onClick={() => window.dispatchEvent(new CustomEvent('resetVideoStudio'))}
          >
            <Zap size={16} />
            Open Studio — Free
          </Link>
          <a
            href="#features"
            className="btn-secondary"
            style={{ fontSize: 14.5, padding: '14px 30px', borderRadius: 14 }}
          >
            <Play size={15} color={DS.sandGold} />
            Explore Architecture
          </a>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center',
          opacity: visible ? 1 : 0, transition: 'opacity 0.8s 0.4s ease',
        }}>
          {[
            'Zero Server Uploads',
            'Full Audio Preserved',
            'Pure Closed-Form Math',
            'Native H.264 MP4'
          ].map(t => (
            <span key={t} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13.5, color: DS.linenSoft, fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
            }}>
              <CheckCircle2 size={16} color={DS.mutedTeal} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="ds-divider" style={{ maxWidth: 1000, margin: '0 auto' }} />

      {/* --------------------------------------------------------------------
          CORE CAPABILITIES (FEATURES) SECTION
          -------------------------------------------------------------------- */}
      <section id="features" style={{ padding: '120px 28px', position: 'relative' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 18px', borderRadius: 999,
              background: 'rgba(50, 45, 41, 0.8)',
              border: '1px solid rgba(194, 156, 109, 0.35)',
              marginBottom: 18,
            }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                color: DS.sandGold,
              }}>
                02
              </span>
              <span style={{ width: 16, height: 1, background: 'rgba(194, 156, 109, 0.5)' }} />
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: DS.linenWhite,
              }}>
                Core Capabilities
              </span>
            </div>

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 700,
              fontSize: 'clamp(38px, 5.5vw, 62px)',
              color: DS.linenWhite,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Everything You Need
            </h2>

            <p style={{
              fontSize: 16,
              color: DS.linenSoft,
              maxWidth: 580,
              margin: '0 auto',
              lineHeight: 1.7,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              A complete in-browser mathematical pipeline built for precision, speed, and absolute privacy.
            </p>
          </div>

          {/* Grid of Pedestals */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24,
          }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="ds-divider" style={{ maxWidth: 1000, margin: '0 auto' }} />

      {/* --------------------------------------------------------------------
          ARCHITECTURAL PIPELINE (HOW IT WORKS) SECTION
          -------------------------------------------------------------------- */}
      <section id="how-it-works" style={{ padding: '120px 28px', position: 'relative' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 18px', borderRadius: 999,
              background: 'rgba(77, 111, 117, 0.18)',
              border: '1px solid rgba(77, 111, 117, 0.35)',
              marginBottom: 18,
            }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                color: DS.tealLight,
              }}>
                03
              </span>
              <span style={{ width: 16, height: 1, background: 'rgba(77, 111, 117, 0.4)' }} />
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: DS.tealLight,
              }}>
                Four Steps
              </span>
            </div>

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 700,
              fontSize: 'clamp(38px, 5.5vw, 62px)',
              color: DS.linenWhite,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              How It Works
            </h2>

            <p style={{
              fontSize: 16,
              color: DS.linenSoft,
              maxWidth: 540,
              margin: '0 auto',
              lineHeight: 1.7,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              From upload to clean MP4 in seconds — entirely on your local device.
            </p>
          </div>

          {/* 4 Step Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 22,
          }}>
            {steps.map((s, i) => (
              <StepCard key={s.title} num={i + 1} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="ds-divider" style={{ maxWidth: 1000, margin: '0 auto' }} />

      {/* --------------------------------------------------------------------
          ARCHITECTURAL CTA BANNER
          -------------------------------------------------------------------- */}
      <section style={{ padding: '120px 28px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          maxWidth: 840,
          margin: '0 auto',
          borderRadius: 32,
          padding: '64px 40px',
          background: 'linear-gradient(165deg, #322d28 0%, #24201c 100%)',
          border: '1px solid rgba(194, 156, 109, 0.35)',
          boxShadow: '0 32px 80px -15px rgba(15, 12, 10, 0.7), inset 0 1px 0 rgba(245, 238, 230, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          color: DS.linenWhite,
        }}>
          {/* Subtle Archway glow inside CTA in Muted Teal */}
          <div style={{
            position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
            width: 400, height: 300,
            background: 'radial-gradient(ellipse, rgba(194, 156, 109, 0.22) 0%, rgba(77, 111, 117, 0.15) 50%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: DS.sandGold, marginBottom: 16,
          }}>
            Ready For Video Cleaning
          </div>

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 700,
            fontSize: 'clamp(40px, 6vw, 68px)',
            color: DS.linenWhite,
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            marginBottom: 20,
          }}>
            Ready to Clean Your Video?
          </h2>

          <p style={{
            fontSize: 16,
            color: DS.linenSoft,
            lineHeight: 1.75,
            maxWidth: 560,
            margin: '0 auto 40px',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Open the studio — no account, no upload, no cost. Works entirely in your browser.
          </p>

          <Link
            to="/studio/video"
            className="btn-primary"
            style={{ fontSize: 15, padding: '16px 42px', borderRadius: 14 }}
            onClick={() => window.dispatchEvent(new CustomEvent('resetVideoStudio'))}
          >
            <Zap size={17} />
            Start Cleaning — Free
            <ArrowRight size={17} />
          </Link>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginTop: 24, fontSize: 12.5, color: DS.linenMuted, fontFamily: 'DM Sans, sans-serif',
          }}>
            <Shield size={14} color={DS.mutedTeal} />
            <span>Your video never leaves your device. Zero uploads. Zero tracking.</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          ARCHITECTURAL FOOTER
          -------------------------------------------------------------------- */}
      <footer style={{
        borderTop: '1px solid rgba(194, 156, 109, 0.2)',
        background: '#1e1a17',
        padding: '44px 32px',
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: 20,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid rgba(194, 156, 109, 0.45)',
              overflow: 'hidden',
            }}>
              <img src="/favicon.png" alt="CleanMark AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: DS.linenWhite }}>
                CleanMark <span style={{ color: DS.sandGold }}>AI</span>
              </span>
              <span style={{ display: 'block', fontSize: 10, color: DS.linenMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                05 Dusk Sand · Modern Architectural Minimal
              </span>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/support" style={{ fontSize: 13, color: DS.linenSoft, textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
              Support
            </Link>
            <Link to="/studio/video" style={{ fontSize: 13, color: DS.sandGold, textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Video Studio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
