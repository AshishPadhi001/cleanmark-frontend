import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Video, ShieldCheck, Cpu,
  Download, ArrowRight, CheckCircle2, ChevronDown, Award,
  Layers, Upload, Paintbrush, Sliders, Zap, Play
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   3D Pop Feature Card with Spring Scale & Ambient Glow
   ═══════════════════════════════════════════════════════════════ */
function FeatureCard({ icon: Icon, title, desc, tag, gradient }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 24,
        padding: '36px 30px',
        background: hovered
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: hovered ? 'rgba(99, 102, 241, 0.55)' : 'rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(16px)',
        transform: hovered
          ? 'translateY(-12px) scale(1.03) perspective(1000px)'
          : 'translateY(0px) scale(1) perspective(1000px)',
        boxShadow: hovered
          ? '0 28px 60px -10px rgba(99, 102, 241, 0.4), 0 0 30px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(129, 140, 248, 0.4)'
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Top Glow Beam on Hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: gradient || 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          boxShadow: '0 0 16px #818cf8',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: gradient || 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            transform: hovered ? 'scale(1.15) rotate(-3deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: hovered ? '0 8px 24px rgba(99, 102, 241, 0.5)' : 'none',
          }}
        >
          <Icon size={26} color="#fff" />
        </div>
        {tag && (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#a5b4fc',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            {tag}
          </span>
        )}
      </div>

      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 12 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Interactive 3D Pop Step Card
   ═══════════════════════════════════════════════════════════════ */
function StepCard({ num, icon: Icon, title, desc }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 24,
        padding: '36px 28px',
        background: hovered
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: hovered ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        transform: hovered
          ? 'translateY(-14px) scale(1.04) perspective(1000px)'
          : 'translateY(0px) scale(1) perspective(1000px)',
        boxShadow: hovered
          ? '0 30px 70px -10px rgba(99, 102, 241, 0.45), 0 0 35px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(129, 140, 248, 0.4)'
          : '0 10px 24px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: hovered ? 'scale(1.15) rotate(-6deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: hovered ? '0 10px 28px rgba(6,182,212,0.6)' : '0 6px 18px rgba(6,182,212,0.35)',
          }}
        >
          <Icon size={22} color="#fff" />
        </div>
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 28,
            fontWeight: 900,
            color: hovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)',
            transition: 'color 0.2s ease',
          }}
        >
          {num}
        </span>
      </div>

      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 10 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13.5, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Interactive Consumer FAQ Accordion Item
   ═══════════════════════════════════════════════════════════════ */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18,
        border: '1px solid',
        background: open ? 'rgba(6, 182, 212, 0.08)' : hovered ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
        borderColor: open ? 'rgba(6, 182, 212, 0.45)' : hovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        backdropFilter: 'blur(12px)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: open
          ? '0 12px 32px rgba(6, 182, 212, 0.15), 0 0 0 1px rgba(6, 182, 212, 0.2)'
          : hovered
          ? '0 8px 24px rgba(0,0,0,0.2)'
          : 'none',
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
      >
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: open ? '#38bdf8' : '#fff', transition: 'color 0.2s' }}>
          {q}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: open ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${open ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <ChevronDown size={18} color={open ? '#38bdf8' : '#9ca3af'} />
        </div>
      </button>

      {open && (
        <div style={{
          padding: '0 24px 22px',
          fontSize: 14.5,
          color: '#cbd5e1',
          lineHeight: 1.7,
          animation: 'fade-up 0.25s ease-out',
        }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Smooth scroll to anchor if hash is present in URL
  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* ═══════════════════════════════════════════════════════════════
          Hero Section
          ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 24px 80px',
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.18) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 840, width: '100%' }}>
          
          {/* Trust Badge Bar */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 999,
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
            marginBottom: 28
          }}>
            <Sparkles size={14} color="#22d3ee" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a5f3fc' }}>
              Zero-Blur Video Cleaning • 100% In-Browser Engine
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(40px, 6.5vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}>
            Erase Video Watermarks with <br />
            <span className="gradient-text">Zero Blur &amp; 100% Quality</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: '#9ca3af',
            lineHeight: 1.65,
            maxWidth: 680,
            margin: '0 auto 40px',
          }}>
            Remove unwanted watermarks, Google Veo stars, logos, and timestamps from your videos.
            Runs <strong>100% locally in your browser</strong> using hardware GPU acceleration — no 4MB limits, no server timeouts, and complete privacy.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/studio/video" className="btn-primary btn-lg" style={{ boxShadow: '0 8px 32px rgba(6, 182, 212, 0.4)' }}>
              <Video size={20} /> Open Video Studio <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary btn-lg">
              How It Works
            </a>
          </div>

          {/* Key Metrics Highlight Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              [Award, '#818cf8', '100% Zero-Blur Precision'],
              [ShieldCheck, '#10b981', '100% Local & Private (0MB Upload)'],
              [Video, '#38bdf8', 'Any Video Length & Unlimited Size'],
            ].map(([Icon, color, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
                <Icon size={16} color={color} /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            Hero Showcase: Before / After Cards
            ═══════════════════════════════════════════════════════════════ */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 52, width: '100%', maxWidth: 1060 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'center',
          }}>
            
            {/* Card 1: Original Video Frame */}
            <div
              onMouseEnter={() => setHoveredCard('before')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid',
                borderColor: hoveredCard === 'before' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                transform: hoveredCard === 'before'
                  ? 'translateY(-14px) scale(1.03) perspective(1000px)'
                  : 'translateY(0px) scale(1) perspective(1000px)',
                boxShadow: hoveredCard === 'before'
                  ? '0 32px 85px -10px rgba(239, 68, 68, 0.45), 0 0 35px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.5)'
                  : '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', top: 16, left: 16, zIndex: 10,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff', fontSize: 12, fontWeight: 700, backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Video size={13} color="#f87171" /> ORIGINAL VIDEO (WITH WATERMARK)
              </div>

              <img
                src="./demo/before.jpeg"
                alt="Original Video with Watermark"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>

            {/* Card 2: Cleaned Video Frame */}
            <div
              onMouseEnter={() => setHoveredCard('after')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                background: 'rgba(6, 182, 212, 0.04)',
                border: '1px solid',
                borderColor: hoveredCard === 'after' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(6, 182, 212, 0.35)',
                backdropFilter: 'blur(16px)',
                transform: hoveredCard === 'after'
                  ? 'translateY(-14px) scale(1.03) perspective(1000px)'
                  : 'translateY(0px) scale(1) perspective(1000px)',
                boxShadow: hoveredCard === 'after'
                  ? '0 32px 85px -10px rgba(6, 182, 212, 0.55), 0 0 45px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(56, 189, 248, 0.5)'
                  : '0 20px 50px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.2)',
                transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                padding: '6px 16px', borderRadius: 999,
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(99, 102, 241, 0.95))',
                color: '#fff', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: hoveredCard === 'after' ? '0 6px 24px rgba(6, 182, 212, 0.8)' : '0 4px 16px rgba(6, 182, 212, 0.5)',
              }}>
                <Sparkles size={14} color="#fff" /> Zero-Blur Cleaned Video
              </div>

              <img
                src="./demo/after.jpeg"
                alt="Cleaned Video with Zero Blur"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          How It Works (Three Steps for Videos)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 24px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 14 }}>
              EFFORTLESS VIDEO WORKFLOW
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Three Steps to a Clean Video
            </h2>
            <p style={{ fontSize: 15, color: '#9ca3af', maxWidth: 540, margin: '0 auto' }}>
              No heavy software or cloud uploads. Clean your videos locally at hardware speed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            <StepCard
              num="01"
              icon={Upload}
              title="Upload Any Video"
              desc="Drag and drop your MP4, MOV, or WebM video of any size or duration. Loads 100% locally in your browser with zero 4MB limits."
            />
            <StepCard
              num="02"
              icon={Sliders}
              title="Select Watermark Area"
              desc="Choose a smart preset (Bottom-Right, Bottom-Left, etc.) or drag the box over the watermark with live real-time preview."
            />
            <StepCard
              num="03"
              icon={Sparkles}
              title="Clean & Export MP4"
              desc="The in-browser engine removes watermarks with zero blur at up to 120 FPS using your GPU and exports a pristine MP4 file directly to your disk."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Core Features
          ═══════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 14 }}>
              NEXT-GEN INPAINTING TECH
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Built for Video Speed &amp; Precision
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            <FeatureCard
              icon={Sparkles}
              title="Zero-Blur Video Inpainting"
              desc="CleanMark seamlessly restores the original video background underneath watermarks, preserving pristine quality with zero blur, smearing, or loss of detail."
              tag="Zero Blur"
              gradient="linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))"
            />
            <FeatureCard
              icon={Video}
              title="Unlimited Video Size & Length"
              desc="No 4MB payload walls and no server timeouts. Handles 50MB, 500MB, or 2GB videos seamlessly because all computation runs on your device."
              tag="Unlimited Size"
              gradient="linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.3))"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="100% Private & In-Browser"
              desc="Your videos are never uploaded to any cloud server. Everything stays safely on your machine, saving you bandwidth and protecting your privacy."
              tag="100% Private"
              gradient="linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.3))"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Frequently Asked Questions
          ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: '100px 24px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 14 }}>
              COMMON QUESTIONS
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FAQItem
              q="Does CleanMark reduce video resolution or quality?"
              a="No! CleanMark preserves your exact original video resolution (720p, 1080p, 4K) and frame rate (30fps, 60fps) with zero blur and pristine pixel-perfect clarity."
            />
            <FAQItem
              q="Is there any file size or video duration limit?"
              a="No! Because CleanMark processes videos 100% locally inside your browser using your computer's GPU/CPU, there is no 4MB server limit or timeout. You can process videos of any size."
            />
            <FAQItem
              q="What watermark types can CleanMark remove?"
              a="CleanMark is specifically calibrated to remove translucent AI watermarks (such as Google Veo, Gemini, Sora, and Runway) as well as logos, timestamps, and channel stamps."
            />
            <FAQItem
              q="Are my videos uploaded to any external server?"
              a="No, never. All frame decoding, watermark removal, and MP4 rendering happen entirely in your browser. Your video files never leave your computer."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Sleek Branded Footer
          ═══════════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10, 8, 22, 0.95)',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/favicon.png"
              alt="CleanMark AI"
              style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', boxShadow: '0 4px 14px rgba(6,182,212,0.4)' }}
            />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
              CleanMark AI
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', maxWidth: 460, margin: 0, lineHeight: 1.6 }}>
            Privacy-first in-browser video watermark, logo &amp; object removal studio.
          </p>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            &copy; {new Date().getFullYear()} CleanMark AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
