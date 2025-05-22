"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminNavbar from "../AdminNavbar"
import styles from "./orders.module.css"
import authService from "@/services/authService"
import orderService from "@/services/orderService"
import adminUserService from "../../server_functions/adminUserService"

export default function AdminOrdersPage() {
  const [users, setUsers] = useState([])
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [ordersByUser, setOrdersByUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/")
          return
        }

        const currentUser = authService.getCurrentUser()
        if (currentUser.role !== "ADMIN") {
          router.push("/")
          return
        }

        const usersData = await adminUserService.getAllUsers()
        setUsers(usersData.filter(u => u.id))
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Failed to load users.")
        setLoading(false)
      }
    }

    load()
  }, [router])

 const handleToggleUser = async (userId) => {
  const isExpanded = expandedUserId === userId
   setExpandedUserId(isExpanded ? null : userId)

   if (!isExpanded && !ordersByUser[userId]) {
     try {
       const res = await orderService.getOrdersByUser(userId)

       if (!Array.isArray(res)) {
         console.error("Unexpected response for user:", userId, res)
         setOrdersByUser(prev => ({ ...prev, [userId]: [] }))
         return
       }

       setOrdersByUser(prev => ({ ...prev, [userId]: res }))
     } catch (err) {
       setOrdersByUser(prev => ({ ...prev, [userId]: [] }))
     }
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

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="orders" />

      <div className={styles.contentContainer}>
        <div className={styles.ordersContainer}>
          <h2 className={styles.pageTitle}>All User Orders</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <>
              {users.map(user => (
                <div key={user.id}>
                  <div
                    className={`${styles.userCard} ${expandedUserId === user.id ? styles.userCardExpanded : ""}`}
                    onClick={() => handleToggleUser(user.id)}
                  >
                    <div className={styles.userInfo}>
                      <div className={styles.userEmail}>{user.email}</div>
                      <div className={styles.userRole}>{user.roleType}</div>
                    </div>
                    <div
                      className={`${styles.expandIcon} ${expandedUserId === user.id ? styles.rotate : ""}`}
                    >
                      ▶
                    </div>
                  </div>
                    {expandedUserId === user.id && (
                    <div className={`${styles.ordersList} ${styles.expandableOrders}`}>
                        {ordersByUser[user.id] && ordersByUser[user.id].length > 0 ? (
                        ordersByUser[user.id].map(order => (
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
                                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                            </div>
                            <div className={styles.orderActions}>
                                <button
                                className={styles.viewButton}
                                onClick={() => handleViewOrder(order.orderId)}
                                >
                                View
                                </button>
                            </div>
                            </div>
                        ))
                        ) : (
                        <div className={styles.emptyOrdersContainer}>
                            <p>This user has no orders.</p>
                        </div>
                        )}
                    </div>
                    )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
