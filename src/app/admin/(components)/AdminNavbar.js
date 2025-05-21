"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./admin-navbar.module.css"
import authService from "@/services/authService"

export default function AdminNavbar({user}) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter();

  const handleNavigation = (path) => {
    setActiveTab(path)
    router.push(`/admin/${path}`)
  }

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⚙️</span>
        <h1 className={styles.logoText}>Kavapp Admin</h1>
      </div>

      <div className={styles.navButtons}>
        <button
          className={`${styles.navButton} ${activeTab === "dashboard" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "menu" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("menu")}
        >
          Menu Items
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "orders" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("orders")}
        >
          Orders
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "user" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("user")}
        >
          Users
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "settings" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("settings")}
        >
          Settings
        </button>

        <div className={styles.userInfo}>
          {user && (
            <span className={styles.userEmail}>
              {user.email}
              <span className={styles.adminBadge}>Admin</span>
            </span>
          )}
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
