"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from 'react' 
import styles from "./menu-item.module.css"
import navStyles from "../../dashboard/dashboard.module.css"
import { authService } from "../../../services/authService"
import { menuService } from "../../../services/menuService"
import { 
  getCartCount, 
  getCartItems,
  addCartItem, 
  updateCartCount,
  dispatchCartUpdatedEvent
} from "../../../utils/cartUtils"

export default function ItemDetailPage({ params }) {
  const resolvedParams = use(params)
  const itemId = resolvedParams.id
  
  const router = useRouter()
  const [menuItem, setMenuItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedVariations, setSelectedVariations] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/')
          return
        }

        const currentUser = authService.getCurrentUser()
        setUser(currentUser)

        if (!itemId) {
          setError("No menu item specified")
          setLoading(false)
          return
        }

        setLoading(true)
        const itemData = await menuService.getMenuItemById(itemId)
        setMenuItem(itemData)
        
        const editingIndex = sessionStorage.getItem('editingCartItemIndex')
        
        if (editingIndex !== null) {
          const cartItems = getCartItems()
          const editingItem = cartItems[parseInt(editingIndex, 10)]
          
          if (editingItem && editingItem.id === itemId) {
            setSelectedVariations(editingItem.variations)
            setQuantity(editingItem.quantity)
          }
        }
        
        updateCartCount(setCartCount)
        
        setLoading(false)
      } catch (err) {
        console.error("Error loading menu item:", err)
        setError("Failed to load menu item details. Please try again.")
        setLoading(false)
      }
    }

    loadData()
    
    const handleCartUpdate = () => {
      updateCartCount(setCartCount)
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [itemId, router])

  const incrementQuantity = () => {
    const maxStock = Math.min(
      ...selectedVariations.map(v => v.stock || Infinity),
      menuItem?.stock || Infinity
    )
    
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleVariationToggle = (variation) => {
    setSelectedVariations(prevVariations => {
      const isSelected = prevVariations.some(v => v.id === variation.id)
      
      if (isSelected) {
        return prevVariations.filter(v => v.id !== variation.id)
      } else {
        return [...prevVariations, variation]
      }
    })
    
    setQuantity(1)
  }

  const addToCart = () => {
    const basePrice = Number(menuItem.price);
    const variationsPrice = selectedVariations.reduce(
      (total, variation) => total + Number(variation.price), 
      0
    );
    const totalItemPrice = basePrice + variationsPrice;
    
    const itemForCart = {
      id: menuItem.id,
      name: menuItem.name,
      basePrice: basePrice,
      price: totalItemPrice,
      quantity: quantity,
      variations: selectedVariations.map(variation => ({
        id: variation.id,
        name: variation.name,
        price: Number(variation.price)
      }))
    }
    
    const editingIndex = sessionStorage.getItem('editingCartItemIndex')
    
    if (editingIndex !== null) {
      const cartItems = getCartItems()
      
      cartItems[parseInt(editingIndex, 10)] = itemForCart
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
      
      sessionStorage.removeItem('editingCartItemIndex')
      
      dispatchCartUpdatedEvent()
      
      alert(`Updated ${menuItem.name} in your cart`)
    } else {
      addCartItem(itemForCart)
      
      const variationText = selectedVariations.length > 0 
        ? ` with ${selectedVariations.map(v => v.name).join(", ")}` 
        : "";
      
      alert(`Added ${quantity} ${menuItem.name}${variationText} to cart`)
    }
    
    router.back()
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
              Cart {cartCount > 0 && <span className={navStyles.badge}>{cartCount}</span>}
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
              Cart {cartCount > 0 && <span className={navStyles.badge}>{cartCount}</span>}
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

  const basePrice = Number(menuItem.price);
  const variationsPrice = selectedVariations.reduce((total, variation) => {
    return total + Number(variation.price);
  }, 0);
  const displayPrice = basePrice + variationsPrice;

  const anyVariationOutOfStock = selectedVariations.some(v => v.stock <= 0);
  
  const availableStocks = [
    ...selectedVariations.map(v => v.stock),
    menuItem.stock
  ].filter(stock => stock !== undefined && stock !== null);
  
  const minStock = availableStocks.length > 0 ? Math.min(...availableStocks) : 0;
  const isInStock = minStock > 0 && !anyVariationOutOfStock;

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
            Cart {cartCount > 0 && <span className={navStyles.badge}>{cartCount}</span>}
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
            Base price: {basePrice.toFixed(2)} eur
          </div>

          <div className={styles.optionsContainer}>
            {menuItem.variations && menuItem.variations.length > 0 && (
              <div className={styles.optionSection}>
                <h3 className={styles.optionTitle}>Variations (select multiple)</h3>
                <div className={styles.checkboxGroup}>
                  {menuItem.variations.map((variation) => (
                    <label key={variation.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="variation"
                        value={variation.id}
                        checked={selectedVariations.some(v => v.id === variation.id)}
                        onChange={() => handleVariationToggle(variation)}
                        className={styles.checkboxInput}
                        disabled={variation.stock <= 0}
                      />
                      <span className={styles.checkboxText}>
                        {variation.name} - +{Number(variation.price).toFixed(2)} eur
                        {variation.stock <= 0 && <span className={styles.outOfStock}> (Out of stock)</span>}
                        {variation.stock > 0 && variation.stock <= 5 && 
                          <span className={styles.lowStock}> (Only {variation.stock} left)</span>
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Selected variations summary */}
            {selectedVariations.length > 0 && (
              <div className={styles.selectedVariationsSection}>
                <h3 className={styles.optionTitle}>Selected variations:</h3>
                <ul className={styles.selectedVariationsList}>
                  {selectedVariations.map(variation => (
                    <li key={variation.id} className={styles.selectedVariationItem}>
                      <span>{variation.name}</span>
                      <span>+{Number(variation.price).toFixed(2)} eur</span>
                    </li>
                  ))}
                </ul>
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
                    if (!isNaN(value) && value >= 1 && value <= minStock) {
                      setQuantity(value);
                    }
                  }}
                  min="1"
                  max={minStock}
                  className={styles.quantityInput}
                  disabled={!isInStock}
                />
                <div className={styles.quantityButtons}>
                  <button 
                    type="button" 
                    onClick={incrementQuantity} 
                    className={styles.quantityButton}
                    disabled={quantity >= minStock || !isInStock}
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
                  ? `In stock: ${minStock} remaining` 
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
              disabled={!isInStock || selectedVariations.length === 0}
            >
              {!isInStock ? "Out of stock" : 
               selectedVariations.length === 0 ? "Please select at least one variation" : 
               "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}