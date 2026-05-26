'use client';

import { useState } from 'react';
import type { MoodProfile, MoodType, CravingType, HungerType } from '@/lib/recommendations';

interface Props {
  onComplete: (profile: MoodProfile) => void;
  onSkip: () => void;
}

const STEP_MOODS: { key: MoodType; emoji: string; label: string; sub: string; bg: string }[] = [
  { key: 'happy',       emoji: '😊', label: 'Happy & Excited',     sub: 'Ready to celebrate',   bg: '#FFF3E0' },
  { key: 'relaxed',     emoji: '😌', label: 'Relaxed & Chill',     sub: 'Just unwinding',        bg: '#E8F5E9' },
  { key: 'tired',       emoji: '😴', label: 'Tired — Need Energy', sub: 'Long day, need a boost', bg: '#EDE7F6' },
  { key: 'celebrating', emoji: '🎉', label: 'Celebrating!',         sub: 'Special occasion',      bg: '#FCE4EC' },
];

const STEP_CRAVINGS: { key: CravingType; emoji: string; label: string; sub: string; bg: string }[] = [
  { key: 'spicy',  emoji: '🌶️', label: 'Spicy & Fiery',   sub: 'Bring the heat!',    bg: '#FFEBEE' },
  { key: 'light',  emoji: '🍃', label: 'Light & Fresh',   sub: 'Something easy',     bg: '#E8F5E9' },
  { key: 'sweet',  emoji: '🍮', label: 'Sweet & Indulgent', sub: 'Treat yourself',    bg: '#FFF8E1' },
  { key: 'hearty', emoji: '🍛', label: 'Heavy & Hearty',  sub: 'Full meal please!',  bg: '#FBE9E7' },
];

const STEP_HUNGERS: { key: HungerType; emoji: string; label: string; sub: string; bg: string }[] = [
  { key: 'starving', emoji: '🤤', label: 'Very Hungry!',      sub: 'Bring everything!',    bg: '#FFEBEE' },
  { key: 'normal',   emoji: '🙂', label: 'Moderately Hungry', sub: 'A good meal please',   bg: '#E8F5E9' },
  { key: 'snack',    emoji: '🫙', label: 'Just a Snack',      sub: 'Light bite & drinks',  bg: '#E3F2FD' },
];

export function MoodWizard({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [craving, setCraving] = useState<CravingType | null>(null);

  function selectMood(m: MoodType) {
    setMood(m);
    setTimeout(() => setStep(1), 280);
  }
  function selectCraving(c: CravingType) {
    setCraving(c);
    setTimeout(() => setStep(2), 280);
  }
  function selectHunger(h: HungerType) {
    if (mood && craving) onComplete({ mood, craving, hunger: h });
  }

  const steps = ['Your Vibe', 'Craving', 'Hunger'];

  return (
    <div className="wizard-overlay">
      <div className="wizard-card">
        {/* Top decoration */}
        <div className="wizard-top-bar" />

        {/* Logo + Title */}
        <div className="wizard-head">
          <div className="wizard-icon">✨</div>
          <h2 className="wizard-title">Personalise Your Menu</h2>
          <p className="wizard-subtitle">3 quick questions — we'll recommend the perfect dishes</p>
        </div>

        {/* Progress dots */}
        <div className="wizard-dots">
          {steps.map((s, i) => (
            <div key={s} className={`wdot ${i <= step ? 'done' : ''} ${i === step ? 'current' : ''}`}>
              <div className="wdot-circle">{i < step ? '✓' : i + 1}</div>
              <span className="wdot-label">{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Mood */}
        {step === 0 && (
          <div className="wizard-body">
            <h3 className="wiz-q">How are you feeling right now?</h3>
            <div className="wiz-grid">
              {STEP_MOODS.map(m => (
                <button
                  key={m.key}
                  className={`wiz-option ${mood === m.key ? 'selected' : ''}`}
                  style={{ '--opt-bg': m.bg } as React.CSSProperties}
                  onClick={() => selectMood(m.key)}
                >
                  <span className="wiz-emoji">{m.emoji}</span>
                  <span className="wiz-label">{m.label}</span>
                  <span className="wiz-sub">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Craving */}
        {step === 1 && (
          <div className="wizard-body">
            <h3 className="wiz-q">What are you craving?</h3>
            <div className="wiz-grid">
              {STEP_CRAVINGS.map(c => (
                <button
                  key={c.key}
                  className={`wiz-option ${craving === c.key ? 'selected' : ''}`}
                  style={{ '--opt-bg': c.bg } as React.CSSProperties}
                  onClick={() => selectCraving(c.key)}
                >
                  <span className="wiz-emoji">{c.emoji}</span>
                  <span className="wiz-label">{c.label}</span>
                  <span className="wiz-sub">{c.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Hunger */}
        {step === 2 && (
          <div className="wizard-body">
            <h3 className="wiz-q">How hungry are you?</h3>
            <div className="wiz-grid hunger-grid">
              {STEP_HUNGERS.map(h => (
                <button
                  key={h.key}
                  className="wiz-option"
                  style={{ '--opt-bg': h.bg } as React.CSSProperties}
                  onClick={() => selectHunger(h.key)}
                >
                  <span className="wiz-emoji">{h.emoji}</span>
                  <span className="wiz-label">{h.label}</span>
                  <span className="wiz-sub">{h.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="wiz-skip" onClick={onSkip}>
          Skip personalisation
        </button>
      </div>
    </div>
  );
}
