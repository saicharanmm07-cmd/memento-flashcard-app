import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deckRes, cardsRes] = await Promise.all([
          api.get(`/decks/${id}`),
          api.get(`/flashcards/deck/${id}`)
        ]);
        setDeck(deckRes.data.deck);
        const shuffled = [...cardsRes.data.flashcards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
      } catch {
        toast.error('Failed to load cards');
        navigate(`/deck/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const next = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      if (index < cards.length - 1) setIndex(i => i + 1);
      else setCompleted(true);
    }, 150);
  }, [index, cards.length]);

  const prev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setTimeout(() => setIndex(i => i - 1), 150);
    }
  }, [index]);

  const markKnown = () => {
    setKnownCount(k => k + 1);
    next();
  };

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [next, prev]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
      <div className="spinner" style={{ width: 36, height: 36 }}></div>
    </div>
  );

  const card = cards[index];
  const progress = ((index) / cards.length) * 100;

  if (completed) {
    const pct = Math.round((knownCount / cards.length) * 100);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card animate-in" style={{ padding: 48, textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
          </div>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>Study session complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            You marked {knownCount} of {cards.length} cards as known ({pct}%)
          </p>
          <div className="progress-bar" style={{ marginBottom: 32 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--green)' : 'var(--accent)' }}></div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => { setIndex(0); setFlipped(false); setCompleted(false); setKnownCount(0); }}>
              🔁 Study Again
            </button>
            <Link to={`/deck/${id}/quiz`} className="btn btn-primary">🎯 Take Quiz</Link>
            <Link to={`/deck/${id}`} className="btn btn-ghost">← Back to Deck</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link to={`/deck/${id}`} style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← {deck?.title}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {index + 1} / {cards.length}
            </span>
            <span className={`badge badge-${card?.difficulty}`}>{card?.difficulty}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 40 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={() => setFlipped(f => !f)}
            style={{
              width: '100%', maxWidth: 640,
              minHeight: 280,
              cursor: 'pointer',
              perspective: '1000px',
              userSelect: 'none',
            }}
          >
            <div style={{
              position: 'relative',
              width: '100%', minHeight: 280,
              transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 40,
                boxShadow: 'var(--shadow)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  QUESTION
                </div>
                <p style={{ fontSize: 22, textAlign: 'center', lineHeight: 1.5, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {card?.front}
                </p>
                <div style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
                  Click to reveal · Space key
                </div>
              </div>

              {/* Back */}
              <div style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(124,106,247,0.08) 100%)',
                border: '1px solid rgba(124,106,247,0.3)',
                borderRadius: 20,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 40,
                boxShadow: 'var(--shadow), 0 0 40px var(--accent-soft)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  ANSWER
                </div>
                <p style={{ fontSize: 18, textAlign: 'center', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {card?.back}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={prev} disabled={index === 0}>← Prev</button>
          {flipped ? (
            <>
              <button className="btn btn-danger" style={{ minWidth: 120, justifyContent: 'center' }} onClick={next}>
                😕 Still Learning
              </button>
              <button className="btn btn-success" style={{ minWidth: 120, justifyContent: 'center' }} onClick={markKnown}>
                ✓ Got it!
              </button>
            </>
          ) : (
            <button className="btn btn-primary" style={{ minWidth: 160, justifyContent: 'center' }} onClick={() => setFlipped(true)}>
              Show Answer
            </button>
          )}
          <button className="btn btn-ghost" onClick={next}>Next →</button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          ← → arrow keys to navigate · Space to flip
        </p>
      </div>
    </div>
  );
}
