# Hangman - Web Edition

A browser-based Hangman game built on a Python/Flask backend with a React frontend. Authentication is handled via SSH, you log in with credentials to an actual SSH server before playing.

**Tech stack:** Python · Flask · Paramiko · React · Vite

---

## Project Structure

```
web-project/
├── api/                        # Python backend
│   ├── hang_man/               # Game package
│   │   ├── __init__.py
│   │   ├── game_logic.py       # All game logic (word selection, guessing, win/lose)
│   │   ├── store.py            # In-memory game state store
│   │   ├── word_list.py        # Word loader
│   │   ├── easywords.txt
│   │   ├── mediumwords.txt
│   │   └── hardwords.txt
│   ├── .env
│   ├── api.py                  # Flask routes (/api/connect, /api/new_game, /api/guess)
│   ├── requirements.txt        # Python dependencies
│   └── ssh_auth.py             # SSH authentication via Paramiko
│
├── src/                        # React frontend (Vite)
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Hangman.jsx         # Game UI
│   │   └── Login.jsx           # SSH login form
│   ├── App.jsx                 # Routing + session state
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Access to an SSH server on your local network (the login form authenticates against it)

---

## Setup & Running

### 1. Backend

```bash
cd api
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

Install dependencies and start Flask:
```bash
pip install -r requirements.txt
flask run
```

Flask will start on `http://localhost:5000`. Leave this terminal open.

---

### 2. Frontend

In a separate terminal:

```bash
cd my-app
npm install
npm run dev
```

Vite will start on `http://localhost:5173`. Open that in your browser.

> The Vite dev server proxies all `/api/...` requests to Flask on port 5000.
> This is configured in `vite.config.js` — no extra setup needed.

---

### 3. Using the App

1. Open `http://localhost:5173`
2. Enter the IP of your SSH server and valid credentials
3. On success you'll be redirected to the game
4. Pick a difficulty (Easy / Medium / Hard) and start playing
5. Guess letters with the on-screen keyboard or just type
6. Hit **Disconnect** to log out and return to the login page

---

## API Reference

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| `POST` | `/api/connect` | `{ ip, username, password }` | `{ sessionToken }` or 401 |
| `POST` | `/api/new_game` | `{ difficulty }` | `{ game_id, display, lives, status, guessed_letters }` |
| `POST` | `/api/guess` | `{ game_id, letter }` | `{ display, lives, status, guessed_letters }` or `{ status, word }` on game over |

---

## Development Process

The project was built as a school assignment exploring full-stack web development and human–AI collaboration.

**Division of work:**
- All Python code (game logic, SSH auth, API) written manually
- Frontend generated with Claude (AI), with minor manual adjustments
- AI was used as a bug-tester during Python development - prompted to identify mistakes and areas to improve without providing code solutions. Iterations continued until the logic worked as intended.

**How it came together:**
- Started by building Hangman as a console game in Python, full version lives in the [Programmering repo](https://github.com/eskilwelin/Programmering)
- Built the login page frontend with Claude, designed from the start with API calls in mind
- Adapted an SSH function from class to return `True`/`False` based on connection success
- Learned how REST APIs work and wired up the `/api/connect` route to pass credentials from the frontend through to the SSH function
- Set up React Router so a successful login redirects to `/hangman`
- Converted the console Hangman game into API-friendly functions (stateless guessing, game ID based state) so the frontend can drive it over HTTP. Through this process I learned how to globally store values in dicts and access them across files
- Generated the game UI with Claude and connected the full stack together
- Researched authentication tokens and implemented session token validation. Tokens are generated on login, stored server-side, and sent with every subsequent request for the backend to validate 

**Major sources:**
- https://blog.miguelgrinberg.com/ - Great resource for the API and token research
- Shoutout Mr. Ray-Fray 