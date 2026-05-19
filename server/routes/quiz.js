const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const QuizResult = require('../models/QuizResult');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/quiz/deck/:deckId - Get quiz questions for a deck
router.get('/deck/:deckId', async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });

    const flashcards = await Flashcard.find({ deck: req.params.deckId });
    if (flashcards.length < 2) {
      return res.status(400).json({ success: false, message: 'Need at least 2 flashcards for a quiz' });
    }

    // Build MCQ questions using other cards as distractors
    const questions = flashcards.map(card => {
      const distractors = flashcards
        .filter(c => c._id.toString() !== card._id.toString())
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back);

      const options = [...distractors, card.back].sort(() => Math.random() - 0.5);

      return {
        id: card._id,
        question: card.front,
        correctAnswer: card.back,
        options: options.length >= 4 ? options : [...options, ...Array(4 - options.length).fill('N/A')],
        difficulty: card.difficulty
      };
    });

    res.json({ success: true, questions: questions.sort(() => Math.random() - 0.5) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/quiz/submit - Submit quiz answers
router.post('/submit', async (req, res) => {
  try {
    const { deckId, answers, timeTaken } = req.body;

    const deck = await Deck.findOne({ _id: deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });

    let score = 0;
    const processedAnswers = answers.map(a => {
      const isCorrect = a.userAnswer === a.correctAnswer;
      if (isCorrect) score++;
      return { ...a, isCorrect };
    });

    const percentage = Math.round((score / answers.length) * 100);

    const result = await QuizResult.create({
      deck: deckId,
      user: req.user._id,
      score,
      totalQuestions: answers.length,
      percentage,
      timeTaken,
      answers: processedAnswers
    });

    // Update deck last studied
    await Deck.findByIdAndUpdate(deckId, { lastStudied: new Date() });

    // Update flashcard stats
    for (const a of processedAnswers) {
      if (a.flashcardId) {
        await Flashcard.findByIdAndUpdate(a.flashcardId, {
          $inc: { timesReviewed: 1, correctCount: a.isCorrect ? 1 : 0 }
        });
      }
    }

    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/quiz/history - Get quiz history for user
router.get('/history', async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .populate('deck', 'title color')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
