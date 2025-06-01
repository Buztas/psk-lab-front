"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./menu.module.css"
import AdminNavbar from "../AdminNavbar"
import authService from "@/services/authService"
import adminMenuService from "@/services/data_manipulation_services/adminMenuService"
import menuService from "@/services/menuService"

export default function MenuPage() {
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
        if (currentUser.role !== "ADMIN") {
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

  const handleEdit = (id) => {
    router.push(`/admin/menu/edit/${id}`)
  }

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this menu item?")
    if (!confirmDelete) return

    try {
      await adminMenuService.deleteMenuItem(id)
      setMenuItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error("Error deleting item:", err)
      alert("Failed to delete menu item.")
    }
  }

  const handleAdd = () => {
    router.push("/admin/menu/create")
  }

  const getTypeLabel = (type) =>
    type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : ""

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="menu" />

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail} style={{ width: "100%", maxWidth: "1000px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <h2 className={styles.menuItemName}>Manage Menu</h2>
            <button className={styles.addItemButton} onClick={handleAdd}>
              + Add Item
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className={styles.errorContainer}>
              <p>No menu items found.</p>
            </div>
          ) : (
            <div className={styles.checkboxGroup}>
              {menuItems.map(item => (
                <div key={item.id} className={styles.checkboxLabel} style={{
                  justifyContent: "space-between",
                  border: "1px solid #eee",
                  padding: "1rem",
                  borderRadius: "6px",
                  backgroundColor: "#fafafa"
                }}>
                  <div style={{ flex: 1, marginRight: "2rem", maxWidth: "calc(100% - 140px)" }}>
                    <div className={styles.menuItemType}>
                      {getTypeLabel(item.type)}
                    </div>
                    <div className={styles.menuItemName}>{item.name}</div>
                    <div className={styles.menuItemDescription}>
                      {item.description?.substring(0, 100)}...
                    </div>
                    <div className={styles.menuItemBasePrice}>
                      {Number(item.price).toFixed(2)} eur — {item.stock} in stock
                      {item.variations?.length > 0 && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#555" }}>
                          ({item.variations.length} variation{item.variations.length > 1 ? "s" : ""})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.menuActions}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(item.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️ Delete
                    </button>
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
