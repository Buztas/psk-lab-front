"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./cart.module.css"
import navStyles from "../dashboard/dashboard.module.css"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Latte Macchiato",
      size: "S",
      milk: "Cow Milk",
      quantity: 3,
      price: 1.85,
      total: 5.55
    },
    {
      id: 2,
      name: "Flat White",
      size: "L",
      milk: "Soy Milk",
      quantity: 1,
      price: 2.80,
      total: 2.80
    }
  ])

  const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0)
  
  const selectedShop = "Ozo g. 25, PC Akropolis"

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const handleEditItem = (id) => {
    const itemToEdit = cartItems.find(item => item.id === id)
    if (itemToEdit) {
      router.push(`/menuItem/${encodeURIComponent(itemToEdit.name)}`)
    }
  }

  const handleOrderAndPay = () => {
    alert("Processing your order. Thank you for shopping with Kavapp!")
    setCartItems([])
  }

  return (
    <div className={styles.container}>
      <nav className={navStyles.navbar}>
        <div className={navStyles.logo}>
          <span className={navStyles.logoIcon}>☕</span>
          <h1 className={navStyles.logoText}>Kavapp</h1>
        </div>
        <div className={navStyles.navButtons}>
          <button 
            className={navStyles.navButton} 
            onClick={() => router.push("/dashboard")}
          >
            Menu
          </button>
          <button 
            className={`${navStyles.navButton} ${styles.activeNavButton}`}
          >
            Cart <span className={navStyles.badge}>{cartItems.length}</span>
          </button>
          <button className={navStyles.navButton}>Account</button>
        </div>
      </nav>

      <div className={styles.cartContainer}>
        <div className={styles.cartContent}>
          <h2 className={styles.cartTitle}>Your Order:</h2>
          
          <div className={styles.orderItems}>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemQuantity}>x{item.quantity}</div>
                    <div className={styles.itemPrice}>{item.total.toFixed(2)}eur</div>
                  </div>
                  <div className={styles.itemOptions}>
                    {item.size}, {item.milk}
                  </div>
                  <div className={styles.itemActions}>
                    <button 
                      className={styles.actionButton} 
                      onClick={() => handleEditItem(item.id)}
                      aria-label="Edit item"
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.actionButton} 
                      onClick={() => handleRemoveItem(item.id)}
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
                <div className={styles.totalAmount}>{totalPrice.toFixed(2)}eur</div>
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <>
              <div className={styles.shopAddress}>
                Coffee shop address: {selectedShop}
              </div>
              
              <button 
                className={styles.orderButton}
                onClick={handleOrderAndPay}
              >
                Order and pay
              </button>
            </>
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
