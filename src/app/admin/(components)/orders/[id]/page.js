"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNavbar from "../../AdminNavbar";
import styles from "@/app/employee/orders/[id]/employee-order-detail.module.css";
import authService from "@/services/authService";
import orderService from "@/services/orderService";

export default function EmployeeOrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        const currentUser = authService.getCurrentUser();
        if (currentUser.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) loadOrder();
  }, [orderId, router]);

  const handleStatusChange = async (newStatus) => {

    setUpdating(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus, order.version);
      
      const updatedOrderData = await orderService.getOrderById(orderId);
      setOrder(updatedOrderData);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return styles.statusPending;
      case "READY":
        return styles.statusReady;
      case "COLLECTED":
        return styles.statusCollected;
      default:
        return "";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "READY":
        return "Ready for Pickup";
      case "COLLECTED":
        return "Collected";
      default:
        return status;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return "READY";
      case "READY":
        return "COLLECTED";
      default:
        return null;
    }
  };

  const getStatusButtonText = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return "✅ Mark as Ready";
      case "READY":
        return "📦 Mark as Collected";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminNavbar activeTab="orders" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <AdminNavbar activeTab="orders" />
        <div className={styles.contentContainer}>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className={styles.backButton}
              onClick={() => router.push("/admin/orders")}
            >
              ← Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <AdminNavbar activeTab="orders" />
        <div className={styles.contentContainer}>
          <div className={styles.errorContainer}>
            <p>Order not found.</p>
            <button 
              className={styles.backButton}
              onClick={() => router.push("/admin/orders")}
            >
              ← Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="orders" />

      <div className={styles.contentContainer}>
        <div className={styles.orderContainer}>
          <div className={styles.header}>
            <h2 className={styles.pageTitle}>Order Details</h2>
            <button 
              className={styles.backButton}
              onClick={() => router.push("/admin/orders")}
            >
              ← Back to Orders
            </button>
          </div>

          <div className={styles.orderInfo}>
            <div className={styles.orderHeader}>
              <div className={styles.orderIdSection}>
                <span className={styles.label}>Order ID:</span>
                <span className={styles.orderId}>{order.orderId}</span>
              </div>
              <div className={styles.statusSection}>
                <span 
                  className={`${styles.orderStatus} ${getStatusClass(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className={styles.orderMeta}>
              <div className={styles.metaItem}>
                <span className={styles.label}>Order Date:</span>
                <span>{formatDateTime(order.orderDate)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Customer:</span>
                <span>{order.customerEmail || order.customerId}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Total Amount:</span>
                <span className={styles.totalAmount}>
                  €{Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className={styles.itemsSection}>
              <h3 className={styles.sectionTitle}>Order Items</h3>
              <div className={styles.itemsList}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemName}>{item.menuItemName}</div>
                      <div className={styles.itemQuantity}>x{item.quantity}</div>
                      {item.chosenVariations && item.chosenVariations.length > 0 && (
                        <div className={styles.variations}>
                          <span className={styles.variationsLabel}>Variations:</span>
                          <div className={styles.variationsList}>
                            {item.chosenVariations.map((variation, vIndex) => (
                              <span key={vIndex} className={styles.variation}>
                                {variation.name} (+€{Number(variation.price).toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemPrice}>
                        €{Number(item.itemTotalPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getNextStatus(order.status) && (
            <div className={styles.actionSection}>
              <button
                className={styles.statusButton}
                onClick={() => handleStatusChange(getNextStatus(order.status))}
                disabled={updating}
              >
                {updating ? "Updating..." : getStatusButtonText(order.status)}
              </button>
            </div>
          )}

          {order.status === "COLLECTED" && (
            <div className={styles.completedMessage}>
              <span className={styles.completedIcon}>✅</span>
              <span>This order has been completed and collected by the customer.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}