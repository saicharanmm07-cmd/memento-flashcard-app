const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
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
  front: {
    type: String,
    required: [true, 'Front content is required'],
    trim: true,
    maxlength: 1000
  },
  back: {
    type: String,
    required: [true, 'Back content is required'],
    trim: true,
    maxlength: 2000
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timesReviewed: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
