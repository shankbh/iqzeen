'use client';

import { MapPin, Phone, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="landing">
      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-logo">
          <img
            src="/logo.png"
            alt="Shaan Restaurant logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => {}}
          />
        </div>
        <h1 className="landing-name">Shaan Restaurant</h1>
        <p className="landing-tagline">✦ &nbsp; Authentic Indian Flavours &nbsp; ✦</p>
        <div style={{ fontSize: '1.3rem', letterSpacing: '6px', color: 'rgba(255,255,255,0.6)', margin: '4px 0' }}>
          · · ·
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '1px' }}>
          Bangalore's Finest Indian Cuisine
        </p>
      </div>

      {/* Info */}
      <div className="landing-info">
        <div className="info-card">
          <div className="info-row">
            <div className="info-icon">
              <MapPin size={18} />
            </div>
            <div>
              <div className="info-label">Address</div>
              <div className="info-value">123 MG Road, Indiranagar<br />Bangalore — 560 038</div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-icon">
              <Phone size={18} />
            </div>
            <div>
              <div className="info-label">Reservations</div>
              <div className="info-value">+91 86182 40810</div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-icon">
              <Clock size={18} />
            </div>
            <div>
              <div className="info-label">Hours</div>
              <div className="info-value">Mon – Sun · 11:00 AM – 11:00 PM</div>
            </div>
          </div>
        </div>

        {/* Scan prompt */}
        <div className="scan-prompt">
          <div className="scan-emoji">📱</div>
          <div className="scan-title">Ready to Order?</div>
          <p className="scan-desc">
            Scan the <strong>QR code</strong> on your table to browse our menu and place your order instantly.
          </p>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <a
            href="/menu/qr-table-1"
            style={{
              flex: 1,
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '12px',
              padding: '13px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.82rem',
              textDecoration: 'none',
              display: 'block',
              boxShadow: '0 4px 14px rgba(192,57,43,0.35)',
            }}
          >
            🍽️ View Menu (Table 1)
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Powered by <strong style={{ color: 'var(--primary)' }}>Zeen</strong> · Smart Restaurant Ordering
        </div>
      </div>
    </div>
  );
}
