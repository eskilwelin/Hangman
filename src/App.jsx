import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Hangman from "./pages/Hangman";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  // Auth state: null = not logged in, string = session token from backend.
  // Initialized from sessionStorage so a page refresh doesn't log you out.
  const [sessionToken, setSessionToken] = useState(
    () => sessionStorage.getItem("sessionToken") || null
  );

  const handleLogin = (token) => {
    sessionStorage.setItem("sessionToken", token);
    setSessionToken(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sessionToken");
    setSessionToken(null);
  };

  return (
    <Routes>
      {/* Public route — redirect to /hangman if already logged in */}
      <Route
        path="/"
        element={
          sessionToken
            ? <Navigate to="/hangman" replace />
            : <Login onLogin={handleLogin} />
        }
      />

      {/* Protected routes — redirect to / if not logged in */}
      <Route
        path="/hangman"
        element={
          <ProtectedRoute sessionToken={sessionToken}>
            <Hangman onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: any unknown path goes home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
