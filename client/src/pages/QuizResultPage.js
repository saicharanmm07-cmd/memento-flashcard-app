import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function QuizResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    navigate('/dashboard');
    return null;
  }

  const { result, deck } = state;
  const { score, totalQuestions, percentage, timeTaken, answers } = result;

  const emoji = percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪';
  const grade = percentage >= 90 ? 'Excellent!' : percentage >= 70 ? 'Great job!' : percentage >= 50 ? 'Good effort!' : 'Keep practicing!';
  const gradeColor = percentage >= 70 ? 'var(--green)' : percentage >= 50 ? 'var(--yellow)' : 'var(--red)';

  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, paddingBottom: 80 }}>
      <div className="page-wrapper" style={{ maxWidth: 680 }}>
        {/* Score card */}
        <div className="card animate-in" style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>{emoji}</div>
          <h1 style={{ fontSize: 30, letterSpacing: '-0.5px', marginBottom: 4 }}>{grade}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Quiz for <strong style={{ color: 'var(--text-primary)' }}>{deck?.title}</strong>
          </p>

          {/* Score display */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'var(--font-display)', color: gradeColor, lineHeight: 1 }}>
                {percentage}%
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Score</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }}/>
            <div>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                {score}<span style={{ fontSize: 24, color: 'var(--text-muted)' }}>/{totalQuestions}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Correct</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }}/>
            <div>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Time</div>
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: 8, height: 10 }}>
            <div className="progress-fill" style={{ width: `${percentage}%`, background: gradeColor, height: 10 }}></div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => navigate(`/deck/${deck?._id || result.deck}/quiz`)}>
              🔁 Retry Quiz
            </button>
            <Link to={`/deck/${deck?._id || result.deck}/study`} className="btn btn-ghost">
              📖 Study Cards
            </Link>
            <Link to="/dashboard" className="btn btn-primary">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Answer review */}
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Answer Review</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {answers?.map((a, i) => (
            <div key={i} className="card" style={{
              padding: '16px 20px',
              borderColor: a.isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: a.isCorrect ? 'var(--green-soft)' : 'var(--red-soft)',
                  color: a.isCorrect ? 'var(--green)' : 'var(--red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, marginTop: 2,
                }}>
                  {a.isCorrect ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{a.question}</p>
                  {!a.isCorrect && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Your answer: <span style={{ color: 'var(--red)' }}>{a.userAnswer}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 13 }}>
                    {a.isCorrect ? (
                      <span style={{ color: 'var(--green)' }}>✓ {a.correctAnswer}</span>
                    ) : (
                      <span>Correct: <span style={{ color: 'var(--green)' }}>{a.correctAnswer}</span></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
