import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee, Heart, Sparkles, QrCode, Copy, Check, ShieldCheck,
  Zap, ArrowRight, ExternalLink, Gift, DollarSign, Smartphone,
  CheckCircle2, CreditCard
} from 'lucide-react';

const tiers = [
  {
    id: '100',
    name: '1 Coffee',
    price: '₹100',
    icon: '☕',
    tag: 'Quick Fuel',
    desc: 'Fuel late-night AI model optimizations and bug fixes.',
    popular: false,
  },
  {
    id: '250',
    name: '1 Treat / Pizza',
    price: '₹250',
    icon: '🍕',
    tag: 'Most Popular',
    desc: 'Helps cover dependency builds, compute, and local testing.',
    popular: true,
  },
  {
    id: '500',
    name: 'Super Supporter',
    price: '₹500',
    icon: '🚀',
    tag: 'Indie Sponsor',
    desc: 'Sponsors local GPU video inpainting model research & training.',
    popular: false,
  },
];

export default function SupportPage() {
  const [selectedTier, setSelectedTier] = useState('250');

  const selectedTierObj = tiers.find((t) => t.id === selectedTier) || tiers[1];

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      paddingTop: 80,
      paddingBottom: 80,
      paddingLeft: 24,
      paddingRight: 24,
      background: '#07050f',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 650, height: 360, background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.18) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 70%)',
        filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* ─── Hero Header ─── */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px', borderRadius: 999,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15))',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            fontSize: 12.5, fontWeight: 700, color: '#fbbf24',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)',
            marginBottom: 16,
          }}>
            <Coffee size={14} color="#f59e0b" />
            <span>SUPPORT INDIE DEVELOPMENT</span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 14,
            letterSpacing: '-0.02em',
          }}>
            Buy Me a <span style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coffee ☕</span>
          </h1>

          <p style={{ fontSize: 15.5, color: '#9ca3af', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
            <strong>CleanMark AI</strong> is built with ❤️ as a 100% free, private, local AI tool without ads or forced subscriptions. If this app saved your time or workflow, consider buying me a coffee!
          </p>
        </div>

        {/* ─── Main Grid: Tiers & Real QR Code ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 44 }}>
          
          {/* Left Column: Contribution Amount Tiers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>
              Select Contribution Amount
            </div>

            {tiers.map((t) => {
              const isSelected = selectedTier === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  style={{
                    borderRadius: 16,
                    padding: '20px 22px',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(139, 92, 246, 0.22))'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#818cf8' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected ? '0 8px 30px rgba(99, 102, 241, 0.35)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 30 }}>{t.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.name}</span>
                        {t.tag && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            padding: '2px 7px', borderRadius: 6,
                            background: t.popular ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'rgba(255,255,255,0.08)',
                            color: '#fff',
                          }}>
                            {t.tag}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 3 }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: isSelected ? '#a5b4fc' : '#fff', fontFamily: 'Outfit, sans-serif' }}>
                      {t.price}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* UPI Apps Badge Pill */}
            <div style={{
              marginTop: 6,
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
                <Smartphone size={16} color="#818cf8" />
                <span>Accepted UPI Apps:</span>
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 700, color: '#a5b4fc' }}>
                <span style={{ background: 'rgba(99,102,241,0.15)', padding: '3px 8px', borderRadius: 6 }}>GPay</span>
                <span style={{ background: 'rgba(99,102,241,0.15)', padding: '3px 8px', borderRadius: 6 }}>PhonePe</span>
                <span style={{ background: 'rgba(99,102,241,0.15)', padding: '3px 8px', borderRadius: 6 }}>Paytm</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real User QR Code Card */}
          <div style={{
            background: 'rgba(15, 12, 32, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '28px',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              <QrCode size={18} color="#818cf8" />
              <span>Scan QR to Send {selectedTierObj.price}</span>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>
              Open any UPI app on your phone &amp; scan the code below
            </p>

            {/* QR Code Container with User's Real QR Image */}
            <div style={{
              width: 240,
              height: 240,
              padding: 10,
              background: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 0 3px rgba(99,102,241,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <img
                src="./qr.png"
                alt="UPI Payment QR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
            </div>

            {/* Selected Amount Confirmation Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: 12,
              fontWeight: 700,
            }}>
              <CheckCircle2 size={13} />
              <span>Selected Amount: {selectedTierObj.price} ({selectedTierObj.name})</span>
            </div>
          </div>
        </div>

        {/* ─── Where Contribution Goes ─── */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 20,
          padding: '28px',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14, textAlign: 'center' }}>
            Where does your support go?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { title: '100% Free & Open', desc: 'No paywalls, subscriptions, or watermarks placed on your exported results.' },
              { title: 'Local AI Research', desc: 'Sponsors optimization of PyTorch / ONNX models for faster CPU & GPU inference.' },
              { title: 'Video Inpainting', desc: 'Accelerates development of our next temporal frame-consistent video remover.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>
                  ✨ {f.title}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Studio CTA */}
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <Link to="/studio/image" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', fontSize: 13.5, fontWeight: 700 }}>
            <span>Back to Image Studio</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
