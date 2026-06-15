import { Navigate } from "react-router-dom";

// Wraps any page that requires authentication.
// If sessionToken is present, renders children normally.
// If not, redirects to / (login page) without touching browser history.
export default function ProtectedRoute({ sessionToken, children }) {
  if (!sessionToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}
