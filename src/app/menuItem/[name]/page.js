"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./menu-item.module.css"
import navStyles from "../../dashboard/dashboard.module.css"
import { authService } from "../../../services/authService"
import { menuService } from "../../../services/menuService"

export default function ItemDetailPage({ params }) {
  const router = useRouter()
  const [menuItem, setMenuItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedVariation, setSelectedVariation] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
WS
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/')
          return
        }

        const currentUser = authService.getCurrentUser()
        setUser(currentUser)

        if (!params?.id) {
          setError("No menu item specified")
          setLoading(false)
          return
        }

        setLoading(true)
        const itemData = await menuService.getMenuItemById(params.id)
        setMenuItem(itemData)
        
        if (itemData.variations && itemData.variations.length > 0) {
          setSelectedVariation(itemData.variations[0])
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Error loading menu item:", err)
        setError("Failed to load menu item details. Please try again.")
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  const incrementQuantity = () => {
    const maxStock = selectedVariation ? selectedVariation.stock : (menuItem?.stock || 1)
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation)
    setQuantity(1)
  }

  const addToCart = () => {
    const itemForCart = {
      id: menuItem.id,
      name: menuItem.name,
      price: selectedVariation ? selectedVariation.price : menuItem.price,
      quantity: quantity,
      variationId: selectedVariation ? selectedVariation.id : null,
      variationName: selectedVariation ? selectedVariation.name : null
    }
    
    console.log("Added to cart:", itemForCart)
    setCartCount((prev) => prev + quantity)
    
    alert(`Added ${quantity} ${selectedVariation ? selectedVariation.name : ""} ${menuItem.name} to cart`)
    
    router.push("/dashboard")
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <nav className={navStyles.navbar}>
          <div className={navStyles.logo}>
            <span className={navStyles.logoIcon}>☕</span>
            <h1 className={navStyles.logoText}>Kavapp</h1>
          </div>
          <div className={navStyles.navButtons}>
            <button className={navStyles.navButton} onClick={() => router.push("/dashboard")}>
              Menu
            </button>
            <button className={navStyles.navButton} onClick={() => router.push("/cart")}>
              Cart <span className={navStyles.badge}>{cartCount}</span>
            </button>
            <div className={navStyles.userInfo}>
              {user && <span className={navStyles.userEmail}>{user.email}</span>}
              <button onClick={handleLogout} className={navStyles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading menu item details...</p>
        </div>
      </div>
    )
  }

  if (error || !menuItem) {
    return (
      <div className={styles.container}>
        <nav className={navStyles.navbar}>
          <div className={navStyles.logo}>
            <span className={navStyles.logoIcon}>☕</span>
            <h1 className={navStyles.logoText}>Kavapp</h1>
          </div>
          <div className={navStyles.navButtons}>
            <button className={navStyles.navButton} onClick={() => router.push("/dashboard")}>
              Menu
            </button>
            <button className={navStyles.navButton} onClick={() => router.push("/cart")}>
              Cart <span className={navStyles.badge}>{cartCount}</span>
            </button>
            <div className={navStyles.userInfo}>
              {user && <span className={navStyles.userEmail}>{user.email}</span>}
              <button onClick={handleLogout} className={navStyles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error || "Menu item not found"}</p>
          <button 
            className={styles.backButton}
            onClick={() => router.push("/dashboard")}
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  const displayPrice = selectedVariation 
    ? Number(selectedVariation.price).toFixed(2) 
    : Number(menuItem.price).toFixed(2)

  const currentStock = selectedVariation 
    ? selectedVariation.stock 
    : menuItem.stock
  const isInStock = currentStock > 0

  return (
    <div className={styles.container}>
      <nav className={navStyles.navbar}>
        <div className={navStyles.logo}>
          <span className={navStyles.logoIcon}>☕</span>
          <h1 className={navStyles.logoText}>Kavapp</h1>
        </div>
        <div className={navStyles.navButtons}>
          <button className={navStyles.navButton} onClick={() => router.push("/dashboard")}>
            Menu
          </button>
          <button className={navStyles.navButton} onClick={() => router.push("/cart")}>
            Cart <span className={navStyles.badge}>{cartCount}</span>
          </button>
          <div className={navStyles.userInfo}>
            {user && <span className={navStyles.userEmail}>{user.email}</span>}
            <button onClick={handleLogout} className={navStyles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <div className={styles.menuItemType}>
            {menuItem.type.charAt(0).toUpperCase() + menuItem.type.slice(1).toLowerCase()}
          </div>
          
          <h2 className={styles.menuItemName}>{menuItem.name}</h2>
          
          <div className={styles.menuItemDescription}>
            <p>{menuItem.description}</p>
          </div>

          <div className={styles.menuItemBasePrice}>
            Base price: {Number(menuItem.price).toFixed(2)} eur
          </div>

          <div className={styles.optionsContainer}>
          {menuItem.variations && menuItem.variations.length > 0 && (
            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Variations</h3>
              <div className={styles.radioGroup}>
                {menuItem.variations.map((variation) => (
                  <label key={variation.id} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="variation"
                      value={variation.id}
                      checked={selectedVariation?.id === variation.id}
                      onChange={() => handleVariationChange(variation)}
                      className={styles.radioInput}
                      disabled={variation.stock <= 0}
                    />
                    <span className={styles.radioText}>
                      {variation.name} - {Number(variation.price).toFixed(2)} eur
                      {variation.stock <= 0 && <span className={styles.outOfStock}> (Out of stock)</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity controls */}
          <div className={styles.quantitySection}>
            <h3 className={styles.optionTitle}>Quantity:</h3>
            <div className={styles.quantityControl}>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1 && value <= currentStock) {
                    setQuantity(value);
                  }
                }}
                min="1"
                max={currentStock}
                className={styles.quantityInput}
                disabled={!isInStock}
              />
              <div className={styles.quantityButtons}>
                <button 
                  type="button" 
                  onClick={incrementQuantity} 
                  className={styles.quantityButton}
                  disabled={quantity >= currentStock || !isInStock}
                >
                  ▲
                </button>
                <button 
                  type="button" 
                  onClick={decrementQuantity} 
                  className={styles.quantityButton}
                  disabled={quantity <= 1 || !isInStock}
                >
                  ▼
                </button>
              </div>
            </div>
            <div className={styles.stockInfo}>
              {isInStock 
                ? `In stock: ${currentStock} remaining` 
                : <span className={styles.outOfStock}>Out of stock</span>}
            </div>
          </div>

          {/* Total price calculation */}
          <div className={styles.totalSection}>
            <h3 className={styles.totalLabel}>Total:</h3>
            <div className={styles.totalPrice}>
              {(displayPrice * quantity).toFixed(2)} eur
            </div>
          </div>

          <button 
            className={styles.addToCartButton} 
            onClick={addToCart}
            disabled={!isInStock}
          >
            {isInStock ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}