const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/flashcards/deck/:deckId
router.get('/deck/:deckId', async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });

    const flashcards = await Flashcard.find({ deck: req.params.deckId }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, flashcards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/flashcards - Create single flashcard
router.post('/', async (req, res) => {
  try {
    const { deck, front, back, difficulty } = req.body;

    const deckDoc = await Deck.findOne({ _id: deck, user: req.user._id });
    if (!deckDoc) return res.status(404).json({ success: false, message: 'Deck not found' });

    const count = await Flashcard.countDocuments({ deck });
    const flashcard = await Flashcard.create({
      deck, front, back, difficulty,
      user: req.user._id,
      order: count
    });

    // Update deck card count
    await Deck.findByIdAndUpdate(deck, { $inc: { cardCount: 1 } });

    res.status(201).json({ success: true, flashcard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/flashcards/bulk - Create multiple flashcards
router.post('/bulk', async (req, res) => {
  try {
    const { deckId, cards } = req.body;

    const deck = await Deck.findOne({ _id: deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });

    const existingCount = await Flashcard.countDocuments({ deck: deckId });

    const flashcardsData = cards.map((card, index) => {
      const { id, _id, ...cardData } = card; // strip any frontend id fields
      return {
        ...cardData,
        deck: deckId,
        user: req.user._id,
        order: existingCount + index
      };
    });

    const flashcards = await Flashcard.insertMany(flashcardsData);

    await Deck.findByIdAndUpdate(deckId, { $inc: { cardCount: cards.length } });

    res.status(201).json({ success: true, flashcards, count: flashcards.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/flashcards/:id - Update flashcard
router.put('/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!flashcard) return res.status(404).json({ success: false, message: 'Flashcard not found' });
    res.json({ success: true, flashcard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/flashcards/:id - Delete flashcard
router.delete('/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!flashcard) return res.status(404).json({ success: false, message: 'Flashcard not found' });

    await Deck.findByIdAndUpdate(flashcard.deck, { $inc: { cardCount: -1 } });

    res.json({ success: true, message: 'Flashcard deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
