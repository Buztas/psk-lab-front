"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeNavbar from "../components/EmployeeNavbar";
import styles from "./employee-dashboard.module.css";
import authService from "@/services/authService";
import orderService from "@/services/orderService";

export default function EmployeeDashboardPage() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    readyOrders: 0,
    totalOrdersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
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

        const response = await orderService.getAllOrders(0, 100);
        const orders = response.content || [];
        
        const today = new Date().toDateString();
        const todayOrders = orders.filter(order => 
          new Date(order.orderDate).toDateString() === today
        );

        setStats({
          pendingOrders: orders.filter(order => order.status === "PENDING").length,
          readyOrders: orders.filter(order => order.status === "READY").length,
          totalOrdersToday: todayOrders.length
        });

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <EmployeeNavbar activeTab="dashboard" />

      <div className={styles.contentContainer}>
        <div className={styles.dashboardContainer}>
          <h2 className={styles.pageTitle}>Employee Dashboard</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard} onClick={() => handleNavigation("/employee/orders?filter=ALL")}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statNumber}>{stats.totalOrdersToday}</div>
                  <div className={styles.statLabel}>Orders Today</div>
                </div>

                <div className={styles.statCard} onClick={() => handleNavigation("/employee/orders?filter=PENDING")}>
                  <div className={styles.statIcon}>⏳</div>
                  <div className={styles.statNumber}>{stats.pendingOrders}</div>
                  <div className={styles.statLabel}>Pending Orders</div>
                </div>

                <div className={styles.statCard} onClick={() => handleNavigation("/employee/orders?filter=READY")}>
                  <div className={styles.statIcon}>✅</div>
                  <div className={styles.statNumber}>{stats.readyOrders}</div>
                  <div className={styles.statLabel}>Ready for Pickup</div>
                </div>
              </div>

              <div className={styles.quickActions}>
                <h3 className={styles.sectionTitle}>Quick Actions</h3>
                
                <div className={styles.actionGrid}>
                  <button 
                    className={styles.actionCard}
                    onClick={() => handleNavigation("/employee/orders")}
                  >
                    <div className={styles.actionIcon}>📋</div>
                    <div className={styles.actionTitle}>Manage Orders</div>
                    <div className={styles.actionDescription}>
                      View and update order statuses
                    </div>
                  </button>

                  <button 
                    className={styles.actionCard}
                    onClick={() => handleNavigation("/employee/menu")}
                  >
                    <div className={styles.actionIcon}>🍽️</div>
                    <div className={styles.actionTitle}>View Menu</div>
                    <div className={styles.actionDescription}>
                      Browse all menu items and pricing
                    </div>
                  </button>

                  <button 
                    className={styles.actionCard}
                    onClick={() => handleNavigation("/employee/variations")}
                  >
                    <div className={styles.actionIcon}>🔧</div>
                    <div className={styles.actionTitle}>View Variations</div>
                    <div className={styles.actionDescription}>
                      Check available item variations
                    </div>
                  </button>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Employee Guidelines</h3>
                <div className={styles.guidelinesList}>
                  <div className={styles.guideline}>
                    <span className={styles.guidelineIcon}>📝</span>
                    <span>Check pending orders regularly and update their status</span>
                  </div>
                  <div className={styles.guideline}>
                    <span className={styles.guidelineIcon}>⚡</span>
                    <span>Mark orders as "Ready" when prepared</span>
                  </div>
                  <div className={styles.guideline}>
                    <span className={styles.guidelineIcon}>📦</span>
                    <span>Mark orders as "Collected" when customers pick them up</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}