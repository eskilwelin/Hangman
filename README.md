# Hangman - Desktop Edition

A native desktop Hangman game built on a Python/Flask backend with a React frontend, wrapped in Tauri. Authentication is handled via SSH - you log in with credentials to an actual SSH server before playing.

The Flask backend is compiled into a standalone executable with PyInstaller and launched automatically as a Tauri **sidecar**, so the whole app starts with a single command.

**Tech stack:** Python · Flask · Paramiko · React · Vite · Tauri · PyInstaller

---

## Project Structure

```
web-project/
├── api/                        # Python backend
│   ├── hang_man/               # Game package
│   │   ├── __init__.py
│   │   ├── game_logic.py       # All game logic (word selection, guessing, win/lose)
│   │   ├── store.py            # In-memory game + session state store
│   │   ├── session_token.py    # Session token generation + validation
│   │   ├── word_list.py        # Word loader (frozen-aware path resolution)
│   │   ├── easywords.txt
│   │   ├── mediumwords.txt
│   │   └── hardwords.txt
│   ├── .env
│   ├── api.py                  # Flask routes + entry point (/api/connect, /api/new_game, /api/guess)
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
│   ├── config.js               # API base URL (relative in dev, absolute in build)
│   └── main.jsx
│
├── src-tauri/                  # Tauri desktop shell (Rust)
│   ├── binaries/
│   │   └── api-x86_64-pc-windows-msvc.exe   # PyInstaller-built Flask backend (sidecar)
│   ├── src/
│   │   ├── lib.rs              # Spawns the Flask sidecar on startup
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json         # Sidecar registered under bundle > externalBin
│
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Rust** (install via [rustup](https://rustup.rs)) — required by Tauri
- **Tauri system dependencies** — on Windows, the Visual Studio C++ Build Tools and WebView2 (WebView2 ships with Windows 10/11 by default). See the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/) for your OS.
- **Access to an SSH server** on your local network (the login form authenticates against it)

> **Platform note:** The bundled sidecar binary is built for `x86_64-pc-windows-msvc` (64-bit Windows). To run on macOS or Linux, rebuild the Flask executable with PyInstaller on that platform and rename it with the matching [target triple](https://tauri.app/develop/sidecar/) (run `rustc -Vv` and use the `host:` value).

---

## Setup & Running

### 1. Install frontend dependencies

From the project root:

```bash
npm install
```

### 2. Set up the Python backend

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

Install dependencies (PyInstaller is needed to build the sidecar):

```bash
pip install -r requirements.txt
pip install pyinstaller
```

### 3. Build the backend sidecar

The Flask backend runs as a standalone executable that Tauri launches automatically. Build it from inside the `api/` folder with the virtual environment active:

```bash
pyinstaller --onefile api.py ^
  --add-data "hang_man/easywords.txt;hang_man" ^
  --add-data "hang_man/mediumwords.txt;hang_man" ^
  --add-data "hang_man/hardwords.txt;hang_man"
```

> On macOS / Linux, replace the `;` data separators with `:` and the `^` line-continuations with `\`.

This produces `dist/api.exe`. Copy it into Tauri's `binaries/` folder, renamed with your platform's target triple:

```bash
mkdir ..\src-tauri\binaries
copy dist\api.exe ..\src-tauri\binaries\api-x86_64-pc-windows-msvc.exe
```

The `.txt` word lists are bundled into the executable, and `word_list.py` resolves their path through `sys._MEIPASS` when running frozen — so the data files are found inside the packaged app, not just in development.

### 4. Run the app

From the project root:

```bash
npx tauri dev
```

That's the only command you need. Tauri compiles the Rust shell, starts the Vite dev server, launches the Flask backend as a sidecar, and opens the desktop window. The Flask process is tied to the app's lifecycle, so it shuts down automatically when you close the window.

> **Do not** start Flask manually (`flask run` or running `api.exe` directly) while using `npx tauri dev` — both would compete for port 5000 and the login request would fail.

### 5. Build a standalone installer

To produce a double-clickable desktop app that runs without any terminal or dev tools:

```bash
npx tauri build
```

> Make sure `npx tauri dev` is **not** running first — it locks files in `src-tauri/target/` and the build will fail with an "access denied" error. (Windows Defender can also briefly lock newly-built files; if the build fails once with a permission error, just run it again.)

The build writes installers to `src-tauri/target/release/bundle/`:

- `nsis/web-project_0.1.0_x64-setup.exe` — recommended installer
- `msi/web-project_0.1.0_x64_en-US.msi` — Windows Installer package

Run the installer, and the app is installed with a Start Menu shortcut and the Flask sidecar placed correctly alongside it — launch it like any normal Windows app, no terminal needed.

> **Unsigned app:** Windows SmartScreen may warn that the app is from an unknown publisher (it isn't code-signed — that requires a paid certificate). Click **More info → Run anyway**.

> **After changing `tauri.conf.json`** (e.g. `productName`, window title, icons), rebuild for the changes to take effect — they're baked in at build time. Note that changing `productName` changes the install location, so a renamed build installs *alongside* the old one rather than replacing it.

---

## Running as a Web App (Development)

The app can also run in the browser without Tauri. This is handy for backend development, since this mode runs the Python **source** directly — no exe rebuild needed after Python changes.

In two separate terminals:

**Terminal 1 — backend** (from `api/`, with the venv active):

```bash
flask run
```

Flask starts on `http://localhost:5000`. Use `flask run` rather than `python api.py` so the `.env` file is auto-loaded by the Flask CLI.

**Terminal 2 — frontend** (from the project root):

```bash
npm run dev
```

Vite starts on `http://localhost:5173`. Open that in your browser and use the app exactly as in the desktop version — the Vite dev server proxies all `/api/...` requests to Flask on port 5000.

> **Desktop vs. web:** In web mode the backend runs from source, so Python edits take effect on reload. In desktop mode (`npx tauri dev`) the backend is the pre-built sidecar exe — rebuild it (Setup step 3) for Python changes to take effect there. Don't run both modes at once; they'd compete for port 5000.

---

## Using the App

1. Launch with `npx tauri dev` (the desktop window opens automatically)
2. Enter the IP of your SSH server and valid credentials
3. On success you'll be taken to the game
4. Pick a difficulty (Easy / Medium / Hard) and start playing
5. Guess letters with the on-screen keyboard or just type
6. Hit **Disconnect** to log out and return to the login screen

---

## How It Works

The frontend never talks to the SSH server or holds the target word directly — everything goes through the Flask API:

- **Login** sends credentials to `/api/connect`, which attempts an SSH connection via Paramiko. On success the backend issues a session token, stored server-side and sent with every subsequent request.
- **Gameplay** is fully server-driven. The backend tracks each game by ID, validates guesses, and returns only the masked display, remaining lives, and status — the answer is never sent to the frontend until the game ends.
- **API routing** adapts to the environment via `src/config.js`. In development the frontend uses relative `/api/...` URLs, which the Vite dev server proxies to Flask on port 5000 (configured in `vite.config.js`). In a production build there's no dev server, so it calls the sidecar directly at `http://localhost:5000` — permitted by the `CORS(app)` setting on the backend.

---

## API Reference

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| `POST` | `/api/connect` | `{ ip, username, password }` | `{ sessionToken }` or 401 |
| `POST` | `/api/new_game` | `{ difficulty }` | `{ game_id, display, lives, status, guessed_letters }` |
| `POST` | `/api/guess` | `{ game_id, letter }` | `{ display, lives, status, guessed_letters }` or `{ status, word }` on game over |

All endpoints except `/api/connect` require a valid `sessionToken` header.

---

## Development Process

The project was built as a school assignment exploring full-stack web development and human–AI collaboration.

**Division of work:**
- All Python **application** code (game logic, SSH auth, API routes, session handling) written manually
- Frontend generated with Claude (AI), with minor manual adjustments
- AI was used as a bug-tester during Python development — prompted to identify mistakes and areas to improve without providing code solutions. Iterations continued until the logic worked as intended.
- The desktop **packaging glue** (PyInstaller frozen-path handling, the Flask entry point, and the Tauri/Rust sidecar integration) was done with AI assistance under deadline — distinct from the manually-written application logic above.

**How it came together:**
- Started by building Hangman as a console game in Python; the full version lives in the [Programmering repo](https://github.com/eskilwelin/Programmering)
- Built the login page frontend with Claude, designed from the start with API calls in mind
- Adapted an SSH function from class to return `True`/`False` based on connection success
- Learned how REST APIs work and wired up the `/api/connect` route to pass credentials from the frontend through to the SSH function
- Set up React Router so a successful login redirects to `/hangman`
- Converted the console Hangman game into API-friendly functions (stateless guessing, game-ID-based state) so the frontend can drive it over HTTP. Through this I learned how to store values globally in dicts and access them across files
- Generated the game UI with Claude and connected the full stack together
- Researched authentication tokens and implemented session token validation. Tokens are generated on login, stored server-side, and sent with every subsequent request for the backend to validate
- Packaged the backend into a standalone executable with PyInstaller, then wrapped the whole stack in Tauri so it runs as a native desktop app. Configured the Flask exe as a Tauri sidecar — registered in `tauri.conf.json` and spawned from `lib.rs` on startup — so the entire app launches from a single command

**Major sources:**
- https://blog.miguelgrinberg.com/ — great resource for the API and token research
- Shoutout Mr. Ray