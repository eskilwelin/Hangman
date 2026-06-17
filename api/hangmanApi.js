const API_BASE = "http://localhost:5000"; // adjust to wherever Flask runs

export async function startNewGame(difficulty) {
  const response = await fetch(`${API_BASE}/api/new_game`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty }),
  });
  return await response.json();
  // Expect back: { game_id, display, lives, guessed_letters, status }
}

export async function submitGuess(gameId, letter) {
  const response = await fetch(`${API_BASE}/api/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, letter }),
  });
  return await response.json();
  // Expect back: { display, lives, guessed_letters, status, word (only if game over) }
}