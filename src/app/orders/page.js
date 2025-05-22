"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./orders.module.css"
import navStyles from "../dashboard/dashboard.module.css"
import { authService } from "../../services/authService"
import { orderService } from "../../services/orderService"
import { updateCartCount } from "../../utils/cartUtils"
import Navbar from "../../components/Navbar.js"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10
  const router = useRouter()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/')
          return
        }
        
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        
        updateCartCount(setCartCount)
        
        setLoading(true)
        const response = await orderService.getMyOrders(currentPage, pageSize)
        setOrders(response.content || [])
        setTotalPages(response.totalPages || 0)
        setTotalElements(response.totalElements || 0)
        setLoading(false)
      } catch (err) {
        console.error("Error loading orders:", err)
        setError("Failed to load your orders. Please try again.")
        setLoading(false)
      }
    }
    
    loadOrders()
    
    const handleCartUpdate = () => {
      updateCartCount(setCartCount)
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [router, currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleViewOrder = (orderId) => {
    router.push(`/orders/${orderId}`)
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A"
    const date = new Date(dateTimeString)
    return date.toLocaleString()
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return styles.statusPending
      case 'READY':
        return styles.statusReady
      case 'COLLECTED':
        return styles.statusCollected
      default:
        return ""
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return "Pending"
      case 'READY':
        return "Ready for Pickup"
      case 'COLLECTED':
        return "Collected"
      default:
        return status
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <Navbar 
        activePage="orders"
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
      />

      <div className={styles.contentContainer}>
        <div className={styles.ordersContainer}>
          <h2 className={styles.pageTitle}>My Orders</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyOrdersContainer}>
              <p>You don't have any orders yet.</p>
              <button 
                className={styles.browseButton}
                onClick={() => router.push("/dashboard")}
              >
                Browse Coffee Menu
              </button>
            </div>
          ) : (
            <>
              <div className={styles.ordersList}>
                <div className={styles.ordersHeader}>
                  <div className={styles.orderIdHeader}>Order ID</div>
                  <div className={styles.dateHeader}>Order Date</div>
                  <div className={styles.statusHeader}>Status</div>
                  <div className={styles.totalHeader}>Total</div>
                  <div className={styles.itemsHeader}>Items</div>
                  <div className={styles.actionsHeader}></div>
                </div>
                
                {orders.map(order => (
                  <div key={order.orderId} className={styles.orderItem}>
                    <div className={styles.orderId}>{order.orderId.substring(0, 8)}...</div>
                    <div className={styles.orderDate}>{formatDateTime(order.orderDate)}</div>
                    <div className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                    <div className={styles.orderTotal}>
                      {Number(order.totalAmount).toFixed(2)} eur
                    </div>
                    <div className={styles.orderItems}>
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </div>
                    <div className={styles.orderActions}>
                      <button 
                        className={styles.viewButton}
                        onClick={() => handleViewOrder(order.orderId)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={styles.pageButton}
                  >
                    Previous
                  </button>
                  
                  <span className={styles.pageInfo}>
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              )}
              
              <div className={styles.totalInfo}>
                Total Orders: {totalElements}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}