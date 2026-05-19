import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#7c6af7', '#4ade80', '#f87171', '#fbbf24', '#60a5fa', '#f472b6', '#34d399', '#a78bfa'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newDeck, setNewDeck] = useState({ title: '', description: '', color: COLORS[0], tags: '' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await api.get('/decks');
      setDecks(res.data.decks);
    } catch (err) {
      toast.error('Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (e) => {
    e.preventDefault();
    if (!newDeck.title.trim()) return toast.error('Deck needs a title');
    setCreating(true);
    try {
      const tags = newDeck.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/decks', { ...newDeck, tags });
      setDecks([res.data.deck, ...decks]);
      setShowCreate(false);
      setNewDeck({ title: '', description: '', color: COLORS[0], tags: '' });
      toast.success('Deck created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create deck');
    } finally {
      setCreating(false);
    }
  };

  const deleteDeck = async (id) => {
    if (!window.confirm('Delete this deck and all its flashcards?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/decks/${id}`);
      setDecks(decks.filter(d => d._id !== id));
      toast.success('Deck deleted');
    } catch (err) {
      toast.error('Failed to delete deck');
    } finally {
      setDeletingId(null);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="page-wrapper">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 32, letterSpacing: '-1px', marginBottom: 6 }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {decks.length === 0 ? 'Create your first deck to get started' : `You have ${decks.length} deck${decks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/generate" className="btn btn-ghost">✨ Generate from text</Link>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Deck</button>
          </div>
        </div>

        {/* Stats row */}
        {decks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Total Decks', value: decks.length, icon: '🗂️' },
              { label: 'Total Cards', value: decks.reduce((s, d) => s + (d.cardCount || 0), 0), icon: '📇' },
              { label: 'Studied Today', value: decks.filter(d => d.lastStudied && new Date(d.lastStudied).toDateString() === new Date().toDateString()).length, icon: '📖' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 24 }}>{stat.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create deck modal */}
        {showCreate && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }} onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
            <div className="card animate-in" style={{ padding: 32, width: '100%', maxWidth: 480 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20 }}>Create new deck</h2>
                <button onClick={() => setShowCreate(false)} style={{
                  background: 'none', color: 'var(--text-muted)', fontSize: 18, padding: 0, lineHeight: 1
                }}>✕</button>
              </div>
              <form onSubmit={createDeck} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="e.g. Biology Chapter 5" value={newDeck.title}
                    onChange={e => setNewDeck({ ...newDeck, title: e.target.value })} autoFocus />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" placeholder="What's this deck about?" rows={2}
                    value={newDeck.description} onChange={e => setNewDeck({ ...newDeck, description: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input className="input" placeholder="science, biology, chapter5"
                    value={newDeck.tags} onChange={e => setNewDeck({ ...newDeck, tags: e.target.value })} />
                </div>
                <div>
                  <label className="label">Color</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setNewDeck({ ...newDeck, color: c })}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                          outline: newDeck.color === c ? `3px solid white` : '3px solid transparent',
                          outlineOffset: 2, cursor: 'pointer', transition: 'all 0.15s',
                        }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                    disabled={creating}>
                    {creating ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Create Deck'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Decks grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32 }}></div>
          </div>
        ) : decks.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🗂️</div>
            <h3>No decks yet</h3>
            <p style={{ marginBottom: 24 }}>Create a deck or generate one from your notes</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Deck</button>
              <Link to="/generate" className="btn btn-ghost">✨ Generate from text</Link>
            </div>
          </div>
        ) : (
          <div className="deck-grid">
            {decks.map((deck, i) => (
              <div key={deck._id} className="card" style={{
                padding: 0, overflow: 'hidden', cursor: 'pointer',
                animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
              }}>
                {/* Color stripe */}
                <div style={{ height: 5, background: deck.color || 'var(--accent)' }} />
                <div style={{ padding: '20px 20px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, flex: 1, marginRight: 8 }}
                      onClick={() => navigate(`/deck/${deck._id}`)}>{deck.title}</h3>
                    <button onClick={(e) => { e.stopPropagation(); deleteDeck(deck._id); }}
                      disabled={deletingId === deck._id}
                      style={{
                        background: 'none', color: 'var(--text-muted)', fontSize: 14, padding: '2px 6px',
                        border: '1px solid transparent', borderRadius: 6, cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={e => { e.target.style.color = 'var(--red)'; e.target.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                      onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'transparent'; }}
                    >
                      {deletingId === deck._id ? '...' : '🗑'}
                    </button>
                  </div>

                  {deck.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                      {deck.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                    <span>📇 {deck.cardCount || 0} cards</span>
                    <span>🕒 {timeAgo(deck.createdAt)}</span>
                    {deck.lastStudied && <span>📖 Studied {timeAgo(deck.lastStudied)}</span>}
                  </div>

                  {deck.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {deck.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '8px 12px' }}
                      onClick={() => navigate(`/deck/${deck._id}`)}>
                      Manage
                    </button>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '8px 12px' }}
                      onClick={() => navigate(`/deck/${deck._id}/study`)}
                      disabled={!deck.cardCount}>
                      📖 Study
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '8px 12px' }}
                      onClick={() => navigate(`/deck/${deck._id}/quiz`)}
                      disabled={!deck.cardCount || deck.cardCount < 2}>
                      🎯 Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
