"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./cart.module.css"
import navStyles from "../dashboard/dashboard.module.css"
import { authService } from "../../services/authService"
import { orderService } from "../../services/orderService"
import Navbar from "../../components/Navbar.js"
import { 
  getCartItems, 
  removeCartItem, 
  clearCart, 
  getCartTotal,
  updateCartCount,
  dispatchCartUpdatedEvent
} from "../../utils/cartUtils"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cartCount, setCartCount] = useState(0)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/')
          return
        }

        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        
        setCartItems(getCartItems())
        
        updateCartCount(setCartCount)
      } catch (err) {
        console.error("Error loading cart data:", err)
        setError("Failed to load cart data. Please try again.")
      }
    }

    loadData()
    
    const handleCartUpdate = () => {
      setCartItems(getCartItems())
      updateCartCount(setCartCount)
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [router])

  const totalPrice = getCartTotal()
  
  const handleRemoveItem = (index) => {
    const updatedItems = removeCartItem(index)
    setCartItems(updatedItems)
  }

  const handleEditItem = (item, index) => {
    sessionStorage.setItem('editingCartItemIndex', index.toString());
    
    router.push(`/menuItem/${item.id}`);
  }

  const handleOrderAndPay = async () => {
    try {
      setLoading(true)
      setError("")
      
      if (!user) {
        setError("You must be logged in to place an order")
        setLoading(false)
        return
      }
      
      if (cartItems.length === 0) {
        setError("Your cart is empty")
        setLoading(false)
        return
      }
      
      const orderItems = cartItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        chosenVariationIds: item.variations.map(v => v.id)
      }))
      
      const orderRequest = {
        items: orderItems
      }
      
      const createdOrder = await orderService.createOrder(orderRequest)
      
      const updatedItems = clearCart()
      setCartItems(updatedItems)
      
      alert("Your order has been placed successfully! Order ID: " + createdOrder.orderId)
      
      try {
        router.push(`/orders/${createdOrder.orderId}`)
      } catch {
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Error creating order:", err)
      setError("Failed to place your order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <Navbar 
        activePage="cart"
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
      />

      <div className={styles.cartContainer}>
        <div className={styles.cartContent}>
          <h2 className={styles.cartTitle}>Your Order:</h2>
          
          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}
          
          <div className={styles.orderItems}>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemQuantity}>x{item.quantity}</div>
                    <div className={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} eur</div>
                  </div>
                  <div className={styles.itemOptions}>
                    {item.variations && item.variations.length > 0 ? (
                      item.variations.map(v => v.name).join(", ")
                    ) : "No variations"}
                  </div>
                  <div className={styles.itemActions}>
                    <button 
                      className={styles.actionButton} 
                      onClick={() => handleEditItem(item, index)}
                      aria-label="Edit item"
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.actionButton} 
                      onClick={() => handleRemoveItem(index)}
                      aria-label="Remove item"
                    >
                      ❌
                    </button>
                  </div>
                  <div className={styles.itemDivider}></div>
                </div>
              ))
            ) : (
              <div className={styles.emptyCart}>
                Your cart is empty. Add some coffee to get started!
              </div>
            )}
            
            {cartItems.length > 0 && (
              <div className={styles.totalSection}>
                <div className={styles.totalLabel}>Total:</div>
                <div className={styles.totalAmount}>{totalPrice.toFixed(2)} eur</div>
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <button 
              className={styles.orderButton}
              onClick={handleOrderAndPay}
              disabled={loading}
            >
              {loading ? "Processing..." : "Order and pay"}
            </button>
          )}
          
          {cartItems.length === 0 && (
            <button 
              className={styles.browseButton}
              onClick={() => router.push("/dashboard")}
            >
              Browse Coffee Menu
            </button>
          )}
        </div>
      </div>
    </div>
  )
}