'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaUser, FaLock } from "react-icons/fa";
import Image from "next/image";
import { IP, PORT } from "../config";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);  // ✅ NEW
  const router = useRouter();
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // prevent double submit
    setLoading(true);

    try {
      const response = await fetch(`${IP}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("user_id", data.login_id);
      localStorage.setItem("uuid", data.uuid);


      if (data.role === "admin") {
        router.push("/admin_dashboard");
      } else if (data.role === "lecturer") {
        router.push("/lecturer_dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Server error");
      setLoading(false);
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.overlay}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <Image
            src="/uneswa_logo.png"
            alt="UNESWA Logo"
            width={100}
            height={100}
            style={styles.logo}
          />
          <h2 style={styles.title}>UNESWA QR Attendance System</h2>
          <p style={styles.subtitle}>Lecturer & Admin Login</p>

          <div style={styles.inputWrapper}>
            <FaUser style={styles.inputIcon} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User Email"
              style={{ ...styles.input, paddingLeft: "34px" }}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <FaLock style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{ ...styles.input, paddingLeft: "34px", paddingRight: "40px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
          </div>
 
          {/* LOGIN BUTTON WITH LOADING */}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? (
              <div style={styles.spinner}></div>
            ) : (
              "Login"
            )}
          </button>

          <div style={styles.registerContainer}>
            <span style={styles.registerText}>Dont have an account?</span>
            <a href="/register" style={styles.registerLink}>Register</a>
          </div>

          <div style={styles.footer}>
            © {new Date().getFullYear()} University of Eswatini — QR Attendance System
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  background: {
    height: "100vh",
    backgroundImage:
      'url("https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1950&q=80")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Poppins, sans-serif",
  },
  overlay: {
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    margin: "0 auto 16px auto",
  },
  title: {
    textAlign: "center",
    color: "#003366",
    fontSize: "22px",
    marginBottom: "4px",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    color: "#333",
    fontSize: "14px",
    marginBottom: "20px",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    backgroundColor: "white",
    outline: "none",
  },
  inputIcon: {
    position: "absolute",
    left: "10px",
    top: "12px",
    color: "#003366",
    fontSize: "18px",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#555",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#003366",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  // Simple spinning loader
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  registerContainer: {
    marginTop: "12px",
    textAlign: "center",
    fontSize: "14px",
  },
  registerText: {
    marginRight: "5px",
    color: "#333",
  },
  registerLink: {
    color: "#003366",
    textDecoration: "underline",
    cursor: "pointer",
  },
  footer: {
    marginTop: "32px",
    fontSize: "11px",
    color: "hsl(0, 0%, 30%)",
    textAlign: "center",
  },
};

// Required for CSS animation
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
