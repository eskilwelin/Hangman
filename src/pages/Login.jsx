import { useState } from "react";


const IPAddress = "192.168.1.67"

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0d1117",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Consolas', 'Menlo', 'Monaco', monospace",
  },
  box: {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  dot: (color) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: color,
    flexShrink: 0,
  }),
  title: {
    color: "#e6edf3",
    fontSize: "18px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    margin: 0,
  },
  fieldGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    color: "#8b949e",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "5px",
    color: "#e6edf3",
    fontSize: "14px",
    padding: "9px 12px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  rowItem: (flex) => ({
    flex,
  }),
  divider: {
    borderTop: "1px solid #21262d",
    margin: "28px 0 24px",
  },
  button: (loading) => ({
    width: "100%",
    padding: "10px",
    backgroundColor: loading ? "#1a3a5c" : "#1f6feb",
    color: loading ? "#8b949e" : "#ffffff",
    border: "1px solid " + (loading ? "#30363d" : "#388bfd26"),
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "inherit",
    letterSpacing: "0.3px",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "background-color 0.15s",
  }),
  statusBox: (type) => ({
    marginTop: "16px",
    padding: "10px 12px",
    borderRadius: "5px",
    fontSize: "12px",
    fontFamily: "inherit",
    backgroundColor: type === "error" ? "#2a0f0f" : "#0f2a1a",
    border: `1px solid ${type === "error" ? "#6e1c1c" : "#1c6e3a"}`,
    color: type === "error" ? "#f85149" : "#3fb950",
  }),
};

// onLogin(token) is called by App.jsx when the backend returns a session token.
// App.jsx then stores it and redirects to /hangman automatically.
export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    ip: IPAddress,
    username: "",
    password: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status) setStatus(null);
  };

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focusedField === name ? "#388bfd" : "#30363d",
  });

  const handleConnect = async () => {
    const { ip, username, password } = form;

    if (!ip || !username || !password) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.error || `Connection failed (HTTP ${res.status}).`,
        });
      } else {
        setStatus({ type: "success", message: `Authenticated as ${username}@${ip}` });
        // Hand the token up to App.jsx — it will update state and
        // the router will navigate to /hangman automatically.
        onLogin(data.sessionToken);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "Could not reach backend. Is the server running?",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleConnect();
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.titleRow}>
          <span style={styles.dot("#3fb950")} />
          <h1 style={styles.title}>Login Client</h1>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>IP Address</label>
          <input
            style={inputStyle("ip")}
            name="ip"
            type="text"
            placeholder="192.168.1.10"
            value={form.ip}
            onChange={handleChange}
            onFocus={() => setFocusedField("ip")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Username</label>
          <input
            style={inputStyle("username")}
            name="username"
            type="text"
            placeholder="root"
            value={form.username}
            onChange={handleChange}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            autoComplete="username"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={inputStyle("password")}
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
          />
        </div>

        <div style={styles.divider} />

        <button
          style={styles.button(loading)}
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? "Connecting…" : "Connect"}
        </button>

        {status && (
          <div style={styles.statusBox(status.type)}>{status.message}</div>
        )}
      </div>
    </div>
  );
}
