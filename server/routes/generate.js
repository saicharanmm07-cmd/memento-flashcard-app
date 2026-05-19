const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

// Smart text parser to extract Q&A pairs from any text
function generateFlashcardsFromText(text) {
  const cards = [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);

  // Pattern 1: Definition patterns "X is Y" / "X are Y" / "X means Y" / "X refers to Y"
  const definitionPatterns = [
    /^(.+?)\s+(?:is|are|was|were)\s+(?:a|an|the)?\s*(.{10,})/i,
    /^(.+?)\s+(?:means?|refers? to|defined? as|known as)\s+(.{10,})/i,
    /^(.+?)\s*:\s*(.{10,})/,
    /^(?:The\s+)?(.+?)\s+(?:can be|could be)\s+defined as\s+(.{10,})/i,
  ];

  sentences.forEach(sentence => {
    for (const pattern of definitionPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1].split(' ').length <= 8) {
        const term = match[1].trim().replace(/^(The|A|An)\s+/i, '');
        const definition = match[2].trim();
        if (term.length > 2 && definition.length > 10) {
          cards.push({
            front: `What is ${term}?`,
            back: definition,
            difficulty: 'medium'
          });
          break;
        }
      }
    }
  });

  // Pattern 2: Facts with numbers/dates "In YEAR, X happened"
  const factPattern = /(?:In\s+\d{4}|During|After|Before|When)\s*,?\s*(.{15,})/gi;
  let match;
  while ((match = factPattern.exec(text)) !== null) {
    const context = match[0].match(/(?:In\s+(\d{4})|During\s+(.+?),|When\s+(.+?),)/i);
    if (context) {
      const timeRef = context[1] || context[2] || context[3];
      cards.push({
        front: `What happened in/during ${timeRef}?`,
        back: match[1].trim(),
        difficulty: 'medium'
      });
    }
  }

  // Pattern 3: Cause-effect "X causes/leads to Y"
  const causeEffect = /(.{10,}?)\s+(?:causes?|leads? to|results? in|produces?)\s+(.{10,})/gi;
  while ((match = causeEffect.exec(text)) !== null) {
    cards.push({
      front: `What does "${match[1].trim()}" cause or lead to?`,
      back: match[2].trim(),
      difficulty: 'hard'
    });
  }

  // Pattern 4: Process/steps "To X, you must Y" / "X requires Y"
  const processPattern = /(?:To\s+.+?,|In order to\s+.+?,)\s*(.{15,})/gi;
  while ((match = processPattern.exec(text)) !== null) {
    const step = match[0].match(/(?:To\s+(.+?),|In order to\s+(.+?),)/i);
    if (step) {
      const goal = step[1] || step[2];
      cards.push({
        front: `How do you ${goal.toLowerCase()}?`,
        back: match[1].trim(),
        difficulty: 'medium'
      });
    }
  }

  // Pattern 5: Lists "X, Y, and Z are..." 
  const listPattern = /(.+?)\s+(?:include|consist of|are made up of|are composed of|contain)\s+(.+)/gi;
  while ((match = listPattern.exec(text)) !== null) {
    cards.push({
      front: `What does ${match[1].trim()} include/consist of?`,
      back: match[2].trim(),
      difficulty: 'medium'
    });
  }

  // Pattern 6: Key terms with "important", "key", "main", "primary"
  const keyTermPattern = /(?:The\s+)?(?:important|key|main|primary|major|critical|essential)\s+(.+?)\s+(?:is|are|include)\s+(.{10,})/gi;
  while ((match = keyTermPattern.exec(text)) !== null) {
    cards.push({
      front: `What is the ${match[1].trim()}?`,
      back: match[2].trim(),
      difficulty: 'easy'
    });
  }

  // Fill to minimum with sentence-based cards if needed
  if (cards.length < 3 && sentences.length >= 2) {
    const chunkSize = Math.ceil(sentences.length / Math.max(3, Math.floor(text.length / 200)));
    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunk = sentences.slice(i, i + chunkSize).join('. ');
      if (chunk.length > 20) {
        const words = chunk.split(' ').slice(0, 5).join(' ');
        cards.push({
          front: `Complete or explain: "${words}..."`,
          back: chunk,
          difficulty: 'medium'
        });
      }
      if (cards.length >= 10) break;
    }
  }

  // Deduplicate and clean
  const seen = new Set();
  return cards.filter(card => {
    const key = card.front.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return card.front.length > 5 && card.back.length > 5;
  }).slice(0, 20);
}

// @POST /api/generate/flashcards
router.post('/flashcards', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 50 characters of text to generate flashcards'
      });
    }

    const cards = generateFlashcardsFromText(text.trim());

    if (cards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract flashcards from the provided text. Try adding more structured content with definitions, facts, or explanations.'
      });
    }

    res.json({
      success: true,
      cards,
      count: cards.length,
      message: `Generated ${cards.length} flashcards from your text`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
