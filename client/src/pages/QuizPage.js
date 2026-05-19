import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const [deckRes, quizRes] = await Promise.all([
          api.get(`/decks/${id}`),
          api.get(`/quiz/deck/${id}`)
        ]);
        setDeck(deckRes.data.deck);
        setQuestions(quizRes.data.questions);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load quiz');
        navigate(`/deck/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const question = questions[qIndex];
  const progress = ((qIndex) / questions.length) * 100;

  const confirm = () => {
    if (!selectedAnswer) return;
    setConfirmed(true);
    setAnswers(prev => [...prev, {
      flashcardId: question.id,
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: selectedAnswer,
    }]);
  };

  const next = async () => {
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setSelectedAnswer(null);
      setConfirmed(false);
    } else {
      // Submit quiz
      setSubmitting(true);
      try {
        const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
        const finalAnswers = [...answers];
        const res = await api.post('/quiz/submit', {
          deckId: id,
          answers: finalAnswers,
          timeTaken
        });
        navigate('/quiz/result', { state: { result: res.data.result, deck } });
      } catch (err) {
        toast.error('Failed to submit quiz');
        setSubmitting(false);
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
      <div className="spinner" style={{ width: 36, height: 36 }}></div>
    </div>
  );

  const isCorrect = confirmed && selectedAnswer === question.correctAnswer;
  const isWrong = confirmed && selectedAnswer !== question.correctAnswer;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-wrapper" style={{ maxWidth: 680 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Link to={`/deck/${id}`} style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            ← {deck?.title}
          </Link>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Question {qIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 36 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question */}
        <div className="card animate-in" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            QUESTION {qIndex + 1}
          </div>
          <p style={{ fontSize: 20, lineHeight: 1.5, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {question?.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {question?.options.map((option, i) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;

            let bg = 'var(--bg-card)';
            let border = 'var(--border)';
            let textColor = 'var(--text-primary)';

            if (confirmed) {
              if (isCorrectOption) {
                bg = 'var(--green-soft)'; border = 'rgba(74,222,128,0.4)'; textColor = 'var(--green)';
              } else if (isSelected && !isCorrectOption) {
                bg = 'var(--red-soft)'; border = 'rgba(248,113,113,0.4)'; textColor = 'var(--red)';
              } else {
                textColor = 'var(--text-muted)';
              }
            } else if (isSelected) {
              bg = 'var(--accent-soft)'; border = 'rgba(124,106,247,0.5)'; textColor = 'var(--text-primary)';
            }

            return (
              <button
                key={i}
                onClick={() => !confirmed && setSelectedAnswer(option)}
                disabled={confirmed}
                style={{
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 12,
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 15,
                  color: textColor,
                  cursor: confirmed ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transform: isSelected && !confirmed ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: confirmed ? (isCorrectOption ? 'var(--green)' : isSelected ? 'var(--red)' : 'var(--bg-elevated)') : (isSelected ? 'var(--accent)' : 'var(--bg-elevated)'),
                  color: (confirmed && (isCorrectOption || isSelected)) || (!confirmed && isSelected) ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  transition: 'all 0.2s',
                }}>
                  {confirmed && isCorrectOption ? '✓' : confirmed && isSelected && !isCorrectOption ? '✗' : String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {confirmed && (
          <div className="animate-in" style={{
            padding: '14px 20px',
            background: isCorrect ? 'var(--green-soft)' : 'var(--red-soft)',
            border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 14,
            color: isCorrect ? 'var(--green)' : 'var(--red)',
          }}>
            {isCorrect ? '✅ Correct!' : `❌ The correct answer is: "${question.correctAnswer}"`}
          </div>
        )}

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!confirmed ? (
            <button className="btn btn-primary" style={{ minWidth: 140, justifyContent: 'center', padding: '12px 24px' }}
              onClick={confirm} disabled={!selectedAnswer}>
              Check Answer
            </button>
          ) : (
            <button className="btn btn-primary" style={{ minWidth: 140, justifyContent: 'center', padding: '12px 24px' }}
              onClick={next} disabled={submitting}>
              {submitting ? <div className="spinner" style={{ width: 16, height: 16 }}></div>
                : qIndex < questions.length - 1 ? 'Next Question →' : '🏁 Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
