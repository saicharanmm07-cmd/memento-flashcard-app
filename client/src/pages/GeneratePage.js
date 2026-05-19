import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SAMPLE_TEXT = `Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar. This process takes place in the chloroplasts, specifically using chlorophyll, which is the green pigment that gives plants their color.

The process of photosynthesis consists of two main stages: the light-dependent reactions and the Calvin cycle. During light-dependent reactions, which occur in the thylakoid membranes, light energy is converted into chemical energy in the form of ATP and NADPH.

The Calvin cycle takes place in the stroma and uses the ATP and NADPH produced during the light reactions to fix carbon dioxide into glucose. This cycle is also known as carbon fixation. Plants, algae, and some bacteria are capable of performing photosynthesis.`;

export default function GeneratePage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [editedCards, setEditedCards] = useState([]);
  const [step, setStep] = useState(1); // 1=input, 2=preview, 3=save
  const [decks, setDecks] = useState([]);
  const [deckMode, setDeckMode] = useState('new'); // 'new' | 'existing'
  const [selectedDeck, setSelectedDeck] = useState('');
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/decks').then(res => setDecks(res.data.decks)).catch(() => {});
  }, []);

  const generate = async () => {
    if (!text.trim() || text.trim().length < 50) {
      return toast.error('Please enter at least 50 characters of text');
    }
    setGenerating(true);
    try {
      const res = await api.post('/generate/flashcards', { text });
      setGeneratedCards(res.data.cards);
      setEditedCards(res.data.cards.map((c, i) => ({ ...c, id: i })));
      setNewDeckTitle('Generated: ' + text.trim().split(' ').slice(0, 5).join(' ') + '...');
      setStep(2);
      toast.success(`Generated ${res.data.count} flashcards!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const updateCard = (idx, field, value) => {
    setEditedCards(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const removeCard = (idx) => {
    setEditedCards(prev => prev.filter((_, i) => i !== idx));
    toast.success('Card removed');
  };

  const addCard = () => {
    setEditedCards(prev => [...prev, { front: '', back: '', difficulty: 'medium', id: Date.now() }]);
  };

  const saveToDecks = async () => {
    const validCards = editedCards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) return toast.error('No valid cards to save');
    if (deckMode === 'new' && !newDeckTitle.trim()) return toast.error('Enter a deck name');
    if (deckMode === 'existing' && !selectedDeck) return toast.error('Select a deck');

    setSaving(true);
    try {
      let deckId;
      if (deckMode === 'new') {
        const res = await api.post('/decks', { title: newDeckTitle, sourceText: text });
        deckId = res.data.deck._id;
      } else {
        deckId = selectedDeck;
      }

      await api.post('/flashcards/bulk', { deckId, cards: validCards });
      toast.success(`Saved ${validCards.length} cards to deck!`);
      navigate(`/deck/${deckId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="page-wrapper">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              boxShadow: '0 0 20px var(--accent-glow)',
            }}>✨</div>
            <h1 style={{ fontSize: 28, letterSpacing: '-0.5px' }}>Generate Flashcards</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Paste your notes, articles, or any text and get smart flashcards instantly
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          {['Paste Text', 'Review Cards', 'Save to Deck'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: step >= i + 1 ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  border: step === i + 1 ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.3s',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 600 : 400 }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div style={{ height: 1, flex: 1, background: step > i + 1 ? 'var(--green)' : 'var(--border)', transition: 'all 0.3s' }}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Text input */}
        {step === 1 && (
          <div className="animate-in">
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="label" style={{ margin: 0 }}>Your text</label>
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => setText(SAMPLE_TEXT)}>
                  Try sample text
                </button>
              </div>
              <textarea
                className="input"
                style={{ minHeight: 280, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="Paste your notes, article, lecture transcript, or any educational text here...&#10;&#10;Tip: The more structured and clear your text, the better the flashcards!"
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {text.length} characters {text.length < 50 && text.length > 0 && '(need at least 50)'}
                </span>
                <button className="btn btn-primary" onClick={generate} disabled={generating || text.length < 50}
                  style={{ gap: 8 }}>
                  {generating ? (
                    <><div className="spinner" style={{ width: 16, height: 16 }}></div> Generating...</>
                  ) : '✨ Generate Flashcards'}
                </button>
              </div>
            </div>

            {/* Tips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 20 }}>
              {[
                { icon: '📖', title: 'Definitions', tip: 'Text with "X is Y" or "X means Y" patterns works best' },
                { icon: '📅', title: 'Facts & Dates', tip: 'Historical facts and dated events are extracted automatically' },
                { icon: '🔄', title: 'Cause & Effect', tip: 'Sentences with "causes", "leads to" generate question pairs' },
                { icon: '📝', title: 'Long form', tip: 'Lecture notes and articles work great for bulk generation' },
              ].map((tip, i) => (
                <div key={i} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{tip.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tip.tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20 }}>Review generated cards</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                  Edit, remove, or add cards before saving — {editedCards.length} cards
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-ghost" onClick={addCard}>+ Add Card</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}
                  disabled={editedCards.filter(c => c.front && c.back).length === 0}>
                  Save Cards →
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editedCards.map((card, i) => (
                <div key={card.id ?? i} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                        Card {i + 1}
                      </span>
                      <select
                        value={card.difficulty || 'medium'}
                        onChange={e => updateCard(i, 'difficulty', e.target.value)}
                        style={{
                          background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 12
                        }}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <button onClick={() => removeCard(i)} style={{
                      background: 'none', color: 'var(--text-muted)', fontSize: 14, padding: '2px 6px',
                      border: 'none', cursor: 'pointer',
                    }}
                      onMouseEnter={e => e.target.style.color = 'var(--red)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    >✕ Remove</button>
                  </div>
                  <div className="two-col">
                    <div>
                      <label className="label">Front (Question)</label>
                      <textarea className="input" rows={2} style={{ resize: 'vertical' }}
                        value={card.front} onChange={e => updateCard(i, 'front', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Back (Answer)</label>
                      <textarea className="input" rows={2} style={{ resize: 'vertical' }}
                        value={card.back} onChange={e => updateCard(i, 'back', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              <button className="btn btn-ghost" style={{ justifyContent: 'center', padding: 16, borderStyle: 'dashed' }}
                onClick={addCard}>
                + Add another card
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Save */}
        {step === 3 && (
          <div className="animate-in" style={{ maxWidth: 520 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>Save to deck</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Saving {editedCards.filter(c => c.front && c.back).length} cards
              </p>
            </div>

            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {['new', 'existing'].map(mode => (
                  <button key={mode} onClick={() => setDeckMode(mode)}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                      background: deckMode === mode ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: deckMode === mode ? 'white' : 'var(--text-secondary)',
                      border: '1px solid ' + (deckMode === mode ? 'var(--accent)' : 'var(--border)'),
                      cursor: 'pointer', transition: 'var(--transition)',
                    }}>
                    {mode === 'new' ? '+ New Deck' : '📂 Existing Deck'}
                  </button>
                ))}
              </div>

              {deckMode === 'new' ? (
                <div>
                  <label className="label">Deck name</label>
                  <input className="input" value={newDeckTitle} onChange={e => setNewDeckTitle(e.target.value)}
                    placeholder="Enter deck name..." />
                </div>
              ) : (
                <div>
                  <label className="label">Select deck</label>
                  {decks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No decks yet — create a new one instead.</p>
                  ) : (
                    <select className="input" value={selectedDeck} onChange={e => setSelectedDeck(e.target.value)}>
                      <option value="">Choose a deck...</option>
                      {decks.map(d => <option key={d._id} value={d._id}>{d.title} ({d.cardCount} cards)</option>)}
                    </select>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={saveToDecks} disabled={saving}>
                  {saving ? <><div className="spinner" style={{ width: 16, height: 16 }}></div> Saving...</> : '💾 Save Deck'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
