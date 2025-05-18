"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./auth.module.css"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // validate and authenticate here
    router.push("/dashboard")
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

        {activeTab === "login" ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formDescription}>Sign in to your Kavapp account</p>

            <div className={styles.formGroup}>
              <label htmlFor="login-email" className={styles.label}>
                Email
              </label>
              <input id="login-email" type="email" placeholder="you@example.com" className={styles.input} />
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

            <button type="submit" className={styles.submitButton}>
              Login
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
              <input id="signup-email" type="email" placeholder="you@example.com" className={styles.input} />
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

            <button type="submit" className={styles.submitButton}>
              Create Account
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
