"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./employee-menu.module.css"
import EmployeeNavbar from "../components/EmployeeNavbar"
import authService from "@/services/authService"
import menuService from "@/services/menuService"

export default function EmployeeMenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadMenu = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/")
          return
        }

        const currentUser = authService.getCurrentUser()
        if (currentUser.role !== "EMPLOYEE") {
          router.push("/dashboard")
          return
        }

        const data = await menuService.getAllMenuItems()
        if (!Array.isArray(data.content)) {
          console.error("Unexpected menu response", data)
          setMenuItems([])
        } else {
          setMenuItems(data.content)
        }
      } catch (err) {
        console.error("Failed to load menu items", err)
        setError("Failed to load menu items. Try again.")
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [router])

  const getTypeLabel = (type) =>
    type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : ""

  return (
    <div className={styles.container}>
      <EmployeeNavbar activeTab="menu" />

      <div className={styles.contentContainer}>
        <div className={styles.menuContainer}>
          <h2 className={styles.pageTitle}>Menu Items</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No menu items found.</p>
            </div>
          ) : (
            <div className={styles.menuList}>
              {menuItems.map(item => (
                <div key={item.id} className={styles.menuCard}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.menuItemType}>
                      {getTypeLabel(item.type)}
                    </div>
                    <div className={styles.menuItemName}>{item.name}</div>
                    <div className={styles.menuItemDescription}>
                      {item.description}
                    </div>
                    <div className={styles.menuItemPrice}>
                      {Number(item.price).toFixed(2)} eur — {item.stock} in stock
                      {item.variations?.length > 0 && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#555" }}>
                          ({item.variations.length} variation{item.variations.length > 1 ? "s" : ""})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}