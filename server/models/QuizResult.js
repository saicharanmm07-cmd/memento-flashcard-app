const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  answers: [{
    flashcardId: mongoose.Schema.Types.ObjectId,
    question: String,
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
