// Drop your Hangman frontend code into this component.
// onLogout() is passed from App.jsx — call it to clear the session and
// return the user to the login page.

export default function Hangman({ onLogout }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "#e6edf3",
        fontFamily: "'Consolas', 'Menlo', 'Monaco', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "24px" }}>Hangman</h1>
      <p style={{ color: "#8b949e", margin: 0 }}>Your game frontend goes here.</p>
      <button
        onClick={onLogout}
        style={{
          padding: "8px 20px",
          backgroundColor: "transparent",
          border: "1px solid #30363d",
          borderRadius: "5px",
          color: "#8b949e",
          fontFamily: "inherit",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
