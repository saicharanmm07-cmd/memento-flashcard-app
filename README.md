# ⚡ Memento — Flashcard & Quiz Generator
### Full-stack MERN application with authentication

---

## 🗂️ Project Structure

```
flashcard-app/
├── server/                  ← Express + MongoDB backend
│   ├── models/
│   │   ├── User.js          ← Auth user model
│   │   ├── Deck.js          ← Flashcard deck model
│   │   ├── Flashcard.js     ← Individual card model
│   │   └── QuizResult.js    ← Quiz history model
│   ├── routes/
│   │   ├── auth.js          ← Register, login, profile
│   │   ├── decks.js         ← CRUD for decks
│   │   ├── flashcards.js    ← CRUD for cards (bulk too)
│   │   ├── quiz.js          ← Quiz generation & submission
│   │   └── generate.js      ← AI text → flashcards
│   ├── middleware/
│   │   └── auth.js          ← JWT protect middleware
│   ├── index.js             ← Express server entry
│   └── .env                 ← Environment config
│
└── client/                  ← React frontend
    └── src/
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js  ← All decks, stats
        │   ├── GeneratePage.js   ← Text → flashcards wizard
        │   ├── DeckPage.js       ← Manage cards
        │   ├── StudyPage.js      ← Flip-card study mode
        │   ├── QuizPage.js       ← MCQ quiz
        │   └── QuizResultPage.js ← Score & review
        ├── components/
        │   └── Navbar.js
        ├── context/
        │   └── AuthContext.js    ← JWT auth state
        └── utils/
            └── api.js            ← Axios instance
```

---

## ✅ Prerequisites

Make sure you have these installed:

- **Node.js** v16 or higher → https://nodejs.org
- **MongoDB** running locally → https://www.mongodb.com/try/download/community
  - OR use MongoDB Atlas (free cloud) → update `MONGO_URI` in `.env`
- **npm** (comes with Node.js)

---

## 🚀 Steps to Run

### Step 1 — Clone / place the project
Ensure the `flashcard-app` folder is on your machine.

---

### Step 2 — Install MongoDB (if not installed)
**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download installer from https://www.mongodb.com/try/download/community
Or use **MongoDB Atlas** (free, no local install needed).

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

---

### Step 3 — Set up the backend

```bash
cd flashcard-app/server
npm install
```

Check/edit `.env` file (already created):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/flashcardapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

> If using MongoDB Atlas, replace MONGO_URI with your connection string.

---

### Step 4 — Set up the frontend

```bash
cd flashcard-app/client
npm install
```

---

### Step 5 — Run both servers

**Option A: Run them separately (recommended for beginners)**

Terminal 1 — Backend:
```bash
cd flashcard-app/server
npm run dev
```
> Server starts at http://localhost:5000

Terminal 2 — Frontend:
```bash
cd flashcard-app/client
npm start
```
> React app opens at http://localhost:3000

---

**Option B: Run both with one command**
```bash
cd flashcard-app
npm install          # installs concurrently
npm run dev          # starts both simultaneously
```

---

### Step 6 — Open the app

Visit: **http://localhost:3000**

1. Click **"Create one free"** to register
2. Log in with your credentials
3. Create a deck or use **"Generate from text"** ✨

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Register/Login with JWT, protected routes |
| ✨ Generate | Paste text → auto-generate flashcards |
| 📇 Manage | Add, edit, delete flashcards in any deck |
| 📖 Study | Flip-card mode with keyboard shortcuts |
| 🎯 Quiz | Multiple-choice quiz with scoring |
| 📊 Results | Detailed answer review & history |
| 🗂️ Decks | Color-coded decks with tags |

---

## ⌨️ Keyboard Shortcuts (Study Mode)
- `Space` → Flip card
- `→` → Next card
- `←` → Previous card

---

## 🔧 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Decks
- `GET /api/decks` — List all decks
- `POST /api/decks` — Create deck
- `PUT /api/decks/:id` — Update deck
- `DELETE /api/decks/:id` — Delete deck + cards

### Flashcards
- `GET /api/flashcards/deck/:deckId` — Get cards in deck
- `POST /api/flashcards` — Add single card
- `POST /api/flashcards/bulk` — Add multiple cards
- `PUT /api/flashcards/:id` — Update card
- `DELETE /api/flashcards/:id` — Delete card

### Quiz
- `GET /api/quiz/deck/:deckId` — Get MCQ questions
- `POST /api/quiz/submit` — Submit & score quiz
- `GET /api/quiz/history` — Past quiz results

### Generate
- `POST /api/generate/flashcards` — Text → flashcards

---

## 🐛 Troubleshooting

**"MongoDB connection error"**
→ Make sure MongoDB is running: `mongod` or `brew services start mongodb-community`

**"Port 5000 already in use"**
→ Change `PORT=5001` in `server/.env`

**"Cannot find module"**
→ Run `npm install` in both `/server` and `/client` folders

**React proxy errors**
→ Make sure the backend is running before starting the frontend
"# memento-flashcard-app" 
