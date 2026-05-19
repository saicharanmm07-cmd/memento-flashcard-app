const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Deck title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardCount: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  tags: [{
    type: String,
    trim: true
  }],
  sourceText: {
    type: String,
    default: ''
  },
  lastStudied: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Deck', deckSchema);
