const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// @GET /api/decks - Get all decks for user
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, decks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/decks - Create deck
router.post('/', async (req, res) => {
  try {
    const { title, description, color, tags, sourceText } = req.body;
    const deck = await Deck.create({
      title, description, color, tags, sourceText,
      user: req.user._id
    });
    res.status(201).json({ success: true, deck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/decks/:id - Get single deck
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, user: req.user._id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });
    res.json({ success: true, deck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/decks/:id - Update deck
router.put('/:id', async (req, res) => {
  try {
    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });
    res.json({ success: true, deck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/decks/:id - Delete deck + all its flashcards
router.delete('/:id', async (req, res) => {
  try {
    const deck = await Deck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });
    await Flashcard.deleteMany({ deck: req.params.id });
    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
