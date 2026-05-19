import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(124,106,247,0.12) 0%, transparent 50%),
                          radial-gradient(ellipse at 80% 20%, rgba(74,222,128,0.06) 0%, transparent 40%)`,
        pointerEvents: 'none',
      }}/>

      {/* Left panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 48,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-in">
          {/* Logo */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40,
                background: 'var(--accent)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                boxShadow: '0 0 30px var(--accent-glow)',
              }}>⚡</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>Memento</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Smarter flashcards, better retention</p>
          </div>

          <h1 style={{ fontSize: 28, marginBottom: 8, letterSpacing: '-0.5px' }}>Sign in</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Create one free</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }}></div> Signing in...</> : 'Sign in →'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 24,
            padding: '12px 16px',
            background: 'var(--accent-soft)',
            border: '1px solid rgba(124,106,247,0.2)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            💡 <strong style={{ color: 'var(--text-primary)' }}>New here?</strong> Register to get started — it's free and instant.
          </div>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 48,
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 360, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🧠</div>
          <h2 style={{ fontSize: 26, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Learn anything,<br />remember everything
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Paste any text — articles, notes, lectures — and instantly get AI-generated flashcards and quizzes to supercharge your study sessions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32, textAlign: 'left' }}>
            {[
              { icon: '✨', text: 'Auto-generate flashcards from any text' },
              { icon: '🎯', text: 'Multiple-choice quizzes with scoring' },
              { icon: '📊', text: 'Track your performance over time' },
              { icon: '🗂️', text: 'Organize into decks with custom tags' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
