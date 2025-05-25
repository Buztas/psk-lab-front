"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./(components)/AdminNavbar";
import authService from "@/services/authService";
import orderService from "@/services/orderService";
import menuService from "@/services/menuService";
import adminUserService from "./server_functions/adminUserService";
import styles from "./admin-dashboard.module.css";

export default function AdminPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    totalUsers: 0,
    totalMenuItems: 0
  });

  useEffect(() => {
    const loadAdminData = async () => {
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

        const [ordersRes, usersRes, menuRes] = await Promise.all([
          orderService.getAllOrders(0, 100),
          adminUserService.getAllUsers(),
          menuService.getAllMenuItems(0, 1000) // Fetch larger menu size
        ]);

        const today = new Date().toDateString();
        const todayOrders = ordersRes.content.filter(
          (order) => new Date(order.orderDate).toDateString() === today
        );

        setStats({
          ordersToday: todayOrders.length,
          totalUsers: usersRes.length,
          totalMenuItems: menuRes.content.length || 0
        });

      } catch (err) {
        console.error("Admin data load error:", err);
        setError("Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [router]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="dashboard" />

      <div className={styles.contentContainer}>
        <h2 className={styles.pageTitle}>Admin Dashboard</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard} onClick={() => handleNavigation("/admin/orders")}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statNumber}>{stats.ordersToday}</div>
                <div className={styles.statLabel}>Orders Today</div>
              </div>

              <div className={styles.statCard} onClick={() => handleNavigation("/admin/users")}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statNumber}>{stats.totalUsers}</div>
                <div className={styles.statLabel}>Registered Users</div>
              </div>

              <div className={styles.statCard} onClick={() => handleNavigation("/admin/menu")}>
                <div className={styles.statIcon}>🍽️</div>
                <div className={styles.statNumber}>{stats.totalMenuItems}</div>
                <div className={styles.statLabel}>Menu Items</div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h3 className={styles.sectionTitle}>Quick Actions</h3>

              <div className={styles.actionGrid}>
                <button
                  className={styles.actionCard}
                  onClick={() => handleNavigation("/admin/orders")}
                >
                  <div className={styles.actionIcon}>📋</div>
                  <div className={styles.actionTitle}>Manage Orders</div>
                  <div className={styles.actionDescription}>
                    Review and update all orders
                  </div>
                </button>

                <button
                  className={styles.actionCard}
                  onClick={() => handleNavigation("/admin/menu")}
                >
                  <div className={styles.actionIcon}>📝</div>
                  <div className={styles.actionTitle}>Manage Menu</div>
                  <div className={styles.actionDescription}>
                    Edit food items and pricing
                  </div>
                </button>

                <button
                  className={styles.actionCard}
                  onClick={() => handleNavigation("/admin/users")}
                >
                  <div className={styles.actionIcon}>🔒</div>
                  <div className={styles.actionTitle}>Manage Users</div>
                  <div className={styles.actionDescription}>
                    View or update user roles
                  </div>
                </button>

                <button
                  className={styles.actionCard}
                  onClick={() => handleNavigation("/admin/variations")}
                >
                  <div className={styles.actionIcon}>⚙️</div>
                  <div className={styles.actionTitle}>Item Variations</div>
                  <div className={styles.actionDescription}>
                    Modify menu item variations
                  </div>
                </button>

                <button
                  className={styles.actionCard}
                  onClick={() => handleNavigation("/admin/payments")}
                >
                  <div className={styles.actionIcon}>💳</div>
                  <div className={styles.actionTitle}>Manage Payments</div>
                  <div className={styles.actionDescription}>
                    Track transactions and revenue
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
