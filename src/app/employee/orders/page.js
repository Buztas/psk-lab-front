"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployeeNavbar from "../components/EmployeeNavbar";
import styles from "./employee-orders.module.css";
import authService from "@/services/authService";
import orderService from "@/services/orderService";

export default function EmployeeOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const pageSize = 15;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['ALL', 'PENDING', 'READY', 'COLLECTED'].includes(filterParam)) {
      setStatusFilter(filterParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        const currentUser = authService.getCurrentUser();
        if (currentUser.role !== "EMPLOYEE") {
          router.push("/dashboard");
          return;
        }

        setLoading(true);
        const response = await orderService.getAllOrders(currentPage, pageSize);
        const allOrders = response.content || [];
        setOrders(allOrders);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        
        filterOrdersByStatus(allOrders, statusFilter);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, currentPage, statusFilter]);

  const filterOrdersByStatus = (ordersList, status) => {
    if (status === "ALL") {
      setFilteredOrders(ordersList);
    } else {
      const filtered = ordersList.filter(order => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(0);
    filterOrdersByStatus(orders, newStatus);
  };

  const handleViewOrder = (orderId) => {
    router.push(`/employee/orders/${orderId}`);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderToUpdate = orders.find(order => order.orderId === orderId);
      if (!orderToUpdate) {
        alert("Order not found.");
        return;
      }
  
      await orderService.updateOrderStatus(orderId, newStatus, orderToUpdate.version);
      
      const response = await orderService.getAllOrders(currentPage, pageSize);
      const allOrders = response.content || [];
      setOrders(allOrders);
      filterOrdersByStatus(allOrders, statusFilter);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status.");
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
        return "✅ Mark Ready";
      case "READY":
        return "📦 Mark Collected";
      default:
        return null;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.container}>
      <EmployeeNavbar activeTab="orders" />

      <div className={styles.contentContainer}>
        <div className={styles.ordersContainer}>
          <div className={styles.header}>
            <h2 className={styles.pageTitle}>Order Management</h2>
            
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Filter by status:</label>
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="READY">Ready for Pickup</option>
                <option value="COLLECTED">Collected</option>
              </select>
            </div>
          </div>

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total:</span>
              <span className={styles.statValue}>{filteredOrders.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Pending:</span>
              <span className={styles.statValue}>
                {orders.filter(order => order.status === "PENDING").length}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Ready:</span>
              <span className={styles.statValue}>
                {orders.filter(order => order.status === "READY").length}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Collected:</span>
              <span className={styles.statValue}>
                {orders.filter(order => order.status === "COLLECTED").length}
              </span>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyOrdersContainer}>
              <p>
                {statusFilter === "ALL" 
                  ? "No orders found." 
                  : `No ${statusFilter.toLowerCase()} orders found.`
                }
              </p>
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
                  <div className={styles.actionsHeader}>Actions</div>
                </div>

                {filteredOrders.map((order) => (
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
                      {getNextStatus(order.status) && (
                        <button
                          className={styles.statusButton}
                          onClick={() => handleStatusChange(order.orderId, getNextStatus(order.status))}
                        >
                          {getStatusButtonText(order.status)}
                        </button>
                      )}
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
                Showing {filteredOrders.length} of {totalElements} total orders
                {statusFilter !== "ALL" && (
                  <span className={styles.filterInfo}>
                    {" "}(filtered by {statusFilter.toLowerCase()})
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}