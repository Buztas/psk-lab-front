"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../AdminNavbar";
import styles from "./orders.module.css";
import authService from "@/services/authService";
import orderService from "@/services/orderService";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
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

        setLoading(true);
        const response = await orderService.getAllOrders(currentPage, pageSize);
        setOrders(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, currentPage]);

  const handleViewOrder = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await orderService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order.");
    }
  };

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="orders" />

      <div className={styles.contentContainer}>
        <div className={styles.ordersContainer}>
          <h2 className={styles.pageTitle}>All Orders</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyOrdersContainer}>
              <p>No orders found.</p>
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

                {orders.map((order) => (
                  <div key={order.orderId} className={styles.orderItem}>
                    <div className={styles.orderId}>
                      {order.orderId.substring(0, 8)}...
                    </div>
                    <div className={styles.orderDate}>
                      {formatDateTime(order.orderDate)}
                    </div>
                    <div
                      className={`${styles.orderStatus} ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </div>
                    <div className={styles.orderTotal}>
                      {Number(order.totalAmount).toFixed(2)} eur
                    </div>
                    <div className={styles.orderItems}>
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </div>
                    <div className={styles.orderActions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => handleViewOrder(order.orderId)}
                      >
                        🔎 View
                      </button>
                      <button
                        className={styles.deleteButton}
                        style={{ cursor: "pointer", marginLeft: "4px"}}
                        onClick={() => handleDeleteOrder(order.orderId)}
                      >
                        🗑️ Delete
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
  );
}
