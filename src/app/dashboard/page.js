"use client"

import { useState } from "react"
import styles from "./dashboard.module.css"

export default function DashboardPage() {
  const [selectedShop, setSelectedShop] = useState("Ozo g. 25, PC Akropolis")
  const [cartCount, setCartCount] = useState(0)

  // Sample data
  const coffeeShops = [
    "Ozo g. 25, PC Akropolis",
    "Gedimino pr. 9, Vilnius",
    "Konstitucijos pr. 16, Europa",
    "Pilies g. 8, Old Town",
  ]

  // Sample data 
  const coffeeMenu = [
    { name: "Latte Macchiato", prices: { S: 1.85, M: 2.15, L: 2.8 } },
    { name: "Cappuccino", prices: { S: 1.85, M: 2.15, L: 2.8 } },
    { name: "Flat White", prices: { S: 1.85, M: 2.15, L: 2.8 } },
    { name: "Black Coffee", prices: { S: 1.85, M: 2.15, L: 2.8 } },
    { name: "Espresso", prices: { S: 1.5, M: 1.85, L: 2.2 } },
    { name: "Americano", prices: { S: 1.7, M: 2.0, L: 2.5 } },
  ]

  const addToCart = () => {
    setCartCount(cartCount + 1)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>☕</span>
          <h1 className={styles.logoText}>Kavapp</h1>
        </div>
        <div className={styles.navButtons}>
          <button className={styles.navButton}>Menu</button>
          <button className={styles.navButton}>
            Cart <span className={styles.badge}>{cartCount}</span>
          </button>
          <button className={styles.navButton}>Account</button>
        </div>
      </nav>

      <div className={styles.shopSelection}>
        <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} className={styles.shopDropdown}>
          {coffeeShops.map((shop) => (
            <option key={shop} value={shop}>
              {shop}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.menuContainer}>
        <div className={styles.menuGrid}>
          {coffeeMenu.map((coffee) => (
            <div key={coffee.name} className={styles.coffeeCard}>
              <div className={styles.coffeeImage}>
                <div className={styles.placeholder}></div>
              </div>
              <h3 className={styles.coffeeName}>{coffee.name}</h3>
              <div className={styles.pricingOptions}>
                <div className={styles.priceOption} onClick={addToCart}>
                  <span className={styles.sizeIcon}>★</span> S - {coffee.prices.S.toFixed(2)} eur
                </div>
                <div className={styles.priceOption} onClick={addToCart}>
                  <span className={styles.sizeIcon}>♥</span> M - {coffee.prices.M.toFixed(2)} eur
                </div>
                <div className={styles.priceOption} onClick={addToCart}>
                  <span className={styles.sizeIcon}>●</span> L - {coffee.prices.L.toFixed(2)} eur
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
