"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./dashboard.module.css"
import { authService } from "../../services/authService"
import { menuService } from "../../services/menuService"
import AdminPage from "../admin/page"

export default function DashboardPage() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/')
          return
        }
        
        const currentUser = authService.getCurrentUser()
        console.log("User data: ", currentUser);
        setUser(currentUser)
        
        setLoading(true)
        const menuData = await menuService.getAllMenuItems()
        setMenuItems(menuData.content || [])
        setLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load menu items. Please try again.")
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const navigateToMenuItem = (menuItemId) => {
    router.push(`/menuItem/${encodeURIComponent(menuItemId)}`)
  }
  
  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  const getItemTypeLabel = (type) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  return (
    <div className={styles.container}>
      {(user?.role === 'ADMIN') && (
        <AdminPage/>
      )}
      {(user?.role === 'EMPLOYEE' && (
        <EmployeePage/>
      ))}
      {(user?.role === 'CUSTOMER' && (
        <div>
          <nav className={styles.navbar}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>☕</span>
              <h1 className={styles.logoText}>Kavapp</h1>
            </div>
            <div className={styles.navButtons}>
              <button className={`${styles.navButton} ${styles.activeNavButton}`}>Menu</button>
              <button className={styles.navButton} onClick={() => router.push("/cart")}>
                Cart <span className={styles.badge}>{cartCount}</span>
              </button>
              <div className={styles.userInfo}>
                {user && <span className={styles.userEmail}>{user.email}</span>}
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </div>
            </div>
          </nav>

          <div className={styles.menuContainer}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading menu items...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button 
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className={styles.emptyContainer}>
                <p>No menu items available.</p>
              </div>
            ) : (
              <div className={styles.menuGrid}>
                {menuItems.map((menuItem) => (
                  <div
                    key={menuItem.id}
                    className={styles.menuItemCard}
                    onClick={() => navigateToMenuItem(menuItem.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.menuItemType}>
                      {getItemTypeLabel(menuItem.type)}
                    </div>
                    <h3 className={styles.menuItemName}>{menuItem.name}</h3>
                    <p className={styles.menuItemDescription}>
                      {menuItem.description.length > 100 
                        ? menuItem.description.substring(0, 100) + "..." 
                        : menuItem.description}
                    </p>
                    <div className={styles.menuItemInfo}>
                      <div className={styles.menuItemPrice}>
                        {Number(menuItem.price).toFixed(2)} eur
                      </div>
                      <div className={styles.menuItemStock}>
                        {menuItem.stock > 0 ? `In stock: ${menuItem.stock}` : "Out of stock"}
                      </div>
                    </div>
                    {menuItem.variations && menuItem.variations.length > 0 && (
                      <div className={styles.variationsLabel}>
                        {menuItem.variations.length} variations available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}