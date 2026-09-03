import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Image as ImageIcon, Video, ShieldCheck, Cpu,
  CheckCircle2, ArrowRight, Upload, Layers, Sliders, Zap,
  Check, HelpCircle, ChevronDown, Award, Paintbrush
} from 'lucide-react';

/* ─── Interactive 3D Spring Pop Feature Card Component ─── */
function FeatureCard({ icon: Icon, title, desc, tag, gradient, glowColor }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 24,
        padding: '36px 32px',
        background: hovered
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(99, 102, 241, 0.12) 100%)'
          : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid',
        borderColor: hovered ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        transform: hovered
          ? 'translateY(-12px) scale(1.03) perspective(1000px) rotateX(1.5deg)'
          : 'translateY(0px) scale(1) perspective(1000px) rotateX(0deg)',
        boxShadow: hovered
          ? `0 30px 70px -10px ${glowColor || 'rgba(99, 102, 241, 0.45)'}, 0 0 35px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(129, 140, 248, 0.4)`
          : '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.04)',
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

/* ─── Interactive 3D Pop Step Card ─── */
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: hovered ? 'scale(1.15) rotate(-6deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: hovered ? '0 10px 28px rgba(99,102,241,0.6)' : '0 6px 18px rgba(99,102,241,0.35)',
          }}
        >
          <Icon size={22} color="#fff" />
        </div>
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 28,
            fontWeight: 900,
            color: hovered ? '#818cf8' : 'rgba(255, 255, 255, 0.15)',
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

/* ─── Interactive Consumer FAQ Accordion Item ─── */
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
        background: open ? 'rgba(99, 102, 241, 0.07)' : hovered ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
        borderColor: open ? 'rgba(99, 102, 241, 0.45)' : hovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        backdropFilter: 'blur(12px)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: open
          ? '0 12px 32px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.2)'
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
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: open ? '#a5b4fc' : '#fff', transition: 'color 0.2s' }}>
          {q}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: open ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${open ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <ChevronDown size={18} color={open ? '#a5b4fc' : '#9ca3af'} />
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

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* ─── Hero Section ─── */}
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
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820, width: '100%' }}>
          
          {/* Trust Badge Bar with 90% Accuracy Highlight */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 28 }}>
            <Sparkles size={14} color="#818cf8" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>
              State of the Art Local AI • 90% Inpainting Precision
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
            Erase Watermarks with <br />
            <span className="gradient-text">90% AI Precision</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: '#9ca3af',
            lineHeight: 1.65,
            maxWidth: 620,
            margin: '0 auto 40px',
          }}>
            Remove watermarks, stamps, logos, and unwanted objects from up to <strong>5 images simultaneously</strong> with fast local AI inpainting.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/studio/video" className="btn-primary btn-lg" style={{ boxShadow: '0 8px 32px rgba(56, 189, 248, 0.4)' }}>
              <Video size={20} /> Open Video Studio <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary btn-lg">
              How It Works
            </a>
          </div>

          {/* Key Metrics Highlight Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              [Award, '#818cf8', '90% Removal Accuracy'],
              [ShieldCheck, '#10b981', '100% Local & Private'],
              [Layers, '#38bdf8', 'Batch Up to 5 Images'],
            ].map(([Icon, color, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
                <Icon size={16} color={color} /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Hero Showcase: Real Side-by-Side Before / After Pop Cards ─── */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 48, width: '100%', maxWidth: 1060 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'center',
          }}>
            
            {/* Card 1: Before Card with Pop Spring Hover */}
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
              }}>
                ORIGINAL (WITH WATERMARK)
              </div>

              <img
                src="./demo/before.jpeg"
                alt="Original with Watermark"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>

            {/* Card 2: After Card with Pop Spring Hover */}
            <div
              onMouseEnter={() => setHoveredCard('after')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                background: 'rgba(99, 102, 241, 0.04)',
                border: '1px solid',
                borderColor: hoveredCard === 'after' ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.35)',
                backdropFilter: 'blur(16px)',
                transform: hoveredCard === 'after'
                  ? 'translateY(-14px) scale(1.03) perspective(1000px)'
                  : 'translateY(0px) scale(1) perspective(1000px)',
                boxShadow: hoveredCard === 'after'
                  ? '0 32px 85px -10px rgba(99, 102, 241, 0.55), 0 0 45px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(129, 140, 248, 0.5)'
                  : '0 20px 50px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.2)',
                transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                padding: '6px 16px', borderRadius: 999,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95))',
                color: '#fff', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: hoveredCard === 'after' ? '0 6px 24px rgba(99, 102, 241, 0.8)' : '0 4px 16px rgba(99, 102, 241, 0.5)',
              }}>
                <Sparkles size={14} color="#fff" /> 90% Precision Cleaned
              </div>

              <img
                src="./demo/after.jpeg"
                alt="Cleaned with AI Inpainting"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ─── How It Works (Three Steps) ─── */}
      <section id="how-it-works" style={{ padding: '100px 24px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 14 }}>
              EFFORTLESS WORKFLOW
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Three Steps to a Clean Image
            </h2>
            <p style={{ fontSize: 15, color: '#9ca3af', maxWidth: 500, margin: '0 auto' }}>
              No complicated Photoshop layers. Just paint over the watermark and let the local AI do the rest.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            <StepCard
              num="01"
              icon={Upload}
              title="Upload 1 to 5 Images"
              desc="Drag and drop your photos into the batch studio. Runs 100% locally on your hardware."
            />
            <StepCard
              num="02"
              icon={Paintbrush}
              title="Paint Over Any Watermark"
              desc="Use the smooth circular brush to highlight multiple logos, timestamps, or text across all images."
            />
            <StepCard
              num="03"
              icon={Sparkles}
              title="Clean & Download"
              desc="Remove watermarks with 90% accuracy and download individually or as a single ZIP package."
            />
          </div>
        </div>
      </section>

      {/* ─── Core Features ─── */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 14 }}>
              AI INPAINTING TECH
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Built for Speed &amp; Precision
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            <FeatureCard
              icon={Sparkles}
              title="90% Inpainting Accuracy"
              desc="Fast Fourier Convolutions synthesize surrounding textures, fabrics, and backgrounds seamlessly."
              tag="90% Precision"
              gradient="linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))"
            />
            <FeatureCard
              icon={Layers}
              title="Batch Queue (1 to 5 Images)"
              desc="Clean single images one at a time or process your entire queue simultaneously in parallel."
              tag="Fast Bulk"
              gradient="linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.3))"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="100% Private & Local"
              desc="Zero cloud uploads. All neural network weights run directly on your own device."
              tag="Zero Cloud"
              gradient="linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.3))"
            />
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ─── */}
      <section id="faq" style={{ padding: '100px 24px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 14 }}>
              COMMON QUESTIONS
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FAQItem
              q="Does CleanMark reduce image quality or resolution?"
              a="No. CleanMark maintains 100% full original resolution and delivers 90% inpainting precision on the reconstructed area."
            />
            <FAQItem
              q="Can I remove multiple watermarks or logos from the same photo?"
              a="Yes! You can paint as many separate logos, stamps, or watermark spots as you want on each photo."
            />
            <FAQItem
              q="How does batch processing work?"
              a="You can upload up to 5 images at once. Select watermarks across them and clean them individually or all at once."
            />
            <FAQItem
              q="Are my photos uploaded to any external server?"
              a="No, never. All processing happens locally on your computer. Your session is automatically cleared upon download."
            />
          </div>
        </div>
      </section>

   
      {/* ─── Sleek Branded Footer ─── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10, 8, 22, 0.95)',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="./logo.png"
              alt="CleanMark AI"
              style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
            />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
              CleanMark AI
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', maxWidth: 460, margin: 0, lineHeight: 1.6 }}>
            Privacy-first local watermark, logo & object removal studio.
          </p>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            © {new Date().getFullYear()} CleanMark AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
