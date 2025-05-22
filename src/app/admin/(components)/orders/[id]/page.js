"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./order-detail.module.css";
import authService from "@/services/authService";
import orderService from "@/services/orderService";
import { updateCartCount } from "@/utils/cartUtils";
import AdminNavbar from "../../AdminNavbar";
import { use } from "react";

export default function OrderDetailPage({ params }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id

  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // Update cart count
        updateCartCount(setCartCount);

        if (!orderId) {
          setError("No order specified");
          setLoading(false);
          return;
        }
        setLoading(true);
        let orderData = await orderService.getOrderById(orderId);
        if (orderData.pickupTime) {
          const pickupTime = new Date(orderData.pickupTime.replace(" ", "T"));
          const now = new Date();
          try {
            if (now >= pickupTime) {
              await orderService.updateOrderStatus(
                orderId,
                "READY",
                orderData.version,
              );
            }
          } catch (err) {
            console.error("Failed updating status: ", err);
          } finally {
            orderData = await orderService.getOrderById(orderId);
          }
        }
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading order details:", err);
        setError("Failed to load order details. Please try again.");
        setLoading(false);
      }
    };

    loadOrderDetails();

    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCount(setCartCount);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [orderId, router]);

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

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab={"orders"} />

      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading order details...</p>
          </div>
        ) : error || !order ? (
          <div className={styles.errorContainer}>
            <h2 className={styles.errorTitle}>Error</h2>
            <p className={styles.errorMessage}>{error || "Order not found"}</p>
            <button
              className={styles.backButton}
              onClick={() => router.push("/admin/orders")}
            >
              Back to Orders
            </button>
          </div>
        ) : (
          <div className={styles.orderContainer}>
            <button
              className={styles.backButton}
              onClick={() => router.push("/admin/orders")}
            >
              &larr; Back to Orders
            </button>
            <h2 className={styles.pageTitle}>Order Details</h2>

            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <div className={styles.orderIdSection}>
                  <span className={styles.orderIdLabel}>Order ID:</span>
                  <span className={styles.orderId}>{order.orderId}</span>
                </div>

                <div className={styles.orderDates}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateLabel}>Ordered:</span>
                    <span className={styles.dateValue}>
                      {formatDateTime(order.orderDate)}
                    </span>
                  </div>

                  {order.pickupTime && (
                    <div className={styles.dateInfo}>
                      <span className={styles.dateLabel}>Pickup:</span>
                      <span className={styles.dateValue}>
                        {formatDateTime(order.pickupTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`${styles.orderStatus} ${getStatusClass(order.status)}`}
              >
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className={styles.orderItems}>
              <h3 className={styles.sectionTitle}>Items</h3>

              <div className={styles.itemsList}>
                {order.items &&
                  order.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemMainInfo}>
                        <div className={styles.itemName}>
                          {item.menuItemName}
                        </div>
                        <div className={styles.itemQuantity}>
                          x{item.quantity}
                        </div>
                        <div className={styles.itemPrice}>
                          {Number(item.itemTotalPrice).toFixed(2)} eur
                        </div>
                      </div>

                      {item.chosenVariations &&
                        item.chosenVariations.length > 0 && (
                          <div className={styles.variationsContainer}>
                            <div className={styles.variationsTitle}>
                              Variations:
                            </div>
                            <div className={styles.variationsList}>
                              {item.chosenVariations.map(
                                (variation, vIndex) => (
                                  <div
                                    key={vIndex}
                                    className={styles.variation}
                                  >
                                    {variation.name} (+
                                    {Number(variation.price).toFixed(2)} eur)
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>

            <div className={styles.orderTotal}>
              <span className={styles.totalLabel}>Total:</span>
              <span className={styles.totalAmount}>
                {Number(order.totalAmount).toFixed(2)} eur
              </span>
            </div>

            {order.status === "PENDING" && (
              <div className={styles.statusMessage}>
                <div className={styles.pendingIcon}>⏱️</div>
                <div className={styles.messageText}>
                  Your order is being prepared. It will be ready for pickup
                  soon.
                  {order.pickupTime && (
                    <span className={styles.pickupTime}>
                      {" "}
                      Expected pickup time: {formatDateTime(order.pickupTime)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {order.status === "READY" && (
              <div className={styles.statusMessage}>
                <div className={styles.readyIcon}>✅</div>
                <div className={styles.messageText}>
                  Your order is ready for pickup!
                </div>
              </div>
            )}

            {order.status === "COLLECTED" && (
              <div className={styles.statusMessage}>
                <div className={styles.collectedIcon}>🎉</div>
                <div className={styles.messageText}>
                  This order has been collected. Thank you for your purchase!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
