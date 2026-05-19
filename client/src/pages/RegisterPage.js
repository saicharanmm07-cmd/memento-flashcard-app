import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Let\'s go 🚀');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      console.error('Register error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(ellipse at 70% 30%, rgba(124,106,247,0.1) 0%, transparent 50%),
                          radial-gradient(ellipse at 20% 80%, rgba(74,222,128,0.05) 0%, transparent 40%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 440, padding: 24 }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48,
            background: 'var(--accent)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 16px',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}>⚡</div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.5px' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
            Already registered? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Full name</label>
              <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={update('name')} autoFocus />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
            </div>
            <div className="two-col">
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min. 6 chars" value={form.password} onChange={update('password')} />
              </div>
              <div>
                <label className="label">Confirm</label>
                <input className="input" type="password" placeholder="Repeat password" value={form.confirm} onChange={update('confirm')} />
              </div>
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(form.password.length * 8, 100)}%`,
                    background: form.password.length < 6 ? 'var(--red)' : form.password.length < 10 ? 'var(--yellow)' : 'var(--green)',
                  }}></div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Good' : 'Strong'}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 4, width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }}></div> Creating account...</> : 'Create account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          By registering, you agree to use this app responsibly. 😊
        </p>
      </div>
    </div>
  );
}
