import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function DeckPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', difficulty: 'medium' });
  const [adding, setAdding] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [deckRes, cardsRes] = await Promise.all([
        api.get(`/decks/${id}`),
        api.get(`/flashcards/deck/${id}`)
      ]);
      setDeck(deckRes.data.deck);
      setFlashcards(cardsRes.data.flashcards);
    } catch (err) {
      toast.error('Failed to load deck');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (e) => {
    e.preventDefault();
    if (!newCard.front.trim() || !newCard.back.trim()) return toast.error('Fill in both sides');
    setAdding(true);
    try {
      const res = await api.post('/flashcards', { deck: id, ...newCard });
      setFlashcards(prev => [...prev, res.data.flashcard]);
      setDeck(prev => ({ ...prev, cardCount: (prev.cardCount || 0) + 1 }));
      setNewCard({ front: '', back: '', difficulty: 'medium' });
      setShowAdd(false);
      toast.success('Card added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add card');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (card) => {
    setEditingCard(card._id);
    setEditForm({ front: card.front, back: card.back, difficulty: card.difficulty });
  };

  const saveEdit = async (cardId) => {
    setSaving(true);
    try {
      const res = await api.put(`/flashcards/${cardId}`, editForm);
      setFlashcards(prev => prev.map(c => c._id === cardId ? res.data.flashcard : c));
      setEditingCard(null);
      toast.success('Card updated!');
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (cardId) => {
    if (!window.confirm('Delete this flashcard?')) return;
    setDeletingId(cardId);
    try {
      await api.delete(`/flashcards/${cardId}`);
      setFlashcards(prev => prev.filter(c => c._id !== cardId));
      setDeck(prev => ({ ...prev, cardCount: Math.max(0, (prev.cardCount || 0) - 1) }));
      toast.success('Card deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
      <div className="spinner" style={{ width: 36, height: 36 }}></div>
    </div>
  );

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="page-wrapper">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)' }}>{deck?.title}</span>
        </div>

        {/* Deck header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: deck?.color || 'var(--accent)', flexShrink: 0 }}/>
              <h1 style={{ fontSize: 28, letterSpacing: '-0.5px' }}>{deck?.title}</h1>
            </div>
            {deck?.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>{deck.description}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13 }}>
              <span>📇 {flashcards.length} cards</span>
              {deck?.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? '✕ Cancel' : '+ Add Card'}
            </button>
            <Link to={`/deck/${id}/study`}
              className={`btn ${flashcards.length === 0 ? 'btn-ghost' : 'btn-ghost'}`}
              style={{ pointerEvents: flashcards.length === 0 ? 'none' : 'auto', opacity: flashcards.length === 0 ? 0.5 : 1 }}>
              📖 Study
            </Link>
            <Link to={`/deck/${id}/quiz`}
              className={`btn ${flashcards.length < 2 ? 'btn-ghost' : 'btn-primary'}`}
              style={{ pointerEvents: flashcards.length < 2 ? 'none' : 'auto', opacity: flashcards.length < 2 ? 0.5 : 1 }}>
              🎯 Start Quiz
            </Link>
          </div>
        </div>

        {/* Add card form */}
        {showAdd && (
          <div className="card animate-in" style={{ padding: 24, marginBottom: 24, borderColor: 'rgba(124,106,247,0.3)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Add new card</h3>
            <form onSubmit={addCard} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="two-col">
                <div>
                  <label className="label">Front (Question)</label>
                  <textarea className="input" rows={3} placeholder="Enter the question or term..."
                    value={newCard.front} onChange={e => setNewCard({ ...newCard, front: e.target.value })}
                    style={{ resize: 'vertical' }} autoFocus />
                </div>
                <div>
                  <label className="label">Back (Answer)</label>
                  <textarea className="input" rows={3} placeholder="Enter the answer or definition..."
                    value={newCard.back} onChange={e => setNewCard({ ...newCard, back: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div>
                  <label className="label">Difficulty</label>
                  <select className="input" style={{ width: 'auto' }} value={newCard.difficulty}
                    onChange={e => setNewCard({ ...newCard, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 22, alignSelf: 'flex-start' }}
                  disabled={adding}>
                  {adding ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Flashcards list */}
        {flashcards.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📇</div>
            <h3>No flashcards yet</h3>
            <p style={{ marginBottom: 24 }}>Add cards manually or generate from text</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Card</button>
              <Link to="/generate" className="btn btn-ghost">✨ Generate from Text</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              {flashcards.length} card{flashcards.length !== 1 ? 's' : ''}
            </div>
            {flashcards.map((card, i) => (
              <div key={card._id} className="card" style={{ padding: 0, animation: `fadeIn 0.25s ease ${i * 0.03}s both` }}>
                {editingCard === card._id ? (
                  /* Edit mode */
                  <div style={{ padding: 20 }}>
                    <div className="two-col" style={{ marginBottom: 12 }}>
                      <div>
                        <label className="label">Front</label>
                        <textarea className="input" rows={3} style={{ resize: 'vertical' }}
                          value={editForm.front} onChange={e => setEditForm({ ...editForm, front: e.target.value })} />
                      </div>
                      <div>
                        <label className="label">Back</label>
                        <textarea className="input" rows={3} style={{ resize: 'vertical' }}
                          value={editForm.back} onChange={e => setEditForm({ ...editForm, back: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <select className="input" style={{ width: 'auto' }} value={editForm.difficulty}
                        onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}
                          onClick={() => setEditingCard(null)}>Cancel</button>
                        <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}
                          onClick={() => saveEdit(card._id)} disabled={saving}>
                          {saving ? '...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div style={{ padding: '16px 20px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, minWidth: 24, marginTop: 2 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          FRONT
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{card.front}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          BACK
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{card.back}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                      <span className={`badge badge-${card.difficulty}`}>{card.difficulty}</span>
                      {card.timesReviewed > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {card.correctCount}/{card.timesReviewed} correct
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => startEdit(card)}>✏️</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => deleteCard(card._id)} disabled={deletingId === card._id}>
                          {deletingId === card._id ? '...' : '🗑'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
