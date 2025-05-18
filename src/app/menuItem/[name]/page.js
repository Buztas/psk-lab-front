"use client"

import { useState } from "react"
import { use } from 'react';
import { useRouter } from "next/navigation"
import styles from "./menu-item.module.css"
import navStyles from "../../dashboard/dashboard.module.css"

export default function ItemDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter()
  const [size, setSize] = useState("S")
  const [milk, setMilk] = useState("Cow milk")
  const [quantity, setQuantity] = useState(1)
  const [cartCount, setCartCount] = useState(0)

  const menuItemName = resolvedParams.name ? decodeURIComponent(resolvedParams.name) : "Menu Item";

  const itemDetails = {
    "Latte Macchiato": {
      prices: { S: 1.85, M: 2.15, L: 2.8 },
    },
    Cappuccino: {
      prices: { S: 1.85, M: 2.15, L: 2.8 },
    },
    "Flat White": {
      prices: { S: 1.85, M: 2.15, L: 2.8 },
    },
    "Black Coffee": {
      prices: { S: 1.85, M: 2.15, L: 2.8 },
    },
    Espresso: {
      prices: { S: 1.5, M: 1.85, L: 2.2 },
    },
    Americano: {
      prices: { S: 1.7, M: 2.0, L: 2.5 },
    },
  }

  const menuItem = itemDetails[menuItemName] || { prices: { S: 1.85, M: 2.15, L: 2.8 } }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const addToCart = () => {
    setCartCount((prev) => prev + quantity)
    alert(`Added ${quantity} ${size} ${menuItemName} with ${milk} to cart`)
    router.push("/dashboard")
  }

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
          <button className={navStyles.navButton}>Account</button>
        </div>
      </nav>

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <div className={styles.menuItemImage}>
            <div className={styles.placeholder}></div>
          </div>

          <h2 className={styles.menuItemName}>{menuItemName}</h2>

          <div className={styles.optionsContainer}>
            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Size</h3>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="size"
                    value="S"
                    checked={size === "S"}
                    onChange={() => setSize("S")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>S - {menuItem.prices.S.toFixed(2)} eur</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="size"
                    value="M"
                    checked={size === "M"}
                    onChange={() => setSize("M")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>M - {menuItem.prices.M.toFixed(2)} eur</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="size"
                    value="L"
                    checked={size === "L"}
                    onChange={() => setSize("L")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>L - {menuItem.prices.L.toFixed(2)} eur</span>
                </label>
              </div>
            </div>

            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Milk</h3>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="milk"
                    value="Cow milk"
                    checked={milk === "Cow milk"}
                    onChange={() => setMilk("Cow milk")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Cow milk</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="milk"
                    value="Soy milk"
                    checked={milk === "Soy milk"}
                    onChange={() => setMilk("Soy milk")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Soy milk</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="milk"
                    value="Almond milk"
                    checked={milk === "Almond milk"}
                    onChange={() => setMilk("Almond milk")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Almond milk</span>
                </label>
              </div>
            </div>

            <div className={styles.quantitySection}>
              <h3 className={styles.optionTitle}>Quantity:</h3>
              <div className={styles.quantityControl}>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  min="1"
                  className={styles.quantityInput}
                />
                <div className={styles.quantityButtons}>
                  <button type="button" onClick={incrementQuantity} className={styles.quantityButton}>
                    ▲
                  </button>
                  <button type="button" onClick={decrementQuantity} className={styles.quantityButton}>
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button className={styles.addToCartButton} onClick={addToCart}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
