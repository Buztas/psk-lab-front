"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./auth.module.css"
import { authService } from "../services/authService"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  useEffect(() => {
    setError("")
    setFieldErrors({ email: "", password: "" })
    setEmail("")
    setPassword("")
  }, [activeTab])

  const validateForm = () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return false
    }
    
    if (activeTab === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      if (activeTab === "login") {
        await authService.login(email, password)
        router.push("/dashboard")
      } else {
        await authService.register(email, password)
        await authService.login(email, password)
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Authentication error:", err)
      
      if (activeTab === "login") {
        if (err.status === 401) {
          setError("Invalid email or password. Please try again.")
        } else {
          setError("Unable to log in. Please try again later.")
        }
      } else {
        const errorMessage = err.message || "";
        
        if (errorMessage.includes("already exists") || errorMessage.toLowerCase().includes("email already in use")) {
          setError("Email already in use. Please use a different email or try logging in.")
          setFieldErrors({
            ...fieldErrors,
            email: "This email is already registered"
          })
        } else {
          setError("Registration failed. Please try again later.")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>☕</span>
          <h1 className={styles.logoText}>Kavapp</h1>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "login" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "signup" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {activeTab === "login" ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formDescription}>Sign in to your Kavapp account</p>

            <div className={styles.formGroup}>
              <label htmlFor="login-email" className={styles.label}>
                Email
              </label>
              <input 
                id="login-email" 
                type="email" 
                placeholder="you@example.com" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="login-password" className={styles.label}>
                  Password
                </label>
              </div>
              <div className={styles.passwordInput}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formDescription}>Join Kavapp to order coffee</p>

            <div className={styles.formGroup}>
              <label htmlFor="signup-email" className={styles.label}>
                Email
              </label>
              <input 
                id="signup-email" 
                type="email" 
                placeholder="you@example.com" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="signup-password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordInput}>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className={styles.passwordHint}>Password must be at least 8 characters long</p>
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}