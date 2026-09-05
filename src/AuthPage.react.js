import React, { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from "firebase/auth";
import {auth} from "./firebase.js"; // Adjust this path to where your Firebase init file lives
import Spinner from "./Spinner.react.js"; // Uses your project's spinner component

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage("");
    setFormValues({ email: "", password: "", confirmPassword: "", name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isSignUp && formValues.password !== formValues.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formValues.email, 
          formValues.password
        );
        
        if (formValues.name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: formValues.name.trim()
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, formValues.email, formValues.password);
      }

      setSubmitting(false);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      console.error("Authentication Error:", err);
      setSubmitting(false);
      
      switch (err.code) {
        case "auth/email-already-in-use":
          setErrorMessage("This email is already registered. Please sign in instead.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setErrorMessage("Password must be at least 6 characters long.");
          break;
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setErrorMessage("Invalid email or password combination.");
          break;
        default:
          setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleOAuthLogin = async (providerName) => {
    setSubmitting(true);
    setErrorMessage("");
    
    let providerInstance;

    switch (providerName.toLowerCase()) {
      case "google":
        providerInstance = new GoogleAuthProvider();
        providerInstance.setCustomParameters({ prompt: "select_account" });
        break;
      case "facebook":
        providerInstance = new FacebookAuthProvider();
        break;
      case "apple":
        providerInstance = new OAuthProvider("apple.com");
        break;
      default:
        setErrorMessage(`Unsupported provider: ${providerName}`);
        setSubmitting(false);
        return;
    }

    try {
      const result = await signInWithPopup(auth, providerInstance);
      console.log(`${providerName} authentication successful:`, result.user);
      
      setSubmitting(false);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      console.error(`${providerName} Authentication Error:`, err);
      setSubmitting(false);
      
      switch (err.code) {
        case "auth/popup-closed-by-user":
          setErrorMessage("Sign-in window was closed before completing authentication.");
          break;
        case "auth/account-exists-with-different-credential":
          setErrorMessage("An account already exists with this email using a different sign-in method.");
          break;
        case "auth/cancelled-popup-request":
          // Can happen on rapid double-clicks; usually safe to ignore visually
          break;
        default:
          setErrorMessage(err.message || `An error occurred logging in with ${providerName}.`);
      }
    }
  };

  return (
    <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <header className="App-header" style={{ padding: "40px 20px" }}>
        
        {/* Heading Theme */}
        <h1
          style={{
            fontSize: 42,
            fontWeight: "bold",
            marginBottom: 12,
            letterSpacing: 1,
            color: "#38a1ff",
            textShadow: "0 2px 12px rgba(79,140,255,0.15)",
          }}
        >
          {isSignUp ? "Create Your Account" : "Sign In"}
        </h1>
        
        {/* Subtitle */}
        <div style={{ fontSize: 18, color: "#666", marginBottom: 32, marginTop: 0 }}>
          {isSignUp ? (
            "Get started by creating your account below."
          ) : (
            <>
              Don't have an account?{" "}
              <span
                onClick={toggleAuthMode}
                style={{
                  color: "#4ea1ff",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Sign Up
              </span>
            </>
          )}
        </div>

        {/* Central Card Container */}
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#fff",
            padding: 32,
            borderRadius: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            position: "relative",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Active Overlay Loading Spinner */}
          {submitting && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                borderRadius: 18,
              }}
            >
              <Spinner size={44} color="#4f8cff" />
            </div>
          )}

          {/* Error Message Box Banner */}
          {errorMessage && (
            <div
              style={{
                background: "#ffeef0",
                color: "#b71234",
                padding: "12px 14px",
                borderRadius: 8,
                fontSize: 14,
                textAlign: "left",
                marginBottom: 20,
                border: "1px solid rgba(183,18,52,0.15)",
                fontWeight: "500",
                lineHeight: "1.4"
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Core Auth Form */}
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <label style={{ marginBottom: 6, fontWeight: 500, fontSize: 15, color: "#222" }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", fontSize: 16, padding: "10px 12px", borderRadius: 8, border: "1px solid #bbb", boxSizing: "border-box" }}
                />
              </div>
            )}

            <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <label style={{ marginBottom: 6, fontWeight: 500, fontSize: 15, color: "#222" }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                required
                style={{ width: "100%", fontSize: 16, padding: "10px 12px", borderRadius: 8, border: "1px solid #bbb", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <label style={{ marginBottom: 6, fontWeight: 500, fontSize: 15, color: "#222" }}>Password</label>
              <input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                required
                style={{ width: "100%", fontSize: 16, padding: "10px 12px", borderRadius: 8, border: "1px solid #bbb", boxSizing: "border-box" }}
              />
            </div>

            {isSignUp && (
              <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <label style={{ marginBottom: 6, fontWeight: 500, fontSize: 15, color: "#222" }}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", fontSize: 16, padding: "10px 12px", borderRadius: 8, border: "1px solid #bbb", boxSizing: "border-box" }}
                />
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 20px",
                fontSize: 18,
                fontWeight: "bold",
                borderRadius: 14,
                background: "linear-gradient(90deg, #4f8cff 0%, #38e8ff 100%)",
                color: "#fff",
                border: "none",
                boxShadow: "0 4px 14px rgba(79,140,255,0.3)",
                cursor: "pointer",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Visual Separator Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", color: "#888", fontSize: 14 }}>
            <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
            <span style={{ padding: "0 12px" }}>or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
          </div>

          {/* Social OAuth Integration Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => handleOAuthLogin("Google")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff",
                fontSize: 15,
                fontWeight: "600",
                color: "#444",
                cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.58z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.38-2.31V6.54H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.46l4.06-3.22z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.97 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.46l4.06 3.23c.95-2.85 3.6-4.94 6.73-4.94z"/>
              </svg>
              Google
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={() => handleOAuthLogin("Apple")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: "#000",
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.26-.56 2.97-1.4z"/>
                </svg>
                Apple
              </button>

              <button
                onClick={() => handleOAuthLogin("Facebook")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1877F2",
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Footer Link for switching back from Sign Up view */}
        <div style={{ marginTop: 24, fontSize: 16, color: "#666" }}>
          {isSignUp && (
            <>
              Already have an account?{" "}
              <span
                onClick={toggleAuthMode}
                style={{
                  color: "#4ea1ff",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Sign In
              </span>
            </>
          )}
        </div>
      </header>
    </div>
  );
}